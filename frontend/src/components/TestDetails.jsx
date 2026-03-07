import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, FileText, Star, CheckCircle, Crown, ArrowLeft,
  Play, Target, Award, AlertCircle, ShieldCheck, X, Zap, Lock, ChevronRight,
} from 'lucide-react';

/* ── Generic test instructions shown in the pre-test modal ── */
const GENERIC_INSTRUCTIONS = [
  'Read every question carefully before selecting your answer.',
  'You can navigate between questions using the Previous and Next buttons.',
  'Use the question palette on the right to jump directly to any question.',
  'Once the timer reaches zero, the test will be submitted automatically.',
  'Do not refresh or close the browser tab during the test — your progress may be lost.',
  'Each attempted question will be highlighted green in the question palette.',
  'You may review and change answers any time before submitting.',
  'Results and detailed explanations are shown immediately after submission.',
];

/* ── Topic colour map by category ── */
const TOPIC_COLOURS = {
  Maths: 'bg-blue-100 text-blue-700',
  Mathematics: 'bg-blue-100 text-blue-700',
  English: 'bg-emerald-100 text-emerald-700',
  Science: 'bg-violet-100 text-violet-700',
  Reasoning: 'bg-amber-100 text-amber-700',
  'General Knowledge': 'bg-rose-100 text-rose-700',
};
const topicColour = (category) =>
  TOPIC_COLOURS[category] || 'bg-gray-100 text-gray-600';

