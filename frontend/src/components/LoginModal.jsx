import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BookOpen, Shield, Award, Users, X, Eye, EyeOff, Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const OTP_TIMER_SECS = 120;

// Simple email format check
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(OTP_TIMER_SECS);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Refs for OTP boxes and timer interval
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const timerRef = useRef(null);

  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotEmailNotFound, setForgotEmailNotFound] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ─── Google token from URL ────────────────────────────────────────────────
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

  // ─── Timer logic ──────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setOtpTimer(OTP_TIMER_SECS);
    timerRef.current = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // If user changes email after OTP flow started, reset everything
  const handleSignUpEmailChange = (e) => {
    const value = e.target.value;
    setSignUpEmail(value);
    if (otpSent || emailVerified) {
      setOtpSent(false);
      setEmailVerified(false);
      setOtpValues(['', '', '', '']);
      setOtpError('');
      clearInterval(timerRef.current);
    }
  };

  // ─── Send OTP ─────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!isValidEmail(signUpEmail)) return;
    setOtpError('');
    setOtpLoading(true);
    try {
      await api.sendOtp(signUpEmail);
      setOtpSent(true);
      setOtpValues(['', '', '', '']);
      startTimer();
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      setOtpError(err.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // ─── Resend OTP ───────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setOtpError('');
    setOtpValues(['', '', '', '']);
    setOtpLoading(true);
    try {
      await api.sendOtp(signUpEmail);
      startTimer();
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      setOtpError(err.message || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // ─── OTP input handling ───────────────────────────────────────────────────
  const handleOtpChange = async (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpValues];
    newOtp[index] = digit;
    setOtpValues(newOtp);
    setOtpError('');

    if (digit && index < 3) {
      otpRefs[index + 1].current?.focus();
    }

    if (newOtp.every((d) => d !== '') && newOtp.join('').length === 4) {
      await verifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    const newOtp = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i];
    setOtpValues(newOtp);
    const focusIdx = Math.min(pasted.length, 3);
    otpRefs[focusIdx].current?.focus();
    if (newOtp.every((d) => d !== '')) verifyOtp(newOtp.join(''));
  };

  // ─── Verify OTP ───────────────────────────────────────────────────────────
  const verifyOtp = async (otp) => {
    setOtpError('');
    try {
      await api.verifyOtp(signUpEmail, otp);
      setEmailVerified(true);
      setOtpSent(false);
      clearInterval(timerRef.current);
    } catch (err) {
      setOtpError(err.message || 'Invalid OTP');
    }
  };

  // ─── Format timer as MM:SS ────────────────────────────────────────────────
  const formatTimer = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // ─── Tab switch helper ────────────────────────────────────────────────────
  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setForgotSuccess(false);
    setForgotEmailNotFound(false);
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
    if (!emailVerified) {
      setError('Please verify your email before signing up.');
      return;
    }
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
    setForgotEmailNotFound(false);
    setLoading(true);
    try {
      const data = await api.forgotPassword(forgotEmail);
      // Backend returns isExisting: false when no account matches the email.
      // We surface this explicitly so the user knows to check their address.
      if (data.isExisting === false) {
        setForgotEmailNotFound(true);
      } else {
        setForgotSuccess(true);
      }
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
          {/* Feature icons */}
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

          {/* Tab Navigation */}
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

              {/* 1. Email row with Verify Mail button or verified badge */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={handleSignUpEmailChange}
                    placeholder="Email"
                    required
                    disabled={emailVerified}
                    className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${emailVerified
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : 'border-blue-300'
                      }`}
                  />
                </div>

                {emailVerified ? (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-semibold whitespace-nowrap">
                    <CheckCircle className="w-4 h-4" /> Verified
                  </span>
                ) : (
                  isValidEmail(signUpEmail) && !otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading}
                      className="flex items-center gap-1 whitespace-nowrap px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {otpLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      {otpLoading ? 'Sending...' : 'Verify Mail'}
                    </button>
                  )
                )}
              </div>

              {/* Inline error (e.g. email already exists) */}
              {otpError && !otpSent && (
                <p className="text-xs text-red-600 font-medium -mt-1">{otpError}</p>
              )}

              {/* OTP Section */}
              {otpSent && !emailVerified && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
                  <p className="text-xs text-blue-700 font-medium text-center">
                    Enter the 4-digit OTP sent to your email
                  </p>

                  <div className="flex justify-center gap-3">
                    {otpValues.map((val, idx) => (
                      <input
                        key={idx}
                        ref={otpRefs[idx]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={val}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                        className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${otpError
                          ? 'border-red-400 bg-red-50 text-red-600'
                          : val
                            ? 'border-blue-500 bg-white text-blue-700'
                            : 'border-gray-300 bg-white text-gray-800'
                          }`}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className="text-center text-xs text-red-600 font-medium">{otpError}</p>
                  )}

                  <div className="text-center text-xs">
                    {otpTimer > 0 ? (
                      <span className="font-semibold text-blue-600">
                        Resend OTP in {formatTimer(otpTimer)}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={otpLoading}
                        className="font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {otpLoading ? 'Sending...' : 'Resend OTP'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Name */}
              <input
                type="text"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                placeholder="Name"
                required
                className="w-full px-4 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* 3. Mobile */}
              <input
                type="tel"
                value={signUpMobile}
                onChange={(e) => setSignUpMobile(e.target.value)}
                placeholder="Mobile Number (Optional)"
                className="w-full px-4 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* 4. Password */}
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

              {/* Sign Up button — disabled until email verified */}
              <button
                type="submit"
                disabled={loading || !emailVerified}
                title={!emailVerified ? 'Please verify your email first' : ''}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>

              {!emailVerified && (
                <p className="text-center text-xs text-amber-600">
                  ⚠ Verify your email to enable Sign Up
                </p>
              )}
            </form>
          )}

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

              {/* ── Email not found ── */}
              {forgotEmailNotFound ? (
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
                    <Mail className="w-7 h-7 text-red-500" />
                  </div>
                  <p className="font-semibold text-gray-800">No account found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    There is no Prep Plus account associated with{' '}
                    <span className="font-medium text-gray-700">{forgotEmail}</span>.
                    Please check the email address or create a new account.
                  </p>
                  <div className="flex gap-3 mt-5">
                    <button
                      type="button"
                      onClick={() => { setForgotEmailNotFound(false); setForgotEmail(''); }}
                      className="text-sm px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      Try another email
                    </button>
                    <button
                      type="button"
                      onClick={() => switchTab('signup')}
                      className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Create account
                    </button>
                  </div>
                </div>

              ) : forgotSuccess ? (
                /* ── Email sent successfully ── */
                <div className="flex flex-col items-center text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                  <p className="font-semibold text-gray-800">Check your inbox!</p>
                  <p className="text-sm text-gray-500 mt-2">
                    A password reset link has been sent to{' '}
                    <span className="font-medium text-gray-700">{forgotEmail}</span>.
                    It expires in 15 minutes.
                  </p>
                  <p className="text-xs text-gray-400 mt-3">Check your spam folder if you don't see it.</p>
                  <button
                    type="button"
                    onClick={() => { setForgotSuccess(false); setForgotEmailNotFound(false); setForgotEmail(''); setError(''); }}
                    className="mt-4 text-sm text-blue-600 hover:underline"
                  >
                    Try a different email
                  </button>
                </div>

              ) : (
                /* ── Form ── */
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => { setForgotEmail(e.target.value); setForgotEmailNotFound(false); }}
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

          {/* ─── Google / Admin ─── */}
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