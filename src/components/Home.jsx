import React, { useState } from 'react';
import { Search, Filter, BookOpen, Users, Award, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TestCard from './TestCard';

const Home = ({ testSeries, onSelectTest, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const navigate = useNavigate();

  const categories = ['All Categories', ...new Set(testSeries.map(test => test.category))];
  const difficulties = ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const types = ['Free', 'Paid'];

  const filteredTests = testSeries.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || selectedCategory === 'All Categories' || test.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || selectedDifficulty === 'All Levels' || test.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'All' || (selectedType === 'Free' && test.type === 'free');

    return matchesSearch && matchesCategory && matchesDifficulty && matchesType;
  });

  const handleViewDetails = (test) => {
    navigate(`/test/${test.testId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl text-white p-8 mb-12">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Master Programming with Expert Test Series
          </h1>
          <p className="text-xl mb-6 opacity-90">
            Challenge yourself with carefully crafted tests designed by industry experts. 
            Track your progress and earn certificates.
          </p>
          {!user && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <p className="text-white/90 text-sm">
                <span className="font-semibold">Sign in to unlock:</span> Track your progress, earn certificates, and access premium content
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 mr-3" />
              <div>
                <div className="font-semibold text-lg">{testSeries.length}+</div>
                <div className="text-sm opacity-80">Test Series</div>
              </div>
            </div>
            <div className="flex items-center">
              <Users className="w-8 h-8 mr-3" />
              <div>
                <div className="font-semibold text-lg">10,000+</div>
                <div className="text-sm opacity-80">Active Users</div>
              </div>
            </div>
            <div className="flex items-center">
              <Award className="w-8 h-8 mr-3" />
              <div>
                <div className="font-semibold text-lg">5,000+</div>
                <div className="text-sm opacity-80">Certificates Issued</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search for tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>

              {/* Free Only Toggle Button */}
              <button
                className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${selectedType === 'Free' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
                onClick={() => setSelectedType(selectedType === 'Free' ? 'All' : 'Free')}
              >
                <Filter className="w-4 h-4" /> Free Only
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {selectedCategory === 'All' ? 'All Test Series' : `${selectedCategory} Tests`}
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''} available
          </p>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <TrendingUp className="w-4 h-4 mr-1" />
          Sorted by popularity
        </div>
      </div>

      {/* Test Cards Grid */}
      {filteredTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map(test => (
            <TestCard 
              key={test.testId} 
              test={test} 
              onSelect={handleViewDetails}
              user={user}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tests found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or filters to find more tests.
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;