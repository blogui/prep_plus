import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen, ChevronRight, Bug, Send, CheckCircle,
    AlertTriangle, Cpu, Monitor, Globe, Smartphone, Mail,
} from 'lucide-react';

const BUG_CATEGORIES = [
    { value: 'test-issue', label: 'Test / Question Issue', desc: 'Wrong answer, broken question, timer problem' },
    { value: 'login-account', label: 'Login / Account', desc: 'Can\'t log in, password reset, account lock' },
    { value: 'payment-billing', label: 'Payment / Billing', desc: 'Charge error, subscription not activating' },
    { value: 'display-layout', label: 'Display / Layout', desc: 'Page looks broken, overlapping elements' },
    { value: 'performance', label: 'Performance', desc: 'Slow loading, freezing, crashing' },
    { value: 'other', label: 'Other', desc: 'Anything else' },
];

const SEVERITY_LEVELS = [
    { value: 'critical', label: 'Critical', desc: 'Platform unusable', colour: 'red' },
    { value: 'high', label: 'High', desc: 'Major feature broken', colour: 'orange' },
    { value: 'medium', label: 'Medium', desc: 'Feature works partially', colour: 'amber' },
    { value: 'low', label: 'Low', desc: 'Minor visual issue', colour: 'green' },
];

const BROWSER_OPTIONS = ['Google Chrome', 'Mozilla Firefox', 'Safari', 'Microsoft Edge', 'Opera', 'Other'];
const DEVICE_OPTIONS = ['Desktop / Laptop', 'Tablet', 'Mobile Phone'];

