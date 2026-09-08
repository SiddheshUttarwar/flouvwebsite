import { useState, useEffect } from 'react';

const PAGE_SIZE = 20;
const SOURCES = ['newsletter', 'meeting', 'report', 'general', 'collaboration', 'distribution', 'representation', 'ai_report_email'];

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatSource(source) {
  if (!source) return '—';
  if (source === 'ai_report_email') return 'AI Report Email';
  return source.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SignupsTab() {
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [sourceFilter, setSourceFilter] = useState('');

  useEffect(() => {
    setPage(0);
  }, [sourceFilter]);

  useEffect(() => {
    fetchSignups(page, sourceFilter);
  }, [page, sourceFilter]);

  const fetchSignups = async (pageIndex, source) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ skip: pageIndex * PAGE_SIZE, limit: PAGE_SIZE });
      if (source) params.set('source', source);
      const res = await fetch(`/api/signups?${params}`, { credentials: 'include' });
      const data = await res.json();
      setSignups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch signups', err);
    }
    setLoading(false);
  };

  const thStyle = { textAlign: 'left', padding: '10px 14px', fontSize: 11.5, fontWeight: 700, color: 'var(--flouv-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--flouv-border)' };
  const tdStyle = { padding: '12px 14px', fontSize: 13.5, color: 'var(--flouv-text)', borderBottom: '1px solid var(--flouv-border)' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--flouv-blue)' }}>
          Signups
        </h2>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--flouv-border)', fontSize: 13, fontFamily: "'Inter', sans-serif", background: 'var(--flouv-white)' }}
        >
          <option value="">All sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>{formatSource(s)}</option>
          ))}
        </select>
      </div>
      <p style={{ color: 'var(--flouv-muted)', fontSize: 13.5, margin: '0 0 20px' }}>
        Every email address collected anywhere on the site — newsletter signups, inquiry-form
        submissions, and report-delivery requests — logged as its own row per capture event.
      </p>

      <div style={{ background: 'var(--flouv-white)', borderRadius: 8, border: '1px solid var(--flouv-border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--flouv-muted)' }}>Loading...</div>
        ) : signups.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--flouv-muted)' }}>
            {page === 0 ? 'No signups yet.' : 'No more signups.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Source</th>
                </tr>
              </thead>
              <tbody>
                {signups.map((s) => (
                  <tr key={s.id}>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: 'var(--flouv-muted)' }}>
                      {formatDate(s.created_at)}
                    </td>
                    <td style={tdStyle}>{s.email}</td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--flouv-blue)', background: 'var(--flouv-blue-tint)', padding: '3px 9px', borderRadius: 100 }}>
                        {formatSource(s.source)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--flouv-border)', background: 'var(--flouv-white)', color: 'var(--flouv-text)', fontSize: 13, fontWeight: 600, cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.5 : 1 }}
        >
          Previous
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={signups.length < PAGE_SIZE}
          style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--flouv-border)', background: 'var(--flouv-white)', color: 'var(--flouv-text)', fontSize: 13, fontWeight: 600, cursor: signups.length < PAGE_SIZE ? 'default' : 'pointer', opacity: signups.length < PAGE_SIZE ? 0.5 : 1 }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
