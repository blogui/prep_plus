import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import api from '../services/api';

// ─── Password Strength Helper ────────────────────────────────────────────────
const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const map = {
        0: { label: '', color: '' },
        1: { label: 'Very Weak', color: '#ef4444' },
        2: { label: 'Weak', color: '#f97316' },
        3: { label: 'Fair', color: '#eab308' },
        4: { label: 'Strong', color: '#22c55e' },
        5: { label: 'Very Strong', color: '#16a34a' },
    };
    return { score, ...map[score] };
};

// ─── Component ────────────────────────────────────────────────────────────────
const ResetPassword = () => {
    const navigate = useNavigate();

    // Read token & email from URL query params
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState('');

    const strength = getPasswordStrength(newPassword);

    // Guard: missing token / email
    const isInvalidLink = !token || !email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setValidationError('');

        if (newPassword.length < 6) {
            setValidationError('Password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setValidationError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await api.resetPassword(token, email, newPassword, confirmPassword);
            setSuccess(true);
            // Auto-redirect to home (login) after 3 seconds
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setError(err.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Invalid link ────────────────────────────────────────────────────────────
    if (isInvalidLink) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-red-600 p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-white mx-auto mb-3" />
                        <h2 className="text-2xl font-bold text-white">Invalid Reset Link</h2>
                    </div>
                    <div className="p-8 text-center">
                        <p className="text-gray-600 mb-6">
                            This password reset link is invalid or has expired. Please request a new one.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Success ─────────────────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-green-600 p-8 text-center">
                        <CheckCircle className="h-12 w-12 text-white mx-auto mb-3" />
                        <h2 className="text-2xl font-bold text-white">Password Reset!</h2>
                    </div>
                    <div className="p-8 text-center">
                        <p className="text-gray-600 mb-2">Your password has been reset successfully.</p>
                        <p className="text-sm text-gray-400 mb-6">Redirecting you to login in a moment…</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Sign In Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Reset Form ──────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 p-8 text-center">
                    <BookOpen className="h-12 w-12 text-white mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-white">Prep Plus</h2>
                    <p className="text-blue-100 mt-2">Set a new password</p>
                </div>

                <div className="p-8">
                    <div className="flex items-center mb-6">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <Lock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Create New Password</h3>
                            <p className="text-xs text-gray-500 truncate max-w-xs">for {decodeURIComponent(email)}</p>
                        </div>
                    </div>

                    {/* Error banners */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {validationError && (
                        <div className="mb-4 p-3 bg-orange-50 text-orange-600 text-sm rounded-lg border border-orange-200">
                            {validationError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <div className="relative">
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {/* Password strength bar */}
                            {newPassword && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                className="h-1 flex-1 rounded-full transition-all duration-300"
                                                style={{
                                                    backgroundColor: i <= strength.score ? strength.color : '#e5e7eb',
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs" style={{ color: strength.color || '#9ca3af' }}>
                                        {strength.label}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-10 ${confirmPassword && confirmPassword !== newPassword
                                            ? 'border-red-400 bg-red-50'
                                            : confirmPassword && confirmPassword === newPassword
                                                ? 'border-green-400 bg-green-50'
                                                : 'border-gray-300'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {confirmPassword && confirmPassword !== newPassword && (
                                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                            )}
                            {confirmPassword && confirmPassword === newPassword && (
                                <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Resetting Password…
                                </span>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        This link is valid for 15 minutes.{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="text-blue-600 hover:underline"
                        >
                            Request a new one
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
