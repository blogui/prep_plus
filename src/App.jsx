import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import TestDetails from './components/TestDetails';
import TestInterface from './components/TestInterface';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import TestResults from './components/TestResults';
import LoginModal from './components/LoginModal';

import testSeriesData from './data/testSeries.json';
import questionsData from './data/questions.json';

function App() {
  const [user, setUser] = useState(null);
  const [testSeries, setTestSeries] = useState(testSeriesData);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleSelectTest = (test) => {
    window.location.href = `/test/${test.id}`;
  };

  const handleStartTest = (test) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    // Proceed with test start logic
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={handleLogout} onLogin={() => setShowLoginModal(true)} />
        <Routes>
          <Route 
            path="/" 
            element={<Home testSeries={testSeries} onSelectTest={handleSelectTest} />} 
          />
          <Route 
            path="/test/:id" 
            element={<TestDetails testSeries={testSeries} user={user} onStartTest={handleStartTest} />} 
          />
          <Route 
            path="/test/:id/start" 
            element={user ? <TestInterface testSeries={testSeries} questionsData={questionsData} /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/test/:id/results" 
            element={user ? <TestResults /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <UserDashboard user={user} testSeries={testSeries} /> : <Navigate to="/" replace />} 
          />
          {user && user.role === 'admin' && (
            <Route 
              path="/admin" 
              element={<AdminDashboard testSeries={testSeries} setTestSeries={setTestSeries} />} 
            />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {showLoginModal && (
          <LoginModal onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />
        )}
      </div>
    </Router>
  );
}

export default App;