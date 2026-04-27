import React, { useState, useEffect, useRef } from 'react';
import {
  Award, Download, TrendingUp, BookOpen, CheckCircle,
  BarChart2, ChevronDown, ChevronRight, Star, Calendar, Clock,
} from 'lucide-react';
import api from '../services/api';

/* ─────────────────────────────────────────────────────────────
   Level helpers  (UNCHANGED)
───────────────────────────────────────────────────────────── */
const getLevel = (pct) => {
  if (pct === 0) return { label: 'Not Started', color: '#9ca3af', bg: '#f3f4f6', text: '#6b7280', emoji: '○' };
  if (pct <= 30) return { label: 'Beginner', color: '#ef4444', bg: '#fee2e2', text: '#b91c1c', emoji: '🔴' };
  if (pct <= 70) return { label: 'Intermediate', color: '#f97316', bg: '#ffedd5', text: '#c2410c', emoji: '🟡' };
  return { label: 'Pro', color: '#22c55e', bg: '#dcfce7', text: '#15803d', emoji: '🟢' };
};

/* ─────────────────────────────────────────────────────────────
   Count-up animation hook
───────────────────────────────────────────────────────────── */
const useCountUp = (target, duration = 900) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let cancelled = false;
    let rafId;
    const start = performance.now();
    const step = (now) => {
      if (cancelled) return;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => { cancelled = true; if (rafId) cancelAnimationFrame(rafId); };
  }, [target, duration]);
  return count;
};

/* ─────────────────────────────────────────────────────────────
   Stat card (animated count-up)
───────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, value, suffix = '', label, gradFrom, gradTo, shadow }) => {
  const count = useCountUp(value);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradFrom} ${gradTo} shadow-lg ${shadow}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-2xl font-extrabold text-gray-900 leading-none mb-0.5">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-xs text-gray-500 font-medium">{label}</div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   CourseProgressBar  (LOGIC UNCHANGED — visual only)
───────────────────────────────────────────────────────────── */
const CourseProgressBar = ({ courseName, highestPercentage, totalAttempts, animate }) => {
  const pct = Math.min(Math.max(highestPercentage || 0), 100);
  const level = getLevel(pct);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800 text-sm leading-tight flex-1 min-w-0 truncate pr-2">{courseName}</h4>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1"
          style={{ background: level.bg, color: level.text }}
        >
          <span>{level.emoji}</span>
          {level.label}
        </span>
      </div>

      {/* Slim progress track */}
      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-none"
          style={{
            width: animate ? `${pct}%` : '0%',
            background: `linear-gradient(90deg, ${level.color}cc, ${level.color})`,
            transition: 'width 0.85s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      {/* Footer row */}
      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>{totalAttempts > 0 ? `${totalAttempts} attempt${totalAttempts !== 1 ? 's' : ''}` : 'Not attempted'}</span>
        <span className="font-semibold" style={{ color: level.color }}>{pct}%</span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   CategorySection  (LOGIC UNCHANGED — visual only)
───────────────────────────────────────────────────────────── */
const CategorySection = ({ categoryName, courses, animate }) => {
  const [isOpen, setIsOpen] = useState(false);

  // UNCHANGED logic
  const proCount = courses.filter((c) => c.highestPercentage > 70).length;
  const attemptedCount = courses.filter((c) => c.totalAttempts > 0).length;

  return (
    <div className="mb-3">
      {/* Category header */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border-l-4 border-l-blue-500
                   border border-gray-100 rounded-xl hover:bg-blue-50/50 transition-colors group shadow-sm"
      >
        <div className="flex items-center gap-3">
          {isOpen
            ? <ChevronDown className="w-4 h-4 text-blue-500 transition-colors" />
            : <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          }
          <span className="font-semibold text-gray-800 text-sm">{categoryName}</span>
          <span className="text-xs text-gray-400">
            {courses.length} course{courses.length !== 1 ? 's' : ''}
          </span>
        </div>
        {/* Mini stats */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="hidden sm:inline">{attemptedCount} attempted</span>
          {proCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
              {proCount} 🟢 Pro
            </span>
          )}
        </div>
      </button>

      {/* Animated expand */}
      <div
        style={{
          maxHeight: isOpen ? `${courses.length * 200}px` : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pl-2">
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
   Tab button
───────────────────────────────────────────────────────────── */
const TabBtn = ({ id, label, icon: Icon, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${active
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

/* ─────────────────────────────────────────────────────────────
   Main UserDashboard component  (LOGIC UNCHANGED)
───────────────────────────────────────────────────────────── */
const UserDashboard = ({ user, testSeries }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [allProgress, setAllProgress] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);
  const hasFetched = useRef(false);

  // Mock certificates (UNCHANGED)
  const certificates = [
    { id: 'CERT-001-2024', testTitle: 'Basic Programming Fundamentals', score: 85, issuedDate: '2024-01-20' },
    { id: 'CERT-003-2024', testTitle: 'React Fundamentals', score: 92, issuedDate: '2024-02-01' },
  ];

  /* ── Fetch all progress once (UNCHANGED) ── */
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

  /* ── Animate bars on overview tab (UNCHANGED) ── */
  useEffect(() => {
    if (activeTab !== 'overview') return;
    setAnimateBars(false);
    const t = setTimeout(() => setAnimateBars(true), 80);
    return () => clearTimeout(t);
  }, [activeTab]);

  /* ── Merge testSeries with progress (UNCHANGED) ── */
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

  /* ── Group by category (UNCHANGED) ── */
  const categoryMap = {};
  mergedProgress.forEach((course) => {
    const cat = course.category || 'Uncategorized';
    if (!categoryMap[cat]) categoryMap[cat] = [];
    categoryMap[cat].push(course);
  });
  Object.keys(categoryMap).forEach((cat) => {
    categoryMap[cat].sort((a, b) => a.courseName.localeCompare(b.courseName));
  });
  const sortedCategories = Object.keys(categoryMap).sort((a, b) => a.localeCompare(b));

  /* ── Global stats (UNCHANGED) ── */
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

  /* ── Member since formatted (UNCHANGED logic) ── */
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ══════════════════════════════════════════
            PROFILE HEADER
        ══════════════════════════════════════════ */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl overflow-hidden mb-8 shadow-xl">
          {/* Mesh blobs */}
          <div className="absolute top-[-30%] left-[-5%] w-72 h-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[5%] w-56 h-56 rounded-full bg-violet-600/25 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 sm:p-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="p-1 rounded-2xl bg-gradient-to-br from-blue-400 to-violet-500 shadow-xl shadow-blue-500/30">
                <img
                  src={user?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                  alt={user?.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{user?.name}</h1>
              <p className="text-white/60 text-sm mb-3">{user?.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-white/70">
                  <Calendar className="w-3 h-3" />
                  Member since {memberSince}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                  ${user?.isPremium
                    ? 'bg-amber-400/20 border border-amber-400/30 text-amber-300'
                    : 'bg-white/10 border border-white/15 text-white/70'}`}>
                  {user?.isPremium ? '⭐ Premium' : '○ Free Plan'}
                </span>
              </div>
            </div>

            {/* Quick stat pills (desktop) */}
            <div className="hidden lg:flex flex-col gap-2 text-right flex-shrink-0">
              <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2 text-center">
                <div className="text-xl font-bold text-white">{attemptedCount}</div>
                <div className="text-xs text-white/50">Tests Done</div>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2 text-center">
                <div className="text-xl font-bold text-white">{avgPct}%</div>
                <div className="text-xs text-white/50">Avg Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            STATS CARDS
        ══════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={BookOpen} value={testSeries?.length || 0} label="Tests Available" gradFrom="from-blue-500" gradTo="to-violet-600" shadow="shadow-blue-500/25" />
          <StatCard icon={CheckCircle} value={attemptedCount} label="Tests Attempted" gradFrom="from-emerald-500" gradTo="to-teal-600" shadow="shadow-emerald-500/25" />
          <StatCard icon={TrendingUp} value={avgPct} suffix="%" label="Avg Best Score" gradFrom="from-amber-500" gradTo="to-orange-500" shadow="shadow-amber-500/25" />
          <StatCard icon={Award} value={proCount} label="🏆 Pro Badges Earned" gradFrom="from-violet-500" gradTo="to-purple-600" shadow="shadow-violet-500/25" />
        </div>

        {/* ══════════════════════════════════════════
            PILL TAB NAV + CONTENT AREA
        ══════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <TabBtn id="overview" label="Overview" icon={BarChart2} active={activeTab === 'overview'} onClick={setActiveTab} />
            <TabBtn id="tests" label="Test History" icon={BookOpen} active={activeTab === 'tests'} onClick={setActiveTab} />
            {/* <TabBtn id="certificates" label="Certificates" icon={Award} active={activeTab === 'certificates'} onClick={setActiveTab} /> */}
          </div>

          <div className="p-6">

            {/* ════════════ OVERVIEW TAB ════════════ */}
            {activeTab === 'overview' && (
              <div>
                {/* Section heading */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
                  <h3 className="text-base font-bold text-gray-900">Course Progress</h3>
                  <span className="text-xs text-gray-400 ml-1">by category</span>
                </div>

                {/* Loading skeleton */}
                {progressLoading && (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-100 rounded-xl p-5 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                        <div className="h-2.5 bg-gray-200 rounded-full" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {!progressLoading && sortedCategories.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
                      <BarChart2 className="w-8 h-8 text-blue-300" />
                    </div>
                    <p className="text-gray-700 font-semibold mb-1">No courses yet</p>
                    <p className="text-sm text-gray-400">Browse tests to start tracking your progress</p>
                  </div>
                )}

                {/* Category groups (UNCHANGED logic) */}
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
                  <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-gray-100">
                    {[
                      { label: 'Not Started', color: '#9ca3af' },
                      { label: 'Beginner (0–30%)', color: '#ef4444' },
                      { label: 'Intermediate (31–70%)', color: '#f97316' },
                      { label: 'Pro (71–100%)', color: '#22c55e' },
                    ].map(({ label, color }) => (
                      <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
                        {label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ════════════ TEST HISTORY TAB ════════════ */}
            {activeTab === 'tests' && (() => {
              // UNCHANGED logic
              const historyRows = [...allProgress]
                .filter((p) => p.totalAttempts > 0)
                .sort((a, b) => new Date(b.lastAttemptedAt) - new Date(a.lastAttemptedAt))
                .slice(0, 7);

              return (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
                      <h3 className="text-base font-bold text-gray-900">Test History</h3>
                    </div>
                    {historyRows.length > 0 && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        Showing last {historyRows.length}
                      </span>
                    )}
                  </div>

                  {historyRows.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-blue-300" />
                      </div>
                      <p className="text-gray-700 font-semibold mb-1">No attempts yet</p>
                      <p className="text-sm text-gray-400">Start a course to see your history here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {historyRows.map((row, idx) => {
                        const level = getLevel(row.highestPercentage);
                        const dateStr = row.lastAttemptedAt
                          ? new Date(row.lastAttemptedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—';
                        return (
                          <div
                            key={row.courseId}
                            className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50/70 hover:shadow-sm transition-all duration-200"
                          >
                            {/* Index */}
                            <span className="text-xs font-bold text-gray-300 w-5 text-center flex-shrink-0">
                              {String(idx + 1).padStart(2, '0')}
                            </span>

                            {/* Course info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{row.courseName}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                  <Clock className="w-3 h-3" /> {dateStr}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {row.totalAttempts} attempt{row.totalAttempts !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>

                            {/* Mini score bar */}
                            <div className="hidden sm:flex flex-col items-end gap-1 w-28 flex-shrink-0">
                              <span className="text-xs font-bold" style={{ color: level.color }}>
                                {row.highestPercentage}%
                              </span>
                              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${row.highestPercentage}%`, background: level.color }}
                                />
                              </div>
                            </div>

                            {/* Level badge */}
                            <span
                              className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                              style={{ background: level.bg, color: level.text }}
                            >
                              {level.emoji} {level.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ════════════ CERTIFICATES TAB ════════════ */}
            {activeTab === 'certificates' && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
                  <h3 className="text-base font-bold text-gray-900">Your Certificates</h3>
                </div>

                {certificates.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 flex items-center justify-center">
                      <Award className="w-8 h-8 text-amber-300" />
                    </div>
                    <p className="text-gray-700 font-semibold mb-1">No certificates yet</p>
                    <p className="text-sm text-gray-400">Complete a test with 70%+ to earn your first certificate</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {certificates.map((certificate) => (
                      <div
                        key={certificate.id}
                        className="rounded-2xl overflow-hidden border border-amber-100 shadow-sm hover:shadow-lg transition-shadow duration-300"
                      >
                        {/* Top gradient bar */}
                        <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-400" />

                        <div className="p-5 bg-white">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-md shadow-amber-200">
                              <Award className="w-6 h-6 text-white" />
                            </div>
                            <button
                              onClick={() => handleDownloadCertificate(certificate)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                                         bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </button>
                          </div>

                          {/* Info */}
                          <h4 className="font-bold text-gray-900 mb-3 text-sm leading-snug">{certificate.testTitle}</h4>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Certificate ID</span>
                              <span className="font-mono text-gray-600 text-[11px]">{certificate.id}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Score Achieved</span>
                              <span className="font-bold text-emerald-600">{certificate.score}%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Issued On</span>
                              <span className="text-gray-600">{new Date(certificate.issuedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;