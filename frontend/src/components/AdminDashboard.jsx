import React, { useState } from 'react';
import {
  Users, BookOpen, Award, TrendingUp, Plus, Edit, Trash2,
  Search, Filter, Eye, Download, Settings, BarChart3
} from 'lucide-react';

const AdminDashboard = ({ testSeries, setTestSeries }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddTestModal, setShowAddTestModal] = useState(false);

  // Mock admin data
  const adminStats = {
    totalUsers: 1250,
    totalTests: testSeries.length,
    totalCertificates: 892,
    averageScore: 78,
    recentActivity: [
      { user: 'John Doe', action: 'Completed', test: 'React Fundamentals', time: '2 hours ago' },
      { user: 'Jane Smith', action: 'Started', test: 'JavaScript Advanced', time: '4 hours ago' },
      { user: 'Mike Johnson', action: 'Completed', test: 'Programming Basics', time: '6 hours ago' },
    ]
  };

  const mockUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      joinDate: '2024-01-15',
      testsCompleted: 3,
      averageScore: 85,
      status: 'Active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      joinDate: '2024-02-01',
      testsCompleted: 2,
      averageScore: 92,
      status: 'Active'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      joinDate: '2024-01-20',
      testsCompleted: 5,
      averageScore: 78,
      status: 'Active'
    }
  ];

  const handleDeleteTest = (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      setTestSeries(testSeries.filter(test => test.id !== testId));
    }
  };

  const AddTestModal = () => {
    const [newTest, setNewTest] = useState({
      title: '',
      description: '',
      category: '',
      difficulty: 'Beginner',
      type: 'free',
      price: 0,
      duration: 60,
      questions: 50,
      topics: [],
      passingScore: 70,
      totalMarks: 100
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const test = {
        ...newTest,
        id: Math.max(...testSeries.map(t => t.id)) + 1,
        image: "https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=400",
        topics: newTest.topics.split(',').map(t => t.trim()).filter(t => t),
        instructions: [
          "Each question carries 2 marks",
          "No negative marking",
          "You can review and change answers before submission",
          "Timer will be displayed during the test"
        ]
      };
      setTestSeries([...testSeries, test]);
      setShowAddTestModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Add New Test</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newTest.title}
                  onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={newTest.category}
                  onChange={(e) => setNewTest({ ...newTest, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newTest.description}
                onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={newTest.difficulty}
                  onChange={(e) => setNewTest({ ...newTest, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={newTest.type}
                  onChange={(e) => setNewTest({ ...newTest, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              {newTest.type === 'paid' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    value={newTest.price}
                    onChange={(e) => setNewTest({ ...newTest, price: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (mins)</label>
                <input
                  type="number"
                  value={newTest.duration}
                  onChange={(e) => setNewTest({ ...newTest, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Questions</label>
                <input
                  type="number"
                  value={newTest.questions}
                  onChange={(e) => setNewTest({ ...newTest, questions: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score (%)</label>
                <input
                  type="number"
                  value={newTest.passingScore}
                  onChange={(e) => setNewTest({ ...newTest, passingScore: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
                <input
                  type="number"
                  value={newTest.totalMarks}
                  onChange={(e) => setNewTest({ ...newTest, totalMarks: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topics (comma-separated)</label>
              <input
                type="text"
                value={newTest.topics}
                onChange={(e) => setNewTest({ ...newTest, topics: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="React, JavaScript, HTML, CSS"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddTestModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Test
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-white/80">Manage tests, users, and monitor platform performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{adminStats.totalUsers}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{adminStats.totalTests}</div>
              <div className="text-sm text-gray-500">Test Series</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{adminStats.totalCertificates}</div>
              <div className="text-sm text-gray-500">Certificates Issued</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{adminStats.averageScore}%</div>
              <div className="text-sm text-gray-500">Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'overview'
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'tests'
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Manage Tests
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'users'
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'analytics'
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {adminStats.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm">
                            <span className="font-medium">{activity.user}</span> {activity.action.toLowerCase()}
                            <span className="font-medium"> {activity.test}</span>
                          </div>
                          <div className="text-xs text-gray-500">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowAddTestModal(true)}
                      className="w-full flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add New Test
                    </button>
                    <button className="w-full flex items-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                      <Download className="w-5 h-5 mr-2" />
                      Export Reports
                    </button>
                    <button className="w-full flex items-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                      <Settings className="w-5 h-5 mr-2" />
                      Platform Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Manage Test Series</h3>
                <button
                  onClick={() => setShowAddTestModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Test
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Test Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Questions</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testSeries.map((test) => (
                      <tr key={test.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{test.title}</div>
                          <div className="text-sm text-gray-500">{test.difficulty}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{test.category}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${test.type === 'free'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {test.type === 'free' ? 'Free' : `₹${test.price}`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{test.questions}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTest(test.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Join Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Tests Completed</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Avg Score</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(user.joinDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.testsCompleted}</td>
                        <td className="py-3 px-4 text-gray-600">{user.averageScore}%</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Platform Analytics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Test Completion Rates</h4>
                  </div>
                  <div className="space-y-3">
                    {testSeries.slice(0, 4).map((test) => (
                      <div key={test.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{test.title}</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.random() * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.floor(Math.random() * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Recent Trends</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">New Registrations</span>
                      <span className="text-sm font-medium text-green-600">+15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Test Attempts</span>
                      <span className="text-sm font-medium text-blue-600">+8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Scores</span>
                      <span className="text-sm font-medium text-purple-600">+3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddTestModal && <AddTestModal />}
    </div>
  );
};

export default AdminDashboard;