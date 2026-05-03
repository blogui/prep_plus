import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Mail, ArrowUp, ReceiptText } from 'lucide-react';

const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'eligibility', label: 'Refund Eligibility' },
    { id: 'non-refundable', label: 'Non-Refundable Situations' },
    { id: 'how-to-request', label: 'How to Request a Refund' },
    { id: 'cancellation', label: 'Cancellation' },
    { id: 'changes', label: 'Changes to This Policy' },
    { id: 'contact', label: 'Contact Us' },
];

const LAST_UPDATED = '22 March 2026';

const SectionCard = ({ id, title, children }) => (
    <div id={id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 scroll-mt-24">
        <div className="flex items-start gap-3 mb-5">
            <div className="w-1 self-stretch rounded-full bg-gradient-to-b from-blue-500 to-violet-500 flex-shrink-0" />
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="text-gray-600 leading-relaxed space-y-3 text-[15px]">
            {children}
        </div>
    </div>
);

const BulletList = ({ items }) => (
    <ul className="space-y-1.5 pl-1">
        {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
            </li>
        ))}
    </ul>
);

const InfoBox = ({ children, variant = 'blue' }) => {
    const colours = {
        blue: 'bg-blue-50 border-blue-100 text-blue-800',
        green: 'bg-green-50 border-green-100 text-green-800',
        yellow: 'bg-amber-50 border-amber-100 text-amber-800',
        red: 'bg-red-50 border-red-100 text-red-800',
    };
    return (
        <div className={`rounded-xl p-4 border text-sm ${colours[variant]}`}>
            {children}
        </div>
    );
};

const RefundPolicy = () => {
    const [activeSection, setActiveSection] = useState('overview');
    const [showBackToTop, setShowBackToTop] = useState(false);
    const observerRef = useRef(null);

    useEffect(() => {
        const sectionEls = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
            },
            { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
        );
        sectionEls.forEach(el => observerRef.current.observe(el));
        return () => observerRef.current?.disconnect();
    }, []);

    useEffect(() => {
        const onScroll = () => setShowBackToTop(window.scrollY > 600);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

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
                        <span className="text-gray-300">Refund Policy</span>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 flex-shrink-0 mt-1">
                            <ReceiptText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Refund Policy</h1>
                            <p className="text-gray-400 text-sm">
                                Last updated: <span className="text-gray-300 font-medium">{LAST_UPDATED}</span>
                            </p>
                            <p className="text-gray-400 mt-3 max-w-2xl leading-relaxed text-[15px]">
                                We want you to feel confident when purchasing a Prep Plus subscription. This policy
                                explains your refund rights under different situations.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Mobile chips ── */}
            <div className="lg:hidden bg-white border-b border-gray-200 sticky top-16 z-30 px-4 py-3 overflow-x-auto">
                <div className="flex gap-2 w-max">
                    {SECTIONS.map(s => (
                        <button
                            key={s.id}
                            onClick={() => scrollToSection(s.id)}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeSection === s.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Main ── */}
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex gap-8 items-start">

                    {/* Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Contents</p>
                            <nav className="space-y-0.5">
                                {SECTIONS.map((s, i) => (
                                    <button
                                        key={s.id}
                                        onClick={() => scrollToSection(s.id)}
                                        className={`w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all ${activeSection === s.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                    >
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${activeSection === s.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                                        {s.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-6">

                        <SectionCard id="overview" title="1. Overview">
                            <p>
                                Prep Plus offers free and paid ("<strong>Premium</strong>") subscription plans. When you
                                purchase a Premium subscription, you are entering into a contract with us under which we
                                will provide you with access to premium test content.
                            </p>
                            <p>
                                We want you to be satisfied with your purchase. This policy sets out the circumstances
                                in which we will issue refunds and the process for requesting one.
                            </p>
                        </SectionCard>


                        <SectionCard id="eligibility" title="2. Refund Eligibility">
                            <p>You may be eligible for a refund in the following circumstances:</p>
                            <BulletList items={[
                                'You were charged incorrectly or a duplicate charge was made to your account.',
                                'A technical fault on our platform prevented you from accessing content you paid for, and we were unable to resolve the issue within a reasonable timeframe.',
                                'You did the payment but it failed due to some technical issue from our side'
                            ]} />
                        </SectionCard>

                        <SectionCard id="non-refundable" title="3. Non-Refundable Situations">
                            <p>Refunds will <strong>not</strong> be issued in other circumstances except the ones mentioned above</p>
                        </SectionCard>

                        <SectionCard id="how-to-request" title="4. How to Request a Refund">
                            <p>To request a refund, please follow these steps:</p>
                            <div className="space-y-3">
                                {[
                                    { step: '1', title: 'Contact us by email', desc: 'Send an email to support@logicjunior.com with the subject line "Refund Request".' },
                                    { step: '2', title: 'Include your details', desc: 'Provide your full name, registered email address, date of purchase, and your order reference number (found in your confirmation email).' },
                                    { step: '3', title: 'Explain your reason', desc: 'Briefly describe why you are requesting a refund. This helps us process your request quickly.' },
                                    { step: '4', title: 'We will respond', desc: 'We aim to acknowledge your request within 2 business days and issue a decision within 5 business days.' },
                                ].map(({ step, title, desc }) => (
                                    <div key={step} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                                        <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{step}</span>
                                        <div><span className="font-semibold text-gray-800">{title}: </span><span>{desc}</span></div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100 rounded-xl p-4 flex items-center gap-2 mt-2">
                                <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <a href="mailto:support@logicjunior.com" className="text-blue-700 font-medium hover:underline text-sm">
                                    support@logicjunior.com
                                </a>
                            </div>
                        </SectionCard>


                        <SectionCard id="cancellation" title="5. Cancellation of Subscription">
                            <p>
                                If you wish to cancel your subscription to prevent future renewals, please contact us at{' '}
                                <a href="mailto:support@logicjunior.com" className="text-blue-600 hover:underline">
                                    support@logicjunior.com
                                </a>.
                            </p>
                            <BulletList items={[
                                'Cancelling your subscription stops any future billing but does not automatically trigger a refund for the current period.',
                                'You will retain access to premium content until the end of your current paid period.',
                                'After the period ends, your account will revert to the free tier automatically.',
                            ]} />
                        </SectionCard>


                        <SectionCard id="changes" title="6. Changes to This Policy">
                            <p>
                                We may update this Refund Policy from time to time. Material changes will be communicated
                                via email or a notice on our platform, indicating the updated "Last updated" date. Your
                                continued use of the Service after changes take effect constitutes your acceptance.
                            </p>
                        </SectionCard>

                        <SectionCard id="contact" title="7. Contact Us">
                            <p>For refund enquiries or any questions about this policy, please contact us:</p>
                            <div className="bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100 rounded-xl p-5 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <a href="mailto:support@logicjunior.com" className="text-blue-700 font-medium hover:underline">
                                        support@logicjunior.com
                                    </a>
                                </div>
                                <p className="text-sm text-gray-600">We aim to reply within <strong>5 business days</strong>.</p>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                You may also wish to read our{' '}
                                <Link to="/terms-of-service" className="text-blue-600 hover:underline font-medium">Terms of Service</Link>
                                {' '}and{' '}
                                <Link to="/privacy-policy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>.
                            </p>
                        </SectionCard>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-10">
                            <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                                ← Back to Home
                            </Link>
                            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Prep Plus. All rights reserved.</p>
                        </div>

                    </div>
                </div>
            </div>

            {showBackToTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/40 flex items-center justify-center hover:bg-blue-700 transition-colors"
                    aria-label="Back to top"
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

export default RefundPolicy;
