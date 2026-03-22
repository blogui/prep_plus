import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen, ChevronRight, ChevronDown, Mail, Search,
    User, CreditCard, FileQuestion, Settings, BookMarked,
    ShieldCheck, MessageCircle, ArrowUp,
} from 'lucide-react';

// ── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQ_CATEGORIES = [
    {
        id: 'getting-started',
        label: 'Getting Started',
        icon: BookOpen,
        colour: 'blue',
        faqs: [
            {
                q: 'How do I create an account?',
                a: 'Click the "Login / Sign Up" button in the top-right corner of any page. Fill in your name, email address, and choose a password. You will receive a verification email — click the link inside to activate your account.',
            },
            {
                q: 'Is Logic Junior free to use?',
                a: 'Yes! Logic Junior offers a selection of free tests that any registered user can access. Premium subscribers get unlimited access to all tests, detailed analytics, and certificates. See the Premium Plans section for pricing.',
            },
            {
                q: 'What subjects and year groups are covered?',
                a: 'We currently cover a range of subjects aligned to UK primary and secondary curricula, including Maths and English. New test series are added regularly. Browse the Tests section on the home page to see all available content.',
            },
            {
                q: 'Can I use Logic Junior on my phone or tablet?',
                a: 'Absolutely. Logic Junior is fully responsive and works on smartphones, tablets, laptops, and desktop computers. We recommend using a modern browser such as Chrome, Firefox, Safari, or Edge.',
            },
        ],
    },
    {
        id: 'account',
        label: 'Account & Profile',
        icon: User,
        colour: 'violet',
        faqs: [
            {
                q: 'How do I reset my password?',
                a: 'On the login screen, click "Forgot Password". Enter your registered email address and we will send you a password-reset link. The link expires after 30 minutes. Check your spam folder if you don\'t see the email.',
            },
            {
                q: 'How do I update my email address or name?',
                a: 'Currently, account details can be updated by contacting us at support@logicjunior.com. We are working on a self-service profile settings page which will be available soon.',
            },
            {
                q: 'How do I delete my account?',
                a: 'To request account deletion, email support@logicjunior.com with the subject "Delete Account" from your registered email address. We will process your request within 5 business days and confirm by email. Please review our Privacy Policy for details on data retention.',
            },
            {
                q: 'I\'m not receiving emails from Logic Junior. What should I do?',
                a: 'Check your spam or junk folder first. Add support@logicjunior.com to your contacts or safe senders list. If the issue persists, contact us and we will investigate.',
            },
        ],
    },
    {
        id: 'tests',
        label: 'Tests & Results',
        icon: FileQuestion,
        colour: 'green',
        faqs: [
            {
                q: 'Can I pause a test and come back to it?',
                a: 'Tests are designed to simulate exam conditions, so the timer continues to run while the test is open. We recommend completing a test in one sitting. If you close the browser, your progress may be lost.',
            },
            {
                q: 'How are my test results calculated?',
                a: 'Each question carries a fixed number of marks as specified in the test instructions. Your score is calculated based on the number of correct answers. There is no negative marking unless explicitly stated. You can view your detailed results, including correct and incorrect answers, after submission.',
            },
            {
                q: 'Where can I see my past test attempts?',
                a: 'Log in and navigate to your Dashboard. The "Test History" tab shows all your past attempts, scores, and dates. You can also see your progress over time in the Overview tab.',
            },
            {
                q: 'How do I earn a certificate?',
                a: 'Certificates are awarded upon completion of qualifying tests. Visit your Dashboard to view and download any certificates you have earned.',
            },
            {
                q: 'Why did my test submit automatically?',
                a: 'Tests have a fixed time limit. When the timer reaches zero, the test is automatically submitted with whatever answers you have provided at that point. Make sure to keep an eye on the countdown timer shown during the test.',
            },
        ],
    },
    {
        id: 'billing',
        label: 'Billing & Subscriptions',
        icon: CreditCard,
        colour: 'amber',
        faqs: [
            {
                q: 'What payment methods are accepted?',
                a: 'We accept all major debit and credit cards (Visa, Mastercard, American Express) processed securely via Razorpay. We do not store your card details on our servers.',
            },
            {
                q: 'How do I upgrade to Premium?',
                a: 'Click "Premium Plans" in the navigation or footer, choose your plan, and complete the checkout. Your account will be upgraded instantly once payment is confirmed.',
            },
            {
                q: 'Can I get a refund?',
                a: 'Yes, in certain circumstances. If you haven\'t accessed any premium content within 14 days of purchase, you are entitled to a full refund under the Consumer Contracts Regulations 2013. See our Refund Policy for full details.',
            },
            {
                q: 'Will I be charged automatically on renewal?',
                a: 'Subscription renewals depend on the plan you select. You will always be notified in advance of any renewal charge. To prevent a renewal, contact us at support@logicjunior.com before the renewal date.',
            },
            {
                q: 'I was charged but my account is not upgraded. What do I do?',
                a: 'This is rare but can happen if there is a network delay after payment. Please wait a few minutes and refresh your page. If the issue persists, email us at support@logicjunior.com with your payment confirmation and we will resolve it promptly.',
            },
        ],
    },
    {
        id: 'privacy',
        label: 'Privacy & Safety',
        icon: ShieldCheck,
        colour: 'rose',
        faqs: [
            {
                q: 'Is my personal data safe?',
                a: 'Yes. We take data security very seriously. All data is transmitted over HTTPS, passwords are hashed, and we follow UK GDPR and the Data Protection Act 2018. See our Privacy Policy for full details.',
            },
            {
                q: 'Does Logic Junior use my data for advertising?',
                a: 'No. We do not sell your personal data or use it for targeted advertising. Your data is used solely to provide and improve our educational services.',
            },
            {
                q: 'My child uses Logic Junior. What protections are in place?',
                a: 'We comply with the ICO\'s Children\'s Code (Age Appropriate Design Code). Privacy settings are high by default for child users, and we do not engage in behavioural monitoring or profiling of under-13s. Parental consent is required for users under 13.',
            },
        ],
    },
    {
        id: 'technical',
        label: 'Technical Issues',
        icon: Settings,
        colour: 'slate',
        faqs: [
            {
                q: 'The website isn\'t loading properly. What should I try?',
                a: 'First, try refreshing the page (Ctrl+R or Cmd+R). Then clear your browser cache and cookies, and try again. Make sure your browser is up to date. If the issue continues, try a different browser or device and contact us if the problem persists.',
            },
            {
                q: 'A test question or answer seems incorrect. How do I report it?',
                a: 'We take content accuracy seriously. Please email support@logicjunior.com with the subject "Content Issue", the name of the test, the question number, and a description of the problem. Our team will review and correct it promptly.',
            },
            {
                q: 'I found a bug. How do I report it?',
                a: 'Please email support@logicjunior.com with "Bug Report" in the subject line. Include a description of what happened, what you expected to happen, the steps to reproduce it, and your browser/device. Screenshots are very helpful.',
            },
        ],
    },
];

