import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../services/api';
import QuestionCard from './QuestionCard';

const TestInterface = ({ testSeries }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const test = testSeries.find(t => t.id === id || t.id === parseInt(id));

  const [attemptId, setAttemptId] = useState(null);
  const [questionIds, setQuestionIds] = useState([]);
  const [questionsById, setQuestionsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  const formatQuestion = useCallback((q) => ({
    id: q._id,
    question: q.questionText || '',
    questionImage: q.questionImage || '',
    options: (q.options || []).map(o => ({
      text: o.text || '',
      image: o.image || '',
    })),
    correct: (q.options || []).findIndex(o => o.isCorrect),
    explanation: q.explanation?.text || '',
    explanationImage: q.explanation?.image || '',
    marks: q.marks || 1,
    negativeMarks: q.negativeMarks || 0,
  }), []);

  const parseTime = (timeString) => {
    if (!timeString) return 0;
    const match = timeString.toString().match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  useEffect(() => {
    const startAttempt = async () => {
      if (!test) return;

      try {
        setLoading(true);
        setError(null);
        setAttemptId(null);
        setQuestionIds([]);
        setQuestionsById({});
        setCurrentQuestion(0);
        setAnswers({});
        setTestStarted(false);
        setTimeLeft(0);

        const attempt = await api.startTestAttempt(test.id);
        setAttemptId(attempt.attemptId);
        setQuestionIds(Array.isArray(attempt.questionIds) ? attempt.questionIds : []);
      } catch (err) {
        console.error('Failed to start test attempt:', err);
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    startAttempt();
  }, [test]);

  const fetchAttemptQuestion = useCallback(async (questionId, cachedQuestions = questionsById) => {
    if (!attemptId || !questionId) return null;

    if (cachedQuestions[questionId]) {
      return cachedQuestions[questionId];
    }

    const fetchedQuestion = await api.getAttemptQuestion(attemptId, questionId);
    const formattedQuestion = formatQuestion(fetchedQuestion);

    setQuestionsById(prev => ({
      ...prev,
      [questionId]: formattedQuestion,
    }));

    return formattedQuestion;
  }, [attemptId, formatQuestion, questionsById]);

  useEffect(() => {
    const questionId = questionIds[currentQuestion];
    if (!questionId || questionsById[questionId]) return;

    let cancelled = false;

    const loadCurrentQuestion = async () => {
      try {
        setLoadingQuestion(true);
        await fetchAttemptQuestion(questionId);
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch question:', err);
          setError('Failed to load this question. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoadingQuestion(false);
        }
      }
    };

    loadCurrentQuestion();

    return () => {
      cancelled = true;
    };
  }, [currentQuestion, fetchAttemptQuestion, questionIds, questionsById]);

  useEffect(() => {
    if (test && !testStarted && questionIds.length > 0) {
      const timeInMinutes = parseTime(test.time) || parseTime(test.duration) || 60;
      setTimeLeft(timeInMinutes * 60);
      setTestStarted(true);
    }
  }, [test, testStarted, questionIds.length]);

  const getLoadedQuestionsInOrder = useCallback((cache) => (
    questionIds.map(questionId => cache[questionId]).filter(Boolean)
  ), [questionIds]);

  const calculateScore = useCallback((loadedQuestions) => {
    let score = 0;
    loadedQuestions.forEach(question => {
      if (answers[question.id] === question.correct) {
        score += question.marks || 1;
      }
    });
    return score;
  }, [answers]);

  const loadAllSelectedQuestions = useCallback(async () => {
    const nextQuestionsById = { ...questionsById };

    for (const questionId of questionIds) {
      if (!nextQuestionsById[questionId]) {
        nextQuestionsById[questionId] = await fetchAttemptQuestion(questionId, nextQuestionsById);
      }
    }

    setQuestionsById(nextQuestionsById);
    return getLoadedQuestionsInOrder(nextQuestionsById);
  }, [fetchAttemptQuestion, getLoadedQuestionsInOrder, questionIds, questionsById]);

  const handleSubmitTest = useCallback(async () => {
    if (submitting || !attemptId) return;

    try {
      setSubmitting(true);
      setShowConfirmSubmit(false);

      const loadedQuestions = await loadAllSelectedQuestions();
      const calculatedTotalMarks = loadedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
      const score = calculateScore(loadedQuestions);
      const passed = calculatedTotalMarks > 0
        ? (score / calculatedTotalMarks) * 100 >= test.passingScore
        : false;
      const timeInMinutes = parseTime(test.time) || parseTime(test.duration) || 60;

      try {
        await api.submitTestAttempt({
          attemptId,
          score,
          totalMarks: calculatedTotalMarks,
        });
      } catch (err) {
        console.warn('Could not save test attempt:', err);
      }

      navigate(`/test/${test.id}/results`, {
        state: {
          test,
          questions: loadedQuestions,
          answers,
          score,
          totalMarks: calculatedTotalMarks,
          passed,
          timeSpent: timeInMinutes * 60 - timeLeft,
        },
      });
    } catch (err) {
      console.error('Failed to submit test:', err);
      setError('Failed to submit test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [
    answers,
    attemptId,
    calculateScore,
    loadAllSelectedQuestions,
    navigate,
    submitting,
    test,
    timeLeft,
  ]);

  useEffect(() => {
    if (timeLeft > 0 && testStarted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (timeLeft === 0 && testStarted) {
      handleSubmitTest();
    }
  }, [handleSubmitTest, timeLeft, testStarted]);

  if (!test) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Test not found</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800">Back to tests</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test questions...</p>
        </div>
      </div>
    );
  }

  if (error || questionIds.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {error || "No questions available for this test yet."}
          </h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to tests
          </button>
        </div>
      </div>
    );
  }

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex,
    });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestionId = questionIds[currentQuestion];
  const currentQuestionData = questionsById[currentQuestionId];
  const isLastQuestion = currentQuestion === questionIds.length - 1;
  const answeredQuestions = Object.keys(answers).length;
  const progress = (currentQuestion + 1) / questionIds.length * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-16 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{test.title}</h1>
              <p className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {questionIds.length}
              </p>
            </div>

            <div className="flex items-center space-x-6">
              <div className={`flex items-center px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
              </div>

              <div className="text-sm text-gray-600">
                <span className="font-medium">{answeredQuestions}</span>/{questionIds.length} answered
              </div>

              <button
                onClick={() => setShowConfirmSubmit(true)}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'End Test'}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border p-8 flex flex-col"
              style={{ maxHeight: 'calc(100vh - 15rem)' }}>
              <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                {currentQuestionData ? (
                  <QuestionCard
                    key={currentQuestionData.id}
                    questionData={currentQuestionData}
                    questionIndex={currentQuestion}
                    selectedAnswer={answers[currentQuestionData.id]}
                    onAnswerSelect={handleAnswerSelect}
                  />
                ) : (
                  <div className="min-h-[300px] flex items-center justify-center text-gray-500">
                    {loadingQuestion ? 'Loading question...' : 'Question unavailable'}
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6 pt-6 border-t border-gray-100 shrink-0">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>

                <button
                  onClick={() => setCurrentQuestion(Math.min(questionIds.length - 1, currentQuestion + 1))}
                  disabled={isLastQuestion}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Question Navigation</h3>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {questionIds.map((questionId, index) => (
                  <button
                    key={questionId}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${index === currentQuestion
                      ? 'bg-blue-600 text-white'
                      : answers[questionId] !== undefined
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                  <span className="text-gray-600">Current</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                  <span className="text-gray-600">Not Answered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">End Test?</h3>
              <p className="text-gray-600">
                You have answered {answeredQuestions} out of {questionIds.length} questions.
              </p>
              {answeredQuestions < questionIds.length && (
                <p className="text-red-600 text-sm mt-2">
                  {questionIds.length - answeredQuestions} question(s) remain unanswered.
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Continue Test
              </button>
              <button
                onClick={handleSubmitTest}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'End Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestInterface;
