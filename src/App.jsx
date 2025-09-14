import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Home from './components/Home';
import TestDetails from './components/TestDetails';
import TestInterface from './components/TestInterface';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

import testSeriesData from './data/testSeries.json';
import questionsData from './data/questions.json';

function App() {
  const [user, setUser] = useState(null);
  const [testSeries, setTestSeries] = useState(testSeriesData);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleSelectTest = (test) => {
    window.location.href = `/test/${test.id}`;
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route 
            path="/" 
            element={<Home testSeries={testSeries} onSelectTest={handleSelectTest} />} 
          />
          <Route 
            path="/test/:id" 
            element={<TestDetails testSeries={testSeries} user={user} />} 
          />
          <Route 
            path="/test/:id/start" 
            element={<TestInterface testSeries={testSeries} questionsData={questionsData} />} 
          />
          <Route 
            path="/dashboard" 
            element={<UserDashboard user={user} testSeries={testSeries} />} 
          />
          {user.role === 'admin' && (
            <Route 
              path="/admin" 
              element={<AdminDashboard testSeries={testSeries} setTestSeries={setTestSeries} />} 
            />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;