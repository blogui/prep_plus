import React, { useState, useEffect } from 'react';
import { BookOpen, Tag, HelpCircle, FileText, LayoutDashboard, Users, TrendingUp, Award } from 'lucide-react';
import api from '../services/api';
import AdminCoursesTab from './AdminCoursesTab';
import AdminCategoriesTab from './AdminCategoriesTab';
import AdminQuestionsTab from './AdminQuestionsTab';
import AdminBlogsTab from './AdminBlogsTab';

const TABS = [
  { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
  { id: 'courses',     label: 'Courses',     icon: BookOpen },
  { id: 'categories',  label: 'Categories',  icon: Tag },
  { id: 'questions',   label: 'Questions',   icon: HelpCircle },
  { id: 'blogs',       label: 'Blogs',       icon: FileText },
];

const AdminDashboard = ({ testSeries, setTestSeries, user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState(testSeries || []);

  // Keep local courses in sync with parent and allow child tabs to trigger refresh
  const refreshCourses = async () => {
    try {
      const data = await api.getCourses();
      if (Array.isArray(data)) {
        const formatted = data.map(c => ({ ...c, id: c._id }));
        setCourses(formatted);
        setTestSeries(formatted);
      }
    } catch (e) { console.error('Failed to refresh courses', e); }
  };

  useEffect(() => { setCourses(testSeries || []); }, [testSeries]);

  // ── Overview stats ─────────────────────────────────────────────────────
  const stats = [
    { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Published', value: courses.filter(c => c.isPublished).length, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Free Courses', value: courses.filter(c => !c.isPaid).length, icon: Award, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Paid Courses', value: courses.filter(c => c.isPaid).length, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white p-8 mb-8">
        <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-white/70 text-sm">Manage courses, questions, blogs and categories</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab shell */}
      <div className="bg-white rounded-xl shadow-sm border">
        {/* Tab nav */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex min-w-max">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? 'border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Courses</h3>
              <div className="space-y-2">
                {courses.slice(0, 5).map(c => (
                  <div key={c._id || c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                    <span className="font-medium text-gray-800">{c.title}</span>
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${c.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.isPublished ? 'Published' : 'Draft'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${c.isPaid ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{c.isPaid ? 'Paid' : 'Free'}</span>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && <p className="text-gray-400 text-sm py-4 text-center">No courses yet. Add one from the Courses tab.</p>}
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <AdminCoursesTab courses={courses} onCoursesChanged={refreshCourses} />
          )}

          {activeTab === 'categories' && <AdminCategoriesTab />}

          {activeTab === 'questions' && (
            <AdminQuestionsTab courses={courses} user={user} />
          )}

          {activeTab === 'blogs' && <AdminBlogsTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;