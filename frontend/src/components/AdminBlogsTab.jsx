import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Plus, Edit, Trash2, Check, X, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    [{ color: [] }, { background: [] }],
    ['clean'],
  ],
};
const QUILL_FORMATS = ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'blockquote', 'code-block', 'link', 'image', 'color', 'background'];

const EMPTY_FORM = { title: '', summary: '', coverImage: '', tags: '', isPublished: false };

const AdminBlogsTab = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchBlogs = async () => {
    setLoading(true);
    try { const data = await api.getAllBlogsAdmin(); setBlogs(data || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setContent(''); setShowForm(true); setError(''); };
  const openEdit = async (blog) => {
    setEditing(blog);
    setForm({ title: blog.title || '', summary: blog.summary || '', coverImage: blog.coverImage || '', tags: (blog.tags || []).join(', '), isPublished: blog.isPublished || false });
    try { const full = await api.getBlogByIdAdmin(blog._id); setContent(full.content || ''); }
    catch { setContent(''); }
    setShowForm(true); setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!content || content === '<p><br></p>') { setError('Content cannot be empty.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, content, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (editing) { await api.updateBlog(editing._id, payload); }
      else { await api.createBlog(payload); }
      setShowForm(false); setContent('');
      await fetchBlogs();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try { await api.deleteBlog(id); await fetchBlogs(); }
    catch (e) { setError(e.message); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Blog Posts ({blogs.length})</h3>
        {!showForm && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="w-4 h-4" /> New Post
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      {showForm && (
        <form onSubmit={handleSave} className="bg-gray-50 border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">{editing ? 'Edit Post' : 'New Post'}</h4>
            <button type="button" onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>

          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Post title" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <textarea rows={2} value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })}
            placeholder="Short summary shown on blog list…" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          <input value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })}
            placeholder="Cover image URL (optional)" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
            placeholder="Tags (comma-separated, e.g. 11+ Exam, Tips)" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />

          {/* Rich-text editor */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">Content</p>
            <div className="bg-white rounded-lg border overflow-hidden">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={QUILL_MODULES}
                formats={QUILL_FORMATS}
                style={{ minHeight: '300px' }}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} className="rounded" />
            Publish immediately (visible to readers)
          </label>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex items-center gap-1 px-5 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
              <Check className="w-4 h-4" /> {saving ? 'Saving…' : (form.isPublished ? 'Publish' : 'Save as Draft')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        loading ? <p className="text-gray-400 text-sm">Loading…</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-600">
                <th className="py-3 px-4">Title</th><th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Read Time</th><th className="py-3 px-4">Published</th><th className="py-3 px-4">Actions</th>
              </tr></thead>
              <tbody>
                {blogs.map(blog => (
                  <tr key={blog._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{blog.title}</div>
                      {blog.tags?.length > 0 && <div className="text-xs text-gray-400 mt-0.5">{blog.tags.join(', ')}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${blog.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-700'}`}>
                        {blog.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{blog.readTime} min</td>
                    <td className="py-3 px-4 text-gray-500">{formatDate(blog.publishedAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(blog)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(blog._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {blogs.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No blog posts yet. Create your first one!</td></tr>}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default AdminBlogsTab;
