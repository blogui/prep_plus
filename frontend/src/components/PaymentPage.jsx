import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Crown, CheckCircle, Zap, Award, Shield, Star,
    ArrowLeft, Loader2, PartyPopper,
} from 'lucide-react';
import api from '../services/api';

/* ── Plan features shown on the page ── */
const FEATURES = [
    { icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, text: 'Unlimited access to all premium tests' },
    { icon: <Zap className="w-5 h-5 text-blue-400" />, text: 'Detailed answer explanations after every test' },
    { icon: <Award className="w-5 h-5 text-amber-400" />, text: 'Progress tracked in your personal dashboard' },
    { icon: <Shield className="w-5 h-5 text-violet-400" />, text: 'New tests added regularly — always fresh content' },
    { icon: <Star className="w-5 h-5 text-rose-400" />, text: 'Priority support from our expert team' },
];

/* ── Payment option cards (static UI) ── */
const PLANS = [
    { id: 'monthly',   label: 'Monthly',   price: '₹ 99',  period: '/month',    tag: null },
    { id: 'quarterly', label: 'Quarterly', price: '₹ 249', period: '/3 months', tag: 'Most Popular 🔥' },
    { id: 'half-yearly',    label: 'Half-Yearly',    price: '₹ 599',  period: '/6 months',     tag: 'Save 10%' },
    { id: 'yearly',    label: 'Yearly',    price: '₹ 999', period: '/year',     tag: 'Best Value 🎉' },
];

const PaymentPage = ({ user, onUpgrade, onLogin }) => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState('yearly');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleProceed = async () => {
        if (!user) {
            // Not logged in — open the login modal so they can sign in and try again
            if (onLogin) onLogin();
            return;
        }
        setLoading(true);
        setError('');
        try {
            const data = await api.activatePremium();
            // Build the updated user object and persist it
            const updatedUser = {
                ...user,
                isPremium: true,
                ...data.data?.user,
                avatar: data.data?.user?.photoUrl || user.avatar,
                id: data.data?.user?._id || user.id,
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            onUpgrade(updatedUser);
            setSuccess(true);
            // Auto-navigate home after 2 seconds so the user can start the test
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /* ── Success screen ── */
    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 px-4">
                <div className="text-center animate-fade-in">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <PartyPopper className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white mb-3">You're Premium!</h1>
                    <p className="text-white/70 text-lg mb-2">Welcome aboard. All premium tests are now unlocked.</p>
                    <p className="text-white/40 text-sm">Redirecting you back…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 px-4 py-12">
            {/* Back button */}
            <div className="max-w-4xl mx-auto mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/30">
                        <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
                        Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Premium</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-xl mx-auto">
                        Get full access to every test, detailed solutions, and progress tracking — all in one plan.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left: Features */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                        <h2 className="text-lg font-bold text-white mb-6">What's included</h2>
                        <ul className="space-y-4">
                            {FEATURES.map((f, i) => (
                                <li key={i} className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                        {f.icon}
                                    </div>
                                    <span className="text-white/80 text-sm leading-snug">{f.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: Plan picker + CTA */}
                    <div className="flex flex-col gap-5">

                        {/* ── 2×2 plan grid (1 col mobile, 2 cols sm+) ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                            {PLANS.map(plan => (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan.id)}
                                    className={`relative w-full text-left rounded-2xl border-2 p-6 min-h-[160px]
                                        flex flex-col justify-between
                                        transition-all duration-300 cursor-pointer
                                        ${selectedPlan === plan.id
                                            ? 'border-amber-400 bg-gradient-to-br from-amber-400/15 to-orange-400/5 shadow-2xl shadow-amber-500/30 scale-[1.02]'
                                            : 'border-white/10 bg-white/5 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/10 hover:scale-[1.01]'
                                        }`}
                                >
                                    {/* Floating tag badge */}
                                    {plan.tag && (
                                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1
                                            bg-gradient-to-r from-amber-400 to-orange-400
                                            text-slate-900 text-xs font-bold rounded-full shadow-lg whitespace-nowrap tracking-wide">
                                            {plan.tag}
                                        </span>
                                    )}

                                    {/* Top row: plan label + checkmark */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`text-xs font-bold uppercase tracking-widest transition-colors
                                            ${selectedPlan === plan.id ? 'text-amber-400' : 'text-white/40'}`}>
                                            {plan.label}
                                        </span>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                            flex-shrink-0 transition-all duration-200
                                            ${selectedPlan === plan.id ? 'border-amber-400 bg-amber-400' : 'border-white/20'}`}>
                                            {selectedPlan === plan.id && (
                                                <svg className="w-3 h-3 text-slate-900" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <div className="flex items-baseline gap-1.5 mb-1.5">
                                            <span className="text-3xl font-extrabold text-white leading-none">
                                                {plan.price}
                                            </span>
                                            <span className="text-white/40 text-sm">{plan.period}</span>
                                        </div>
                                        <p className="text-white/35 text-xs">Cancel anytime</p>
                                    </div>

                                    {/* Bottom glow accent on selected */}
                                    {selectedPlan === plan.id && (
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-0.5
                                            bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Proceed button */}
                        <button
                            onClick={handleProceed}
                            disabled={loading}
                            className="w-full py-4 px-6 rounded-2xl font-bold text-slate-900 text-base
                                bg-gradient-to-r from-amber-400 to-orange-400
                                hover:from-amber-300 hover:to-orange-300
                                disabled:opacity-60 disabled:cursor-not-allowed
                                shadow-xl shadow-amber-500/30 hover:shadow-amber-400/50
                                transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
                            ) : (
                                <><Crown className="w-5 h-5" /> Proceed to Pay</>
                            )}
                        </button>

                        <p className="text-center text-white/30 text-xs">
                            🔒 Secure payment simulation — no real charges apply
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
