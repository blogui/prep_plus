import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Mail, ExternalLink, FileText, ArrowUp } from 'lucide-react';

// ── Section data ──────────────────────────────────────────────────────────────
const SECTIONS = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'account', label: 'Your Account' },
    { id: 'services', label: 'Our Services' },
    { id: 'subscriptions', label: 'Subscriptions & Payments' },
    { id: 'acceptable-use', label: 'Acceptable Use' },
    { id: 'ip', label: 'Intellectual Property' },
    { id: 'user-content', label: 'User Content' },
    { id: 'third-party', label: 'Third-Party Links' },
    { id: 'disclaimer', label: 'Disclaimers' },
    { id: 'liability', label: 'Limitation of Liability' },
    { id: 'indemnification', label: 'Indemnification' },
    { id: 'termination', label: 'Termination' },
    { id: 'changes', label: 'Changes to Terms' },
];

const LAST_UPDATED = '22 March 2026';

// ── Reusable components ───────────────────────────────────────────────────────
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
        yellow: 'bg-amber-50 border-amber-100 text-amber-800',
        red: 'bg-red-50 border-red-100 text-red-800',
    };
    return (
        <div className={`rounded-xl p-4 border text-sm ${colours[variant]}`}>
            {children}
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const TermsOfService = () => {
    const [activeSection, setActiveSection] = useState('introduction');
    const [showBackToTop, setShowBackToTop] = useState(false);
    const observerRef = useRef(null);

    useEffect(() => {
        const sectionEls = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
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

    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Hero ── */}
            <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white pt-10 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                        <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            Prep Plus
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                        <span className="text-gray-300">Terms of Service</span>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 flex-shrink-0 mt-1">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                                Terms of Service
                            </h1>
                            <p className="text-gray-400 text-sm">
                                Last updated: <span className="text-gray-300 font-medium">{LAST_UPDATED}</span>
                            </p>
                            <p className="text-gray-400 mt-3 max-w-2xl leading-relaxed text-[15px]">
                                Please read these Terms of Service carefully before using Prep Plus. By accessing or
                                using our platform, you agree to be bound by these terms.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Mobile ToC chips ── */}
            <div className="lg:hidden bg-white border-b border-gray-200 sticky top-16 z-30 px-4 py-3 overflow-x-auto">
                <div className="flex gap-2 w-max">
                    {SECTIONS.map(s => (
                        <button
                            key={s.id}
                            onClick={() => scrollToSection(s.id)}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeSection === s.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex gap-8 items-start">

                    {/* ── Desktop sidebar ToC ── */}
                    <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Contents</p>
                            <nav className="space-y-0.5">
                                {SECTIONS.map((s, i) => (
                                    <button
                                        key={s.id}
                                        onClick={() => scrollToSection(s.id)}
                                        className={`w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all ${activeSection === s.id
                                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${activeSection === s.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                                            }`}>{i + 1}</span>
                                        {s.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* ── Sections ── */}
                    <div className="flex-1 min-w-0 space-y-6">

                        {/* 1 — Introduction */}
                        <SectionCard id="introduction" title="1. Introduction">
                            <p>
                                Welcome to Prep Plus ("<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>").
                                These Terms of Service ("<strong>Terms</strong>") govern your access to and use of the Prep Plus
                                website and online test-preparation platform (the "<strong>Service</strong>").
                            </p>
                            <p>
                                By creating an account or otherwise accessing the Service, you confirm that you have read,
                                understood, and agree to be bound by these Terms and our{' '}
                                <Link to="/privacy-policy" className="text-blue-600 hover:underline font-medium">
                                    Privacy Policy
                                </Link>
                                . If you do not agree, you must not use the Service.
                            </p>
                            <InfoBox variant="blue">
                                <strong>Plain English summary:</strong> These are the rules for using Prep Plus.
                                Using the platform means you accept them. If anything is unclear, contact us.
                            </InfoBox>
                        </SectionCard>

                        {/* 2 — Eligibility */}
                        <SectionCard id="eligibility" title="2. Eligibility">
                            <p>To use the Service you must:</p>
                            <BulletList items={[
                                'Be at least 13 years old. Users under 13 require verifiable parental or guardian consent.',
                                'Be capable of entering into a binding legal agreement under English law, or have a parent/guardian do so on your behalf.',
                                'Not be prohibited from using the Service under any applicable law or regulation.',
                                'Provide accurate and truthful information when registering.',
                            ]} />
                            <p>
                                By using the Service, you represent and warrant that you meet all eligibility requirements.
                                We reserve the right to suspend or terminate accounts that do not meet these requirements.
                            </p>
                        </SectionCard>

                        {/* 3 — Account */}
                        <SectionCard id="account" title="3. Your Account">
                            <p>
                                When you register, you are responsible for:
                            </p>
                            <BulletList items={[
                                'Maintaining the confidentiality of your account credentials.',
                                'All activity that occurs under your account.',
                                'Notifying us immediately at support@prepplus.online if you suspect any unauthorised use.',
                                'Keeping your account information accurate and up to date.',
                            ]} />
                            <p>
                                You may not share your account with or transfer it to any other person. We reserve the
                                right to suspend or terminate accounts that violate these Terms.
                            </p>
                        </SectionCard>

                        {/* 4 — Services */}
                        <SectionCard id="services" title="4. Our Services">
                            <p>
                                Prep Plus provides an online test-preparation platform that includes:
                            </p>
                            <BulletList items={[
                                'Free and premium timed practice tests aligned to UK curricula.',
                                'Progress tracking, performance analytics, and test history.',
                                'Study materials, syllabi, and learning resources (where available).',
                            ]} />
                            <p>
                                We reserve the right to modify, suspend, or discontinue any part of the Service at any
                                time with reasonable notice where practical. We will not be liable to you for any
                                modification, suspension, or discontinuation of the Service.
                            </p>
                            <InfoBox variant="yellow">
                                <strong>Please note:</strong> Prep Plus is a revision and practice tool. Results on our
                                platform are not a guarantee of performance in any official examination or assessment.
                            </InfoBox>
                        </SectionCard>

                        {/* 5 — Subscriptions & Payments */}
                        <SectionCard id="subscriptions" title="5. Subscriptions & Payments">
                            <p>
                                Certain features of the Service require a paid subscription ("<strong>Premium Plan</strong>").
                            </p>
                            <BulletList items={[
                                'Payments are processed securely. We do not store your payment card details.',
                                'Your subscription begins immediately upon successful payment.',
                                'Subscriptions are non-transferable and apply to a single user account only.',
                                'We may change subscription pricing with at least 30 days\' prior notice.',
                            ]} />
                            <p>
                                By completing a purchase, you authorise us to charge the applicable fees to your chosen
                                payment method.
                            </p>
                        </SectionCard>

                        {/* 6 — Acceptable Use */}
                        <SectionCard id="acceptable-use" title="6. Acceptable Use">
                            <p>You agree <strong>not</strong> to use the Service to:</p>
                            <BulletList items={[
                                'Violate any applicable law or regulation, including UK law.',
                                'Attempt to gain unauthorised access to the platform, other accounts, or our infrastructure.',
                                'Share, resell, or redistribute premium content, test questions, or answers.',
                                'Use automated tools (bots, scrapers, crawlers) to extract content from the platform.',
                                'Upload or transmit any malware, viruses, or other harmful code.',
                                'Impersonate any person or misrepresent your affiliation with any entity.',
                                'Engage in cheating, collusion, or any conduct that undermines the integrity of test results.',
                                'Harass, bully, or harm any other user.',
                            ]} />
                            <p>
                                Breach of this section may result in immediate termination of your account without refund,
                                and may be reported to law enforcement where appropriate.
                            </p>
                        </SectionCard>

                        {/* 7 — IP */}
                        <SectionCard id="ip" title="7. Intellectual Property">
                            <p>
                                All content on the Service — including test questions, explanations, study materials,
                                graphics, logos, and software — is the exclusive property of Prep Plus or its licensors
                                and is protected by UK and international copyright, trademark, and other intellectual
                                property laws.
                            </p>
                            <p>
                                We grant you a limited, non-exclusive, non-transferable, revocable licence to access and
                                use the Service solely for your personal, non-commercial educational purposes.
                            </p>
                            <InfoBox variant="red">
                                <strong>You may not</strong> copy, reproduce, distribute, modify, create derivative works
                                from, publicly display, or exploit any part of the Service or its content without our
                                prior written consent.
                            </InfoBox>
                        </SectionCard>

                        {/* 8 — User Content */}
                        <SectionCard id="user-content" title="8. User Content">
                            <p>
                                If you submit any content to the Service (e.g. feedback, bug reports, or feature
                                suggestions), you grant Prep Plus a worldwide, royalty-free, perpetual licence to use,
                                reproduce, and display that content in connection with operating and improving the Service.
                            </p>
                            <p>
                                You represent that you own or have the necessary rights to submit any content you provide,
                                and that such content does not violate the rights of any third party.
                            </p>
                        </SectionCard>

                        {/* 9 — Third-Party */}
                        <SectionCard id="third-party" title="9. Third-Party Links & Services">
                            <p>
                                The Service may contain links to third-party websites or integrate with third-party
                                services (e.g. payment processors, analytics providers). These links are provided for your
                                convenience only.
                            </p>
                            <p>
                                We do not endorse, control, or accept responsibility for any third-party content, privacy
                                practices, or services. Your use of any linked third-party service is at your own risk and
                                is governed by that service's own terms and privacy policy.
                            </p>
                        </SectionCard>

                        {/* 10 — Disclaimers */}
                        <SectionCard id="disclaimer" title="10. Disclaimers">
                            <p>
                                The Service is provided on an "<strong>as is</strong>" and "<strong>as available</strong>"
                                basis. To the fullest extent permitted by applicable law, we disclaim all warranties,
                                express or implied, including but not limited to:
                            </p>
                            <BulletList items={[
                                'Fitness for a particular purpose (e.g. guaranteed exam success).',
                                'Uninterrupted, error-free, or secure access to the Service.',
                                'Accuracy or completeness of any content, test questions, or results.',
                            ]} />
                            <p>
                                Nothing in these Terms limits our liability for death or personal injury caused by our
                                negligence, or for fraudulent misrepresentation, or any other liability that cannot be
                                excluded under English law.
                            </p>
                        </SectionCard>

                        {/* 11 — Liability */}
                        <SectionCard id="liability" title="11. Limitation of Liability">
                            <p>
                                To the fullest extent permitted by English law, Prep Plus shall not be liable for:
                            </p>
                            <BulletList items={[
                                'Any indirect, incidental, special, or consequential loss or damage.',
                                'Loss of data, revenue, profits, or business opportunity.',
                                'Any loss arising from your use of or inability to use the Service.',
                                'Any errors, interruptions, or defects in the Service.',
                            ]} />
                            <InfoBox variant="blue">
                                Nothing in these Terms excludes or limits our liability where it would be unlawful to do so.
                                Your statutory rights as a consumer under English law remain unaffected.
                            </InfoBox>
                        </SectionCard>

                        {/* 12 — Indemnification */}
                        <SectionCard id="indemnification" title="12. Indemnification">
                            <p>
                                You agree to indemnify and hold harmless Prep Plus, its officers, employees, and agents
                                from and against any claims, damages, losses, liabilities, and expenses (including
                                reasonable legal fees) arising out of or relating to:
                            </p>
                            <BulletList items={[
                                'Your breach of these Terms.',
                                'Your use or misuse of the Service.',
                                'Your violation of any applicable law or the rights of any third party.',
                            ]} />
                        </SectionCard>

                        {/* 13 — Termination */}
                        <SectionCard id="termination" title="13. Termination">
                            <p>
                                <strong>By you:</strong> You may close your account at any time by contacting us at{' '}
                                <a href="mailto:support@prepplus.online" className="text-blue-600 hover:underline">
                                    support@prepplus.online
                                </a>. Closing your account does not automatically entitle you to a refund.
                            </p>
                            <p>
                                <strong>By us:</strong> We may suspend or terminate your access to the Service immediately
                                and without notice if:
                            </p>
                            <BulletList items={[
                                'You breach any provision of these Terms.',
                                'We are required to do so by law or a regulatory authority.',
                                'We reasonably believe your account has been used fraudulently or in a way that causes harm.',
                                'We decide to discontinue the Service (in which case we will give reasonable advance notice).',
                            ]} />
                            <p>
                                Upon termination, your right to use the Service ceases immediately. Sections covering
                                intellectual property, disclaimers, liability, and governing law survive termination.
                            </p>
                        </SectionCard>

                        {/* 14 — Changes */}
                        <SectionCard id="changes" title="14. Changes to These Terms">
                            <p>
                                We may revise these Terms from time to time. When we make material changes, we will:
                            </p>
                            <BulletList items={[
                                'Update the "Last updated" date at the top of this page.',
                                'Send a notification to the email address registered on your account.',
                                'Display a prominent notice on the platform.',
                            ]} />
                            <p>
                                Your continued use of the Service after the effective date of the revised Terms constitutes
                                your acceptance of the changes. If you do not agree to the updated Terms, you must stop
                                using the Service and may close your account.
                            </p>
                        </SectionCard>


                        {/* Bottom nav */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-10">
                            <Link
                                to="/"
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                            >
                                ← Back to Home
                            </Link>
                            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Prep Plus. All rights reserved.</p>
                        </div>

                    </div>{/* end sections */}
                </div>
            </div>

            {/* ── Back to top ── */}
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

export default TermsOfService;
