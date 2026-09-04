import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';

const SUGGESTED_QUESTIONS = [
  'Does this work on whole milk?',
  "What's the ROI vs. thermal pasteurization?",
  'How does it compare to HPP?',
  'Can it retrofit our existing line?',
];

export default function FAQ() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const ask = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate('/answer?q=' + encodeURIComponent(trimmed));
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') ask();
  };

  return (
    <Layout active="FAQ">
      <div style={{ fontFamily: "'Inter', sans-serif", background: 'var(--flouv-white)', color: 'var(--flouv-ink)' }}>
        {/* ASK FLOUV — AI-powered question bar */}
        <section style={{ background: 'var(--flouv-bg-soft)', padding: '78px 24px 84px' }}>
          <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--flouv-blue)',
                marginBottom: 14,
              }}
            >
              FAQ
            </div>
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                margin: '0 0 14px',
                lineHeight: 1.1,
              }}
            >
              Ask FloUV
            </h1>
            <p style={{ fontSize: 17, color: 'var(--flouv-text)', lineHeight: 1.6, margin: '0 auto 40px', maxWidth: 620 }}>
              Ask about applications, ROI, or the science — get an instant, expert answer.
            </p>

            <div
              style={{
                background: 'var(--flouv-white)',
                border: '1px solid var(--flouv-border-soft)',
                borderRadius: 24,
                padding: '26px 28px 22px',
                boxShadow: '0 24px 64px oklch(0.3 0.05 264 / 0.12)',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'var(--flouv-bg-soft)',
                  border: '1px solid var(--flouv-border)',
                  borderRadius: 100,
                  padding: '6px 6px 6px 22px',
                }}
              >
                <span style={{ fontSize: 17, flexShrink: 0 }}>✨</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="e.g. Does this work on whole milk?"
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 16,
                    fontFamily: "'Inter', sans-serif",
                    color: 'var(--flouv-ink)',
                    padding: '12px 0',
                  }}
                />
                <button
                  onClick={ask}
                  style={{
                    background: 'var(--flouv-green)',
                    color: 'var(--flouv-green-ink)',
                    border: 'none',
                    borderRadius: 100,
                    padding: '13px 28px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Ask FloUV →
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => navigate('/answer?q=' + encodeURIComponent(q))}
                    style={{
                      background: 'var(--flouv-white)',
                      border: '1px solid var(--flouv-border)',
                      borderRadius: 100,
                      padding: '8px 16px',
                      fontSize: 13,
                      color: 'var(--flouv-text)',
                      cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
