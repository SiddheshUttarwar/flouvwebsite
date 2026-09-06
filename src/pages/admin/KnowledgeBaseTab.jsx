import { useState, useEffect, useRef } from 'react';

const POLL_INTERVAL_MS = 1500;

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function KnowledgeBaseTab() {
  const [status, setStatus] = useState(null); // full /api/ingest-gdrive/status payload
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [syncHistory, setSyncHistory] = useState([]);
  const wasSyncingRef = useRef(false);
  const pollRef = useRef(null);

  useEffect(() => {
    // A sync kicked off before this tab was last opened (e.g. admin navigated
    // away mid-run) is still tracked server-side — pick up its status on load
    // instead of assuming idle.
    fetchStatus();
    fetchDocuments();
    fetchSyncHistory();
    return () => stopPolling();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/admin/kb-documents', { credentials: 'include' });
      if (res.ok) setDocuments(await res.json());
    } catch (err) {
      console.error('Failed to fetch KB documents', err);
    }
  };

  const fetchSyncHistory = async () => {
    try {
      const res = await fetch('/api/admin/sync-history', { credentials: 'include' });
      if (res.ok) setSyncHistory(await res.json());
    } catch (err) {
      console.error('Failed to fetch sync history', err);
    }
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/ingest-gdrive/status', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data);
      if (data.status === 'running') {
        wasSyncingRef.current = true;
        startPolling();
      } else {
        stopPolling();
        // A run that was in progress just finished (in this tab's lifetime) —
        // refresh the document list and history to reflect it.
        if (wasSyncingRef.current) {
          wasSyncingRef.current = false;
          fetchDocuments();
          fetchSyncHistory();
        }
      }
    } catch (err) {
      console.error('Failed to fetch ingest status', err);
    }
  };

  const startPolling = () => {
    if (pollRef.current) return;
    pollRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
  };

  const handleSyncDrive = async () => {
    setError(null);
    try {
      const res = await fetch('/api/ingest-gdrive', { method: 'POST', credentials: 'include' });
      if (res.status === 409) {
        // Already running elsewhere — just start following its progress.
        fetchStatus();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || `Failed to start sync (${res.status})`);
        return;
      }
      fetchStatus();
    } catch (err) {
      setError(`Network error starting sync: ${err.message}`);
    }
  };

  const isSyncing = status?.status === 'running';
  const progressPct = isSyncing && status.total_files > 0
    ? Math.round((status.downloaded_files / status.total_files) * 100)
    : null;

  return (
    <div>
      <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, margin: '0 0 16px', color: 'var(--flouv-blue)' }}>
        Knowledge Base
      </h2>
      <div style={{ maxWidth: 640, padding: 24, background: 'var(--flouv-white)', borderRadius: 8, boxShadow: '0 4px 12px oklch(0.3 0.08 264 / 0.05)', border: '1px solid var(--flouv-border)' }}>
        <p style={{ color: 'var(--flouv-text)', marginTop: 0, marginBottom: 20, fontSize: 14, lineHeight: 1.5 }}>
          Pulls the latest documents from the connected Google Drive folder and rebuilds the chatbot's
          retrieval index. Runs in the background — this can take a while for a large folder, so it's
          safe to navigate away and come back; progress picks back up automatically.
        </p>

        <button
          onClick={handleSyncDrive}
          disabled={isSyncing}
          style={{
            padding: '12px 20px',
            background: 'var(--flouv-blue)',
            color: 'var(--flouv-white)',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: isSyncing ? 'wait' : 'pointer',
            width: '100%',
            fontFamily: "'Inter', sans-serif",
            opacity: isSyncing ? 0.7 : 1
          }}
        >
          {isSyncing ? 'Syncing Google Drive...' : 'Sync Google Drive Now'}
        </button>

        {isSyncing && (
          <div style={{ marginTop: 16 }}>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--flouv-bg-soft)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: 4,
                  background: 'var(--flouv-green)',
                  width: progressPct != null ? `${progressPct}%` : '30%',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: 'var(--flouv-muted)', marginTop: 8 }}>
              {status.total_files > 0
                ? `${status.downloaded_files} of ${status.total_files} files processed${progressPct != null ? ` (${progressPct}%)` : ''}`
                : 'Listing files in the Drive folder...'}
            </div>
          </div>
        )}

        {!isSyncing && status?.status === 'done' && (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: 'rgba(34, 197, 94, 0.08)', color: '#166534', fontSize: 13.5 }}>
            {status.message}
            {status.chunks_indexed > 0 && ` (${status.chunks_indexed} chunks indexed)`}
          </div>
        )}

        {!isSyncing && status?.status === 'error' && (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: 'rgba(239, 68, 68, 0.08)', color: '#991b1b', fontSize: 13.5 }}>
            Sync failed: {status.error}
          </div>
        )}

        {error && (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: 'rgba(239, 68, 68, 0.08)', color: '#991b1b', fontSize: 13.5 }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, marginTop: 32 }}>
        <div>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, margin: '0 0 12px', color: 'var(--flouv-blue)' }}>
            Documents in this knowledge base
          </h3>
          <div style={{ background: 'var(--flouv-white)', borderRadius: 8, border: '1px solid var(--flouv-border)', overflow: 'hidden' }}>
            {documents.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--flouv-muted)', fontSize: 13.5 }}>
                No documents synced yet. Run a sync to pull in your Drive folder.
              </div>
            ) : (
              <div style={{ overflow: 'auto', maxHeight: 420 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ position: 'sticky', top: 0, background: 'var(--flouv-white)', textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: 'var(--flouv-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--flouv-border)' }}>File</th>
                      <th style={{ position: 'sticky', top: 0, background: 'var(--flouv-white)', textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: 'var(--flouv-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--flouv-border)' }}>Last ingested</th>
                      <th style={{ position: 'sticky', top: 0, background: 'var(--flouv-white)', textAlign: 'right', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: 'var(--flouv-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--flouv-border)' }}>Chunks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.filename}>
                        <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--flouv-text)', borderBottom: '1px solid var(--flouv-border)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={doc.filename}>
                          {doc.filename}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: 12.5, color: 'var(--flouv-muted)', borderBottom: '1px solid var(--flouv-border)' }}>
                          {formatDateTime(doc.ingested_at)}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: 13, color: doc.chunk_count === 0 ? '#991b1b' : 'var(--flouv-text)', borderBottom: '1px solid var(--flouv-border)', textAlign: 'right' }}>
                          {doc.chunk_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, margin: '0 0 12px', color: 'var(--flouv-blue)' }}>
            Sync history
          </h3>
          <div style={{ background: 'var(--flouv-white)', borderRadius: 8, border: '1px solid var(--flouv-border)', overflow: 'hidden' }}>
            {syncHistory.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--flouv-muted)', fontSize: 13.5 }}>
                No syncs recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', maxHeight: 420 }}>
                {syncHistory.map((run) => (
                  <div key={run.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--flouv-border)', fontSize: 12.5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{
                        fontWeight: 700, fontSize: 10.5, padding: '2px 8px', borderRadius: 100,
                        background: run.status === 'done' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                        color: run.status === 'done' ? '#166534' : '#991b1b',
                      }}>
                        {run.status.toUpperCase()}
                      </span>
                      <span style={{ color: 'var(--flouv-muted)' }}>{formatDateTime(run.finished_at)}</span>
                    </div>
                    <div style={{ color: 'var(--flouv-text)' }}>
                      {run.status === 'done'
                        ? `${run.files_processed} file${run.files_processed === 1 ? '' : 's'}, ${run.chunks_indexed} chunks`
                        : (run.error || 'Unknown error')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
