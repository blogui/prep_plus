import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const EMPTY_FORM = { title: '', description: '', isPaid: false, price: 0, duration: '', difficulty: 'Beginner', totalQuestions: 0, totalMarks: 0, isPublished: false, topics: '', thumbnail: '' };

const AdminCoursesTab = ({ courses, onCoursesChanged }) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCategories().then(d => setCategories(d || [])).catch(() => {});
  }, []);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setSelectedCategory(''); setShowForm(true); setError(''); };
  const openEdit = (c) => {
    setEditing(c);
    const catId = Array.isArray(c.category) ? c.category[0]?._id : c.category?._id;
    setSelectedCategory(catId || '');
    setForm({
      title: c.title || '', description: c.description || '', isPaid: c.isPaid || false,
      price: c.price || 0, duration: c.duration || '', difficulty: c.difficulty || 'Beginner',
      totalQuestions: c.totalQuestions || 0, totalMarks: c.totalMarks || 0,
      isPublished: c.isPublished || false, topics: (c.topics || []).join(', '), thumbnail: c.thumbnail || '',
    });
    setShowForm(true); setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...form, category: selectedCategory ? [selectedCategory] : [], topics: form.topics ? form.topics.split(',').map(t => t.trim()).filter(Boolean) : [], price: Number(form.price), totalQuestions: Number(form.totalQuestions), totalMarks: Number(form.totalMarks) };
      if (editing) { await api.updateCourse(editing._id || editing.id, payload); }
      else { await api.createCourse(payload); }
      setShowForm(false);
      onCoursesChanged();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course? This is irreversible.')) return;
    try { await api.deleteCourse(id); onCoursesChanged(); }
    catch (e) { setError(e.message); }
  };

  const togglePublish = async (course) => {
    try { await api.updateCourse(course._id || course.id, { isPublished: !course.isPublished }); onCoursesChanged(); }
    catch (e) { setError(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Courses ({courses.length})</h3>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      {showForm && (
        <form onSubmit={handleSave} className="bg-gray-50 border rounded-xl p-5 space-y-3">
          <h4 className="font-semibold text-gray-800">{editing ? 'Edit' : 'New'} Course</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">— Category —</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <textarea required rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option>Beginner</option><option>Intermediate</option><option>Pro</option>
            </select>
            <input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="Duration e.g. 60 mins" className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="number" min={0} value={form.totalQuestions} onChange={e => setForm({ ...form, totalQuestions: e.target.value })} placeholder="Total questions" className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="number" min={0} value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: e.target.value })} placeholder="Total marks" className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <input value={form.topics} onChange={e => setForm({ ...form, topics: e.target.value })} placeholder="Topics (comma-separated)" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <input value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} placeholder="Thumbnail URL" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.isPaid} onChange={e => setForm({ ...form, isPaid: e.target.checked })} className="rounded" /> Paid</label>
            {form.isPaid && <input type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Price (₹)" className="w-28 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />}
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} className="rounded" /> Published</label>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"><Check className="w-4 h-4" />{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"><X className="w-4 h-4" />Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-gray-600"><th className="py-3 px-4">Title</th><th className="py-3 px-4">Type</th><th className="py-3 px-4">Questions</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Actions</th></tr></thead>
          <tbody>
            {courses.map(course => (
              <tr key={course._id || course.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4"><div className="font-medium text-gray-900">{course.title}</div><div className="text-xs text-gray-400">{course.difficulty}</div></td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${course.isPaid ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{course.isPaid ? `₹${course.price}` : 'Free'}</span></td>
                <td className="py-3 px-4 text-gray-600">{course.totalQuestions || 0}</td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${course.isPublished ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>{course.isPublished ? 'Published' : 'Draft'}</span></td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => togglePublish(course)} title={course.isPublished ? 'Unpublish' : 'Publish'} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded">{course.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    <button onClick={() => openEdit(course)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(course._id || course.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No courses yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCoursesTab;
