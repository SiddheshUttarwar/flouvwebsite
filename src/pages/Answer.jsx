import { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Layout from '../components/Layout.jsx';

export default function Answer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  const messagesEndRef = useRef(null);
  const initialFetchDone = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    
    if (!q) {
      navigate('/');
      return;
    }

    // Only fetch the initial question once (protect against React StrictMode double-mount)
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchAnswer(q);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchAnswer = async (userQuery) => {
    setLoading(true);
    setError(null);
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    
    const sessionId = localStorage.getItem('rag_session_id');

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
        localStorage.setItem('rag_session_id', data.session_id);
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
    setGeneratingReport(true);
    const sessionId = localStorage.getItem('rag_session_id');
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const data = await res.json();
      setReport(data.report);
    } catch (err) {
      alert("Error generating report: " + err.message);
    }
    setGeneratingReport(false);
  };

  return (
    <Layout active="Home">
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: 'oklch(0.985 0.004 250)', minHeight: '80vh', padding: '60px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'oklch(0.5 0.01 250)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
              <span>←</span> Back to Home
            </Link>
            
            {messages.length > 1 && !report && (
              <button 
                onClick={generateReport}
                disabled={generatingReport || loading}
                style={{
                  background: 'oklch(0.18 0.02 260)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 100,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: (generatingReport || loading) ? 'not-allowed' : 'pointer',
                  opacity: (generatingReport || loading) ? 0.7 : 1
                }}
              >
                {generatingReport ? 'Synthesizing...' : 'Generate AI Report'}
              </button>
            )}
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, margin: 0, color: 'oklch(0.18 0.02 260)' }}>
            FloUV Knowledge Engine
          </h1>
          
          {/* Chat Window */}
          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.05)', border: '1px solid oklch(0.9 0.01 250)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            {/* Messages Area */}
            <div style={{ padding: '32px 40px', maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  {msg.role === 'user' ? (
                    <div style={{ background: 'oklch(0.95 0.01 250)', padding: '16px 24px', borderRadius: '24px 24px 4px 24px', fontSize: 17, color: 'oklch(0.2 0.01 250)' }}>
                      {msg.content}
                    </div>
                  ) : (
                    <div className="markdown-body" style={{ fontSize: 16, lineHeight: 1.7, color: 'oklch(0.2 0.01 250)' }}>
                      {(() => {
                        const parts = msg.content.split('|||');
                        if (parts.length >= 2) {
                          const imageName = parts[0].trim();
                          const textContent = parts.slice(1).join('|||').trim();
                          return (
                            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                              <img src={`/dynamic_images/${imageName}`} alt={imageName} style={{ width: '35%', borderRadius: 12, objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
                              <div style={{ width: '65%' }}>
                                <ReactMarkdown>{textContent}</ReactMarkdown>
                              </div>
                            </div>
                          );
                        }
                        return <ReactMarkdown>{msg.content}</ReactMarkdown>;
                      })()}
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div style={{ alignSelf: 'flex-start', maxWidth: '85%', width: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ height: 16, background: 'oklch(0.95 0.01 250)', borderRadius: 4, width: '100%', animation: 'pulse 1.5s infinite' }} />
                    <div style={{ height: 16, background: 'oklch(0.95 0.01 250)', borderRadius: 4, width: '90%', animation: 'pulse 1.5s infinite 0.2s' }} />
                    <div style={{ height: 16, background: 'oklch(0.95 0.01 250)', borderRadius: 4, width: '70%', animation: 'pulse 1.5s infinite 0.4s' }} />
                  </div>
                </div>
              )}
              
              {error && (
                <div style={{ padding: 24, background: 'oklch(0.95 0.05 20)', color: 'oklch(0.4 0.1 20)', borderRadius: 8 }}>
                  <strong>Error:</strong> {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} style={{ borderTop: '1px solid oklch(0.9 0.01 250)', padding: '20px 40px', background: 'oklch(0.99 0.002 250)', display: 'flex', gap: 16 }}>
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
                  border: '1px solid oklch(0.85 0.01 250)',
                  fontSize: 16,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  outline: 'none'
                }}
              />
              <button 
                type="submit"
                disabled={loading || !inputValue.trim()}
                style={{
                  background: 'linear-gradient(135deg, oklch(0.18 0.02 260), oklch(0.22 0.06 290))',
                  color: 'white',
                  border: 'none',
                  padding: '0 32px',
                  borderRadius: 100,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: (loading || !inputValue.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (loading || !inputValue.trim()) ? 0.7 : 1,
                  fontFamily: "'Space Grotesk', sans-serif"
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
          position: 'fixed', inset: 0, background: 'white', zIndex: 9999, overflowY: 'auto', padding: '40px 20px'
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
              <button onClick={() => setReport(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: 'oklch(0.5 0.01 250)' }}>
                ← Close
              </button>
              <button onClick={() => window.print()} style={{ background: 'oklch(0.18 0.02 260)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 100, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                Download PDF (Print)
              </button>
            </div>
            
            <div className="report-content" style={{ padding: '40px', border: '1px solid #eaeaea', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, marginBottom: 8 }}>FloUV Technology Brief</h1>
              <p style={{ color: 'oklch(0.5 0.01 250)', marginBottom: 40, fontSize: 14 }}>Generated automatically based on your research session.</p>
              
              <div className="markdown-body" style={{ fontSize: 16, lineHeight: 1.7, color: 'oklch(0.2 0.01 250)' }}>
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
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { font-family: 'Space Grotesk', sans-serif; margin-top: 32px; margin-bottom: 16px; color: oklch(0.18 0.02 260); }
        .markdown-body h3 { font-size: 20px; }
        .markdown-body ul, .markdown-body ol { padding-left: 24px; margin-bottom: 24px; }
        .markdown-body li { margin-bottom: 8px; }
        .markdown-body p { margin-bottom: 16px; }
        .markdown-body strong { color: oklch(0.1 0.01 250); }
        
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
