import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Layout from '../components/Layout.jsx';
import Login from './Login.jsx';

const API_URL = '/api/blogs';
const UPLOAD_URL = '/api/upload';

export default function Admin() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState({ title: '', date: '', category: '', image: '', content: '', points: '', categories: '' });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/check-auth', { credentials: 'include' });
      if (res.ok) {
        setIsAuthenticated(true);
        fetchBlogs();
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
    setIsCheckingAuth(false);
  };

  const fetchBlogs = async () => {
    try {
      const res = await fetch(API_URL, { credentials: 'include' });
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      console.error('Failed to fetch blogs', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleEdit = (blog) => {
    setFormData(blog);
    setEditingId(blog.id);
    setImageFile(null); // Keep existing image unless they select a new one
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setFormData({ title: '', date: '', category: '', image: '', content: '', points: '', categories: '' });
    setEditingId(null);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile && !formData.image) {
        alert("Please select an image to upload.");
        return;
    }
    setLoading(true);
    
    let imageUrl = formData.image;
    
    // 1. Upload the image first if a new one was selected
    if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('file', imageFile);
        
        try {
            const uploadRes = await fetch(UPLOAD_URL, {
                method: 'POST',
                credentials: 'include',
                body: uploadData
            });
            if (uploadRes.ok) {
                const uploadJson = await uploadRes.json();
                imageUrl = uploadJson.url; 
            } else {
                const errText = await uploadRes.text();
                alert(`Image upload failed: ${errText}`);
                setLoading(false);
                return;
            }
        } catch (err) {
            console.error('Failed to upload image', err);
            alert(`Failed to connect to backend for image upload: ${err.message}`);
            setLoading(false);
            return;
        }
    }

    // 2. Submit or Update the blog post
    try {
      const payload = { ...formData, image: imageUrl };
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `${API_URL}/${editingId}` : API_URL;

      const res = await fetch(endpoint, {
        method: method,
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setFormData({ title: '', date: '', category: '', image: '', content: '', points: '', categories: '' });
        setImageFile(null);
        setEditingId(null);
        e.target.reset(); // clears the file input visually
        fetchBlogs();
        alert(editingId ? "Blog updated successfully!" : "Blog published successfully!");
      } else {
        const errText = await res.text();
        alert(`Failed to save blog to database: ${errText}`);
      }
    } catch (err) {
      console.error('Failed to save blog', err);
      alert(`Failed to connect to backend to save blog: ${err.message}`);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) fetchBlogs();
    } catch (err) {
      console.error('Failed to delete blog', err);
    }
  };

  const handleSyncDrive = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/ingest-gdrive', { 
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Success! ${data.message}`);
      } else {
        alert(`Failed to sync: ${data.detail || JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error('Failed to sync drive', err);
      alert(`Network error during sync: ${err.message}`);
    }
    setIsSyncing(false);
  };

  if (isCheckingAuth) {
    return <Layout active="Admin"><div style={{ padding: 100, textAlign: 'center' }}>Loading...</div></Layout>;
  }

  if (!isAuthenticated) {
    return (
      <Layout active="Admin">
        <Login onSuccess={() => {
          setIsAuthenticated(true);
          fetchBlogs();
        }} />
      </Layout>
    );
  }

  return (
    <Layout active="Admin">
      <main style={{ padding: '60px 56px', background: 'oklch(0.985 0.004 250)', minHeight: '80vh' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 60 }}>
          
          {/* Create/Edit Blog Form */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, margin: 0, color: 'oklch(0.18 0.02 260)' }}>
                {editingId ? 'Edit Blog' : 'Create New Blog'}
                </h2>
                {editingId && (
                    <button onClick={cancelEdit} style={{ background: 'none', border: 'none', color: 'oklch(0.5 0.01 250)', cursor: 'pointer', textDecoration: 'underline' }}>
                        Cancel Edit
                    </button>
                )}
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input
                name="title"
                placeholder="Blog Title"
                value={formData.title}
                onChange={handleChange}
                required
                style={{ padding: 12, borderRadius: 6, border: '1px solid #ddd', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 15 }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <input
                    name="date"
                    placeholder="Date (e.g. 5/28/19)"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    style={{ padding: 12, borderRadius: 6, border: '1px solid #ddd', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 15 }}
                />
                <input
                    name="category"
                    placeholder="Category (e.g. Technology)"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    style={{ padding: 12, borderRadius: 6, border: '1px solid #ddd', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 15 }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <input
                    name="points"
                    placeholder='Points (JSON array)'
                    value={formData.points || ''}
                    onChange={handleChange}
                    style={{ padding: 12, borderRadius: 6, border: '1px solid #ddd', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 15 }}
                />
                <input
                    name="categories"
                    placeholder='Categories (JSON array)'
                    value={formData.categories || ''}
                    onChange={handleChange}
                    style={{ padding: 12, borderRadius: 6, border: '1px solid #ddd', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 15 }}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: 'oklch(0.5 0.01 250)', fontWeight: 600 }}>
                  {editingId ? 'Update Cover Image (optional)' : 'Upload Cover Image'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required={!editingId && !formData.image}
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, background: 'white' }}
                />
                {editingId && formData.image && !imageFile && (
                    <span style={{ fontSize: 12, color: 'oklch(0.5 0.01 250)' }}>Currently using: {formData.image.split('/').pop()}</span>
                )}
              </div>

              {/* Rich Text Editor */}
              <div style={{ background: 'white', borderRadius: 6, border: '1px solid #ddd', overflow: 'hidden' }}>
                <ReactQuill 
                    theme="snow" 
                    value={formData.content} 
                    onChange={handleQuillChange} 
                    style={{ height: '300px' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px 24px',
                  background: 'oklch(0.18 0.02 260)',
                  color: 'oklch(0.98 0.005 250)',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  marginTop: 40
                }}
              >
                {loading ? 'Saving...' : (editingId ? 'Update Blog' : 'Publish Blog')}
              </button>
            </form>
          </div>

          {/* Right Column: KB Sync and Manage Blogs List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            
            {/* Knowledge Base Sync Section */}
            <div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, margin: '0 0 16px', color: 'oklch(0.18 0.02 260)' }}>
                Knowledge Base
              </h2>
              <div style={{ padding: 24, background: 'white', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid oklch(0.9 0.01 250)' }}>
                <p style={{ color: 'oklch(0.4 0.01 250)', marginTop: 0, marginBottom: 20, fontSize: 14, lineHeight: 1.5 }}>
                  Click below to fetch the latest documents from your connected Google Drive folder. This will automatically rebuild the AI's vectors so it instantly learns new information.
                </p>
                <button
                  onClick={handleSyncDrive}
                  disabled={isSyncing}
                  style={{
                    padding: '12px 20px',
                    background: 'oklch(0.6 0.19 295)', // brand blue
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: isSyncing ? 'wait' : 'pointer',
                    width: '100%',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    opacity: isSyncing ? 0.7 : 1
                  }}
                >
                  {isSyncing ? 'Syncing Google Drive (this may take a minute)...' : 'Sync Google Drive Now'}
                </button>
              </div>
            </div>

            {/* Manage Blogs Section */}
            <div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, margin: '0 0 24px', color: 'oklch(0.18 0.02 260)' }}>
              Manage Blogs
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {blogs.length === 0 ? (
                <p style={{ color: 'oklch(0.5 0.01 250)' }}>No blogs found. Create one!</p>
              ) : (
                blogs.map((blog) => (
                  <div key={blog.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'white', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: editingId === blog.id ? '2px solid oklch(0.18 0.02 260)' : '2px solid transparent' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'oklch(0.18 0.02 260)', marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>{blog.title}</div>
                      <div style={{ fontSize: 12, color: 'oklch(0.5 0.01 250)', fontFamily: "'IBM Plex Sans', sans-serif" }}>{blog.date} &bull; {blog.category}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                        onClick={() => handleEdit(blog)}
                        style={{
                            background: 'oklch(0.9 0.01 250)',
                            color: 'oklch(0.18 0.02 260)',
                            border: 'none',
                            borderRadius: 4,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                        >
                        Edit
                        </button>
                        <button
                        onClick={() => handleDelete(blog.id)}
                        style={{
                            background: 'oklch(0.6 0.19 295)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                        >
                        Delete
                        </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
