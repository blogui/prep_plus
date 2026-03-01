import React, { useState } from 'react';
import { BookOpen, Shield, Award, Users, X, Eye, EyeOff, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../services/api';

const LoginModal = ({ onLogin, onClose, onRegister }) => {
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Sign In
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpMobile, setSignUpMobile] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userStr = params.get('user');

    if (accessToken && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        window.history.replaceState({}, document.title, window.location.pathname);
        onLogin(user);
        onClose();
      } catch (e) {
        console.error('Error parsing user data from Google Auth:', e);
        setError('Failed to login with Google');
      }
    }
  }, [onLogin, onClose]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setForgotSuccess(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleAdminLogin = () => {
    const adminUser = {
      id: 2,
      email: 'admin@logicjunior.com',
      name: 'Admin User',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      joinedDate: '2024-01-01',
      role: 'admin',
    };
    onLogin(adminUser);
    onClose();
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await api.login(signInEmail, signInPassword);
      onLogin(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = {
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
        mobile: signUpMobile || undefined,
      };
      const user = await api.register(userData);
      if (onRegister) {
        onRegister(user);
      } else {
        onLogin(user);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.forgotPassword(forgotEmail);
      setForgotSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              {activeTab === 'forgot' ? 'Reset Password' : 'Welcome'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Feature icons — only on sign-in / sign-up */}
          {activeTab !== 'forgot' && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3">
                <Shield className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Attempt Test</p>
              </div>
              <div className="text-center p-3">
                <Award className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Performance Report</p>
              </div>
              <div className="text-center p-3">
                <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Track Progress</p>
              </div>
            </div>
          )}

          {/* Tab Navigation — only on sign-in / sign-up */}
          {activeTab !== 'forgot' && (
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => switchTab('signin')}
                className={`flex-1 py-3 text-center text-sm font-semibold transition-colors ${activeTab === 'signin'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchTab('signup')}
                className={`flex-1 py-3 text-center text-sm font-semibold transition-colors ${activeTab === 'signup'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* ─── Sign In ─── */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3 mb-4">
              <div>
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot password link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => switchTab('forgot')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* ─── Sign Up ─── */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3 mb-4">
              <input
                type="text"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                placeholder="Name"
                required
                className="w-full px-4 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-4 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="tel"
                value={signUpMobile}
                onChange={(e) => setSignUpMobile(e.target.value)}
                placeholder="Mobile Number (Optional)"
                className="w-full px-4 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="relative">
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          )}

          {/* ─── Forgot Password ─── */}
          {activeTab === 'forgot' && (
            <div>
              <button
                type="button"
                onClick={() => switchTab('signin')}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Sign In
              </button>

              <p className="text-sm text-gray-500 mb-5">
                Enter your registered email and we'll send you a reset link.
              </p>

              {forgotSuccess ? (
                <div className="flex flex-col items-center text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                  <p className="font-semibold text-gray-800">Check your inbox!</p>
                  <p className="text-sm text-gray-500 mt-2">
                    If an account exists for <span className="font-medium text-gray-700">{forgotEmail}</span>,
                    you will receive a password reset link shortly.
                  </p>
                  <p className="text-xs text-gray-400 mt-3">Check your spam folder if you don't see it.</p>
                  <button
                    type="button"
                    onClick={() => { setForgotSuccess(false); setForgotEmail(''); setError(''); }}
                    className="mt-4 text-sm text-blue-600 hover:underline"
                  >
                    Try a different email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full pl-9 pr-4 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ─── Google / Admin (only for sign-in and sign-up) ─── */}
          {activeTab !== 'forgot' && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-2"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign {activeTab === 'signin' ? 'in' : 'up'} with Google
              </button>

              <button
                onClick={handleAdminLogin}
                className="w-full flex items-center justify-center px-3 py-2 border border-purple-300 rounded-lg bg-purple-50 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
              >
                Login as Admin (Demo)
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;