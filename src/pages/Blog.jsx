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
      <main style={{ padding: '90px 56px 120px', background: 'var(--flouv-white)', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 60, textAlign: 'center' }}>
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
              The latest on non-thermal UV-C processing.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--flouv-muted)' }}>Loading posts...</div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--flouv-muted)' }}>No posts available yet. Check back soon!</div>
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
