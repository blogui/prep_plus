import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen, ChevronRight, CheckCircle2, Circle,
    PenLine, Calculator, Brain, Shapes,
    GraduationCap, Info, ExternalLink, ChevronDown,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// SYLLABUS DATA
// HOW TO ADD NEW CONTENT:
//   - Add a new object to EXAM_BOARDS for a new board/format.
//   - Add new topic strings to any subject's `topics` array.
//   - All UI updates automatically.
// ─────────────────────────────────────────────────────────────────────────────

const SUBJECTS = [
    {
        id: 'english',
        label: 'English',
        icon: PenLine,
        colour: 'blue',
        sections: [
            {
                title: 'Reading Comprehension',
                topics: [
                    'Inference and deduction from fiction and non-fiction passages',
                    'Retrieval of factual information',
                    'Understanding authorial intent and language techniques',
                    'Identifying themes, mood, and tone',
                    'Answering in full sentences using evidence from the text',
                ],
            },
            {
                title: 'Vocabulary',
                topics: [
                    'Definitions of words in context',
                    'Synonyms and antonyms',
                    'Word roots, prefixes, and suffixes',
                    'Understanding figurative language (simile, metaphor, personification)',
                    'Homophones and commonly confused words',
                ],
            },
            {
                title: 'Grammar & Punctuation',
                topics: [
                    'Parts of speech: nouns, verbs, adjectives, adverbs, conjunctions, prepositions',
                    'Sentence types: simple, compound, and complex sentences',
                    'Tenses: past, present, future; simple and continuous',
                    'Punctuation: commas, apostrophes, speech marks, colons, semicolons',
                    'Identifying and correcting grammatical errors',
                    'Clauses: main, subordinate, and relative clauses',
                ],
            },
            {
                title: 'Spelling',
                topics: [
                    'Year 3–6 statutory spelling lists',
                    'Common spelling rules and patterns (e.g. -ous, -tion, -sion)',
                    'Double consonants and silent letters',
                    'Tricky high-frequency words',
                ],
            },
            {
                title: 'Creative Writing (GL)',
                topics: [
                    'Story structure: opening, build-up, climax, resolution',
                    'Descriptive writing using the five senses',
                    'Varied sentence structures and lengths',
                    'Show don\'t tell — using actions and dialogue',
                    'Effective use of paragraphs',
                ],
            },
        ],
    },
    {
        id: 'maths',
        label: 'Maths',
        icon: Calculator,
        colour: 'violet',
        sections: [
            {
                title: 'Number & Arithmetic',
                topics: [
                    'Four operations: addition, subtraction, multiplication, division',
                    'Times tables up to 12×12 and related division facts',
                    'Long multiplication and long division',
                    'Order of operations (BODMAS/BIDMAS)',
                    'Prime numbers, factors, multiples, and HCF/LCM',
                    'Positive and negative numbers',
                    'Rounding to nearest 10, 100, 1000, decimal place',
                ],
            },
            {
                title: 'Fractions, Decimals & Percentages',
                topics: [
                    'Equivalent fractions, simplifying fractions',
                    'Adding, subtracting, multiplying, and dividing fractions',
                    'Converting between fractions, decimals, and percentages',
                    'Finding fractions and percentages of amounts',
                    'Percentage increase and decrease',
                    'Ratio and proportion',
                ],
            },
            {
                title: 'Algebra & Sequences',
                topics: [
                    'Number sequences: term-to-term and position-to-term rules',
                    'Simple algebraic expressions and equations',
                    'Substituting values into formulae',
                    'Solving one-step and two-step equations',
                    'Input/output function machines',
                ],
            },
            {
                title: 'Measurement',
                topics: [
                    'Metric units of length, mass, capacity, and their conversions',
                    'Perimeter and area of rectangles, triangles, and compound shapes',
                    'Volume of cuboids',
                    'Time calculations: 12-hour and 24-hour clocks, timetables',
                    'Speed, distance, and time calculations',
                    'Money problems: profit, loss, and change',
                ],
            },
            {
                title: 'Geometry',
                topics: [
                    'Properties of 2D shapes: quadrilaterals, triangles, polygons, circles',
                    'Properties of 3D shapes: faces, edges, vertices',
                    'Angles: acute, obtuse, reflex; angles in triangles, quadrilaterals, and on a line',
                    'Coordinates in four quadrants',
                    'Reflection, rotation, and translation',
                    'Symmetry: lines and rotational symmetry',
                    'Nets of 3D shapes',
                ],
            },
            {
                title: 'Statistics & Data',
                topics: [
                    'Bar charts, pictograms, pie charts, line graphs, scatter graphs',
                    'Reading and interpreting tables and timetables',
                    'Mean, median, mode, and range',
                    'Stem-and-leaf diagrams',
                    'Probability: simple and combined events',
                ],
            },
        ],
    },
    {
        id: 'verbal-reasoning',
        label: 'Verbal Reasoning',
        icon: Brain,
        colour: 'green',
        sections: [
            {
                title: 'Word-Based Questions',
                topics: [
                    'Synonyms: find the word closest in meaning',
                    'Antonyms: find the word most opposite in meaning',
                    'Odd one out: identify the word that does not belong',
                    'Word analogies: complete the pair (e.g. cat : kitten :: dog : ?)',
                    'Hidden words: find a word embedded within a sentence',
                    'Compound words: join two words to make one',
                    'Making new words by changing/adding letters',
                ],
            },
            {
                title: 'Code-Based Questions',
                topics: [
                    'Letter codes: decode and encode words using a letter shift',
                    'Number codes: assign numbers to letters to find coded words',
                    'Word-to-number codes: match given words to their codes',
                    'Letter sequences: identify the rule and find the next letter',
                    'Coded arithmetic: solve calculations in letter code',
                ],
            },
            {
                title: 'Logic & Reasoning',
                topics: [
                    'Number sequences: find the next number using the rule',
                    'Letter-number sequences: combined pattern questions',
                    'Missing words: choose the correct word to complete two pairs',
                    'Sentence completion: choose the word that fits logically',
                    'True/false/cannot say questions',
                ],
            },
        ],
    },
    {
        id: 'non-verbal-reasoning',
        label: 'Non-Verbal Reasoning',
        icon: Shapes,
        colour: 'amber',
        sections: [
            {
                title: 'Pattern & Sequence',
                topics: [
                    'Complete the sequence: find the next shape in a series',
                    'Matrices: complete a 2×2 or 3×3 grid of shapes',
                    'Find the relationship between two pairs of shapes (analogy)',
                    'Identify the pattern rule (rotation, flip, shading, size, number)',
                ],
            },
            {
                title: 'Shape Identification',
                topics: [
                    'Odd shape out: find the shape that does not belong',
                    'Similar shapes: find the shape most similar to the given shape',
                    'Identifying shapes from different orientations',
                    'Recognising shapes within larger figures',
                ],
            },
            {
                title: 'Spatial Reasoning',
                topics: [
                    'Reflection: identify the mirror image of a shape',
                    'Rotation: mentally rotate a shape and identify the result',
                    'Cube nets: identify which net folds into a given cube',
                    'Plan views: match 3D objects to their top, front, and side views',
                    'Counting faces, edges, and vertices of 3D shapes',
                    'Combining shapes: which shapes fit together to make a figure',
                ],
            },
        ],
    },
];

const EXAM_BOARDS = [
    {
        name: 'GL Assessment',
        badge: 'Most common',
        colour: 'blue',
        points: [
            'Paper-based, multiple-choice format',
            'Four separate papers: English, Maths, VR, NVR',
            'Each paper typically 45–60 minutes',
            'Used by the majority of grammar schools in England',
            'Results reported as Standardised Age Scores (SAS)',
        ],
    },
    {
        name: 'CEM (Durham University)',
        badge: 'Growing',
        colour: 'violet',
        points: [
            'Often computer-based with shorter, timed sections',
            'Subjects are blended across two papers',
            'Heavier focus on vocabulary and verbal reasoning',
            'Questions are not disclosed in advance — harder to predict',
            'Used by grammar schools in Birmingham, Bexley, Wigan, and others',
        ],
    },
    {
        name: 'ISEB Common Pre-Test',
        badge: 'Independent schools',
        colour: 'green',
        points: [
            'Online adaptive test — difficulty adjusts to the child',
            'Covers English, Maths, Verbal Reasoning, and Non-Verbal Reasoning',
            'Taken at the candidate\'s current school',
            'Used by many independent senior schools (e.g. Eton, Harrow pre-test)',
            'Results shared with multiple schools to simplify the process',
        ],
    },
];

const COLOUR = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', tabActive: 'bg-blue-600 text-white', check: 'text-blue-500' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-600', badge: 'bg-violet-100 text-violet-700', tabActive: 'bg-violet-600 text-white', check: 'text-violet-500' },
    green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', badge: 'bg-green-100 text-green-700', tabActive: 'bg-green-600 text-white', check: 'text-green-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700', tabActive: 'bg-amber-500 text-white', check: 'text-amber-500' },
};