const SEVERITY_COLOUR = {
    red: { ring: 'ring-red-400', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-500' },
    orange: { ring: 'ring-orange-400', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-500' },
    amber: { ring: 'ring-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'text-amber-500' },
    green: { ring: 'ring-green-400', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-500' },
};

const EMPTY_FORM = {
    name: '', email: '', category: '', severity: '',
    browser: '', device: '', steps: '', expected: '', actual: '', extra: '',
};

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

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white';

// ── Main component ────────────────────────────────────────────────────────────
const ReportBug = () => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const set = (key, val) => {
        setForm(f => ({ ...f, [key]: val }));
        if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Please enter your name.';
        if (!form.email.trim()) e.email = 'Please enter your email address.';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email address.';
        if (!form.category) e.category = 'Please select a bug category.';
        if (!form.severity) e.severity = 'Please select a severity level.';
        if (!form.steps.trim()) e.steps = 'Please describe the steps to reproduce the bug.';
        if (!form.actual.trim()) e.actual = 'Please describe what actually happened.';
        return e;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setSubmitting(true);
        // Simulate a network call (replace with real API when backend endpoint is ready)
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
        }, 1200);
    };

    // ── Success state ──
    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white pt-10 pb-12 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4" /> Prep Plus
                            </Link>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                            <span className="text-gray-300">Report a Bug</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="max-w-md w-full text-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto mb-5">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Report Submitted!</h2>
                        <p className="text-gray-500 mb-2 leading-relaxed">
                            Thank you, <strong className="text-gray-700">{form.name}</strong>. We've received your bug
                            report and will investigate it promptly.
                        </p>
                        <p className="text-gray-500 text-sm mb-8">
                            A confirmation and any follow-up will be sent to{' '}
                            <span className="text-blue-600 font-medium">{form.email}</span>.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => { setForm(EMPTY_FORM); setSubmitted(false); }}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Submit another report
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
    }

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
                        <Link to="/help-center" className="hover:text-blue-400 transition-colors">Help Centre</Link>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                        <span className="text-gray-300">Report a Bug</span>
                    </div>

                    <div className="flex items-start gap-4 max-w-2xl">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 flex-shrink-0 mt-1">
                            <Bug className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Report a Bug</h1>
                            <p className="text-gray-400 text-[15px] leading-relaxed">
                                Found something that doesn't look right? Fill in the form below and our team will
                                investigate. The more detail you provide, the faster we can fix it.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex gap-8 items-start">

                    {/* ── Tips sidebar ── */}
                    <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24 space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <p className="text-sm font-bold text-gray-800 mb-3">Tips for a great report</p>
                            <ul className="space-y-2.5 text-sm text-gray-600">
                                {[
                                    { icon: AlertTriangle, text: 'Be specific about what went wrong' },
                                    { icon: Cpu, text: 'Include your browser and device type' },
                                    { icon: Monitor, text: 'List every step needed to reproduce the bug' },
                                    { icon: Globe, text: 'Add the page URL where the bug occurred' },
                                    { icon: Smartphone, text: 'Screenshots are extremely helpful' },
                                ].map(({ icon: Icon, text }, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <Icon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <span>{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800">
                            <p className="font-semibold mb-1">Urgent issue?</p>
                            <p className="text-blue-700 mb-2">For critical problems like payment failures, email us directly:</p>
                            <a href="mailto:support@logicjunior.com" className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5" /> support@logicjunior.com
                            </a>
                        </div>
                    </aside>

                    {/* ── Form ── */}
                    <div className="flex-1 min-w-0">
                        <form onSubmit={handleSubmit} noValidate className="space-y-6">

                            {/* Section: About You */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
                                    <h2 className="text-base font-bold text-gray-900">About You</h2>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-5">
                                    <Field label="Full Name" required>
                                        <input
                                            type="text"
                                            placeholder="Jane Smith"
                                            value={form.name}
                                            onChange={e => set('name', e.target.value)}
                                            className={`${inputCls} ${errors.name ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                                        />
                                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                    </Field>

                                    <Field label="Email Address" required>
                                        <input
                                            type="email"
                                            placeholder="jane@example.com"
                                            value={form.email}
                                            onChange={e => set('email', e.target.value)}
                                            className={`${inputCls} ${errors.email ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                                        />
                                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                    </Field>
                                </div>
                            </div>

                            {/* Section: Bug Details */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
                                    <h2 className="text-base font-bold text-gray-900">Bug Details</h2>
                                </div>

                                {/* Category */}
                                <Field label="Bug Category" required>
                                    <div className="grid sm:grid-cols-2 gap-3 mt-1">
                                        {BUG_CATEGORIES.map(cat => (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => set('category', cat.value)}
                                                className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${form.category === cat.value
                                                        ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-400'
                                                        : 'border-gray-200 bg-white hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className="font-semibold text-gray-800 block">{cat.label}</span>
                                                <span className="text-gray-500 text-xs">{cat.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                                </Field>

                                {/* Severity */}
                                <Field label="Severity" required>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
                                        {SEVERITY_LEVELS.map(s => {
                                            const c = SEVERITY_COLOUR[s.colour];
                                            const active = form.severity === s.value;
                                            return (
                                                <button
                                                    key={s.value}
                                                    type="button"
                                                    onClick={() => set('severity', s.value)}
                                                    className={`text-center px-3 py-3 rounded-xl border text-sm transition-all ${active ? `${c.bg} border-transparent ring-2 ${c.ring}` : 'border-gray-200 bg-white hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className={`font-bold block ${active ? c.text : 'text-gray-700'}`}>{s.label}</span>
                                                    <span className="text-gray-500 text-xs">{s.desc}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.severity && <p className="text-xs text-red-500 mt-1">{errors.severity}</p>}
                                </Field>

                                {/* Browser & Device */}
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <Field label="Browser" hint="Which browser were you using?">
                                        <select
                                            value={form.browser}
                                            onChange={e => set('browser', e.target.value)}
                                            className={inputCls}
                                        >
                                            <option value="">Select browser (optional)</option>
                                            {BROWSER_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </Field>

                                    <Field label="Device Type">
                                        <select
                                            value={form.device}
                                            onChange={e => set('device', e.target.value)}
                                            className={inputCls}
                                        >
                                            <option value="">Select device (optional)</option>
                                            {DEVICE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </Field>
                                </div>
                            </div>

                            {/* Section: Reproduction */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
                                    <h2 className="text-base font-bold text-gray-900">How to Reproduce</h2>
                                </div>

                                <Field
                                    label="Steps to Reproduce"
                                    required
                                    hint="Number each step. E.g. 1. Go to Tests page   2. Click 'Start Test'   3. Answer Q1…"
                                >
                                    <textarea
                                        rows={5}
                                        placeholder={`1. Go to...\n2. Click on...\n3. See error...`}
                                        value={form.steps}
                                        onChange={e => set('steps', e.target.value)}
                                        className={`${inputCls} resize-none ${errors.steps ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                                    />
                                    {errors.steps && <p className="text-xs text-red-500 mt-1">{errors.steps}</p>}
                                </Field>

                                <Field label="Expected Behaviour" hint="What should have happened?">
                                    <textarea
                                        rows={3}
                                        placeholder="I expected the page to load the test results…"
                                        value={form.expected}
                                        onChange={e => set('expected', e.target.value)}
                                        className={`${inputCls} resize-none`}
                                    />
                                </Field>

                                <Field label="Actual Behaviour" required hint="What actually happened instead?">
                                    <textarea
                                        rows={3}
                                        placeholder="Instead, the page showed a blank screen…"
                                        value={form.actual}
                                        onChange={e => set('actual', e.target.value)}
                                        className={`${inputCls} resize-none ${errors.actual ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                                    />
                                    {errors.actual && <p className="text-xs text-red-500 mt-1">{errors.actual}</p>}
                                </Field>

                                <Field label="Additional Information" hint="Page URL, error messages, or anything else that might help (optional)">
                                    <textarea
                                        rows={3}
                                        placeholder="e.g. https://logicjunior.com/test/abc — error message: 'Cannot read property of undefined'"
                                        value={form.extra}
                                        onChange={e => set('extra', e.target.value)}
                                        className={`${inputCls} resize-none`}
                                    />
                                </Field>
                            </div>

                            {/* Submit */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-10">
                                <p className="text-xs text-gray-400">
                                    Fields marked <span className="text-red-500 font-semibold">*</span> are required.
                                    Your report will be reviewed by our support team.
                                </p>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm shadow-md shadow-blue-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="60 20" />
                                            </svg>
                                            Submitting…
                                        </>
                                    ) : (
                                        <><Send className="w-4 h-4" /> Submit Bug Report</>
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

export default ReportBug;
