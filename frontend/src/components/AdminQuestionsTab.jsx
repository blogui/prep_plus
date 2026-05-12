import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';

const EMPTY_OPTION = { text: '', isCorrect: false };
const EMPTY_FORM = { courseId: '', questionText: '', difficulty: 'easy', marks: 1, negativeMarks: 0, tags: '', explanation: '', options: [{ ...EMPTY_OPTION }, { ...EMPTY_OPTION }, { ...EMPTY_OPTION }, { ...EMPTY_OPTION }] };

const AdminQuestionsTab = ({ courses, user }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchQuestions = async (courseId) => {
    if (!courseId) return;
    setLoading(true); setError('');
    try {
      const data = await api.getQuestions(courseId);
      setQuestions(Array.isArray(data) ? data : (data?.data || []));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuestions(selectedCourse); }, [selectedCourse]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, courseId: selectedCourse });
    setShowForm(true); setError('');
  };

  const openEdit = (q) => {
    setEditing(q);
    setForm({
      courseId: q.courseId?._id || q.courseId,
      questionText: q.questionText || '',
      difficulty: q.difficulty || 'easy',
      marks: q.marks || 1,
      negativeMarks: q.negativeMarks || 0,
      tags: (q.tags || []).join(', '),
      explanation: q.explanation?.text || '',
      options: q.options?.length ? q.options.map(o => ({ text: o.text || '', isCorrect: o.isCorrect || false })) : [...Array(4)].map(() => ({ ...EMPTY_OPTION })),
    });
    setShowForm(true); setError('');
  };

  const setOption = (i, field, val) => {
    const opts = [...form.options];
    opts[i] = { ...opts[i], [field]: val };
    setForm({ ...form, options: opts });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const hasCorrect = form.options.some(o => o.isCorrect);
    if (!hasCorrect) { setError('At least one option must be marked correct.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        courseId: form.courseId,
        userId: user?.id,
        questionText: form.questionText,
        difficulty: form.difficulty,
        marks: Number(form.marks),
        negativeMarks: Number(form.negativeMarks),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        explanation: { text: form.explanation },
        options: form.options.filter(o => o.text.trim()),
      };
      if (editing) { await api.updateQuestion(editing._id, payload); }
      else { await api.createQuestion(payload); }
      setShowForm(false);
      await fetchQuestions(selectedCourse);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try { await api.deleteQuestion(id); await fetchQuestions(selectedCourse); }
    catch (e) { setError(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">— Select Course —</option>
            {courses.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>)}
          </select>
        </div>
        {selectedCourse && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      {showForm && (
        <form onSubmit={handleSave} className="bg-gray-50 border rounded-xl p-5 space-y-4">
          <h4 className="font-semibold text-gray-800">{editing ? 'Edit' : 'New'} Question</h4>

          <textarea required rows={3} value={form.questionText} onChange={e => setForm({ ...form, questionText: e.target.value })}
            placeholder="Question text…" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />

          <div className="grid grid-cols-3 gap-3">
            <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
            <input type="number" min={0} value={form.marks} onChange={e => setForm({ ...form, marks: e.target.value })}
              placeholder="Marks" className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="number" min={0} value={form.negativeMarks} onChange={e => setForm({ ...form, negativeMarks: e.target.value })}
              placeholder="Negative marks" className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Options <span className="text-gray-400 font-normal">(check the correct one)</span></p>
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="checkbox" checked={opt.isCorrect} onChange={e => setOption(i, 'isCorrect', e.target.checked)} className="w-4 h-4 accent-green-600" />
                <input value={opt.text} onChange={e => setOption(i, 'text', e.target.value)}
                  placeholder={`Option ${i + 1}`} className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            ))}
            <button type="button" onClick={() => setForm({ ...form, options: [...form.options, { ...EMPTY_OPTION }] })}
              className="text-xs text-blue-600 hover:underline">+ Add option</button>
          </div>

          <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
            placeholder="Tags (comma-separated)" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <input value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })}
            placeholder="Explanation (optional)" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
              <Check className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      )}

      {!selectedCourse ? (
        <p className="text-gray-400 text-sm py-8 text-center">Select a course to manage its questions.</p>
      ) : loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
          {questions.map((q, idx) => (
            <div key={q._id} className="border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs text-gray-400 font-mono w-6 shrink-0">#{idx + 1}</span>
                  <p className="text-sm text-gray-800 truncate">{q.questionText || 'No text'}</p>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${q.difficulty === 'easy' ? 'bg-green-100 text-green-700' : q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{q.difficulty}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <button onClick={e => { e.stopPropagation(); openEdit(q); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(q._id); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  {expandedId === q._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {expandedId === q._id && (
                <div className="px-4 pb-4 border-t bg-gray-50 space-y-1 pt-3">
                  {q.options?.map((o, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm p-1.5 rounded ${o.isCorrect ? 'text-green-700 bg-green-50' : 'text-gray-600'}`}>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${o.isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                        {o.isCorrect && <Check className="w-2.5 h-2.5 text-white" />}
                      </span>
                      {o.text}
                    </div>
                  ))}
                  {q.explanation?.text && <p className="text-xs text-gray-500 mt-2 italic">💡 {q.explanation.text}</p>}
                </div>
              )}
            </div>
          ))}
          {questions.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No questions for this course yet.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminQuestionsTab;
