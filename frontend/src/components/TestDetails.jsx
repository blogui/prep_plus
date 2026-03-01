import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, FileText, Star, CheckCircle, Crown, ArrowLeft,
  Play, Target, Award, AlertCircle, ShieldCheck, X,
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

/* ── Pre-Test Instructions Modal ── */
const PreTestModal = ({ test, onConfirm, onClose }) => {
  const [accepted, setAccepted] = useState(false);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Panel */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              Before You Begin
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Test summary chips */}
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
              <Clock className="w-3.5 h-3.5" />
              {test.time} mins
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full">
              <FileText className="w-3.5 h-3.5" />
              {test.totalQuestions} questions
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
              <Target className="w-3.5 h-3.5" />
              Pass: {test.passingScore}%
            </span>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Instructions
            </h3>
            <ul className="space-y-2">
              {GENERIC_INSTRUCTIONS.map((instruction, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  {instruction}
                </li>
              ))}
            </ul>
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-700">
              Closing the browser window or refreshing the page will <strong>not</strong> stop the
              timer. Your test will be auto-submitted when time expires.
            </p>
          </div>

          {/* T&C checkbox */}
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
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!accepted}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white
              bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg
              hover:from-blue-700 hover:to-purple-700
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Play className="w-4 h-4" />
            Begin Test
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── TestDetails ── */
const TestDetails = ({ testSeries, user, onStartTest }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const test = testSeries.find(t => t.id.toString() === id);

  const [showModal, setShowModal] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);

  if (!test) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Test not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to tests
          </button>
        </div>
      </div>
    );
  }

  /* Opens the modal (or the login flow for unauthenticated users) */
  const handleStartClick = () => {
    if (!user) {
      onStartTest(test); // existing auth redirect — unchanged
      return;
    }
    if (test.type === 'paid' && !user.purchasedTests?.includes(test.id)) {
      alert('This is a paid test. In a real application, you would be redirected to the payment page.');
      return;
    }
    setShowModal(true);
  };

  /* Called when user clicks "Begin Test" inside the modal */
  const handleConfirmStart = () => {
    setShowModal(false);
    navigate(`/test/${test.id}/start`);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tests
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Image */}
          <div className="relative h-64">
            <img
              src={test.image}
              alt={test.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white/80 text-sm font-medium uppercase tracking-wide">{test.category}</span>
                  <h1 className="text-3xl font-bold text-white mt-1">{test.title}</h1>
                </div>
                <div className="flex gap-2">
                  {test.type === 'free' ? (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-500 text-white">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Free
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-500 text-white">
                      <Crown className="w-4 h-4 mr-1" />
                      ₹{test.price}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white ${test.difficulty === 'Beginner' ? 'bg-blue-500' :
                    test.difficulty === 'Intermediate' ? 'bg-orange-500' :
                      test.difficulty === 'Advanced' ? 'bg-red-500' : 'bg-purple-500'
                    }`}>
                    <Star className="w-4 h-4 mr-1" />
                    {test.difficulty}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Description */}
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">{test.description}</p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">{test.time} mins</div>
                <div className="text-sm text-gray-500">Duration</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">{test.totalQuestions}</div>
                <div className="text-sm text-gray-500">Questions</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">{test.passingScore}</div>
                <div className="text-sm text-gray-500">Pass Score</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">{test.totalMarks}</div>
                <div className="text-sm text-gray-500">Total Marks</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Topics */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Topics Covered</h3>
                <div className="flex flex-wrap gap-3">
                  {(showAllTopics ? test.topics : test.topics.slice(0, 6)).map((topic, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                  {!showAllTopics && test.topics.length > 6 && (
                    <button
                      onClick={() => setShowAllTopics(true)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-full font-medium hover:bg-gray-200 transition-colors"
                    >
                      +{test.topics.length - 6} more
                    </button>
                  )}
                </div>
              </div>

              {/* Instructions (course-specific) */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h3>
                <ul className="space-y-2">
                  {test.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Start Test */}
            <div className="mt-8 text-center">
              {!user && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 text-sm">
                    <span className="font-semibold">Sign in required:</span> Please sign in to start taking tests and track your progress.
                  </p>
                </div>
              )}
              <button
                onClick={handleStartClick}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Play className="w-5 h-5 mr-2" />
                {user ? 'Start Test' : 'Sign in to Start'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-test instructions modal */}
      {showModal && (
        <PreTestModal
          test={test}
          onConfirm={handleConfirmStart}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default TestDetails;