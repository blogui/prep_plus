import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, Star, Crown, CheckCircle } from 'lucide-react';

const TestCard = ({ test, onSelect, user }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/test/${test.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer" onClick={handleClick}>
      <div className="relative">
        <img
          src={test.image}
          alt={test.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          {test.type === 'free' ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-1" />
              Free
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <Crown className="w-4 h-4 mr-1" />
              Premium
            </span>
          )}
        </div>
        <div className="absolute top-4 right-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${test.difficulty === 'Beginner' ? 'bg-blue-100 text-blue-800' :
            test.difficulty === 'Intermediate' ? 'bg-orange-100 text-orange-800' :
              test.difficulty === 'Advanced' ? 'bg-red-100 text-red-800' :
                'bg-purple-100 text-purple-800'
            }`}>
            <Star className="w-4 h-4 mr-1" />
            {test.difficulty}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{test.category}</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {test.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {test.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{test.time} mins</span>
          </div>
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            <span>{test.totalQuestions} questions</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(test.topics || []).slice(0, 3).map((topic, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {topic}
            </span>
          ))}
          {(test.topics || []).length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              +{(test.topics || []).length - 3} more
            </span>
          )}
        </div>

        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform group-hover:scale-[1.02]">
          View Details
        </button>
      </div>
    </div>
  );
};

export default TestCard;