/* ── Pre-Test Instructions Modal ── */
const PreTestModal = ({ test, onConfirm, onClose }) => {
  const [accepted, setAccepted] = useState(false);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">Before You Begin</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
              <Clock className="w-3.5 h-3.5" /> {test.time} mins
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full">
              <FileText className="w-3.5 h-3.5" /> {test.totalQuestions} questions
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
              <Target className="w-3.5 h-3.5" /> Pass: {test.passingScore}%
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Instructions</h3>
            <ul className="space-y-2">
              {GENERIC_INSTRUCTIONS.map((instruction, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  {instruction}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-700">
              Closing the browser window or refreshing the page will <strong>not</strong> stop the timer. Your test will be auto-submitted when time expires.
            </p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={accepted}
              onChange={e => setAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
              I have read and understood all the instructions. I accept the{' '}
              <span className="text-blue-600 font-medium">Terms &amp; Conditions</span> for this test.
            </span>
          </label>
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!accepted}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Play className="w-4 h-4" /> Begin Test
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Premium Upgrade Modal ── */
const PremiumModal = ({ test, onClose }) => {
  const navigate = useNavigate();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="relative bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 px-6 pt-8 pb-10 text-center">
          <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 id="premium-modal-title" className="text-2xl font-bold text-white mb-1">Premium Content</h2>
          <p className="text-white/85 text-sm">This test is available exclusively for Premium members. Subscribe to unlock all tests &amp; features.</p>
        </div>
        <div className="px-6 py-6 -mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-5 text-center">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Premium Membership</p>
            <p className="text-lg font-bold text-gray-900">Unlock all tests &amp; premium content</p>
            <p className="text-sm text-gray-500 mt-1">Full access across the entire platform</p>
          </div>
          <ul className="space-y-3 mb-6">
            {[
              { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'Full access to all questions in this test' },
              { icon: <Zap className="w-4 h-4 text-blue-500" />, text: 'Detailed explanations for every answer' },
              { icon: <Award className="w-4 h-4 text-purple-500" />, text: 'Progress tracked in your dashboard' },
            ].map(({ icon, text }, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-700">{icon}{text}</li>
            ))}
          </ul>
          <button
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            onClick={() => { onClose(); navigate('/payment'); }}
          >
            <Lock className="w-4 h-4" /> Upgrade to Premium
          </button>
          <button onClick={onClose} className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors py-1">
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Stat chip used in the sticky sidebar ── */
const SidebarStat = ({ icon: Icon, label, value, colour }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colour}`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

/* ── TestDetails ── */
const TestDetails = ({ testSeries, user, onStartTest }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const test = testSeries.find(t => t.id.toString() === id);

  const [showModal, setShowModal] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  const colour = topicColour(test?.category);

  if (!test) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Test not found</h2>
          <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to tests
          </button>
        </div>
      </div>
    );
  }

  const handleStartClick = () => {
    if (!user) { onStartTest(test); return; }
    if (test.type === 'paid' && !user.isPremium && !user.purchasedTests?.includes(test.id)) {
      setShowPremium(true); return;
    }
    setShowModal(true);
  };

  const handleConfirmStart = () => {
    setShowModal(false);
    navigate(`/test/${test.id}/start`);
  };

  const difficultyColour =
    test.difficulty === 'Beginner' ? 'bg-blue-500' :
      test.difficulty === 'Intermediate' ? 'bg-amber-500' :
        test.difficulty === 'Advanced' ? 'bg-red-500' : 'bg-purple-500';

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* ── Breadcrumb ── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
              <button onClick={() => navigate('/')} className="hover:text-blue-600 transition-colors font-medium">Home</button>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <button
                onClick={() => {
                  navigate('/'); setTimeout(() => {
                    const el = document.getElementById('test-series-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 80);
                }}
                className="hover:text-blue-600 transition-colors"
              >
                {test.category}
              </button>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-gray-800 font-medium truncate max-w-[200px]">{test.title}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* ── Two-column layout ── */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── LEFT column: image + content ── */}
            <div className="flex-1 min-w-0">
              {/* Hero image */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl mb-8 h-64 sm:h-80">
                <img src={test.image} alt={test.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">{test.category}</span>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 leading-tight">{test.title}</h1>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {test.type === 'free' ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow">
                          <CheckCircle className="w-3 h-3 mr-1" /> Free
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500 text-white shadow">
                          <Crown className="w-3 h-3 mr-1" /> Premium
                        </span>
                      )}
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow ${difficultyColour}`}>
                        <Star className="w-3 h-3 mr-1" /> {test.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">About This Test</h2>
                <p className="text-gray-600 leading-relaxed">{test.description}</p>
              </div>

              {/* Topics */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Topics Covered</h2>
                <div className="flex flex-wrap gap-2">
                  {(showAllTopics ? test.topics : test.topics.slice(0, 8)).map((topic, index) => (
                    <span key={index} className={`px-3 py-1.5 text-sm rounded-full font-medium ${colour}`}>
                      {topic}
                    </span>
                  ))}
                  {!showAllTopics && test.topics.length > 8 && (
                    <button
                      onClick={() => setShowAllTopics(true)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full font-medium hover:bg-gray-200 transition-colors"
                    >
                      +{test.topics.length - 8} more
                    </button>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Test Instructions</h2>
                <ul className="space-y-3">
                  {test.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-600 gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── RIGHT column: sticky CTA sidebar ── */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Gradient top bar */}
                <div className="h-2 bg-gradient-to-r from-blue-500 to-violet-500" />

                <div className="p-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Stats</p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <SidebarStat icon={Clock} label="Duration" value={`${test.time} mins`} colour="bg-blue-500" />
                    <SidebarStat icon={FileText} label="Questions" value={test.totalQuestions} colour="bg-violet-500" />
                    <SidebarStat icon={Target} label="Pass Score" value={`${test.passingScore}%`} colour="bg-amber-500" />
                    <SidebarStat icon={Award} label="Total Marks" value={test.totalMarks} colour="bg-emerald-500" />
                  </div>

                  {/* Sign-in banner — only for guests */}
                  {!user && (
                    <div className="mb-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 px-4 py-3">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Sign in required</span><br />
                        <span className="text-xs text-blue-600">Track your progress and save results.</span>
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={handleStartClick}
                    className="relative w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg hover:shadow-blue-500/40 transition-all duration-300 overflow-hidden group"
                  >
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700" />
                    <Play className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{user ? 'Start Test' : 'Sign in to Start'}</span>
                  </button>

                  <p className="text-center text-xs text-gray-400 mt-3">
                    {test.type === 'free' ? '✓ Free to attempt' : '⭐ Premium test'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && <PreTestModal test={test} onConfirm={handleConfirmStart} onClose={() => setShowModal(false)} />}
      {showPremium && <PremiumModal test={test} onClose={() => setShowPremium(false)} />}
    </>
  );
};

export default TestDetails;