import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import TestDetails from './components/TestDetails';
import TestInterface from './components/TestInterface';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import TestResults from './components/TestResults';
import LoginModal from './components/LoginModal';
import ResetPassword from './components/ResetPassword';
import SessionTimeoutModal from './components/SessionTimeoutModal';
import PaymentPage from './components/PaymentPage';

import api from './services/api';

// Scrolls to top on every route change — fixes content loading under the fixed navbar
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// ─── Idle-timeout constants ───────────────────────────────────────────────────
const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours of inactivity → logout
const WARNING_BEFORE_MS = 60 * 1000;           // show popup 60 s before logout
const COUNTDOWN_SECS = 60;                  // seconds shown in the popup

// Activity events that reset the idle clock
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

function App() {
  const [user, setUser] = useState(null);
  const [testSeries, setTestSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Idle-timeout state
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECS);

  // Refs so callbacks always see up-to-date values without re-subscribing
  const idleTimerRef = useRef(null);     // fires when idle period ends (starts warning)
  const countdownRef = useRef(null);     // 1-second tick during warning
  const userRef = useRef(user);          // mirror of user state
  const lastActivityRef = useRef(Date.now()); // wall-clock timestamp of last activity
  useEffect(() => { userRef.current = user; }, [user]);

  // Mirror showTimeoutWarning in a ref so resetIdleTimer always sees current value
  const showTimeoutWarningRef = useRef(false);
  useEffect(() => { showTimeoutWarningRef.current = showTimeoutWarning; }, [showTimeoutWarning]);

  // Stable ref to resetIdleTimer so activity listeners always call the latest version
  const resetIdleTimerRef = useRef(null);

  // ─── Logout helper ─────────────────────────────────────────────────────────
  const doLogout = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    clearInterval(countdownRef.current);
    setShowTimeoutWarning(false);
    setCountdown(COUNTDOWN_SECS);
    api.logout();
    setUser(null);
  }, []);

  // ─── auth:expired — fired by api.js interceptor on 401 response ────────────
  useEffect(() => {
    const handleAuthExpired = () => doLogout();
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [doLogout]);

  // ─── Start countdown interval (timestamp-aware) ────────────────────────────
  // Instead of decrementing a counter we compute remaining seconds from the
  // real wall-clock timestamp, so browser timer throttling can't skew values.
  const startCountdown = useCallback((logoutAtMs) => {
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      const remaining = Math.ceil((logoutAtMs - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(countdownRef.current);
        doLogout();
        return;
      }
      setCountdown(remaining);
    }, 500); // tick twice a second so display stays snappy despite throttling
  }, [doLogout]);

  // ─── Start / reset idle timer ──────────────────────────────────────────────
  const resetIdleTimer = useCallback(() => {
    // Nothing to do if no user is logged in
    if (!userRef.current) return;

    // Record the exact moment of this activity
    const now = Date.now();
    lastActivityRef.current = now;

    // Hide warning & clear countdown if the popup is currently visible
    if (showTimeoutWarningRef.current) {
      setShowTimeoutWarning(false);
      setCountdown(COUNTDOWN_SECS);
    }
    clearTimeout(idleTimerRef.current);
    clearInterval(countdownRef.current);

    // Schedule the warning popup to appear WARNING_BEFORE_MS before logout
    idleTimerRef.current = setTimeout(() => {
      if (!userRef.current) return; // user logged out in the meantime
      const logoutAt = lastActivityRef.current + IDLE_TIMEOUT_MS;
      const secsLeft = Math.ceil((logoutAt - Date.now()) / 1000);
      setCountdown(secsLeft);
      setShowTimeoutWarning(true);
      startCountdown(logoutAt);
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);
  }, [doLogout, startCountdown]);

  // Keep the ref in sync with the latest resetIdleTimer
  useEffect(() => { resetIdleTimerRef.current = resetIdleTimer; }, [resetIdleTimer]);

  // ─── Attach / detach activity listeners when user logs in / out ────────────
  useEffect(() => {
    if (!user) {
      // User is logged out — stop all timers
      clearTimeout(idleTimerRef.current);
      clearInterval(countdownRef.current);
      setShowTimeoutWarning(false);
      setCountdown(COUNTDOWN_SECS);
      return;
    }

    // User is logged in — start idle timer and listen for activity.
    // Listeners are on `document` (not `window`) so only interactions directly
    // on this page reset the clock. Activity in other tabs is ignored because
    // document events don't fire cross-tab.
    const handler = () => resetIdleTimerRef.current?.();
    ACTIVITY_EVENTS.forEach(e => document.addEventListener(e, handler, { passive: true }));

    // ── visibilitychange: evaluate true elapsed time when tab becomes visible ──
    // Browsers throttle setTimeout/setInterval in background tabs, so the
    // on-screen countdown can lag behind real time. When the user switches back
    // to this tab we immediately check how much time has actually elapsed and
    // either logout right away or correct the displayed countdown.
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible' || !userRef.current) return;

      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= IDLE_TIMEOUT_MS) {
        // Idle period fully expired while tab was in background → logout now
        doLogout();
      } else if (elapsed >= IDLE_TIMEOUT_MS - WARNING_BEFORE_MS) {
        // Inside the warning window — show popup with correct remaining time
        clearTimeout(idleTimerRef.current);
        const logoutAt = lastActivityRef.current + IDLE_TIMEOUT_MS;
        const secsLeft = Math.ceil((logoutAt - Date.now()) / 1000);
        setCountdown(secsLeft);
        setShowTimeoutWarning(true);
        startCountdown(logoutAt);
      }
      // else: timer still has time left — the background setTimeout will fire
      // correctly (browsers guarantee at least one fire even when throttled).
    };
    document.addEventListener('visibilitychange', handleVisibility);

    resetIdleTimerRef.current?.(); // kick off the first timer

    return () => {
      ACTIVITY_EVENTS.forEach(e => document.removeEventListener(e, handler));
      document.removeEventListener('visibilitychange', handleVisibility);
      clearTimeout(idleTimerRef.current);
      clearInterval(countdownRef.current);
    };
  }, [user, doLogout, startCountdown]); // re-run only when user logs in/out

  // ─── Extend session ("Stay Logged In") ────────────────────────────────────
  const handleExtendSession = useCallback(() => {
    clearInterval(countdownRef.current);
    setShowTimeoutWarning(false);
    setCountdown(COUNTDOWN_SECS);
    resetIdleTimer();
  }, [resetIdleTimer]);

  // ─── Initial data fetch + session restore ─────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const courses = await api.getCourses();
        if (!Array.isArray(courses)) {
          console.error('API returned non-array for courses:', courses);
          setTestSeries([]);
          return;
        }
        const formattedCourses = courses.map(course => ({
          ...course,
          id: course._id,
          questions: course.totalQuestions || 0,
          image: course.thumbnail,
          category:
            Array.isArray(course.category) && course.category.length > 0
              ? course.category[0].name
              : course.category && course.category.name
                ? course.category.name
                : 'Uncategorized',
          topics: course.topics || [],
          difficulty: course.difficulty || 'Beginner',
          type: course.isPaid ? 'paid' : 'free',
          price: course.price || 0,
          instructions: course.instructions || [
            'Each question carries 1 marks',
            'No negative marking',
            'You can review and change answers before submission',
            'Timer will be displayed during the test',
          ],
        }));
        setTestSeries(formattedCourses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // ─── Restore session from localStorage ──────────────────────────────────
    const stored = api.getStoredAuth();
    if (stored) {
      setUser(stored.user);
    }
  }, []);

  // ─── Auth handlers ────────────────────────────────────────────────────────
  const handleLogin = (userData) => {
    setUser(userData);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    doLogout();
  };

  // Called by PaymentPage after premium is activated — updates state + localStorage
  const handleUpgrade = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleSelectTest = (test) => {
    window.location.href = `/test/${test.id}`;
  };

  const handleStartTest = () => {
    if (!user) {
      setShowLoginModal(true);
    }
  };

  return (
    <Router basename="/test">
      <div className="min-h-screen bg-gray-50">
        <ScrollToTop />
        <Navbar user={user} onLogout={handleLogout} onLogin={() => setShowLoginModal(true)} />
        {/* pt-16 = 64px offset for the fixed navbar — applies to all pages */}
        <main className="pt-16">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  testSeries={testSeries}
                  onSelectTest={handleSelectTest}
                  user={user}
                  onLogin={() => setShowLoginModal(true)}
                  heroImage="https://images.unsplash.com/photo-1635372722656-389f87a941b7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FsY3VsdXN8ZW58MHx8MHx8fDA%3D"
                />
              }
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
            <Route
              path="/payment"
              element={
                user
                  ? <PaymentPage user={user} onUpgrade={handleUpgrade} />
                  : <Navigate to="/" replace />
              }
            />
            {user && user.role === 'admin' && (
              <Route
                path="/admin"
                element={<AdminDashboard testSeries={testSeries} setTestSeries={setTestSeries} />}
              />
            )}
            {/* Public route — token in URL acts as the credential */}
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Login modal */}
        {showLoginModal && (
          <LoginModal onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />
        )}

        {/* ─── Idle-timeout warning popup ─────────────────────────────────── */}
        {showTimeoutWarning && user && (
          <SessionTimeoutModal
            countdown={countdown}
            onExtend={handleExtendSession}
            onLogout={doLogout}
          />
        )}
      </div>
    </Router>
  );
}

export default App;