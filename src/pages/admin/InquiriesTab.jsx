import { Fragment, useState, useEffect } from 'react';

const PAGE_SIZE = 20;
const MODES = ['report', 'meeting', 'general', 'collaboration', 'distribution', 'representation'];

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function InquiriesTab() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [modeFilter, setModeFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    setPage(0);
  }, [modeFilter]);

  useEffect(() => {
    fetchInquiries(page, modeFilter);
  }, [page, modeFilter]);

  const fetchInquiries = async (pageIndex, mode) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ skip: pageIndex * PAGE_SIZE, limit: PAGE_SIZE });
      if (mode) params.set('mode', mode);
      const res = await fetch(`/api/inquiries?${params}`, { credentials: 'include' });
      const data = await res.json();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch inquiries', err);
    }
    setLoading(false);
  };

  const toggleHandled = async (inq) => {
    setUpdatingId(inq.id);
    try {
      const res = await fetch(`/api/inquiries/${inq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ handled: !inq.handled }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInquiries(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      }
    } catch (err) {
      console.error('Failed to update inquiry', err);
    }
    setUpdatingId(null);
  };

  const thStyle = { textAlign: 'left', padding: '10px 14px', fontSize: 11.5, fontWeight: 700, color: 'var(--flouv-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--flouv-border)' };
  const tdStyle = { padding: '12px 14px', fontSize: 13.5, color: 'var(--flouv-text)', borderBottom: '1px solid var(--flouv-border)', verticalAlign: 'top' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--flouv-blue)' }}>
          Inquiries
        </h2>
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--flouv-border)', fontSize: 13, fontFamily: "'Inter', sans-serif", background: 'var(--flouv-white)', textTransform: 'capitalize' }}
        >
          <option value="">All types</option>
          {MODES.map(m => <option key={m} value={m} style={{ textTransform: 'capitalize' }}>{m}</option>)}
        </select>
      </div>
      <p style={{ color: 'var(--flouv-muted)', fontSize: 13.5, margin: '0 0 20px' }}>
        Every contact-form submission across the site, captured server-side so nothing is lost even if
        a visitor's browser has no mail client to send the accompanying email draft.
      </p>

      <div style={{ background: 'var(--flouv-white)', borderRadius: 8, border: '1px solid var(--flouv-border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--flouv-muted)' }}>Loading...</div>
        ) : inquiries.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--flouv-muted)' }}>
            {page === 0 ? 'No inquiries yet.' : 'No more inquiries.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Subject</th>
                  <th style={thStyle}>Routed to</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Company</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <Fragment key={inq.id}>
                    <tr style={{ opacity: inq.handled ? 0.6 : 1 }}>
                      <td
                        style={{ ...tdStyle, whiteSpace: 'nowrap', color: 'var(--flouv-muted)', cursor: 'pointer' }}
                        onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}
                      >
                        {formatDate(inq.created_at)}
                      </td>
                      <td style={{ ...tdStyle, textTransform: 'capitalize', cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}>{inq.mode}</td>
                      <td
                        style={{ ...tdStyle, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
                        title={inq.subject || ''}
                        onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}
                      >
                        {inq.subject || '—'}
                      </td>
                      <td style={tdStyle} title={inq.notify_email || ''}>
                        {inq.notify_name ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--flouv-blue)', background: 'var(--flouv-blue-tint)', padding: '3px 9px', borderRadius: 100 }}>
                            {inq.notify_name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--flouv-muted)' }}>General inbox</span>
                        )}
                      </td>
                      <td style={tdStyle}>{inq.name || '—'}</td>
                      <td style={tdStyle}>{inq.company || '—'}</td>
                      <td style={tdStyle}>{inq.email || '—'}</td>
                      <td style={tdStyle}>{inq.phone || '—'}</td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => toggleHandled(inq)}
                          disabled={updatingId === inq.id}
                          style={{
                            fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, border: 'none',
                            cursor: updatingId === inq.id ? 'wait' : 'pointer',
                            background: inq.handled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.12)',
                            color: inq.handled ? '#166534' : '#92600a',
                          }}
                        >
                          {inq.handled ? 'HANDLED' : 'NEW'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === inq.id && (
                      <tr>
                        <td colSpan={9} style={{ ...tdStyle, background: 'var(--flouv-bg-soft)', whiteSpace: 'pre-wrap', fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
                          <strong>Subject:</strong> {inq.subject || '—'}
                          {'\n\n'}
                          {inq.message || '(no message)'}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--flouv-border)', background: 'var(--flouv-white)', color: 'var(--flouv-text)', fontSize: 13, fontWeight: 600, cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.5 : 1 }}
        >
          Previous
        </button>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={inquiries.length < PAGE_SIZE}
          style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--flouv-border)', background: 'var(--flouv-white)', color: 'var(--flouv-text)', fontSize: 13, fontWeight: 600, cursor: inquiries.length < PAGE_SIZE ? 'default' : 'pointer', opacity: inquiries.length < PAGE_SIZE ? 0.5 : 1 }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
