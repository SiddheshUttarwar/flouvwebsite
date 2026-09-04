import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const API_URL = '/api/blogs';
const UPLOAD_URL = '/api/upload';

export default function BlogsTab() {
  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState({ title: '', date: '', category: '', image: '', content: '', points: '', categories: '' });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch(API_URL, { credentials: 'include' });
      const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
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

  const validateJsonArrayField = (label, value) => {
    if (!value) return true;
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        alert(`${label} must be a JSON array, e.g. ["First point", "Second point"]`);
        return false;
      }
      return true;
    } catch (err) {
      alert(`${label} is not valid JSON: ${err.message}`);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile && !formData.image) {
        alert("Please select an image to upload.");
        return;
    }
    if (!validateJsonArrayField('Points', formData.points) || !validateJsonArrayField('Categories', formData.categories)) {
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 60 }}>

      {/* Create/Edit Blog Form */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--flouv-blue)' }}>
            {editingId ? 'Edit Blog' : 'Create New Blog'}
            </h2>
            {editingId && (
                <button onClick={cancelEdit} style={{ background: 'none', border: 'none', color: 'var(--flouv-muted)', cursor: 'pointer', textDecoration: 'underline' }}>
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
            style={{ padding: 12, borderRadius: 6, border: '1px solid var(--flouv-border)', fontFamily: "'Inter', sans-serif", fontSize: 15 }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <input
                name="date"
                placeholder="Date (e.g. 5/28/19)"
                value={formData.date}
                onChange={handleChange}
                required
                style={{ padding: 12, borderRadius: 6, border: '1px solid var(--flouv-border)', fontFamily: "'Inter', sans-serif", fontSize: 15 }}
            />
            <input
                name="category"
                placeholder="Category (e.g. Technology)"
                value={formData.category}
                onChange={handleChange}
                required
                style={{ padding: 12, borderRadius: 6, border: '1px solid var(--flouv-border)', fontFamily: "'Inter', sans-serif", fontSize: 15 }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <input
                name="points"
                placeholder='Points (JSON array)'
                value={formData.points || ''}
                onChange={handleChange}
                style={{ padding: 12, borderRadius: 6, border: '1px solid var(--flouv-border)', fontFamily: "'Inter', sans-serif", fontSize: 15 }}
            />
            <input
                name="categories"
                placeholder='Categories (JSON array)'
                value={formData.categories || ''}
                onChange={handleChange}
                style={{ padding: 12, borderRadius: 6, border: '1px solid var(--flouv-border)', fontFamily: "'Inter', sans-serif", fontSize: 15 }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'var(--flouv-muted)', fontWeight: 600 }}>
              {editingId ? 'Update Cover Image (optional)' : 'Upload Cover Image'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required={!editingId && !formData.image}
              style={{ padding: 10, borderRadius: 6, border: '1px solid var(--flouv-border)', fontFamily: "'Inter', sans-serif", fontSize: 14, background: 'var(--flouv-white)' }}
            />
            {editingId && formData.image && !imageFile && (
                <span style={{ fontSize: 12, color: 'var(--flouv-muted)' }}>Currently using: {formData.image.split('/').pop()}</span>
            )}
          </div>

          {/* Rich Text Editor */}
          <div style={{ background: 'var(--flouv-white)', borderRadius: 6, border: '1px solid var(--flouv-border)', overflow: 'hidden' }}>
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
              background: 'var(--flouv-green)',
              color: 'var(--flouv-green-ink)',
              border: 'none',
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              fontFamily: "'Inter', sans-serif",
              marginTop: 40
            }}
          >
            {loading ? 'Saving...' : (editingId ? 'Update Blog' : 'Publish Blog')}
          </button>
        </form>
      </div>

      {/* Manage Blogs List */}
      <div>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, margin: '0 0 24px', color: 'var(--flouv-blue)' }}>
          Manage Blogs
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {blogs.length === 0 ? (
            <p style={{ color: 'var(--flouv-muted)' }}>No blogs found. Create one!</p>
          ) : (
            blogs.map((blog) => (
              <div key={blog.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'var(--flouv-white)', borderRadius: 8, boxShadow: '0 4px 12px oklch(0.3 0.08 264 / 0.05)', border: editingId === blog.id ? '2px solid var(--flouv-blue)' : '2px solid transparent' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--flouv-blue)', marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>{blog.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--flouv-muted)', fontFamily: "'Inter', sans-serif" }}>{blog.date} &bull; {blog.category}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                    onClick={() => handleEdit(blog)}
                    style={{
                        background: 'var(--flouv-border)',
                        color: 'var(--flouv-blue)',
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
                        background: 'var(--flouv-blue)',
                        color: 'var(--flouv-white)',
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
  );
}
