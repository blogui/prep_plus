import React, { useState } from 'react';
import { User, Award, Download, Calendar, Target, TrendingUp, BookOpen, CheckCircle } from 'lucide-react';

const UserDashboard = ({ user, testSeries }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user data with tests attempted
  const userData = {
    ...user,
    testsAttempted: [
      {
        testId: 1,
        completedAt: "2024-01-20",
        score: 85,
        totalMarks: 100,
        passed: true,
        certificateId: "CERT-001-2024",
        timeTaken: 45
      },
      {
        testId: 3,
        completedAt: "2024-02-01",
        score: 92,
        totalMarks: 120,
        passed: true,
        certificateId: "CERT-003-2024",
        timeTaken: 58
      }
    ],
    certificates: [
      {
        id: "CERT-001-2024",
        testTitle: "Basic Programming Fundamentals",
        score: 85,
        issuedDate: "2024-01-20"
      },
      {
        id: "CERT-003-2024",
        testTitle: "React Fundamentals",
        score: 92,
        issuedDate: "2024-02-01"
      }
    ]
  };

  const handleDownloadCertificate = (certificate) => {
    // In a real app, this would generate and download the certificate
    alert(`Downloading certificate: ${certificate.id}`);
  };

  const getTestDetails = (testId) => {
    return testSeries.find(test => test.id === testId);
  };

  const totalTests = userData.testsAttempted?.length || 0;
  const passedTests = userData.testsAttempted?.filter(test => test.passed).length || 0;
  const averageScore = totalTests > 0 
    ? Math.round(userData.testsAttempted.reduce((sum, test) => sum + test.score, 0) / totalTests)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-8 mb-8">
        <div className="flex items-center">
          <img
            src={userData.avatar}
            alt={userData.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-white/20 mr-6"
          />
          <div>
            <h1 className="text-3xl font-bold mb-2">{userData.name}</h1>
            <p className="text-white/80">{userData.email}</p>
            <p className="text-white/60 text-sm">
              Member since {new Date(userData.joinedDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalTests}</div>
              <div className="text-sm text-gray-500">Tests Taken</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{passedTests}</div>
              <div className="text-sm text-gray-500">Tests Passed</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{averageScore}%</div>
              <div className="text-sm text-gray-500">Avg Score</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{userData.certificates?.length || 0}</div>
              <div className="text-sm text-gray-500">Certificates</div>
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
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'tests'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Test History
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'certificates'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Certificates
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              {userData.testsAttempted?.slice(0, 3).map((attempt) => {
                const testDetails = getTestDetails(attempt.testId);
                return (
                  <div key={`${attempt.testId}-${attempt.completedAt}`} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{testDetails?.title}</h4>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(attempt.completedAt).toLocaleDateString()}
                        <Target className="w-4 h-4 ml-4 mr-1" />
                        {attempt.score}/{attempt.totalMarks} ({Math.round((attempt.score / attempt.totalMarks) * 100)}%)
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      attempt.passed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {attempt.passed ? 'Passed' : 'Failed'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test History</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Test Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Score</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.testsAttempted?.map((attempt) => {
                      const testDetails = getTestDetails(attempt.testId);
                      return (
                        <tr key={`${attempt.testId}-${attempt.completedAt}`} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{testDetails?.title}</div>
                            <div className="text-sm text-gray-500">{testDetails?.category}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(attempt.completedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{attempt.score}/{attempt.totalMarks}</div>
                            <div className="text-sm text-gray-500">
                              {Math.round((attempt.score / attempt.totalMarks) * 100)}%
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {attempt.timeTaken} mins
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              attempt.passed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {attempt.passed ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Certificates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userData.certificates?.map((certificate) => (
                  <div key={certificate.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <Award className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                      <button
                        onClick={() => handleDownloadCertificate(certificate)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{certificate.testTitle}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Certificate ID: {certificate.id}</div>
                      <div>Score: {certificate.score}%</div>
                      <div>Issued: {new Date(certificate.issuedDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
                
                {(!userData.certificates || userData.certificates.length === 0) && (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No certificates yet. Complete tests to earn certificates!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;