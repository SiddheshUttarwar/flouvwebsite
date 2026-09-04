import { useState, useEffect } from 'react';

function StatCard({ label, value, sub }) {
  return (
    <div style={{ flex: 1, minWidth: 160, padding: 20, background: 'var(--flouv-white)', borderRadius: 8, border: '1px solid var(--flouv-border)', boxShadow: '0 4px 12px oklch(0.3 0.08 264 / 0.05)' }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--flouv-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--flouv-blue)', fontFamily: "'Inter', sans-serif" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--flouv-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

/** Simple single-series daily bar chart, inline SVG, no charting library —
 * matches the pattern already used in src/components/Charts.jsx. */
function DailyBarChart({ daily }) {
  const width = 720;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 36, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxMessages = Math.max(1, ...daily.map(d => d.messages));
  const barGap = 6;
  const barW = daily.length > 0 ? Math.max(4, chartW / daily.length - barGap) : 0;
  const yScale = (v) => chartH - (v / maxMessages) * chartH;

  if (daily.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--flouv-muted)', fontSize: 13.5 }}>
        No chatbot activity in this window yet.
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Daily chatbot message volume">
      <g transform={`translate(${padding.left}, ${padding.top})`}>
        <line x1={0} x2={0} y1={0} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
        <line x1={0} x2={chartW} y1={chartH} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
        <text x={-8} y={yScale(maxMessages)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--flouv-muted)">
          {maxMessages}
        </text>
        <text x={-8} y={chartH} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--flouv-muted)">0</text>

        {daily.map((d, i) => {
          const x = i * (chartW / daily.length) + (chartW / daily.length - barW) / 2;
          const barH = chartH - yScale(d.messages);
          const showLabel = daily.length <= 14 || i % Math.ceil(daily.length / 14) === 0;
          return (
            <g key={d.date}>
              <rect
                x={x} y={yScale(d.messages)} width={barW} height={barH}
                fill={d.fallback_count > 0 ? 'var(--flouv-blue-soft)' : 'var(--flouv-green)'}
                rx={2}
              >
                <title>{`${d.date}: ${d.messages} messages, $${d.cost_usd.toFixed(4)}, ${d.fallback_count} fallback`}</title>
              </rect>
              {showLabel && (
                <text
                  x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize={9.5} fill="var(--flouv-muted)"
                >
                  {d.date.slice(5)}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function truncate(text, n) {
  if (!text) return '—';
  return text.length > n ? `${text.slice(0, n)}…` : text;
}

function SessionTranscriptModal({ sessionId, onClose }) {
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/sessions/${encodeURIComponent(sessionId)}/messages`, { credentials: 'include' })
      .then(res => (res.ok ? res.json() : { session_id: sessionId, messages: [] }))
      .then(data => { if (!cancelled) setTranscript(data); })
      .catch(err => console.error('Failed to fetch transcript', err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [sessionId]);

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'oklch(0.22 0.14 264 / 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 640, maxHeight: '80vh', overflowY: 'auto', background: 'var(--flouv-white)', borderRadius: 12, padding: '24px 28px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--flouv-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Conversation</div>
            <div style={{ fontSize: 13, color: 'var(--flouv-muted)', fontFamily: 'monospace' }}>{sessionId}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--flouv-muted)' }}>×</button>
        </div>

        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--flouv-muted)' }}>Loading...</div>
        ) : !transcript || transcript.messages.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--flouv-muted)' }}>No messages found for this session.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {transcript.messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{ fontSize: 10.5, color: 'var(--flouv-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                  {m.role}
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: 12, fontSize: 13.5, whiteSpace: 'pre-wrap',
                  background: m.role === 'user' ? 'var(--flouv-bg-soft)' : 'var(--flouv-blue-tint)',
                  color: 'var(--flouv-ink)',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsTab() {
  const [stats, setStats] = useState(null);
  const [traces, setTraces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [openSessionId, setOpenSessionId] = useState(null);

  useEffect(() => {
    fetchData(days);
  }, [days]);

  const fetchData = async (windowDays) => {
    setLoading(true);
    try {
      const [statsRes, tracesRes] = await Promise.all([
        fetch(`/api/admin/stats?days=${windowDays}`, { credentials: 'include' }),
        fetch('/api/admin/traces?limit=25', { credentials: 'include' }),
      ]);
      setStats(statsRes.ok ? await statsRes.json() : null);
      setTraces(tracesRes.ok ? await tracesRes.json() : []);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
    setLoading(false);
  };

  const thStyle = { textAlign: 'left', padding: '10px 14px', fontSize: 11.5, fontWeight: 700, color: 'var(--flouv-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--flouv-border)' };
  const tdStyle = { padding: '10px 14px', fontSize: 13, color: 'var(--flouv-text)', borderBottom: '1px solid var(--flouv-border)' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--flouv-blue)' }}>
          Chatbot Analytics
        </h2>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--flouv-border)', fontSize: 13, fontFamily: "'Inter', sans-serif", background: 'var(--flouv-white)' }}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>
      <p style={{ color: 'var(--flouv-muted)', fontSize: 13.5, margin: '0 0 20px' }}>
        Real usage and spend from every /api/chat call, logged automatically per message.
      </p>

      {loading && !stats ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--flouv-muted)' }}>Loading...</div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
            <StatCard label="Messages" value={stats?.total_messages ?? 0} sub={`last ${days} days`} />
            <StatCard label="Est. cost" value={`$${(stats?.total_cost_usd ?? 0).toFixed(4)}`} sub={`last ${days} days`} />
            <StatCard label="Avg confidence" value={stats ? `${Math.round(stats.avg_confidence * 100)}%` : '—'} sub="on answered turns" />
            <StatCard label="Fallback rate" value={stats ? `${Math.round(stats.fallback_rate * 100)}%` : '—'} sub="couldn't answer confidently" />
          </div>

          <div style={{ background: 'var(--flouv-white)', borderRadius: 8, border: '1px solid var(--flouv-border)', padding: '20px 24px', marginBottom: 32 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--flouv-text)' }}>Daily message volume</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: 'var(--flouv-muted)' }}>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--flouv-green)', borderRadius: 2, marginRight: 4 }} />no fallback</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--flouv-blue-soft)', borderRadius: 2, marginRight: 4 }} />had fallback</span>
              </div>
            </div>
            <DailyBarChart daily={stats?.daily ?? []} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            <div style={{ background: 'var(--flouv-white)', borderRadius: 8, border: '1px solid var(--flouv-border)', padding: '20px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--flouv-text)', marginBottom: 14 }}>Avg. pipeline stage time</div>
              {Object.keys(stats?.avg_stage_timings_ms ?? {}).length === 0 ? (
                <div style={{ color: 'var(--flouv-muted)', fontSize: 13 }}>No data yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(stats.avg_stage_timings_ms)
                    .sort((a, b) => b[1] - a[1])
                    .map(([stage, ms]) => {
                      const maxMs = Math.max(...Object.values(stats.avg_stage_timings_ms));
                      return (
                        <div key={stage}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--flouv-text)', marginBottom: 3 }}>
                            <span style={{ textTransform: 'capitalize' }}>{stage.replace(/_ms$/, '').replace(/_/g, ' ')}</span>
                            <span style={{ color: 'var(--flouv-muted)' }}>{ms.toFixed(0)}ms</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: 'var(--flouv-bg-soft)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(ms / maxMs) * 100}%`, background: 'var(--flouv-blue)', borderRadius: 3 }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div style={{ background: 'var(--flouv-white)', borderRadius: 8, border: '1px solid var(--flouv-border)', padding: '20px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--flouv-text)', marginBottom: 14 }}>Most-cited knowledge base sources</div>
              {(stats?.top_sources ?? []).length === 0 ? (
                <div style={{ color: 'var(--flouv-muted)', fontSize: 13 }}>No citations yet — either no traffic, or answers are hitting fallback before citing anything.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stats.top_sources.map((s) => (
                    <div key={s.source} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--flouv-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }} title={s.source}>{s.source}</span>
                      <span style={{ color: 'var(--flouv-muted)', fontWeight: 600 }}>{s.citation_count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, margin: '0 0 12px', color: 'var(--flouv-blue)' }}>
            Recent conversations
          </h3>
          <p style={{ color: 'var(--flouv-muted)', fontSize: 12.5, margin: '-8px 0 12px' }}>Click a row to see the full conversation.</p>
          <div style={{ background: 'var(--flouv-white)', borderRadius: 8, border: '1px solid var(--flouv-border)', overflow: 'hidden' }}>
            {traces.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--flouv-muted)' }}>No messages yet.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Query</th>
                      <th style={thStyle}>Confidence</th>
                      <th style={thStyle}>Fallback</th>
                      <th style={thStyle}>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traces.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => t.session_id && setOpenSessionId(t.session_id)}
                        style={{ cursor: t.session_id ? 'pointer' : 'default' }}
                      >
                        <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: 'var(--flouv-muted)' }}>
                          {t.created_at ? new Date(t.created_at).toLocaleString() : '—'}
                        </td>
                        <td style={tdStyle} title={t.query || ''}>{truncate(t.query, 70)}</td>
                        <td style={tdStyle}>{Math.round((t.aggregate_confidence ?? 0) * 100)}%</td>
                        <td style={tdStyle}>
                          {t.fallback_triggered ? (
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#991b1b', background: 'rgba(239, 68, 68, 0.08)', padding: '2px 8px', borderRadius: 100 }}>YES</span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--flouv-muted)' }}>no</span>
                          )}
                        </td>
                        <td style={tdStyle}>${(t.cost_estimate_usd ?? 0).toFixed(5)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {openSessionId && (
        <SessionTranscriptModal sessionId={openSessionId} onClose={() => setOpenSessionId(null)} />
      )}
    </div>
  );
}
