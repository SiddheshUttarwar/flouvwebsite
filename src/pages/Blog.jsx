import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';

const API_URL = '/api/blogs';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch blogs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <Layout active="Blog">
      <main style={{ padding: '68px 56px 84px', background: 'var(--flouv-white)', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 44, textAlign: 'center' }}>
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 56,
                fontWeight: 700,
                margin: '0 0 16px',
                letterSpacing: '-0.02em',
                color: 'var(--flouv-blue)',
              }}
            >
              Blog & Insights
            </h1>
            <p style={{ fontSize: 19, color: 'var(--flouv-text)', margin: 0 }}>
              Notes from the lab and the plant floor on non-thermal UV-C processing.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--flouv-muted)', padding: '60px 0' }}>Loading posts…</div>
          ) : posts.length === 0 ? (
            <div
              style={{
                maxWidth: 720,
                margin: '0 auto',
                padding: '56px 48px 52px',
                background: 'var(--flouv-bg-soft)',
                border: '1px solid oklch(0.90 0.02 258)',
                borderRadius: 18,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  margin: '0 auto 22px',
                  borderRadius: 16,
                  background: 'var(--flouv-blue-tint)',
                  color: 'var(--flouv-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="30" height="30" viewBox="0 0 40 40" aria-hidden="true">
                  <path
                    d="M8 9h17l7 7v15a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                  <path d="M25 9v7h7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
                  <path d="M12 22h13M12 27h9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--flouv-blue-soft)', marginBottom: 10 }}>
                COMING SOON
              </div>
              <h2
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  margin: '0 0 14px',
                  lineHeight: 1.25,
                }}
              >
                We’re working on something worth your time
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--flouv-text)', margin: '0 0 12px' }}>
                We are writing up what we have actually learned — how dose gets validated in a liquid light cannot
                penetrate, what survives non-thermal treatment that heat destroys, and the plant-floor detail that
                rarely makes it into a brochure.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--flouv-text)', margin: '0 0 30px' }}>
                No filler, no press releases. Just the useful parts. First pieces are on the way.
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  to="/faq"
                  style={{
                    background: 'var(--flouv-green)',
                    color: 'var(--flouv-green-ink)',
                    padding: '13px 26px',
                    borderRadius: 100,
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Ask us anything now →
                </Link>
                <Link
                  to="/technology"
                  style={{
                    background: 'transparent',
                    color: 'var(--flouv-blue)',
                    padding: '13px 26px',
                    borderRadius: 100,
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 700,
                    border: '1px solid var(--flouv-blue-soft)',
                  }}
                >
                  Explore the technology
                </Link>
              </div>

              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--flouv-muted)', margin: '26px 0 0' }}>
                Want them as they land? Sign up with your email at the foot of this page.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
                gap: '80px 60px',
              }}
            >
              {posts.map((post) => (
                <div key={post.id} style={{ textAlign: 'center' }}>
                  <Link to={`/blog/${post.id}`} style={{ textDecoration: 'none' }}>
                    <img
                      src={post.image}
                      alt={post.title}
                      style={{
                        width: '100%',
                        aspectRatio: '3/2',
                        objectFit: 'cover',
                        marginBottom: 24,
                        borderRadius: 8,
                        boxShadow: '0 10px 30px oklch(0.3 0.05 264 / 0.1)',
                      }}
                    />
                  </Link>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: 'var(--flouv-muted)',
                      marginBottom: 12,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {post.date} &bull; {post.category}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 26,
                      fontWeight: 600,
                      color: 'var(--flouv-blue)',
                      margin: '0 0 16px',
                      lineHeight: 1.3,
                    }}
                  >
                    <Link to={`/blog/${post.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {post.title}
                    </Link>
                  </h3>
                  <Link
                    to={`/blog/${post.id}`}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--flouv-blue)',
                      textDecoration: 'none',
                      borderBottom: '1px solid var(--flouv-blue)',
                      paddingBottom: 2,
                    }}
                  >
                    Read More
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
