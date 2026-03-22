import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen, ChevronRight, Mail, Phone, MapPin,
    Send, CheckCircle, MessageSquare, Clock, HelpCircle,
} from 'lucide-react';

const ENQUIRY_TYPES = [
    { value: 'general', label: 'General Enquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing / Payment' },
    { value: 'content', label: 'Content / Test Issue' },
    { value: 'partnerships', label: 'Partnerships' },
    { value: 'other', label: 'Other' },
];

const EMPTY_FORM = { name: '', email: '', subject: '', enquiryType: '', message: '' };

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white';

const Field = ({ label, required, children }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {children}
    </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const ContactUs = () => {
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
        if (!form.enquiryType) e.enquiryType = 'Please select an enquiry type.';
        if (!form.message.trim()) e.message = 'Please enter your message.';
        return e;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSubmitting(true);
        // Simulated submission — replace with real API call when ready
        setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 1200);
    };

    // ── Success state ──
    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white pt-10 pb-12 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4" /> Logic Junior
                            </Link>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                            <span className="text-gray-300">Contact Us</span>
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
                            Thank you, <strong className="text-gray-700">{form.name}</strong>. We've received your
                            message and will get back to you within 2 business days.
                        </p>
                        <p className="text-gray-500 text-sm mb-8">
                            A confirmation will be sent to{' '}
                            <span className="text-blue-600 font-medium">{form.email}</span>.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => { setForm(EMPTY_FORM); setSubmitted(false); }}
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
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Hero ── */}
            <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white pt-10 pb-14 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                        <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" /> Logic Junior
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                        <span className="text-gray-300">Contact Us</span>
                    </div>

                    <div className="flex items-start gap-4 max-w-2xl">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 flex-shrink-0 mt-1">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Contact Us</h1>
                            <p className="text-gray-400 text-[15px] leading-relaxed">
                                Have a question, feedback, or need help? We'd love to hear from you. Fill in the form
                                and we'll get back to you within <strong className="text-gray-300">2 business days</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* ── Left: Contact Info ── */}
                    <aside className="w-full lg:w-72 flex-shrink-0 space-y-4">

                        {/* Contact cards */}
                        {[
                            {
                                icon: Mail,
                                colour: 'blue',
                                title: 'Email Us',
                                value: 'support@logicjunior.com',
                                sub: 'For all general enquiries',
                                href: 'mailto:support@logicjunior.com',
                            },
                            {
                                icon: Phone,
                                colour: 'violet',
                                title: 'Phone',
                                value: '+91 98765 43210',
                                sub: 'Mon–Fri, 9 am – 6 pm IST',
                                href: 'tel:+919876543210',
                            },
                            {
                                icon: Clock,
                                colour: 'green',
                                title: 'Response Time',
                                value: 'Within 2 business days',
                                sub: 'We aim to reply sooner',
                                href: null,
                            },
                            // {
                            //     icon: MapPin,
                            //     colour: 'amber',
                            //     title: 'Based in',
                            //     value: 'United Kingdom 🇬🇧',
                            //     sub: 'Serving students across the UK',
                            //     href: null,
                            // },
                        ].map(({ icon: Icon, colour, title, value, sub, href }) => {
                            const colourMap = {
                                blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
                                violet: { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-100' },
                                green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100' },
                                amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
                            };
                            const c = colourMap[colour];
                            return (
                                <div key={title} className={`bg-white rounded-2xl border ${c.border} shadow-sm p-5`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`w-4 h-4 ${c.icon}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{title}</p>
                                            {href ? (
                                                <a href={href} className={`text-sm font-semibold ${c.icon} hover:underline break-all`}>{value}</a>
                                            ) : (
                                                <p className="text-sm font-semibold text-gray-800">{value}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Quick links */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Links</p>
                            <div className="space-y-1.5">
                                {[
                                    { label: 'Help Centre', to: '/help-center' },
                                    { label: 'Refund Policy', to: '/refund-policy' },
                                    { label: 'Privacy Policy', to: '/privacy-policy' },
                                ].map(({ label, to }) => (
                                    <Link
                                        key={to}
                                        to={to}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors py-0.5"
                                    >
                                        <HelpCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* ── Right: Form ── */}
                    <div className="flex-1 min-w-0">
                        <form onSubmit={handleSubmit} noValidate className="space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">

                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
                                    <h2 className="text-base font-bold text-gray-900">Send Us a Message</h2>
                                </div>

                                {/* Name + Email */}
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

                                {/* Enquiry type + Subject */}
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <Field label="Enquiry Type" required>
                                        <select
                                            value={form.enquiryType}
                                            onChange={e => set('enquiryType', e.target.value)}
                                            className={`${inputCls} ${errors.enquiryType ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                                        >
                                            <option value="">Select a type…</option>
                                            {ENQUIRY_TYPES.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                        {errors.enquiryType && <p className="text-xs text-red-500 mt-1">{errors.enquiryType}</p>}
                                    </Field>

                                    <Field label="Subject">
                                        <input
                                            type="text"
                                            placeholder="Brief summary of your enquiry"
                                            value={form.subject}
                                            onChange={e => set('subject', e.target.value)}
                                            className={inputCls}
                                        />
                                    </Field>
                                </div>

                                {/* Message */}
                                <Field label="Message" required>
                                    <textarea
                                        rows={6}
                                        placeholder="Please describe your enquiry in as much detail as possible…"
                                        value={form.message}
                                        onChange={e => set('message', e.target.value)}
                                        className={`${inputCls} resize-none ${errors.message ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                                    />
                                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                                    <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length} characters</p>
                                </Field>

                                {/* Privacy note */}
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    By submitting this form you agree to our{' '}
                                    <Link to="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</Link>.
                                    We will only use your information to respond to your enquiry.
                                </p>

                                {/* Submit */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                                    <p className="text-xs text-gray-400">
                                        Fields marked <span className="text-red-500 font-semibold">*</span> are required.
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
                                                Sending…
                                            </>
                                        ) : (
                                            <><Send className="w-4 h-4" /> Send Message</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Bottom nav */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-10">
                            <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                                ← Back to Home
                            </Link>
                            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Logic Junior. All rights reserved.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ContactUs;
