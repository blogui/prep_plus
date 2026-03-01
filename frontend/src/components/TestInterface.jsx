import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight, Flag } from 'lucide-react';
import api from '../services/api';
import QuestionCard from './QuestionCard';

const TestInterface = ({ testSeries, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const test = testSeries.find(t => t.id === id || t.id === parseInt(id));

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!test) return;

      try {
        setLoading(true);
        // Fetch questions for this course
        // Note: The backend expects courseId. formatting check might be needed if IDs are complex objects
        const fetchedQuestions = await api.getQuestions(test.id);
        console.log("Test Configuration:", {
          testTotalQuestions: test.totalQuestions,
          questionsLength: fetchedQuestions?.length
        });

        if (fetchedQuestions && Array.isArray(fetchedQuestions)) {
          // Transform backend data to frontend format
          const formattedQuestions = fetchedQuestions.map(q => ({
            id: q._id,
            question: q.questionText || '',
            questionImage: q.questionImage || '',                    // ← carry image
            options: q.options.map(o => ({                          // ← full objects
              text: o.text || '',
              image: o.image || '',
            })),
            correct: q.options.findIndex(o => o.isCorrect),
            explanation: q.explanation?.text || '',
            explanationImage: q.explanation?.image || '',
            marks: q.marks || 1,
            negativeMarks: q.negativeMarks || 0,
          }));

          // Shuffle questions
          const shuffledQuestions = formattedQuestions.sort(() => 0.5 - Math.random());

          // Limit questions to test.totalQuestions (or all if not specified)
          const questionLimit = test.totalQuestions || shuffledQuestions.length;
          const selectedQuestions = shuffledQuestions.slice(0, questionLimit);

          setQuestions(selectedQuestions);
        } else {
          setQuestions([]); // No questions found
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [test]);

  // Helper to parse time string (e.g., "60 mins" -> 60)
  const parseTime = (timeString) => {
    if (!timeString) return 0;
    // Extract number from string
    const match = timeString.toString().match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  useEffect(() => {
    if (test && !testStarted && questions.length > 0) {
      // Use test.time (e.g., "60 mins") instead of test.duration ("3 Weeks")
      // If test.time is missing, fallback to parsing duration or default
      const timeInMinutes = parseTime(test.time) || parseTime(test.duration) || 60;
      setTimeLeft(timeInMinutes * 60); // Convert minutes to seconds
      setTestStarted(true);
    }
  }, [test, testStarted, questions.length]);

  useEffect(() => {
    if (timeLeft > 0 && testStarted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && testStarted) {
      handleSubmitTest();
    }
  }, [timeLeft, testStarted]);

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

  if (error || questions.length === 0) {
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
            ← Back to tests
          </button>
        </div>
      </div>
    );
  }

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    });
  };

  const handleSubmitTest = async () => {
    const calculatedTotalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0); // Calculate total marks dynamically based on question marks
    const score = calculateScore();
    const passed = (score / calculatedTotalMarks) * 100 >= test.passingScore;

    // Use the same time parsing logic as useEffect
    const timeInMinutes = parseTime(test.time) || parseTime(test.duration) || 60;

    // Save progress to backend (fire-and-forget — failure must not block results page)
    if (user && user._id) {
      const questionIds = questions.map(q => q.id);
      try {
        await api.submitTestProgress({
          userId: user._id,
          courseId: test.id,
          questionIds,
          score,
          totalMarks: calculatedTotalMarks,
        });
      } catch (err) {
        console.warn('Could not save test progress:', err);
      }
    }

    // Navigate to results page with test data
    navigate(`/test/${test.id}/results`, {
      state: {
        test,
        questions,
        answers,
        score,
        totalMarks: calculatedTotalMarks, // Pass calculated total marks
        passed,
        timeSpent: timeInMinutes * 60 - timeLeft
      }
    });
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correct) {
        score += question.marks || 1; // Use dynamic marks
      }
    });
    return score;
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

  const currentQuestionData = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const answeredQuestions = Object.keys(answers).length;
  const progress = (currentQuestion + 1) / questions.length * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — sticky so timer/progress always visible */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{test.title}</h1>
              <p className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {test.totalQuestions}
              </p>
            </div>

            <div className="flex items-center space-x-6">
              {/* Time Remaining */}
              <div className={`flex items-center px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
              </div>

              {/* Progress */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">{answeredQuestions}</span>/{test.totalQuestions} answered
              </div>

              {/* End Test Button */}
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                End Test
              </button>
            </div>
          </div>

          {/* Progress Bar */}
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
          {/* Question Panel */}
          <div className="lg:col-span-3">
            {/* Card is a flex column — QuestionCard scrolls, nav buttons stay pinned */}
            <div className="bg-white rounded-xl shadow-sm border p-8 flex flex-col"
              style={{ maxHeight: 'calc(100vh - 11rem)' }}>

              {/* Scrollable question area */}
              <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                <QuestionCard
                  key={currentQuestionData.id}
                  questionData={currentQuestionData}
                  questionIndex={currentQuestion}
                  selectedAnswer={answers[currentQuestionData.id]}
                  onAnswerSelect={handleAnswerSelect}
                />
              </div>

              {/* Navigation Buttons — always visible at bottom of card */}
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
                  onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                  disabled={isLastQuestion}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>

          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Question Navigation</h3>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${index === currentQuestion
                      ? 'bg-blue-600 text-white'
                      : answers[questions[index].id] !== undefined
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

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">End Test?</h3>
              <p className="text-gray-600">
                You have answered {answeredQuestions} out of {questions.length} questions.
              </p>
              {answeredQuestions < questions.length && (
                <p className="text-red-600 text-sm mt-2">
                  {questions.length - answeredQuestions} question(s) remain unanswered.
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
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                End Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestInterface;