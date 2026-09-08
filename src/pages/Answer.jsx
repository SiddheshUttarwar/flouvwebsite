import { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Layout from '../components/Layout.jsx';
import { useChat } from '../context/ChatContext.jsx';

export default function Answer() {
  const location = useLocation();
  const navigate = useNavigate();
  // messages/sessionId live in ChatContext (in-memory, at the router root) —
  // survives navigating away and back within the app, but a real browser
  // refresh remounts the whole tree and starts a fresh session, by design.
  const { messages, setMessages, sessionId, setSessionId } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportEmail, setReportEmail] = useState('');
  const [sendingReport, setSendingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportSendError, setReportSendError] = useState(null);

  const messagesContainerRef = useRef(null);
  const initialFetchDone = useRef(false);
  // Snapshot taken once at mount, deliberately NOT the live `messages` state
  // below — fetchAnswer adds messages asynchronously, and stripping `?q=`
  // right after firing it (below) re-runs this effect while that fetch is
  // still in flight. Checking the live (still-empty) `messages` at that
  // moment would redirect the user home mid-answer; this snapshot can't
  // change out from under that check.
  const hadHistoryOnMount = useRef(messages.length > 0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');

    if (!q) {
      // No new question in the URL and nothing was restored from a prior
      // visit — there's genuinely nothing to show here.
      if (!hadHistoryOnMount.current && !initialFetchDone.current) navigate('/');
      return;
    }

    // Only fetch the initial question once (protect against React StrictMode double-mount)
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchAnswer(q);
      // Strip ?q= immediately after consuming it, so a later remount of this
      // page (browser back/forward, or landing here with no new question)
      // never re-fires the same question against the restored history.
      navigate('/answer', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    // Scroll only the chat window's own message list, not scrollIntoView()
    // (which walks up every scrollable ancestor, including the whole page,
    // and was yanking the entire browser viewport down to the footer).
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const fetchAnswer = async (userQuery) => {
    setLoading(true);
    setError(null);

    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery, session_id: sessionId || null }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch answer from the knowledge engine.');
      }

      const data = await res.json();

      // Add assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);

      if (data.session_id) {
        setSessionId(data.session_id);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;
    const query = inputValue.trim();
    setInputValue('');
    fetchAnswer(query);
  };

  const generateReport = async () => {
    const hasAssistantMessage = messages.some((m) => m.role === 'assistant');

    // Don't attempt a report before the first answer has resolved — the backend
    // needs a valid session id, which only exists once an assistant reply comes back.
    if (!sessionId || !hasAssistantMessage) {
      alert('Please wait for an answer before generating a report.');
      return;
    }

    setGeneratingReport(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const data = await res.json();
      setReport(data.report);
      setReportSent(false);
      setReportSendError(null);
    } catch (err) {
      alert("Error generating report: " + err.message);
    }
    setGeneratingReport(false);
  };

  const sendReportEmail = async (e) => {
    e.preventDefault();
    const trimmed = reportEmail.trim();
    if (!trimmed || sendingReport) return;

    setSendingReport(true);
    setReportSendError(null);
    try {
      const res = await fetch('/api/report/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, report_markdown: report }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to send the report');
      }
      setReportSent(true);
    } catch (err) {
      setReportSendError(err.message);
    }
    setSendingReport(false);
  };

  return (
    <Layout active="Home">
      <div className="answer-page" style={{ fontFamily: "'Inter', sans-serif", background: 'var(--flouv-bg-soft)', minHeight: '80vh', padding: '60px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'var(--flouv-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
              <span>←</span> Back to Home
            </Link>

            {messages.length > 1 && !report && (
              <button
                onClick={generateReport}
                disabled={generatingReport || loading}
                style={{
                  background: 'var(--flouv-green)',
                  color: 'var(--flouv-green-ink)',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 100,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: (generatingReport || loading) ? 'not-allowed' : 'pointer',
                  opacity: (generatingReport || loading) ? 0.7 : 1
                }}
              >
                {generatingReport ? 'Synthesizing...' : 'Generate Report'}
              </button>
            )}
          </div>

          <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 700, margin: 0, color: 'var(--flouv-blue)' }}>
            FloUV Knowledge Engine
          </h1>

          {/* Chat Window */}
          <div style={{ background: 'var(--flouv-white)', borderRadius: 16, boxShadow: '0 12px 40px oklch(0.3 0.08 264 / 0.05)', border: '1px solid var(--flouv-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            {/* Messages Area */}
            <div ref={messagesContainerRef} className="answer-messages" style={{ padding: '32px 40px', maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  {msg.role === 'user' ? (
                    <div style={{ background: 'var(--flouv-bg-soft)', padding: '16px 24px', borderRadius: '24px 24px 4px 24px', fontSize: 17, color: 'var(--flouv-ink)' }}>
                      {msg.content}
                    </div>
                  ) : (
                    <div className="markdown-body" style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--flouv-ink)' }}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div style={{ alignSelf: 'flex-start', maxWidth: '85%', width: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ height: 16, background: 'var(--flouv-bg-soft)', borderRadius: 4, width: '100%', animation: 'pulse 1.5s infinite' }} />
                    <div style={{ height: 16, background: 'var(--flouv-bg-soft)', borderRadius: 4, width: '90%', animation: 'pulse 1.5s infinite 0.2s' }} />
                    <div style={{ height: 16, background: 'var(--flouv-bg-soft)', borderRadius: 4, width: '70%', animation: 'pulse 1.5s infinite 0.4s' }} />
                  </div>
                </div>
              )}

              {error && (
                <div style={{ padding: 24, background: 'var(--flouv-bg-soft)', color: 'var(--flouv-text)', borderRadius: 8 }}>
                  <strong>Error:</strong> {error}
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="answer-input-form" style={{ borderTop: '1px solid var(--flouv-border)', padding: '20px 40px', background: 'var(--flouv-white)', display: 'flex', gap: 16 }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a follow-up question..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: 100,
                  border: '1px solid var(--flouv-border)',
                  fontSize: 16,
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                className="answer-send-btn"
                disabled={loading || !inputValue.trim()}
                style={{
                  background: 'var(--flouv-green)',
                  color: 'var(--flouv-green-ink)',
                  border: 'none',
                  padding: '0 32px',
                  borderRadius: 100,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: (loading || !inputValue.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (loading || !inputValue.trim()) ? 0.7 : 1,
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Send
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Report Modal / Overlay for Printing */}
      {report && (
        <div style={{
          position: 'fixed', inset: 0, background: 'var(--flouv-white)', zIndex: 9999, overflowY: 'auto', padding: '40px 20px'
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setReport(null);
                  setReportEmail('');
                  setReportSent(false);
                  setReportSendError(null);
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--flouv-muted)' }}
              >
                ← Close
              </button>

              {reportSent ? (
                <div style={{ fontSize: 14, fontWeight: 600, color: '#166534' }}>✓ Sent to {reportEmail}</div>
              ) : (
                <form onSubmit={sendReportEmail} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="email"
                    required
                    value={reportEmail}
                    onChange={(e) => setReportEmail(e.target.value)}
                    placeholder="you@company.com"
                    disabled={sendingReport}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 100,
                      border: '1px solid var(--flouv-border)',
                      fontSize: 14,
                      fontFamily: "'Inter', sans-serif",
                      outline: 'none',
                      minWidth: 220,
                    }}
                  />
                  <button
                    type="submit"
                    disabled={sendingReport || !reportEmail.trim()}
                    style={{
                      background: 'var(--flouv-green)',
                      color: 'var(--flouv-green-ink)',
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: 100,
                      fontSize: 14,
                      fontWeight: 700,
                      fontFamily: "'Inter', sans-serif",
                      cursor: sendingReport || !reportEmail.trim() ? 'not-allowed' : 'pointer',
                      opacity: sendingReport || !reportEmail.trim() ? 0.7 : 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {sendingReport ? 'Sending...' : 'Email me this report'}
                  </button>
                </form>
              )}
            </div>
            {reportSendError && (
              <div className="no-print" style={{ marginBottom: 24, fontSize: 13.5, color: '#991b1b' }}>{reportSendError}</div>
            )}

            <div className="report-content" style={{ padding: '40px', border: '1px solid var(--flouv-border)', borderRadius: 8, boxShadow: '0 10px 30px oklch(0.3 0.08 264 / 0.05)' }}>
              <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, marginBottom: 8 }}>FloUV Technology Brief</h1>
              <p style={{ color: 'var(--flouv-muted)', marginBottom: 40, fontSize: 14 }}>Generated automatically based on your research session.</p>

              <div className="markdown-body" style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--flouv-ink)' }}>
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { font-family: 'Inter', sans-serif; margin-top: 32px; margin-bottom: 16px; color: var(--flouv-blue); }
        .markdown-body h3 { font-size: 20px; }
        .markdown-body ul, .markdown-body ol { padding-left: 24px; margin-bottom: 24px; }
        .markdown-body li { margin-bottom: 8px; }
        .markdown-body p { margin-bottom: 16px; }
        .markdown-body strong { color: var(--flouv-blue); }
        
        @media print {
          body * {
            visibility: hidden;
          }
          .report-content, .report-content * {
            visibility: visible;
          }
          .report-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
}
