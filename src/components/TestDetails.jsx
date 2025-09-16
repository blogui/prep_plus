import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, FileText, Star, CheckCircle, Crown, ArrowLeft, Play, Target, Award } from 'lucide-react';

const TestDetails = ({ testSeries, user, onStartTest }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const test = testSeries.find(t => t.id === parseInt(id));

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

  const handleStartTest = () => {
    if (!user) {
      onStartTest(test);
      return;
    }
    
    if (test.type === 'paid' && !user.purchasedTests?.includes(test.id)) {
      // In a real app, redirect to payment
      alert('This is a paid test. In a real application, you would be redirected to the payment page.');
      return;
    }
    navigate(`/test/${test.id}/start`);
  };

  return (
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
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white ${
                  test.difficulty === 'Beginner' ? 'bg-blue-500' :
                  test.difficulty === 'Intermediate' ? 'bg-orange-500' :
                  test.difficulty === 'Advanced' ? 'bg-red-500' :
                  'bg-purple-500'
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
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            {test.description}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">{test.duration} mins</div>
              <div className="text-sm text-gray-500">Duration</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">{test.questions}</div>
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
            {/* Topics Covered */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Topics Covered</h3>
              <div className="flex flex-wrap gap-3">
                {test.topics.map((topic, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Instructions */}
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

          {/* Start Test Button */}
          <div className="mt-8 text-center">
            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <span className="font-semibold">Sign in required:</span> Please sign in to start taking tests and track your progress.
                </p>
              </div>
            )}
            <button
              onClick={handleStartTest}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              {user ? 'Start Test' : 'Sign in to Start'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDetails;