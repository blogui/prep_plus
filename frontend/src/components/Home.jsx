import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, BookOpen, Users, Award, TrendingUp, ChevronLeft, ChevronRight, ArrowRight, Play, Star, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TestCard from './TestCard';
import WhyChooseUs from './WhyChooseUs';
import HowItWorks from './HowItWorks';
import FAQ from './FAQ';
import Footer from './Footer';

const CARDS_PER_PAGE = 3;
const PAGE_TRANSITION_MS = 350;

/* ── useCountUp — animates a number from 0 to target ── */
const useCountUp = (target, duration = 1800, startOnMount = true) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // Don't animate if not triggered yet or target is still 0 (data not loaded)
    if (!startOnMount || target === 0) {
      setCount(0);
      return;
    }
    let cancelled = false;
    let rafId;
    const start = performance.now();
    const step = (now) => {
      if (cancelled) return;
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    // Cleanup: cancel in-flight animation when target changes or component unmounts
    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [target, duration, startOnMount]);
  return count;
};

/* ── TypewriterText — cycles through an array of phrases ── */
const PHRASES = ['Mathematics Skills', 'Verbal Reasoning', 'Non Verbal Reasoning', 'English Skills'];
const TypewriterText = () => {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const phrase = PHRASES[phraseIdx];
    let timeout;
    if (!deleting && displayed.length < phrase.length) {
      timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 60);
    } else if (!deleting && displayed.length === phrase.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % PHRASES.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, phraseIdx]);
  return (
    <span className="relative">
      <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
        {displayed}
      </span>
      <span className="inline-block w-0.5 h-[1em] bg-violet-400 ml-0.5 align-middle animate-pulse" />
    </span>
  );
};

/* ── HeroIllustration — decorative SVG test-interface mockup ── */
const HeroIllustration = () => (
  <div className="relative select-none pointer-events-none">
    {/* Glow blobs */}
    <div className="absolute -top-8 -left-8 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
    <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-violet-500/25 rounded-full blur-3xl" />

    {/* Main card */}
    <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 shadow-2xl max-w-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="text-xs text-white/60 font-mono">Test · Q12 / 30</div>
        <div className="flex items-center gap-1 text-xs text-amber-300 font-semibold">
          <span>⏱</span> 28:43
        </div>
      </div>

      {/* Question */}
      <p className="text-white/90 text-sm leading-relaxed mb-4 font-medium">
        What is the time complexity of binary search on a sorted array of <span className="font-mono bg-white/10 px-1 rounded">n</span> elements?
      </p>

      {/* Options */}
      {[
        { label: 'A', text: 'O(n)', active: false },
        { label: 'B', text: 'O(log n)', active: true },
        { label: 'C', text: 'O(n²)', active: false },
        { label: 'D', text: 'O(1)', active: false },
      ].map((opt) => (
        <div
          key={opt.label}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-2 text-sm transition-colors ${opt.active
            ? 'bg-blue-500/30 border border-blue-400/50 text-white'
            : 'bg-white/5 border border-white/10 text-white/70'
            }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${opt.active ? 'bg-blue-400 text-white' : 'bg-white/10 text-white/50'
            }`}>{opt.label}</span>
          {opt.text}
          {opt.active && <CheckCircle className="w-3.5 h-3.5 text-blue-300 ml-auto" />}
        </div>
      ))}

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>Progress</span><span>40%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full">
          <div className="h-full w-[40%] bg-gradient-to-r from-blue-400 to-violet-400 rounded-full" />
        </div>
      </div>
    </div>

    {/* Floating badge — score */}
    <div className="absolute -bottom-4 -left-6 bg-white rounded-xl shadow-xl px-4 py-2.5 flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
        <Award className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-400">Latest Score</p>
        <p className="text-sm font-bold text-gray-800">92 / 100 🎉</p>
      </div>
    </div>

    {/* Floating badge — live users */}
    <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl px-3 py-2 flex items-center gap-2">
      <div className="flex -space-x-2">
        {['#60a5fa', '#a78bfa', '#34d399'].map((c, i) => (
          <div key={i} className="w-6 h-6 rounded-full border-2 border-white" style={{ background: c }} />
        ))}
      </div>
      <p className="text-xs font-semibold text-gray-700">+2.4k online</p>
    </div>
  </div>
);

/* ── Stat item with count-up ── */
const StatItem = ({ icon: Icon, value, suffix, label, color }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const count = useCountUp(value, 1600, inView);
  return (
    <div ref={ref} className="flex items-center gap-2.5 text-white">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="font-bold text-lg leading-none">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-xs text-white/60 mt-0.5">{label}</div>
      </div>
    </div>
  );
};

/* ── Shimmer keyframe (inline so no external CSS needed) ── */
const shimmerStyle = (
  <style>{`
    @keyframes shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }
    .skeleton-shimmer {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 600px 100%;
      animation: shimmer 1.4s infinite linear;
    }
  `}</style>
);

/* ── SkeletonCard — mirrors the real TestCard layout ── */
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    {/* Image area */}
    <div className="h-48 skeleton-shimmer" />
    <div className="p-6 space-y-3">
      {/* Category label */}
      <div className="h-3 w-1/4 rounded skeleton-shimmer" />
      {/* Title */}
      <div className="h-5 w-3/4 rounded skeleton-shimmer" />
      {/* Description lines */}
      <div className="h-3 w-full rounded skeleton-shimmer" />
      <div className="h-3 w-5/6 rounded skeleton-shimmer" />
      {/* Meta row */}
      <div className="flex gap-4 pt-1">
        <div className="h-3 w-20 rounded skeleton-shimmer" />
        <div className="h-3 w-24 rounded skeleton-shimmer" />
      </div>
      {/* Topic pills */}
      <div className="flex gap-2 pt-1">
        {[1, 2, 3].map(i => <div key={i} className="h-5 w-14 rounded-full skeleton-shimmer" />)}
      </div>
      {/* Button */}
      <div className="h-9 w-full rounded-lg skeleton-shimmer mt-2" />
    </div>
  </div>
);

const Home = ({ testSeries, onSelectTest, user, onLogin, heroImage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCourseFamily, setSelectedCourseFamily] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [sortOrder, setSortOrder] = useState('name'); // 'name' | 'difficulty'
  const navigate = useNavigate();


  // Smooth page change with skeleton flash
  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setIsPageChanging(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsPageChanging(false);
    }, PAGE_TRANSITION_MS);
  };

  // Strip trailing " - I", " - II", " - 3" etc. to get the course family name
  const getCourseFamilyName = (title) => {
    // Matches " - " followed by Roman numerals (I/V/X combinations) or digits at end of string
    return title.replace(/\s*-\s*([IVXLCDM]+|\d+)$/i, '').trim();
  };

  const categories = ['All Categories', ...new Set(testSeries.map(test => test.category))];

  // Get unique family names for courses in the selected category
  const courseFamilies = (() => {
    const isAllCategories = selectedCategory === 'All' || selectedCategory === 'All Categories';
    const scopedCourses = isAllCategories
      ? testSeries
      : testSeries.filter(t => t.category === selectedCategory);
    const families = [...new Set(scopedCourses.map(t => getCourseFamilyName(t.title)))];
    return families.sort((a, b) => a.localeCompare(b));
  })();

  const types = ['Free', 'Paid'];

  const filteredTests = testSeries.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || selectedCategory === 'All Categories' || test.category === selectedCategory;
    const matchesCourseFamily = selectedCourseFamily === 'All'
      || getCourseFamilyName(test.title) === selectedCourseFamily;
    const matchesType = selectedType === 'All' || (selectedType === 'Free' && test.type === 'free');
    return matchesSearch && matchesCategory && matchesCourseFamily && matchesType;
  }).sort((a, b) => {
    if (sortOrder === 'difficulty') {
      const order = { Beginner: 0, Intermediate: 1, Advanced: 2 };
      return (order[a.difficulty] ?? 3) - (order[b.difficulty] ?? 3);
    }
    return a.title.localeCompare(b.title);
  });

  const handleViewDetails = (test) => {
    navigate(`/test/${test.testId}`);
  };

  // Reset to page 1 whenever any filter / sort / search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedCourseFamily, selectedType, sortOrder]);

  // Helper: reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedCourseFamily('All');
    setSelectedType('All');
    setSortOrder('name');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'All' || selectedCourseFamily !== 'All' || selectedType !== 'All';

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(filteredTests.length / CARDS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTests = filteredTests.slice(
    (safePage - 1) * CARDS_PER_PAGE,
    safePage * CARDS_PER_PAGE
  );
  const rangeStart = filteredTests.length === 0 ? 0 : (safePage - 1) * CARDS_PER_PAGE + 1;
  const rangeEnd = Math.min(safePage * CARDS_PER_PAGE, filteredTests.length);

  return (
    <div className="min-h-screen">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* HERO SECTION                                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section
        className="relative w-full overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #1e3a5f 70%, #0f172a 100%)',
          minHeight: '92vh',
        }}
      >
        {/* Mesh background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-violet-600/25 blur-[100px]" />
          <div className="absolute top-[40%] left-[35%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px]" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

          {/* ── Left column ── */}
          <div className="flex-1 text-center lg:text-left">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-blue-200 font-medium">2,400+ students active right now</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
              Master 11+<br />
              <TypewriterText />
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Adaptive practice, unlimited mock tests, and detailed progress tracking — everything your child needs to succeed.
              <br />Aligned with GL & ISEB exams • Built by educators • Trusted by parents
            </p>


            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-10">
              <button
                onClick={() => {
                  const section = document.getElementById('test-series-section');
                  if (section) {
                    const top = section.getBoundingClientRect().top + window.scrollY - 64;
                    window.scrollTo({ top, behavior: 'smooth' });
                  }
                }}
                className="relative flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-xl shadow-blue-700/40 hover:shadow-blue-600/60 transition-all duration-300 overflow-hidden group"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out" />
                <span className="relative z-10">Try for Free</span>
                <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {!user && (
                <button
                  onClick={onLogin || (() => { })}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold text-white border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                >
                  <Play className="w-4 h-4" />
                  Get Started Free
                </button>
              )}
            </div>

            {/* Social proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <div className="flex -space-x-3">
                {[
                  { bg: '#60a5fa', letter: 'A' },
                  { bg: '#a78bfa', letter: 'R' },
                  { bg: '#34d399', letter: 'S' },
                  { bg: '#f87171', letter: 'M' },
                  { bg: '#fbbf24', letter: 'K' },
                ].map(({ bg, letter }, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-[#1e1b4b] flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: bg }}
                    title={letter}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div className="text-sm text-white/60">
                <div className="flex items-center gap-1 mb-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-white font-semibold">4.9</span>
                </div>
                <span>Trusted by <strong className="text-white">10,000+</strong> students</span>
              </div>
            </div>
          </div>

          {/* ── Right column: hero visual ── */}
          <div className="flex-1 flex justify-center lg:justify-end w-full max-w-sm lg:max-w-md">
            {heroImage ? (
              <div className="relative w-full max-w-md">
                {/* Glow blobs behind image */}
                <div className="absolute -top-8 -left-8 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-violet-500/25 rounded-full blur-3xl pointer-events-none" />
                <img
                  src={heroImage}
                  alt="Hero visual"
                  className="relative w-full rounded-2xl shadow-2xl object-cover border border-white/10"
                />
              </div>
            ) : (
              <HeroIllustration />
            )}
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="relative z-10 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatItem icon={BookOpen} value={testSeries.length || 0} suffix="+" label="Test Series" color="bg-blue-500/30" />
              <StatItem icon={Users} value={10000} suffix="+" label="Active Students" color="bg-violet-500/30" />
              <StatItem icon={Award} value={5000} suffix="+" label="Tests Completed" color="bg-emerald-500/30" />
              <StatItem icon={TrendingUp} value={98} suffix="%" label="Satisfaction Rate" color="bg-amber-500/30" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ */}
      {/* COURSES SECTION                     */}
      {/* ═══════════════════════════════════ */}
      <div id="test-series-section" className="bg-white border-t border-gray-100">

        {/* ── Section header ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="block w-1 h-7 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Explore Test Series</h2>
              </div>
              <p className="text-gray-500 text-sm ml-4">Choose from our expert-crafted tests across subjects and difficulty levels</p>
            </div>
            {/* Sort */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 whitespace-nowrap">Sort by:</span>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
              >
                <option value="name">Name</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Search + Filter bar ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-4">

            {/* Row 1: Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search test series..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-400"
              />
            </div>

            {/* Row 2: Category pills */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {['All', ...new Set(testSeries.map(t => t.category))].map(cat => {
                  const val = cat === 'All' ? 'All' : cat;
                  const active = selectedCategory === val || (val === 'All' && (selectedCategory === 'All' || selectedCategory === 'All Categories'));
                  return (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(val); setSelectedCourseFamily('All'); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${active
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                        }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Course family + Free toggle */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Course family select */}
              {courseFamilies.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Course</span>
                  <select
                    value={selectedCourseFamily}
                    onChange={e => setSelectedCourseFamily(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                  >
                    <option value="All">All Courses</option>
                    {courseFamilies.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              )}

              {/* Free toggle switch */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs font-semibold text-gray-500">Free Only</span>
                <button
                  role="switch"
                  aria-checked={selectedType === 'Free'}
                  onClick={() => setSelectedType(selectedType === 'Free' ? 'All' : 'Free')}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${selectedType === 'Free' ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${selectedType === 'Free' ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Active filter pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-200">
                <span className="text-xs text-gray-400">Active:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="hover:text-blue-900 ml-0.5">&times;</button>
                  </span>
                )}
                {selectedCategory !== 'All' && selectedCategory !== 'All Categories' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                    {selectedCategory}
                    <button onClick={() => { setSelectedCategory('All'); setSelectedCourseFamily('All'); }} className="hover:text-violet-900 ml-0.5">&times;</button>
                  </span>
                )}
                {selectedCourseFamily !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    {selectedCourseFamily}
                    <button onClick={() => setSelectedCourseFamily('All')} className="hover:text-indigo-900 ml-0.5">&times;</button>
                  </span>
                )}
                {selectedType === 'Free' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    Free Only
                    <button onClick={() => setSelectedType('All')} className="hover:text-emerald-900 ml-0.5">&times;</button>
                  </span>
                )}
                <button onClick={resetFilters} className="text-xs text-gray-400 hover:text-red-500 ml-auto transition-colors">
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Results count ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <p className="text-sm text-gray-500">
            Showing <span className="font-bold text-gray-800">{rangeStart}–{rangeEnd}</span> of{' '}
            <span className="font-bold text-gray-800">{filteredTests.length}</span> test{filteredTests.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* ── Cards grid ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {filteredTests.length > 0 ? (
            <>
              {shimmerStyle}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isPageChanging
                  ? Array.from({ length: CARDS_PER_PAGE }).map((_, i) => <SkeletonCard key={i} />)
                  : paginatedTests.map(test => (
                    <TestCard
                      key={test.testId}
                      test={test}
                      onSelect={handleViewDetails}
                      user={user}
                    />
                  ))
                }
              </div>

              {/* Pagination */}
              {totalPages > 1 && (() => {
                const getPageSequence = () => {
                  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
                  const pages = new Set([1, totalPages, safePage]);
                  if (safePage > 1) pages.add(safePage - 1);
                  if (safePage < totalPages) pages.add(safePage + 1);
                  const sorted = [...pages].sort((a, b) => a - b);
                  const result = [];
                  let prev = null;
                  for (const p of sorted) {
                    if (prev !== null && p - prev > 1) result.push('…');
                    result.push(p);
                    prev = p;
                  }
                  return result;
                };
                return (
                  <nav aria-label="Course pagination" className="flex justify-center mt-10 pt-6 border-t border-gray-100">
                    <div className="inline-flex items-center gap-1 bg-white rounded-2xl shadow-md px-4 py-3">
                      <button
                        onClick={() => handlePageChange(Math.max(1, safePage - 1))}
                        disabled={safePage === 1 || isPageChanging}
                        aria-label="Previous page"
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {getPageSequence().map((item, idx) =>
                        item === '…' ? (
                          <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-sm text-gray-400 select-none" aria-hidden="true">...</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => handlePageChange(item)}
                            disabled={isPageChanging}
                            aria-label={`Go to page ${item}`}
                            aria-current={item === safePage ? 'page' : undefined}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${item === safePage
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                              }`}
                          >
                            {item}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, safePage + 1))}
                        disabled={safePage === totalPages || isPageChanging}
                        aria-label="Next page"
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </nav>
                );
              })()}
            </>
          ) : (
            /* ── Illustrated empty state ── */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-blue-300" fill="none" viewBox="0 0 48 48">
                  <circle cx="22" cy="22" r="16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M34 34l8 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M16 22h12M22 16v12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No tests match your filters</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-xs">
                Try adjusting your search term, category, or remove some filters to find what you're looking for.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-md transition-all duration-200"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Additional Sections ── */}
      <WhyChooseUs />
      <HowItWorks />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Home;