const COLOUR_MAP = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-700' },
    slate: { bg: 'bg-slate-50', icon: 'text-slate-600', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700' },
};

// ── Accordion item ────────────────────────────────────────────────────────────
const AccordionItem = ({ question, answer, colour }) => {
    const [open, setOpen] = useState(false);
    const c = COLOUR_MAP[colour];
    return (
        <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${open ? `${c.border} shadow-sm` : 'border-gray-200'}`}>
            <button
                onClick={() => setOpen(o => !o)}
                className={`w-full text-left px-5 py-4 flex items-center justify-between gap-3 transition-colors ${open ? c.bg : 'bg-white hover:bg-gray-50'}`}
            >
                <span className="text-sm font-semibold text-gray-800 leading-snug pr-2">{question}</span>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${c.icon} ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className={`px-5 pb-5 pt-1 text-sm text-gray-600 leading-relaxed bg-white border-t ${c.border}`}>
                    {answer}
                </div>
            )}
        </div>
    );
};

// ── Category card (used for quick-nav) ───────────────────────────────────────
const CategoryPill = ({ cat, active, onClick }) => {
    const c = COLOUR_MAP[cat.colour];
    const Icon = cat.icon;
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${active ? `${c.bg} ${c.border} ${c.icon}` : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
            <Icon className="w-4 h-4" />
            {cat.label}
            <span className={`ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full ${active ? c.badge : 'bg-gray-100 text-gray-500'}`}>
                {cat.faqs.length}
            </span>
        </button>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const HelpCenter = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);

    // Flatten + filter FAQs for search results
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        const results = [];
        FAQ_CATEGORIES.forEach(cat => {
            cat.faqs.forEach(faq => {
                if (faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q)) {
                    results.push({ ...faq, catLabel: cat.label, colour: cat.colour });
                }
            });
        });
        return results;
    }, [searchQuery]);

    const isSearching = searchQuery.trim().length > 0;

    const visibleCategories = activeCategory
        ? FAQ_CATEGORIES.filter(c => c.id === activeCategory)
        : FAQ_CATEGORIES;

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Hero ── */}
            <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white pt-10 pb-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Breadcrumb */}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-8">
                        <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" /> Logic Junior
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                        <span className="text-gray-300">Help Centre</span>
                    </div>

                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 mx-auto mb-5">
                        <BookMarked className="w-7 h-7 text-white" />
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Help Centre</h1>
                    <p className="text-gray-400 leading-relaxed max-w-xl mx-auto mb-8">
                        Find answers to the most common questions, or get in touch with our support team.
                    </p>

                    {/* Search bar */}
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search for help…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15 transition-all text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-10">

                {/* ── Search results ── */}
                {isSearching ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 mb-6">
                            {searchResults.length > 0
                                ? `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`
                                : `No results found for "${searchQuery}"`}
                        </p>
                        {searchResults.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                                <Search className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-2 font-medium">No articles found</p>
                                <p className="text-sm text-gray-400">Try different keywords, or contact us below.</p>
                            </div>
                        ) : (
                            searchResults.map((item, i) => (
                                <div key={i} className={`bg-white rounded-xl border ${COLOUR_MAP[item.colour].border} shadow-sm overflow-hidden`}>
                                    <div className={`px-5 py-2 text-xs font-semibold flex items-center gap-1.5 ${COLOUR_MAP[item.colour].bg} ${COLOUR_MAP[item.colour].icon}`}>
                                        <ChevronRight className="w-3.5 h-3.5" /> {item.catLabel}
                                    </div>
                                    <div className="px-5 py-4">
                                        <p className="text-sm font-semibold text-gray-800 mb-1.5">{item.q}</p>
                                        <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <>
                        {/* ── Category filter pills ── */}
                        <div className="mb-8">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Browse by topic</p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setActiveCategory(null)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${!activeCategory
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/30'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    All Topics
                                </button>
                                {FAQ_CATEGORIES.map(cat => (
                                    <CategoryPill
                                        key={cat.id}
                                        cat={cat}
                                        active={activeCategory === cat.id}
                                        onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* ── FAQ sections ── */}
                        <div className="space-y-10">
                            {visibleCategories.map(cat => {
                                const Icon = cat.icon;
                                const c = COLOUR_MAP[cat.colour];
                                return (
                                    <section key={cat.id} id={cat.id}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                                                <Icon className={`w-5 h-5 ${c.icon}`} />
                                            </div>
                                            <h2 className="text-lg font-bold text-gray-900">{cat.label}</h2>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
                                                {cat.faqs.length} articles
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {cat.faqs.map((faq, i) => (
                                                <AccordionItem key={i} question={faq.q} answer={faq.a} colour={cat.colour} />
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* ── Contact CTA ── */}
                <div className="mt-14 rounded-2xl bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white p-8 sm:p-10">
                    <div className="max-w-lg mx-auto text-center">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 mx-auto mb-4">
                            <MessageCircle className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Still need help?</h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            Our support team is here for you. We aim to reply to all enquiries within
                            2 business days.
                        </p>
                        <a
                            href="mailto:support@logicjunior.com"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 transition-all"
                        >
                            <Mail className="w-4 h-4" />
                            support@logicjunior.com
                        </a>
                        <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-gray-400">
                            <Link to="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
                            <span>·</span>
                            <Link to="/terms-of-service" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
                            <span>·</span>
                            <Link to="/refund-policy" className="hover:text-blue-400 transition-colors">Refund Policy</Link>
                        </div>
                    </div>
                </div>

                {/* Bottom nav */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 pb-6">
                    <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                        ← Back to Home
                    </Link>
                    <p className="text-xs text-gray-400">© {new Date().getFullYear()} Logic Junior. All rights reserved.</p>
                </div>

            </div>

            {/* ── Back to top ── */}
            <ScrollToTopButton />
        </div>
    );
};

const ScrollToTopButton = () => {
    const [show, setShow] = useState(false);
    React.useEffect(() => {
        const onScroll = () => setShow(window.scrollY > 600);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    if (!show) return null;
    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/40 flex items-center justify-center hover:bg-blue-700 transition-colors"
            aria-label="Back to top"
        >
            <ArrowUp className="w-5 h-5" />
        </button>
    );
};

export default HelpCenter;
