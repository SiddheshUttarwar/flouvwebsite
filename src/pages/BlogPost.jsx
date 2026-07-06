import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import 'react-quill/dist/quill.snow.css'; // Add this to style the editor content

const API_URL = '/api/blogs';

export default function BlogPost() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBlog(data);
        } else {
          setBlog(null);
        }
      } catch (err) {
        console.error('Failed to fetch blog', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <main style={{ padding: '120px 56px', textAlign: 'center', background: 'oklch(0.985 0.004 250)', minHeight: '80vh' }}>
          Loading...
        </main>
      </Layout>
    );
  }

  let parsedPoints = [];
  try {
    if (blog && blog.points) parsedPoints = JSON.parse(blog.points);
  } catch (e) {}

  let parsedCategories = [];
  try {
    if (blog && blog.categories) parsedCategories = JSON.parse(blog.categories);
  } catch (e) {}

  if (!blog) {
    return (
      <Layout>
        <main style={{ padding: '120px 56px', textAlign: 'center', background: 'oklch(0.985 0.004 250)', minHeight: '80vh' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 40, color: 'oklch(0.18 0.02 260)' }}>Blog post not found.</h1>
          <Link to="/blog" style={{ color: 'oklch(0.55 0.19 295)', textDecoration: 'none', fontWeight: 600 }}>← Back to all posts</Link>
        </main>
      </Layout>
    );
  }

  return (
    <Layout active="Blog">
      <main style={{ background: 'oklch(0.985 0.004 250)', minHeight: '100vh', paddingBottom: 120 }}>
        
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px 0' }}>
          <Link to="/blog" style={{ color: 'oklch(0.5 0.01 250)', textDecoration: 'none', fontSize: 14, fontWeight: 500, fontFamily: "'IBM Plex Sans', sans-serif" }}>
            ← Back to Blog
          </Link>
          
          <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', background: 'oklch(0.18 0.02 260)', color: 'white', fontSize: 12, fontWeight: 600, borderRadius: 100, fontFamily: "'IBM Plex Sans', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {blog.category}
            </div>
            {parsedCategories.map((cat, i) => (
              <div key={i} style={{ display: 'inline-block', padding: '4px 12px', background: 'oklch(0.9 0.01 250)', color: 'oklch(0.18 0.02 260)', fontSize: 12, fontWeight: 600, borderRadius: 100, fontFamily: "'IBM Plex Sans', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {cat}
              </div>
            ))}
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 48, fontWeight: 700, margin: '16px 0 16px', lineHeight: 1.1, color: 'oklch(0.18 0.02 260)' }}>
            {blog.title}
          </h1>
          
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: 'oklch(0.5 0.01 250)', marginBottom: 40, letterSpacing: '0.02em' }}>
            {blog.date}
          </div>
        </div>

        {blog.image && (
          <div style={{ maxWidth: 1000, margin: '0 auto 60px', padding: '0 24px' }}>
            <img 
              src={blog.image} 
              alt={blog.title} 
              style={{ width: '100%', borderRadius: 12, boxShadow: '0 20px 50px oklch(0.4 0.02 260 / 0.15)' }} 
            />
          </div>
        )}

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
          {/* We use dangerouslySetInnerHTML to render the HTML from React Quill */}
          <div 
            className="ql-editor"
            dangerouslySetInnerHTML={{ __html: blog.content }}
            style={{ 
              fontFamily: "'IBM Plex Sans', sans-serif", 
              fontSize: 18, 
              lineHeight: 1.8, 
              color: 'oklch(0.3 0.01 250)',
              padding: 0,
              marginBottom: parsedPoints.length > 0 ? 40 : 0
            }}
          />
          
          {parsedPoints.length > 0 && (
            <div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, color: 'oklch(0.18 0.02 260)', marginBottom: 16 }}>Key Points</h3>
              <ul style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 18, lineHeight: 1.8, color: 'oklch(0.3 0.01 250)', paddingLeft: 24 }}>
                {parsedPoints.map((pt, i) => (
                  <li key={i} style={{ marginBottom: 8 }}>{pt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
      </main>
    </Layout>
  );
}
