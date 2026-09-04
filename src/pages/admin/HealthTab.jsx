import { useState, useEffect } from 'react';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function CheckRow({ check }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--flouv-border)' }}>
      <span style={{
        flexShrink: 0, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: 'white',
        background: check.ok ? '#22c55e' : '#ef4444',
      }}>
        {check.ok ? '✓' : '!'}
      </span>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--flouv-text)' }}>{check.name}</div>
        <div style={{ fontSize: 12, color: 'var(--flouv-muted)' }}>{check.detail}</div>
      </div>
    </div>
  );
}

export default function HealthTab() {
  const [health, setHealth] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingFile, setDeletingFile] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [healthRes, uploadsRes] = await Promise.all([
        fetch('/api/admin/health', { credentials: 'include' }),
        fetch('/api/admin/uploads', { credentials: 'include' }),
      ]);
      setHealth(healthRes.ok ? await healthRes.json() : null);
      setUploads(uploadsRes.ok ? await uploadsRes.json() : []);
    } catch (err) {
      console.error('Failed to fetch health/uploads', err);
    }
    setLoading(false);
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Delete "${filename}"? This can't be undone.`)) return;
    setDeletingFile(filename);
    try {
      const res = await fetch(`/api/admin/uploads/${encodeURIComponent(filename)}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setUploads(prev => prev.filter(u => u.filename !== filename));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || 'Failed to delete file');
      }
    } catch (err) {
      alert(`Network error: ${err.message}`);
    }
    setDeletingFile(null);
  };

  const orphanedUploads = uploads.filter(u => u.orphaned);
  const orphanedBytes = orphanedUploads.reduce((sum, u) => sum + u.bytes, 0);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--flouv-muted)' }}>Loading...</div>;
  }

  return (
    <div>
      <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, margin: '0 0 8px', color: 'var(--flouv-blue)' }}>
        System Health
      </h2>
      <p style={{ color: 'var(--flouv-muted)', fontSize: 13.5, margin: '0 0 20px' }}>
        Configuration and storage checks that are easy to break silently — nothing here fails loudly
        until a visitor hits it.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div style={{ background: 'var(--flouv-white)', borderRadius: 8, border: '1px solid var(--flouv-border)', padding: '20px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--flouv-text)', marginBottom: 4 }}>Configuration</div>
          {health?.checks.map((c) => <CheckRow key={c.name} check={c} />)}
        </div>

        <div style={{ background: 'var(--flouv-white)', borderRadius: 8, border: '1px solid var(--flouv-border)', padding: '20px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--flouv-text)', marginBottom: 14 }}>Disk usage</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {health?.disk_usage.map((d) => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--flouv-text)' }} title={d.path}>{d.name}</span>
                <span style={{ color: 'var(--flouv-muted)', fontWeight: 600 }}>{d.bytes > 0 ? formatBytes(d.bytes) : d.exists ? '—' : 'not found'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--flouv-blue)' }}>
          Uploaded files
        </h3>
        {orphanedUploads.length > 0 && (
          <span style={{ fontSize: 12.5, color: 'var(--flouv-muted)' }}>
            {orphanedUploads.length} orphaned ({formatBytes(orphanedBytes)}) — not used by any blog post
          </span>
        )}
      </div>
      <p style={{ color: 'var(--flouv-muted)', fontSize: 12.5, margin: '4px 0 12px' }}>
        Editing a blog's cover image leaves the old file behind — safe to delete anything marked orphaned.
      </p>

      <div style={{ background: 'var(--flouv-white)', borderRadius: 8, border: '1px solid var(--flouv-border)', overflow: 'hidden' }}>
        {uploads.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--flouv-muted)', fontSize: 13.5 }}>No files uploaded yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: 'var(--flouv-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--flouv-border)' }}>File</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: 'var(--flouv-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--flouv-border)' }}>Size</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: 'var(--flouv-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--flouv-border)' }}>Status</th>
                  <th style={{ borderBottom: '1px solid var(--flouv-border)' }}></th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((u) => (
                  <tr key={u.filename}>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--flouv-text)', borderBottom: '1px solid var(--flouv-border)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.filename}>
                      {u.filename}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12.5, color: 'var(--flouv-muted)', borderBottom: '1px solid var(--flouv-border)' }}>{formatBytes(u.bytes)}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--flouv-border)' }}>
                      {u.orphaned ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#92600a', background: 'rgba(234, 179, 8, 0.12)', padding: '2px 8px', borderRadius: 100 }}>ORPHANED</span>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--flouv-muted)' }}>in use</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--flouv-border)', textAlign: 'right' }}>
                      {u.orphaned && (
                        <button
                          onClick={() => handleDelete(u.filename)}
                          disabled={deletingFile === u.filename}
                          style={{
                            background: 'none', border: '1px solid var(--flouv-border)', color: '#991b1b',
                            borderRadius: 4, padding: '5px 12px', fontSize: 12, fontWeight: 600,
                            cursor: deletingFile === u.filename ? 'wait' : 'pointer',
                          }}
                        >
                          {deletingFile === u.filename ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
