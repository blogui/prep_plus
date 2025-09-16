import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Award, Clock, Target, Home, Download } from 'lucide-react';

const TestResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const {
    test,
    questions,
    answers,
    score,
    totalMarks,
    passed,
    timeSpent
  } = location.state || {};

  if (!test || !questions) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Results not found</h2>
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

  const percentage = Math.round((score / totalMarks) * 100);
  const correctAnswers = questions.filter(q => answers[q.id] === q.correct).length;
  const incorrectAnswers = questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== q.correct).length;
  const unanswered = questions.length - Object.keys(answers).length;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownloadCertificate = () => {
    if (passed) {
      // In a real app, this would generate and download the certificate
      alert(`Certificate downloaded for ${test.title}!\nScore: ${percentage}%`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Results Header */}
        <div className={`rounded-2xl p-8 mb-8 text-white ${
          passed ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}>
          <div className="text-center">
            <div className="mb-4">
              {passed ? (
                <CheckCircle className="w-16 h-16 mx-auto" />
              ) : (
                <XCircle className="w-16 h-16 mx-auto" />
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {passed ? 'Congratulations!' : 'Test Completed'}
            </h1>
            <p className="text-xl opacity-90 mb-4">
              {passed ? 'You have successfully passed the test!' : 'Better luck next time!'}
            </p>
            <div className="text-4xl font-bold mb-2">{percentage}%</div>
            <p className="opacity-90">{score} out of {totalMarks} marks</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{correctAnswers}</div>
            <div className="text-sm text-gray-500">Correct</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{incorrectAnswers}</div>
            <div className="text-sm text-gray-500">Incorrect</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <Target className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{unanswered}</div>
            <div className="text-sm text-gray-500">Unanswered</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{formatTime(timeSpent)}</div>
            <div className="text-sm text-gray-500">Time Spent</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Tests
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            View Dashboard
          </button>
          
          {passed && (
            <button
              onClick={handleDownloadCertificate}
              className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </button>
          )}
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Detailed Results</h2>
            <p className="text-gray-600 mt-1">Review all questions and correct answers</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-8">
              {questions.map((question, index) => {
                const userAnswer = answers[question.id];
                const isCorrect = userAnswer === question.correct;
                const wasAnswered = userAnswer !== undefined;
                
                return (
                  <div key={question.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                    <div className="flex items-start mb-4">
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium mr-3 mt-1">
                        Q{index + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          {question.question}
                        </h3>
                        
                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => {
                            const isUserAnswer = userAnswer === optionIndex;
                            const isCorrectAnswer = question.correct === optionIndex;
                            
                            let optionClass = 'p-3 rounded-lg border ';
                            
                            if (isCorrectAnswer) {
                              optionClass += 'border-green-500 bg-green-50 text-green-800';
                            } else if (isUserAnswer && !isCorrect) {
                              optionClass += 'border-red-500 bg-red-50 text-red-800';
                            } else {
                              optionClass += 'border-gray-200 bg-gray-50 text-gray-700';
                            }
                            
                            return (
                              <div key={optionIndex} className={optionClass}>
                                <div className="flex items-center">
                                  <div className="flex items-center mr-3">
                                    {isCorrectAnswer && (
                                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                                    )}
                                    {isUserAnswer && !isCorrect && (
                                      <XCircle className="w-4 h-4 text-red-600 mr-1" />
                                    )}
                                  </div>
                                  <span>{option}</span>
                                  {isUserAnswer && (
                                    <span className="ml-auto text-xs font-medium">
                                      Your Answer
                                    </span>
                                  )}
                                  {isCorrectAnswer && (
                                    <span className="ml-auto text-xs font-medium">
                                      Correct Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Status and Explanation */}
                        <div className="mt-4 flex items-start justify-between">
                          <div className="flex items-center">
                            {!wasAnswered ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <Target className="w-3 h-3 mr-1" />
                                Not Answered
                              </span>
                            ) : isCorrect ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Correct (+2 marks)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Incorrect (0 marks)
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Explanation */}
                        {question.explanation && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Explanation:</h4>
                            <p className="text-sm text-blue-800">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults;