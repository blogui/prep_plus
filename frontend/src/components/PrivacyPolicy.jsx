import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Mail, ExternalLink, ShieldCheck, ArrowUp } from 'lucide-react';

// ── Section data ──────────────────────────────────────────────────────────────
const SECTIONS = [
    { id: 'introduction', label: 'Introduction & Who We Are' },
    { id: 'data-collected', label: 'Data We Collect' },
    { id: 'how-collected', label: 'How We Collect Data' },
    { id: 'how-used', label: 'How We Use Your Data' },
    { id: 'lawful-basis', label: 'Lawful Basis for Processing' },
    { id: 'marketing', label: 'Marketing Communications' },
    { id: 'sharing', label: 'Sharing & Disclosure' },
    { id: 'international', label: 'International Transfers' },
    { id: 'security', label: 'Data Security' },
    { id: 'retention', label: 'Data Retention' },
    { id: 'your-rights', label: 'Your Rights (UK GDPR)' },
    { id: 'children', label: "Children's Data" },
    { id: 'cookies', label: 'Cookies & Tracking' },
    { id: 'changes', label: 'Changes to This Policy' },
    { id: 'contact', label: 'Contact Us & ICO' },
];

const LAST_UPDATED = '22 March 2026';

// ── Small reusable components ─────────────────────────────────────────────────
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

const TableRow = ({ label, value }) => (
    <tr className="border-b border-gray-100 last:border-0">
        <td className="py-2.5 pr-6 font-medium text-gray-700 whitespace-nowrap align-top">{label}</td>
        <td className="py-2.5 text-gray-600">{value}</td>
    </tr>
);

// ── Main component ────────────────────────────────────────────────────────────
const PrivacyPolicy = () => {
    const [activeSection, setActiveSection] = useState('introduction');
    const [showBackToTop, setShowBackToTop] = useState(false);
    const observerRef = useRef(null);

    // Highlight active ToC item as user scrolls
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

    // Back-to-top button visibility
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
                        <span className="text-gray-300">Privacy Policy</span>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 flex-shrink-0 mt-1">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                                Privacy Policy
                            </h1>
                            <p className="text-gray-400 text-sm">
                                Last updated: <span className="text-gray-300 font-medium">{LAST_UPDATED}</span>
                            </p>
                            <p className="text-gray-400 mt-3 max-w-2xl leading-relaxed text-[15px]">
                                At Prep Plus, we are committed to protecting your personal data and respecting your
                                privacy in accordance with the <strong className="text-gray-300">UK General Data Protection
                                    Regulation (UK GDPR)</strong> and the <strong className="text-gray-300">Data Protection
                                        Act 2018</strong>.
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
                        <SectionCard id="introduction" title="1. Introduction & Who We Are">
                            <p>
                                Prep Plus ("<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>") is the
                                Data Controller for the personal data collected through this platform. We operate an
                                online test-preparation and study platform for students in the United Kingdom.
                            </p>
                            <p>
                                This Privacy Policy explains what personal data we collect, why we collect it, how we use
                                it, and the rights you have over it. It applies to all users of our website and services.
                            </p>
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <p className="text-blue-800 text-sm font-medium mb-1">Data Controller</p>
                                <p className="text-blue-700 text-sm">Prep Plus &mdash; support@logicjunior.com</p>
                            </div>
                            <p className="text-sm text-gray-500">
                                If you have any questions about this policy or how we handle your data, please contact us
                                at <a href="mailto:support@logicjunior.com" className="text-blue-600 hover:underline">support@logicjunior.com</a> before
                                contacting the ICO.
                            </p>
                        </SectionCard>

                        {/* 2 — Data We Collect */}
                        <SectionCard id="data-collected" title="2. Data We Collect About You">
                            <p>We may collect the following categories of personal data:</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm mt-2">
                                    <tbody>
                                        <TableRow label="Identity Data" value="First name, last name, username or similar identifier." />
                                        <TableRow label="Contact Data" value="Email address, phone number." />
                                        <TableRow label="Account Data" value="Password (stored as a hashed value), account preferences." />
                                        <TableRow label="Educational Data" value="Test scores, answers, attempt history, progress, certificates earned." />
                                        <TableRow label="Payment Data" value="Billing details processed via Razorpay. We do not store full card details on our servers." />
                                        <TableRow label="Technical Data" value="IP address, browser type and version, time zone, operating system." />
                                        <TableRow label="Usage Data" value="Pages visited, features used, time spent, clicks." />
                                        <TableRow label="Marketing Data" value="Your communication preferences." />
                                    </tbody>
                                </table>
                            </div>
                            <p>We do not collect any special category data (e.g. health, biometric, or racial origin data).</p>
                        </SectionCard>

                        {/* 3 — How Collected */}
                        <SectionCard id="how-collected" title="3. How We Collect Your Data">
                            <BulletList items={[
                                'Direct interactions — when you register, fill in forms, or contact us.',
                                'Automated technologies — cookies, server logs, and analytics tools as you interact with our platform.',
                                'Third-party payment processors — Razorpay provides us with transaction confirmation data.',
                                'Third-party authentication services — if you log in via Google or similar providers.',
                            ]} />
                        </SectionCard>

                        {/* 4 — How Used */}
                        <SectionCard id="how-used" title="4. How We Use Your Data">
                            <p>We use your personal data for the following purposes:</p>
                            <BulletList items={[
                                'To register your account and provide access to the platform.',
                                'To deliver and personalise your test-preparation experience.',
                                'To track your progress and generate performance reports and certificates.',
                                'To process payments and manage your subscription.',
                                'To send service-related communications (account confirmations, password resets).',
                                'To send marketing communications, where you have opted in.',
                                'To improve our platform through aggregated usage analytics.',
                                'To comply with legal obligations and protect our legal rights.',
                                'To detect and prevent fraud, abuse, and security incidents.',
                            ]} />
                        </SectionCard>

                        {/* 5 — Lawful Basis */}
                        <SectionCard id="lawful-basis" title="5. Lawful Basis for Processing (UK GDPR Article 6)">
                            <p>
                                Under UK GDPR, we must have a lawful basis for each processing activity. The bases we
                                rely on are set out below:
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm mt-2">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-2 pr-4 text-gray-700 font-semibold">Purpose</th>
                                            <th className="text-left py-2 text-gray-700 font-semibold">Lawful Basis</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <TableRow label="Account registration & platform delivery" value="Performance of a contract (Art. 6(1)(b))" />
                                        <TableRow label="Payment processing" value="Performance of a contract (Art. 6(1)(b))" />
                                        <TableRow label="Marketing emails" value="Consent (Art. 6(1)(a))" />
                                        <TableRow label="Platform analytics & improvement" value="Legitimate interests (Art. 6(1)(f)) — improving user experience" />
                                        <TableRow label="Fraud prevention & security" value="Legitimate interests (Art. 6(1)(f)) — protecting our users and business" />
                                        <TableRow label="Legal compliance" value="Legal obligation (Art. 6(1)(c))" />
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-sm text-gray-500">
                                Where we rely on legitimate interests, we have carried out a balancing test to confirm
                                that our interests are not overridden by your rights and freedoms.
                            </p>
                        </SectionCard>

                        {/* 6 — Marketing */}
                        <SectionCard id="marketing" title="6. Marketing Communications">
                            <p>
                                We will only send you marketing emails if you have explicitly opted in at the point of
                                registration or via your account settings. We will never share your data with third parties
                                for their own marketing purposes.
                            </p>
                            <p>
                                You can withdraw your consent and opt out of marketing at any time by:
                            </p>
                            <BulletList items={[
                                'Clicking the "Unsubscribe" link in any marketing email.',
                                'Updating your communication preferences in your account settings.',
                                'Emailing us at support@logicjunior.com.',
                            ]} />
                            <p>
                                Opting out of marketing will not affect service-related messages (e.g. account or
                                payment confirmations).
                            </p>
                        </SectionCard>

                        {/* 7 — Sharing */}
                        <SectionCard id="sharing" title="7. Sharing & Disclosure of Your Data">
                            <p>We do not sell or rent your personal data. We may share it with:</p>
                            <BulletList items={[
                                'Payment processors (Razorpay) — to handle secure payment transactions.',
                                'Cloud hosting providers — to store data securely on our servers.',
                                'Analytics providers — to understand platform usage (data is aggregated/anonymised where possible).',
                                'Email service providers — to send account and marketing communications.',
                                'Law enforcement or regulatory authorities — where required by law or court order.',
                                'Professional advisors — solicitors, accountants, and auditors under strict confidentiality obligations.',
                            ]} />
                            <p>
                                All third-party processors are required to process data only on our documented instructions
                                and maintain appropriate security measures.
                            </p>
                        </SectionCard>

                        {/* 8 — International Transfers */}
                        <SectionCard id="international" title="8. International Transfers">
                            <p>
                                Some of our service providers may transfer or process your data outside the UK. Where this
                                occurs, we ensure an equivalent level of protection by relying on one or more of the
                                following safeguards:
                            </p>
                            <BulletList items={[
                                'UK adequacy regulations — transfers to countries deemed adequate by the UK Secretary of State.',
                                'Standard Contractual Clauses (SCCs) — approved UK International Data Transfer Agreements (IDTAs) or addenda.',
                                'Binding corporate rules or other approved transfer mechanisms.',
                            ]} />
                            <p>
                                You can obtain further details of the specific safeguards in place by contacting us
                                at <a href="mailto:support@logicjunior.com" className="text-blue-600 hover:underline">support@logicjunior.com</a>.
                            </p>
                        </SectionCard>

                        {/* 9 — Security */}
                        <SectionCard id="security" title="9. Data Security">
                            <p>
                                We have implemented appropriate technical and organisational measures to protect your
                                personal data against unauthorised access, accidental loss, alteration, or disclosure.
                                These include:
                            </p>
                            <BulletList items={[
                                'HTTPS / TLS encryption for all data in transit.',
                                'Passwords stored using industry-standard hashing (bcrypt).',
                                'Role-based access controls — only authorised personnel can access personal data.',
                                'Regular security reviews and monitoring.',
                                'Payment card data handled entirely by Razorpay under PCI-DSS compliance.',
                            ]} />
                            <p>
                                In the event of a personal data breach that is likely to result in a risk to your rights
                                and freedoms, we will notify the ICO within 72 hours and, where required, inform affected
                                individuals without undue delay.
                            </p>
                        </SectionCard>

                        {/* 10 — Retention */}
                        <SectionCard id="retention" title="10. Data Retention">
                            <p>
                                We retain personal data only for as long as necessary to fulfil the purposes for which it
                                was collected, including for legal, accounting, or reporting obligations.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm mt-2">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-2 pr-4 text-gray-700 font-semibold">Data Type</th>
                                            <th className="text-left py-2 text-gray-700 font-semibold">Retention Period</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <TableRow label="Account & profile data" value="Duration of account + 2 years after deletion request" />
                                        <TableRow label="Educational performance data" value="Duration of account" />
                                        <TableRow label="Payment & transaction records" value="7 years (legal / tax obligation)" />
                                        <TableRow label="Server & security logs" value="Up to 12 months" />
                                        <TableRow label="Marketing consent records" value="Until consent is withdrawn + 1 year" />
                                    </tbody>
                                </table>
                            </div>
                            <p>
                                When data is no longer required, we securely delete or anonymise it. You may request
                                deletion earlier by exercising your right to erasure (see Section 11).
                            </p>
                        </SectionCard>

                        {/* 11 — Rights */}
                        <SectionCard id="your-rights" title="11. Your Rights Under UK GDPR">
                            <p>
                                Under UK GDPR and the Data Protection Act 2018, you have the following rights regarding
                                your personal data:
                            </p>
                            <div className="space-y-2">
                                {[
                                    { right: 'Right to Access', desc: 'Request a copy of the personal data we hold about you (Subject Access Request).' },
                                    { right: 'Right to Rectification', desc: 'Request correction of inaccurate or incomplete data.' },
                                    { right: 'Right to Erasure', desc: 'Request deletion of your data where there is no compelling reason for its continued processing.' },
                                    { right: 'Right to Restriction', desc: 'Request that we limit how we use your data in certain circumstances.' },
                                    { right: 'Right to Data Portability', desc: 'Receive your data in a structured, machine-readable format and transfer it to another controller.' },
                                    { right: 'Right to Object', desc: 'Object to processing based on legitimate interests, including for direct marketing.' },
                                    { right: 'Right to Withdraw Consent', desc: 'Where processing is based on consent, you may withdraw it at any time without affecting prior lawfulness.' },
                                    { right: 'Rights re Automated Decisions', desc: 'Not to be subject to solely automated decision-making that produces significant effects, without human review.' },
                                ].map(({ right, desc }) => (
                                    <div key={right} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                                        <span className="inline-block mt-0.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                        <div><span className="font-semibold text-gray-800">{right}: </span><span>{desc}</span></div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500">
                                To exercise any of these rights, please email{' '}
                                <a href="mailto:support@logicjunior.com" className="text-blue-600 hover:underline">support@logicjunior.com</a>.
                                We will respond within <strong>one calendar month</strong>. There is no fee for most requests; however,
                                we may charge a reasonable fee if a request is clearly unfounded or excessive.
                            </p>
                        </SectionCard>

                        {/* 12 — Children */}
                        <SectionCard id="children" title="12. Children's Data (ICO Children's Code)">
                            <p>
                                Prep Plus is a platform designed to serve students including those under the age of 18.
                                We comply with the <strong>ICO's Children's Code (Age Appropriate Design Code)</strong> and
                                apply the following standards:
                            </p>
                            <BulletList items={[
                                'Privacy settings for accounts likely used by children are set to high by default.',
                                'We do not use children\'s data for behavioural advertising or profiling.',
                                'We collect only the minimum data necessary for a child to use the platform.',
                                'We do not collect geolocation data from children.',
                                'We do not use nudge techniques to encourage children to weaken their privacy settings.',
                                'For users under 13, we require verifiable parental or guardian consent before account creation.',
                                'Parents or guardians may contact us to access, correct, or delete their child\'s data.',
                            ]} />
                            <p>
                                If you believe a child under 13 has provided us with personal data without appropriate
                                parental consent, please contact us immediately at{' '}
                                <a href="mailto:support@logicjunior.com" className="text-blue-600 hover:underline">support@logicjunior.com</a> and
                                we will take steps to delete that information.
                            </p>
                        </SectionCard>

                        {/* 13 — Cookies */}
                        <SectionCard id="cookies" title="13. Cookies & Tracking Technologies">
                            <p>
                                We use cookies and similar tracking technologies to operate and improve our platform.
                                Cookies are small files stored on your browser.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm mt-2">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-2 pr-4 text-gray-700 font-semibold">Cookie Type</th>
                                            <th className="text-left py-2 text-gray-700 font-semibold">Purpose</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <TableRow label="Strictly Necessary" value="Authentication session cookies — required for login and secure access. Cannot be disabled." />
                                        <TableRow label="Analytics" value="Understand how users interact with the platform (e.g. pages visited, errors). Consent required." />
                                        <TableRow label="Preference" value="Remember your settings and preferences. Consent required." />
                                    </tbody>
                                </table>
                            </div>
                            <p>
                                You can control cookies through your browser settings or our cookie banner. Disabling
                                strictly necessary cookies will affect core platform functionality.
                            </p>
                        </SectionCard>

                        {/* 14 — Changes */}
                        <SectionCard id="changes" title="14. Changes to This Policy">
                            <p>
                                We may update this Privacy Policy from time to time to reflect changes in our practices,
                                technology, legal requirements, or other factors.
                            </p>
                            <p>
                                When we make material changes, we will notify you by email (to the address on your account)
                                or by posting a prominent notice on the platform, indicating the revised "Last updated" date
                                at the top of this page.
                            </p>
                            <p>
                                We encourage you to review this policy periodically. Your continued use of the platform
                                after we post changes constitutes your acknowledgment of the updated policy.
                            </p>
                        </SectionCard>

                        {/* 15 — Contact */}
                        <SectionCard id="contact" title="15. Contact Us & How to Complain to the ICO">
                            <p>
                                If you have any questions, concerns, or wish to exercise your data rights, please contact
                                our Data Protection contact in the first instance:
                            </p>
                            <div className="bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100 rounded-xl p-5 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <a href="mailto:support@logicjunior.com" className="text-blue-700 font-medium hover:underline">
                                        support@logicjunior.com
                                    </a>
                                </div>
                                <p className="text-sm text-gray-600">We aim to respond to all requests within <strong>one calendar month</strong>.</p>
                            </div>

                            <p className="mt-2">
                                If you are not satisfied with our response or believe we are processing your data unlawfully,
                                you have the right to <strong>lodge a complaint with the Information Commissioner's Office (ICO)</strong>:
                            </p>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2 text-sm">
                                <p className="font-semibold text-gray-800">Information Commissioner's Office (ICO)</p>
                                <p className="text-gray-600">Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF</p>
                                <p className="text-gray-600">Helpline: <strong>0303 123 1113</strong></p>
                                <a
                                    href="https://ico.org.uk/make-a-complaint/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                                >
                                    ico.org.uk/make-a-complaint <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
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

export default PrivacyPolicy;
