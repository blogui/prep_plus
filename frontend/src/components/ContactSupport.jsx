import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    BookOpen, ChevronRight, HeadphonesIcon, Send, CheckCircle,
    Lock, Phone, Mail, AlertCircle, Loader2,
} from 'lucide-react';
import api from '../services/api';

// ── Shared input class (matches ReportBug.jsx convention) ────────────────────
const inputCls =
    'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 ' +
    'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ' +
    'focus:border-transparent transition-all bg-white';

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, required, hint, children }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
        {children}
    </div>
);

// ── Inline Login Prompt (shown when user is not authenticated) ────────────────
const LoginPrompt = ({ onLogin }) => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white pt-10 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                    <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" /> Prep Plus
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-gray-300">Contact Support</span>
                </div>
                <div className="flex items-start gap-4 max-w-2xl">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 flex-shrink-0 mt-1">
                        <HeadphonesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Contact Support</h1>
                        <p className="text-gray-400 text-[15px] leading-relaxed">
                            Our support team is here to help you. Send us a message and we'll get back to you.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Locked state */}
        <div className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full text-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-100 mx-auto mb-6">
                    <Lock className="w-9 h-9 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Log In to Contact Support</h2>
                <p className="text-gray-500 mb-2 leading-relaxed">
                    You need to be logged in to send a support message.
                </p>
                <p className="text-gray-400 text-sm mb-8">
                    This helps us identify your account and respond more effectively.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Back to Home
                    </Link>
                    <button
                        id="contact-support-login-btn"
                        onClick={onLogin}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold hover:from-blue-500 hover:to-violet-500 transition-all shadow-md shadow-blue-500/30"
                    >
                        Log In
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ── Success state ─────────────────────────────────────────────────────────────
const SuccessCard = ({ email, onReset }) => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white pt-10 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" /> Prep Plus
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-gray-300">Contact Support</span>
                </div>
            </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Message Sent!</h2>
                <p className="text-gray-500 mb-2 leading-relaxed">
                    Your support request has been received. Our team will get back to you at{' '}
                    <span className="text-blue-600 font-medium">{email}</span>.
                </p>
                <p className="text-gray-400 text-sm mb-8">
                    Typical response time is 1–2 business days.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={onReset}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Send another message
                    </button>
                    <Link
                        to="/"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold hover:from-blue-500 hover:to-violet-500 transition-all"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const ContactSupport = ({ user, onLogin }) => {
    const [form, setForm] = useState({ contact: '', message: '' });
    const [errors, setErrors] = useState({});
    // status: 'idle' | 'loading' | 'success' | 'error'
    const [status, setStatus] = useState('idle');
    const [apiError, setApiError] = useState('');

    // Derive email from the prop (pre-filled, read-only)
    const userEmail = user?.email || '';

    const set = (key, val) => {
        setForm(f => ({ ...f, [key]: val }));
        if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
    };

    // ── Client-side validation ─────────────────────────────────────────────
    const validate = () => {
        const e = {};
        if (form.contact && !/^[\+]?[\d\s\-\(\)]{7,20}$/.test(form.contact)) {
            e.contact = 'Invalid contact number format.';
        }
        if (!form.message.trim()) {
            e.message = 'Message is required.';
        } else if (form.message.trim().length < 5) {
            e.message = 'Message must be at least 5 characters long.';
        }
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setStatus('loading');
        setApiError('');

        try {
            await api.contactSupport({
                contact: form.contact.trim() || undefined,
                message: form.message.trim(),
            });
            setStatus('success');
        } catch (err) {
            setStatus('error');
            setApiError(err.message || 'Something went wrong. Please try again.');
        }
    };

    const handleReset = () => {
        setForm({ contact: '', message: '' });
        setErrors({});
        setStatus('idle');
        setApiError('');
    };

    // ── Render: not logged in ──────────────────────────────────────────────
    if (!user) {
        return <LoginPrompt onLogin={onLogin} />;
    }

    // ── Render: success ────────────────────────────────────────────────────
    if (status === 'success') {
        return <SuccessCard email={userEmail} onReset={handleReset} />;
    }

    // ── Render: form ───────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Hero ── */}
            <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white pt-10 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                        <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" /> Prep Plus
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                        <span className="text-gray-300">Contact Support</span>
                    </div>

                    <div className="flex items-start gap-4 max-w-2xl">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 flex-shrink-0 mt-1">
                            <HeadphonesIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Contact Support</h1>
                            <p className="text-gray-400 text-[15px] leading-relaxed">
                                Have a question or issue? Fill in the form below and our team will
                                get back to you as soon as possible.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex gap-8 items-start">

                    {/* ── Sidebar ── */}
                    <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24 space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <p className="text-sm font-bold text-gray-800 mb-3">Before you write…</p>
                            <ul className="space-y-2.5 text-sm text-gray-600">
                                {[
                                    { icon: Mail, text: 'Include your registered email (pre-filled)' },
                                    { icon: Phone, text: 'Adding a contact number speeds up our response' },
                                    { icon: HeadphonesIcon, text: 'Be as specific as possible about your issue' },
                                ].map(({ icon: Icon, text }, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <Icon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <span>{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800">
                            <p className="font-semibold mb-1">Response time</p>
                            <p className="text-blue-700">
                                Our team typically responds within <strong>1–2 business days</strong>.
                            </p>
                        </div>
                    </aside>

                    {/* ── Form ── */}
                    <div className="flex-1 min-w-0">
                        <form onSubmit={handleSubmit} noValidate className="space-y-6">

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
                                    <h2 className="text-base font-bold text-gray-900">Your Details</h2>
                                </div>

                                {/* Email — read-only */}
                                <Field label="Email Address" required hint="This is your registered email — it cannot be changed here.">
                                    <div className="relative">
                                        <input
                                            id="contact-support-email"
                                            type="email"
                                            value={userEmail}
                                            readOnly
                                            className={`${inputCls} pr-10 bg-gray-50 text-gray-500 cursor-not-allowed`}
                                        />
                                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                                    </div>
                                </Field>

                                {/* Contact number — optional */}
                                <Field label="Contact Number" hint="Optional — helps us reach you faster if needed.">
                                    <input
                                        id="contact-support-phone"
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={form.contact}
                                        onChange={e => set('contact', e.target.value)}
                                        className={`${inputCls} ${errors.contact ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                                    />
                                    {errors.contact && (
                                        <p className="text-xs text-red-500 mt-1">{errors.contact}</p>
                                    )}
                                </Field>
                            </div>

                            {/* Message */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
                                    <h2 className="text-base font-bold text-gray-900">Your Message</h2>
                                </div>

                                <Field label="Message" required hint="Describe your issue or question in detail (minimum 5 characters).">
                                    <textarea
                                        id="contact-support-message"
                                        rows={6}
                                        placeholder="e.g. I'm unable to access the premium test after payment…"
                                        value={form.message}
                                        onChange={e => set('message', e.target.value)}
                                        className={`${inputCls} resize-none ${errors.message ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                                    />
                                    {errors.message && (
                                        <p className="text-xs text-red-500 mt-1">{errors.message}</p>
                                    )}
                                </Field>
                            </div>

                            {/* API error banner */}
                            {status === 'error' && apiError && (
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{apiError}</span>
                                </div>
                            )}

                            {/* Submit */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-10">
                                <p className="text-xs text-gray-400">
                                    Fields marked <span className="text-red-500 font-semibold">*</span> are required.
                                </p>
                                <button
                                    id="contact-support-submit-btn"
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm shadow-md shadow-blue-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Sending…
                                        </>
                                    ) : (
                                        <><Send className="w-4 h-4" /> Send Message</>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactSupport;