// ── Collapsible section within a subject ──────────────────────────────────────
const SyllabusSection = ({ section, colour }) => {
    const [open, setOpen] = useState(true);
    const c = COLOUR[colour];
    return (
        <div className={`border ${open ? c.border : 'border-gray-200'} rounded-xl overflow-hidden transition-all`}>
            <button
                onClick={() => setOpen(o => !o)}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors ${open ? c.bg : 'bg-white hover:bg-gray-50'}`}
            >
                <span className={`text-sm font-bold ${open ? c.icon : 'text-gray-700'}`}>{section.title}</span>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>{section.topics.length} topics</span>
                    <ChevronDown className={`w-4 h-4 ${c.icon} transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {open && (
                <ul className="px-5 py-4 space-y-2 bg-white border-t border-gray-100">
                    {section.topics.map((topic, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                            <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.check}`} />
                            {topic}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const Syllabus = () => {
    const [activeSubject, setActiveSubject] = useState('english');
    const current = SUBJECTS.find(s => s.id === activeSubject);
    const totalTopics = SUBJECTS.reduce((acc, s) => acc + s.sections.reduce((a, sec) => a + sec.topics.length, 0), 0);

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
                        <span className="text-gray-300">Syllabus</span>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 flex-shrink-0 mt-1">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">11+ Exam Syllabus</h1>
                            <p className="text-gray-400 text-[15px] leading-relaxed max-w-2xl">
                                A complete topic-by-topic breakdown of the UK 11+ exam across all four core subjects —
                                covering <strong className="text-gray-300">GL Assessment</strong>,{' '}
                                <strong className="text-gray-300">CEM</strong>, and{' '}
                                <strong className="text-gray-300">ISEB</strong> formats.{' '}
                                <span className="text-blue-400 font-medium">{totalTopics}+ topics</span> listed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* ── Sidebar ── */}
                    <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">

                        {/* Subject nav */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Subjects</p>
                            <nav className="space-y-1">
                                {SUBJECTS.map(s => {
                                    const Icon = s.icon;
                                    const c = COLOUR[s.colour];
                                    const active = activeSubject === s.id;
                                    const count = s.sections.reduce((a, sec) => a + sec.topics.length, 0);
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => setActiveSubject(s.id)}
                                            className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${active ? c.bg + ' ' + c.icon + ' font-semibold ' + c.border + ' border' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <Icon className="w-4 h-4 flex-shrink-0" />
                                            <span className="flex-1">{s.label}</span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${active ? c.badge : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Info box */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800">
                            <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                                <div>
                                    <p className="font-semibold mb-1">Which syllabus applies?</p>
                                    <p className="text-blue-700 text-xs leading-relaxed">
                                        Topics vary by exam board and school. Always check your target school's
                                        admissions page for the exact format and subjects tested.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Study material link */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 text-sm">
                            <p className="font-semibold text-gray-800 mb-1">Ready to revise?</p>
                            <p className="text-gray-500 text-xs mb-3">Explore topic-by-topic study guides and resources.</p>
                            <Link
                                to="/study-material"
                                className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs hover:underline"
                            >
                                <BookOpen className="w-3.5 h-3.5" /> Study Material →
                            </Link>
                        </div>
                    </aside>

                    {/* ── Main content ── */}
                    <div className="flex-1 min-w-0 space-y-6">

                        {/* Subject header */}
                        {current && (() => {
                            const Icon = current.icon;
                            const c = COLOUR[current.colour];
                            return (
                                <div className={`${c.bg} border ${c.border} rounded-2xl p-5`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`w-5 h-5 ${c.icon}`} />
                                        </div>
                                        <div>
                                            <h2 className={`text-lg font-bold ${c.icon}`}>{current.label}</h2>
                                            <p className="text-xs text-gray-500">
                                                {current.sections.length} sections ·{' '}
                                                {current.sections.reduce((a, s) => a + s.topics.length, 0)} topics
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Mobile subject tabs */}
                        <div className="lg:hidden flex gap-2 overflow-x-auto pb-1">
                            {SUBJECTS.map(s => {
                                const c = COLOUR[s.colour];
                                const active = activeSubject === s.id;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => setActiveSubject(s.id)}
                                        className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex-shrink-0 ${active ? `${c.tabActive} border-transparent shadow-sm` : 'bg-white border-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {s.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Sections */}
                        {current && (
                            <div className="space-y-3">
                                {current.sections.map(section => (
                                    <SyllabusSection key={section.title} section={section} colour={current.colour} />
                                ))}
                            </div>
                        )}

                        {/* Exam boards */}
                        <div className="pt-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-gray-400" /> Exam Boards & Formats
                            </h2>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {EXAM_BOARDS.map(board => {
                                    const c = COLOUR[board.colour];
                                    return (
                                        <div key={board.name} className={`bg-white border ${c.border} rounded-2xl shadow-sm p-5`}>
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <p className="font-bold text-gray-900 text-sm leading-snug">{board.name}</p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${c.badge}`}>
                                                    {board.badge}
                                                </span>
                                            </div>
                                            <ul className="space-y-1.5">
                                                {board.points.map((pt, i) => (
                                                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                                                        <Circle className={`w-2 h-2 mt-1 flex-shrink-0 ${c.icon} fill-current`} />
                                                        {pt}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* External resources */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-gray-800 mb-4">Official & Recommended Resources</h3>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {[
                                    { label: 'GL Assessment — About the 11+', href: 'https://www.gl-assessment.co.uk/products/11-plus/' },
                                    { label: 'CEM — 11+ Information for Parents', href: 'https://www.cem.org/11-plus' },
                                    { label: 'ISEB — Common Pre-Test', href: 'https://www.iseb.co.uk/assessments/common-pre-test/' },
                                    { label: 'BBC Bitesize — KS2 Revision', href: 'https://www.bbc.co.uk/bitesize/primary' },
                                    { label: 'CGP 11+ Books', href: 'https://www.cgpbooks.co.uk/books/ks2/11-plus' },
                                    { label: 'Bond 11+ Revision', href: 'https://www.bond11plus.co.uk/' },
                                ].map(r => (
                                    <a
                                        key={r.href}
                                        href={r.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />{r.label}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Bottom nav */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-10">
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

export default Syllabus;
