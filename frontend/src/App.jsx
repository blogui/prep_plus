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

import api from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [testSeries, setTestSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const courses = await api.getCourses();
        if (!Array.isArray(courses)) {
          console.error("API returned non-array for courses:", courses);
          setTestSeries([]);
          return;
        }
        // Transform backend data to match frontend expectations if necessary
        // Mapping _id to id for frontend compatibility
        const formattedCourses = courses.map(course => ({
          ...course,
          id: course._id, // Ensure id is present
          questions: course.totalQuestions || 0, // Fallback
          image: course.thumbnail, // Map thumbnail to image
          // Fix: Extract category name from populated array/object
          category: Array.isArray(course.category) && course.category.length > 0
            ? course.category[0].name
            : (course.category && course.category.name ? course.category.name : 'Uncategorized'),

          // Map backend fields to frontend expectations to prevent crash
          topics: course.topics || [], // Prevent .slice() crash
          difficulty: course.difficulty || 'Beginner',
          type: course.isPaid ? 'paid' : 'free',
          price: course.price || 0,
          instructions: course.instructions || [
            "Each question carries 1 marks",
            "No negative marking",
            "You can review and change answers before submission",
            "Timer will be displayed during the test"
          ] // Default instructions
        }));
        setTestSeries(formattedCourses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Check for tokens in localStorage to auto-login
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Ideally verify token with backend, but for now we can persist user state if stored or just rely on protected routes to fail
      // Since we don't have a /me endpoint yet efficiently implemented or used here, 
      // we might want to decode token or just wait for user to hit a protected route.
      // For this task, we focus on fetching data.
    }
  }, []);

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
            element={user ? <TestInterface testSeries={testSeries} user={user} /> : <Navigate to="/" replace />}
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