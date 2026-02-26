import React, { useState, useEffect, useRef } from 'react';
import { Award, Download, TrendingUp, BookOpen, CheckCircle, BarChart2, ChevronDown, ChevronRight } from 'lucide-react';
import api from '../services/api';

/* ─────────────────────────────────────────────────────────────
   Level helpers
───────────────────────────────────────────────────────────── */
const getLevel = (pct) => {
  if (pct === 0) return { label: 'Not Started', color: '#9ca3af', bg: '#f3f4f6', text: '#6b7280' };
  if (pct <= 30) return { label: 'Beginner', color: '#ef4444', bg: '#fee2e2', text: '#b91c1c' };
  if (pct <= 70) return { label: 'Intermediate', color: '#f97316', bg: '#ffedd5', text: '#c2410c' };
  return { label: 'Pro', color: '#22c55e', bg: '#dcfce7', text: '#15803d' };
};

/* ─────────────────────────────────────────────────────────────
   CourseProgressBar sub-component
───────────────────────────────────────────────────────────── */
const CourseProgressBar = ({ courseName, highestPercentage, totalAttempts, animate }) => {
  const pct = Math.min(Math.max(highestPercentage || 0), 100);
  const level = getLevel(pct);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Course name + badge row */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800 text-sm leading-tight">{courseName}</h4>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: level.bg, color: level.text }}
        >
          {level.label}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
        {/* Segment markers */}
        <div className="absolute top-0 bottom-0 w-px bg-white/70" style={{ left: '30%' }} />
        <div className="absolute top-0 bottom-0 w-px bg-white/70" style={{ left: '70%' }} />

        {/* Fill */}
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: animate ? `${pct}%` : '0%',
            background: level.color,
            transition: 'width 0.85s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {/* Percentage label inside bar */}
        {pct > 8 && (
          <span
            className="absolute inset-0 flex items-center pl-3 text-xs font-bold text-white drop-shadow-sm pointer-events-none"
            style={{ opacity: animate ? 1 : 0, transition: 'opacity 0.5s ease 0.6s' }}
          >
            {pct}%
          </span>
        )}
      </div>

      {/* Sub-labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>Beginner · 0–30%</span>
        <span>Intermediate · 31–70%</span>
        <span>Pro · 71–100%</span>
      </div>

      {/* Attempts */}
      {totalAttempts > 0 && (
        <p className="mt-2 text-xs text-gray-400">
          {totalAttempts} attempt{totalAttempts !== 1 ? 's' : ''} · Best: {pct}%
        </p>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   CategorySection — collapsible group header + courses
───────────────────────────────────────────────────────────── */
const CategorySection = ({ categoryName, courses, animate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const proCount = courses.filter((c) => c.highestPercentage > 70).length;
  const attemptedCount = courses.filter((c) => c.totalAttempts > 0).length;

  return (
    <div className="mb-4">
      {/* Category header */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors group"
      >
        <div className="flex items-center gap-3">
          {isOpen
            ? <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            : <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          }
          <span className="font-semibold text-gray-800 text-sm">{categoryName}</span>
          <span className="text-xs text-gray-400 font-normal">
            {courses.length} course{courses.length !== 1 ? 's' : ''}
          </span>
        </div>
        {/* Mini stats */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{attemptedCount} attempted</span>
          {proCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
              {proCount} Pro
            </span>
          )}
        </div>
      </button>

      {/* Courses grid — animated expand/collapse */}
      <div
        style={{
          maxHeight: isOpen ? `${courses.length * 200}px` : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pl-2">
          {courses.map((course) => (
            <CourseProgressBar
              key={course.courseId}
              courseName={course.courseName}
              highestPercentage={course.highestPercentage}
              totalAttempts={course.totalAttempts}
              animate={animate && isOpen}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main UserDashboard component
───────────────────────────────────────────────────────────── */
const UserDashboard = ({ user, testSeries }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [allProgress, setAllProgress] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);
  const hasFetched = useRef(false);

  // Mock certificates (retained)
  const certificates = [
    { id: 'CERT-001-2024', testTitle: 'Basic Programming Fundamentals', score: 85, issuedDate: '2024-01-20' },
    { id: 'CERT-003-2024', testTitle: 'React Fundamentals', score: 92, issuedDate: '2024-02-01' },
  ];

  /* ── Fetch all progress once ── */
  useEffect(() => {
    if (!user?.id || hasFetched.current) return;
    hasFetched.current = true;

    const fetchProgress = async () => {
      setProgressLoading(true);
      try {
        const data = await api.getUserAllProgress(user.id);
        setAllProgress(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch progress:', err);
        setAllProgress([]);
      } finally {
        setProgressLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  /* ── Trigger bar animation every time Overview tab is shown ── */
  useEffect(() => {
    if (activeTab !== 'overview') return;
    setAnimateBars(false);
    const t = setTimeout(() => setAnimateBars(true), 80);
    return () => clearTimeout(t);
  }, [activeTab]);

  /* ── Merge testSeries with progress, carrying category ── */
  const mergedProgress = (testSeries || []).map((course) => {
    const progressEntry = allProgress.find(
      (p) => String(p.courseId) === String(course._id || course.id)
    );
    return {
      courseId: course._id || course.id,
      courseName: course.title,
      category: course.category || 'Uncategorized',
      highestPercentage: progressEntry?.highestPercentage || 0,
      totalAttempts: progressEntry?.totalAttempts || 0,
    };
  });

  /* ── Group by category, sort each group A→Z, sort categories A→Z ── */
  const categoryMap = {};
  mergedProgress.forEach((course) => {
    const cat = course.category || 'Uncategorized';
    if (!categoryMap[cat]) categoryMap[cat] = [];
    categoryMap[cat].push(course);
  });

  // Sort courses within each category alphabetically
  Object.keys(categoryMap).forEach((cat) => {
    categoryMap[cat].sort((a, b) => a.courseName.localeCompare(b.courseName));
  });

  // Sorted category names A→Z
  const sortedCategories = Object.keys(categoryMap).sort((a, b) => a.localeCompare(b));

  /* ── Global stats ── */
  const attemptedCount = mergedProgress.filter((c) => c.totalAttempts > 0).length;
  const proCount = mergedProgress.filter((c) => c.highestPercentage > 70).length;
  const avgPct =
    attemptedCount > 0
      ? Math.round(
        mergedProgress
          .filter((c) => c.totalAttempts > 0)
          .reduce((s, c) => s + c.highestPercentage, 0) / attemptedCount
      )
      : 0;

  const handleDownloadCertificate = (cert) => alert(`Downloading certificate: ${cert.id}`);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ── Header banner ── */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-8 mb-8">
        <div className="flex items-center">
          <img
            src={user?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
            alt={user?.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-white/20 mr-6"
          />
          <div>
            <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
            <p className="text-white/80">{user?.email}</p>
            <p className="text-white/60 text-sm">
              Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{testSeries?.length || 0}</div>
              <div className="text-sm text-gray-500">Total Courses</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{attemptedCount}</div>
              <div className="text-sm text-gray-500">Courses Attempted</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{avgPct}%</div>
              <div className="text-sm text-gray-500">Avg Best Score</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{proCount}</div>
              <div className="text-sm text-gray-500">Pro Level Courses</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {['overview', 'tests', 'certificates'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium capitalize ${activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'tests' ? 'Test History' : 'Certificates'}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* ════════════ OVERVIEW TAB ════════════ */}
          {activeTab === 'overview' && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Course Progress</h3>
              </div>

              {/* Loading skeleton */}
              {progressLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-xl p-5 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                      <div className="h-5 bg-gray-200 rounded-full" />
                    </div>
                  ))}
                </div>
              )}

              {/* No courses */}
              {!progressLoading && sortedCategories.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-base font-medium">No courses available yet.</p>
                </div>
              )}

              {/* Category groups */}
              {!progressLoading && sortedCategories.map((cat) => (
                <CategorySection
                  key={cat}
                  categoryName={cat}
                  courses={categoryMap[cat]}
                  animate={animateBars}
                />
              ))}

              {/* Legend */}
              {!progressLoading && sortedCategories.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
                  {[
                    { label: 'Not Started', color: '#9ca3af' },
                    { label: 'Beginner (0–30%)', color: '#ef4444' },
                    { label: 'Intermediate (31–70%)', color: '#f97316' },
                    { label: 'Pro (71–100%)', color: '#22c55e' },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════ TEST HISTORY TAB ════════════ */}
          {activeTab === 'tests' && (() => {
            // Last 7 courses attempted, most recent first
            const historyRows = [...allProgress]
              .filter((p) => p.totalAttempts > 0)
              .sort((a, b) => new Date(b.lastAttemptedAt) - new Date(a.lastAttemptedAt))
              .slice(0, 7);

            return (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-5">Last Few Test History</h3>

                {historyRows.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-base font-medium">No tests attempted yet.</p>
                    <p className="text-sm mt-1">Start a course to see your history here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Course Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Last Attempted</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Highest Score</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Total Attempts</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyRows.map((row, idx) => {
                          const level = getLevel(row.highestPercentage);
                          return (
                            <tr
                              key={row.courseId}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-3 px-4 text-gray-400 font-medium">{idx + 1}</td>
                              <td className="py-3 px-4 font-medium text-gray-800">{row.courseName}</td>
                              <td className="py-3 px-4 text-gray-500">
                                {row.lastAttemptedAt
                                  ? new Date(row.lastAttemptedAt).toLocaleDateString('en-IN', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                  })
                                  : '—'}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-semibold text-gray-800">
                                  {row.highestPercentage}%
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-700 font-medium">
                                {row.totalAttempts}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                  style={{ background: level.bg, color: level.text }}
                                >
                                  {level.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {historyRows.length > 0 && (
                  <p className="mt-3 text-xs text-gray-400 text-right">
                    Showing last {historyRows.length} course{historyRows.length !== 1 ? 's' : ''} attempted
                  </p>
                )}
              </div>
            );
          })()}

          {/* ════════════ CERTIFICATES TAB ════════════ */}
          {activeTab === 'certificates' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Certificates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <Award className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                      <button
                        onClick={() => handleDownloadCertificate(certificate)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{certificate.testTitle}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Certificate ID: {certificate.id}</div>
                      <div>Score: {certificate.score}%</div>
                      <div>Issued: {new Date(certificate.issuedDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
                {certificates.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No certificates yet. Complete tests to earn certificates!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;