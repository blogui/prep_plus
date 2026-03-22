import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, ArrowUp, Cookie } from 'lucide-react';

const SECTIONS = [
    { id: 'what-are-cookies', label: 'What Are Cookies?' },
    { id: 'how-we-use', label: 'How We Use Cookies' },
    { id: 'types', label: 'Types of Cookies We Use' },
    { id: 'third-party', label: 'Third-Party Cookies' },
    { id: 'your-choices', label: 'Your Cookie Choices' },
    { id: 'browser-settings', label: 'Browser Settings' },
    { id: 'updates', label: 'Updates to This Policy' },
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

const CookieTable = ({ rows }) => (
    <div className="overflow-x-auto mt-2">
        <table className="w-full text-sm border-collapse">
            <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-2.5 px-3 text-gray-700 font-semibold rounded-tl-lg">Cookie Name / Type</th>
                    <th className="text-left py-2.5 px-3 text-gray-700 font-semibold">Purpose</th>
                    <th className="text-left py-2.5 px-3 text-gray-700 font-semibold">Duration</th>
                    <th className="text-left py-2.5 px-3 text-gray-700 font-semibold rounded-tr-lg">Required?</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-gray-700 align-top">{row.name}</td>
                        <td className="py-2.5 px-3 text-gray-600 align-top">{row.purpose}</td>
                        <td className="py-2.5 px-3 text-gray-600 align-top whitespace-nowrap">{row.duration}</td>
                        <td className="py-2.5 px-3 align-top">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${row.required
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                {row.required ? 'Essential' : 'Optional'}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const CookiePolicy = () => {
    const [activeSection, setActiveSection] = useState('what-are-cookies');
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
                            <BookOpen className="w-4 h-4" /> Logic Junior
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                        <span className="text-gray-300">Cookie Policy</span>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 flex-shrink-0 mt-1">
                            <Cookie className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Cookie Policy</h1>
                            <p className="text-gray-400 text-sm">
                                Last updated: <span className="text-gray-300 font-medium">{LAST_UPDATED}</span>
                            </p>
                            <p className="text-gray-400 mt-3 max-w-2xl leading-relaxed text-[15px]">
                                This Cookie Policy explains how Logic Junior uses cookies and similar technologies
                                in accordance with the <strong className="text-gray-300">UK GDPR</strong>, the{' '}
                                <strong className="text-gray-300">Privacy and Electronic Communications Regulations
                                    (PECR)</strong>, and the guidance of the{' '}
                                <strong className="text-gray-300">Information Commissioner's Office (ICO)</strong>.
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
                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeSection === s.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                }`}
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

                        <SectionCard id="what-are-cookies" title="1. What Are Cookies?">
                            <p>
                                Cookies are small text files placed on your device (computer, tablet, or mobile) when
                                you visit a website. They are widely used to make websites work more efficiently, improve
                                user experience, and provide information to website operators.
                            </p>
                            <p>
                                Cookies can be <strong>first-party</strong> (set directly by Logic Junior) or{' '}
                                <strong>third-party</strong> (set by a service we use, such as an analytics provider).
                                They can also be <strong>session cookies</strong> (deleted when you close your browser)
                                or <strong>persistent cookies</strong> (remain on your device for a set period).
                            </p>
                        </SectionCard>

                        <SectionCard id="how-we-use" title="2. How We Use Cookies">
                            <p>Logic Junior uses cookies to:</p>
                            <BulletList items={[
                                'Keep you securely logged in during your session.',
                                'Remember your preferences and settings.',
                                'Understand how users navigate and use the platform (analytics).',
                                'Detect and prevent fraud and security issues.',
                                'Improve the reliability and performance of our service.',
                            ]} />
                            <p>
                                We do <strong>not</strong> use cookies for targeted advertising or to track you across
                                third-party websites. We do <strong>not</strong> sell cookie data to any third party.
                            </p>
                        </SectionCard>

                        <SectionCard id="types" title="3. Types of Cookies We Use">
                            <p className="font-semibold text-gray-800">3.1 Strictly Necessary (Essential)</p>
                            <p>
                                These cookies are essential to operate the platform and cannot be disabled. They are
                                set in response to your actions (e.g. logging in, completing a test). No consent is
                                required for these cookies under PECR.
                            </p>
                            <CookieTable rows={[
                                { name: 'auth_token', purpose: 'Keeps you authenticated during your session. Deleted on logout or browser close.', duration: 'Session', required: true },
                                { name: 'csrf_token', purpose: 'Protects against Cross-Site Request Forgery attacks.', duration: 'Session', required: true },
                                { name: 'session_id', purpose: 'Manages your active session on the server.', duration: 'Session', required: true },
                            ]} />

                            <p className="font-semibold text-gray-800 pt-2">3.2 Analytics & Performance</p>
                            <p>
                                These cookies help us understand how visitors interact with the platform. All data is
                                aggregated and anonymised where possible. <strong>Your consent is required</strong> before
                                these are set.
                            </p>
                            <CookieTable rows={[
                                { name: 'Analytics platform', purpose: 'Tracks page views, session duration, and feature usage to help us improve the platform.', duration: 'Up to 24 months', required: false },
                                { name: 'Error tracking', purpose: 'Captures JavaScript errors and performance data to help us fix bugs.', duration: 'Up to 12 months', required: false },
                            ]} />

                            <p className="font-semibold text-gray-800 pt-2">3.3 Preference Cookies</p>
                            <p>
                                These cookies remember your settings and preferences to personalise your experience.
                                <strong> Your consent is required</strong> before these are set.
                            </p>
                            <CookieTable rows={[
                                { name: 'ui_preferences', purpose: 'Remembers display settings such as theme or layout preferences.', duration: '12 months', required: false },
                            ]} />
                        </SectionCard>

                        <SectionCard id="third-party" title="4. Third-Party Cookies">
                            <p>
                                We use a small number of trusted third-party services that may set their own cookies
                                when you use our platform. We only use services that comply with UK GDPR and PECR.
                            </p>
                            <CookieTable rows={[
                                { name: 'Razorpay', purpose: 'Required to process payments securely. Only active on payment pages.', duration: 'Session', required: true },
                                { name: 'Analytics provider', purpose: 'Aggregated platform usage analytics. Active only with your consent.', duration: 'Up to 24 months', required: false },
                            ]} />
                            <p className="text-sm text-gray-500">
                                Third-party cookies are governed by the privacy policies of the respective providers.
                                We encourage you to review those policies directly.
                            </p>
                        </SectionCard>

                        <SectionCard id="your-choices" title="5. Your Cookie Choices">
                            <p>
                                Under PECR, we are required to obtain your consent before setting any non-essential
                                cookies. You can manage your cookie preferences at any time:
                            </p>
                            <BulletList items={[
                                'Via the cookie consent banner displayed when you first visit the platform.',
                                'By adjusting your browser settings (see Section 6 below).',
                                'By contacting us at support@logicjunior.com to withdraw consent.',
                            ]} />
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                                <strong>Please note:</strong> Disabling strictly necessary cookies will affect core
                                platform functionality, including your ability to log in and complete tests.
                            </div>
                        </SectionCard>

                        <SectionCard id="browser-settings" title="6. Managing Cookies via Browser Settings">
                            <p>
                                Most browsers allow you to control cookies through their settings. Below are links to
                                cookie management instructions for the most common browsers:
                            </p>
                            <div className="grid sm:grid-cols-2 gap-3 mt-2">
                                {[
                                    { name: 'Google Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                                    { name: 'Mozilla Firefox', url: 'https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer' },
                                    { name: 'Safari', url: 'https://support.apple.com/en-gb/guide/safari/sfri11471/mac' },
                                    { name: 'Microsoft Edge', url: 'https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d' },
                                ].map(({ name, url }) => (
                                    <a
                                        key={name}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl text-sm text-gray-700 hover:text-blue-700 transition-all"
                                    >
                                        <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                        {name} — Cookie Settings
                                    </a>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                You can also opt out of analytics cookies across many websites using the{' '}
                                <a href="https://youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    Your Online Choices
                                </a>{' '}
                                tool provided by the European Interactive Digital Advertising Alliance (EDAA).
                            </p>
                        </SectionCard>

                        <SectionCard id="updates" title="7. Updates to This Cookie Policy">
                            <p>
                                We may update this Cookie Policy from time to time to reflect changes in the cookies we
                                use or relevant regulations. The "Last updated" date at the top of this page will always
                                show when the policy was last revised. Material changes will also be communicated via a
                                notice on the platform or by email.
                            </p>
                        </SectionCard>

                        <SectionCard id="contact" title="8. Contact Us">
                            <p>
                                If you have any questions about our use of cookies or this policy, please contact us:
                            </p>
                            <div className="bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100 rounded-xl p-5 space-y-2">
                                <p className="text-sm font-semibold text-gray-800">Logic Junior — Data Protection Contact</p>
                                <a href="mailto:support@logicjunior.com" className="flex items-center gap-1.5 text-sm text-blue-700 font-medium hover:underline">
                                    support@logicjunior.com
                                </a>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                You may also visit the{' '}
                                <a href="https://ico.org.uk/your-data-matters/online/cookies/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    ICO's guidance on cookies
                                </a>
                                {' '}or review our{' '}
                                <Link to="/privacy-policy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>
                                {' '}for more information on how we handle your personal data.
                            </p>
                        </SectionCard>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-10">
                            <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                                ← Back to Home
                            </Link>
                            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Logic Junior. All rights reserved.</p>
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

export default CookiePolicy;
