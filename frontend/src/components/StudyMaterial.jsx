import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen, ChevronRight, Search, Filter,
    PenLine, Calculator, Brain, Shapes, ExternalLink,
    BookMarked, Clock, BarChart2, Tag,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// STUDY MATERIALS DATA
// ─────────────────────────────────────────────────────────────────────────────
//
// HOW TO ADD NEW MATERIAL:
// 1. Find the correct subject array (or create a new one with the same shape).
// 2. Add a new object to its `topics` array following this structure:
//
//   {
//     id:         'unique-slug',          // unique string, used as key
//     title:      'Topic Name',
//     description:'Short description.',
//     difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
//     timeToRead: '15 min',               // estimated study time
//     tags:       ['tag1', 'tag2'],       // searchable labels
//     resources: [                        // can be empty []
//       { label: 'Resource Name', href: 'https://...' },
//     ],
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

export const STUDY_MATERIALS = [
    // ── English ────────────────────────────────────────────────────────────────
    {
        subject: 'English',
        subjectId: 'english',
        icon: PenLine,
        colour: 'blue',
        description: 'Reading comprehension, vocabulary, grammar, punctuation, and creative writing — covering GL Assessment and CEM English papers.',
        topics: [
            {
                id: 'reading-comprehension',
                title: 'Reading Comprehension',
                description: 'Read a passage and answer inference, retrieval, and language technique questions precisely.',
                difficulty: 'Intermediate',
                timeToRead: '20 min',
                tags: ['inference', 'retrieval', 'language', 'fiction', 'non-fiction'],
                resources: [
                    { label: 'BBC Bitesize – Reading Skills', href: 'https://www.bbc.co.uk/bitesize/topics/zv9qhyc' },
                ],
            },
            {
                id: 'vocabulary',
                title: 'Vocabulary & Word Knowledge',
                description: 'Define words in context, identify synonyms/antonyms, and recognise word roots, prefixes, and suffixes.',
                difficulty: 'Beginner',
                timeToRead: '15 min',
                tags: ['synonyms', 'antonyms', 'prefixes', 'suffixes', 'word roots'],
                resources: [
                    { label: 'Oxford Learner\'s Dictionary', href: 'https://www.oxfordlearnersdictionaries.com/' },
                ],
            },
            {
                id: 'grammar-punctuation',
                title: 'Grammar & Punctuation',
                description: 'Identify and correct errors in sentences — covering tenses, clauses, apostrophes, commas, and speech marks.',
                difficulty: 'Intermediate',
                timeToRead: '15 min',
                tags: ['tenses', 'clauses', 'apostrophes', 'commas', 'speech marks'],
                resources: [
                    { label: 'BBC Bitesize – Grammar', href: 'https://www.bbc.co.uk/bitesize/topics/z4kw2hv' },
                ],
            },
            {
                id: 'spelling',
                title: 'Spelling Patterns',
                description: 'Master common spelling rules, homophones, tricky words, and patterns tested in the 11+ English papers.',
                difficulty: 'Beginner',
                timeToRead: '10 min',
                tags: ['homophones', 'spelling rules', 'tricky words'],
                resources: [],
            },
            {
                id: 'creative-writing',
                title: 'Creative Writing',
                description: 'Structure compelling stories with a clear beginning, middle, and end; use descriptive language and varied sentence structures.',
                difficulty: 'Advanced',
                timeToRead: '25 min',
                tags: ['story writing', 'descriptive language', 'paragraphing'],
                resources: [],
            },
        ],
    },

    // ── Maths ──────────────────────────────────────────────────────────────────
    {
        subject: 'Maths',
        subjectId: 'maths',
        icon: Calculator,
        colour: 'violet',
        description: 'Arithmetic, number fluency, measurement, statistics, geometry, and problem-solving up to and beyond KS2 Year 5.',
        topics: [
            {
                id: 'arithmetic',
                title: 'Arithmetic & Mental Maths',
                description: 'Rapid addition, subtraction, multiplication, and division — including long multiplication and long division.',
                difficulty: 'Beginner',
                timeToRead: '15 min',
                tags: ['addition', 'subtraction', 'multiplication', 'division', 'times tables'],
                resources: [
                    { label: 'Times Tables Rock Stars', href: 'https://ttrockstars.com/' },
                ],
            },
            {
                id: 'fractions-decimals-percentages',
                title: 'Fractions, Decimals & Percentages',
                description: 'Convert between fractions, decimals, and percentages; calculate fraction of amounts and percentage change.',
                difficulty: 'Intermediate',
                timeToRead: '20 min',
                tags: ['fractions', 'decimals', 'percentages', 'equivalent fractions'],
                resources: [
                    { label: 'BBC Bitesize – Fractions', href: 'https://www.bbc.co.uk/bitesize/topics/z3rbg82' },
                ],
            },
            {
                id: 'algebra-patterns',
                title: 'Algebra & Number Patterns',
                description: 'Find missing values in equations, identify number sequences, and work with simple formulae.',
                difficulty: 'Intermediate',
                timeToRead: '15 min',
                tags: ['algebra', 'number sequences', 'formulae', 'prime numbers', 'factors'],
                resources: [],
            },
            {
                id: 'measurement',
                title: 'Measurement & Units',
                description: 'Calculate perimeter, area, and volume; convert metric units; work with time, money, and speed.',
                difficulty: 'Intermediate',
                timeToRead: '20 min',
                tags: ['perimeter', 'area', 'volume', 'metric', 'time', 'speed'],
                resources: [
                    { label: 'BBC Bitesize – Measurement', href: 'https://www.bbc.co.uk/bitesize/topics/zjbg87h' },
                ],
            },
            {
                id: 'geometry',
                title: 'Geometry & Shape',
                description: 'Angle calculations, properties of 2D and 3D shapes, reflection, rotation, symmetry, and nets.',
                difficulty: 'Advanced',
                timeToRead: '20 min',
                tags: ['angles', 'shapes', 'reflection', 'rotation', 'symmetry', 'nets'],
                resources: [],
            },
            {
                id: 'statistics',
                title: 'Statistics & Data',
                description: 'Read and interpret bar charts, pie charts, line graphs, tables; calculate mean, median, mode, and range.',
                difficulty: 'Intermediate',
                timeToRead: '15 min',
                tags: ['mean', 'median', 'mode', 'range', 'graphs', 'charts'],
                resources: [],
            },
            {
                id: 'problem-solving',
                title: 'Problem Solving & Word Problems',
                description: 'Apply maths skills to multi-step real-world problems — a key area in both GL and CEM papers.',
                difficulty: 'Advanced',
                timeToRead: '25 min',
                tags: ['word problems', 'multi-step', 'reasoning', 'logic'],
                resources: [],
            },
        ],
    },

    // ── Verbal Reasoning ───────────────────────────────────────────────────────
    {
        subject: 'Verbal Reasoning',
        subjectId: 'verbal-reasoning',
        icon: Brain,
        colour: 'green',
        description: 'Logical thinking with words — codes, sequences, analogies, and language manipulation as tested in GL and CEM 11+ papers.',
        topics: [
            {
                id: 'word-codes',
                title: 'Word Codes & Letter Sequences',
                description: 'Decode messages using letter or number codes and spot the rule to complete sequences.',
                difficulty: 'Intermediate',
                timeToRead: '15 min',
                tags: ['codes', 'sequences', 'patterns', 'letters', 'numbers'],
                resources: [],
            },
            {
                id: 'analogies',
                title: 'Word Analogies',
                description: 'Identify the relationship between a pair of words and apply it to find the matching word.',
                difficulty: 'Intermediate',
                timeToRead: '15 min',
                tags: ['analogies', 'relationships', 'vocabulary'],
                resources: [],
            },
            {
                id: 'hidden-words',
                title: 'Hidden & Compound Words',
                description: 'Find words hidden within sentences and form compound words by joining given words.',
                difficulty: 'Beginner',
                timeToRead: '10 min',
                tags: ['hidden words', 'compound words', 'word building'],
                resources: [],
            },
            {
                id: 'odd-one-out',
                title: 'Odd One Out & Word Groups',
                description: 'Identify which word does not belong to a group based on meaning, category, or letter pattern.',
                difficulty: 'Beginner',
                timeToRead: '10 min',
                tags: ['odd one out', 'categories', 'word groups'],
                resources: [],
            },
            {
                id: 'missing-words',
                title: 'Missing Words & Cloze',
                description: 'Choose the correct word to complete a sentence logically and grammatically.',
                difficulty: 'Intermediate',
                timeToRead: '10 min',
                tags: ['cloze', 'missing words', 'sentence completion'],
                resources: [],
            },
            {
                id: 'number-logic-vr',
                title: 'Number & Logic Puzzles (VR)',
                description: 'Apply logical reasoning to number sequences, sums, and coded arithmetic questions.',
                difficulty: 'Advanced',
                timeToRead: '20 min',
                tags: ['number logic', 'coded arithmetic', 'sequences'],
                resources: [],
            },
        ],
    },

    // ── Non-Verbal Reasoning ───────────────────────────────────────────────────
    {
        subject: 'Non-Verbal Reasoning',
        subjectId: 'non-verbal-reasoning',
        icon: Shapes,
        colour: 'amber',
        description: 'Visual patterns, spatial reasoning, and shape logic — pure problem-solving without words.',
        topics: [
            {
                id: 'pattern-sequences',
                title: 'Pattern Sequences',
                description: 'Identify the rule in a sequence of shapes or figures and choose what comes next.',
                difficulty: 'Interme diate',
                timeToRead: '15 min',
                tags: ['sequences', 'patterns', 'shapes', 'figures'],
                resources: [],
            },
            {
                id: 'odd-shape-out',
                title: 'Odd Shape Out',
                description: 'Find the shape that does not share a feature with the others — colour, rotation, shading, or style.',
                difficulty: 'Beginner',
                timeToRead: '10 min',
                tags: ['odd one out', 'shapes', 'visual patterns'],
                resources: [],
            },
            {
                id: 'reflection-rotation',
                title: 'Reflection & Rotation',
                description: 'Mentally flip or rotate shapes and identify the correct transformed image.',
                difficulty: 'Advanced',
                timeToRead: '20 min',
                tags: ['reflection', 'rotation', 'transformation', 'symmetry'],
                resources: [],
            },
            {
                id: 'matrices-grids',
                title: 'Matrices & Grids',
                description: 'Complete a 2×2 or 3×3 grid of shapes by finding the pattern across rows and columns.',
                difficulty: 'Advanced',
                timeToRead: '20 min',
                tags: ['matrices', 'grids', 'patterns', 'logic'],
                resources: [],
            },
            {
                id: 'cube-nets',
                title: 'Cube Nets & 3D Shapes',
                description: 'Identify which net folds into a given cube and visualise 3D shapes from 2D drawings.',
                difficulty: 'Advanced',
                timeToRead: '20 min',
                tags: ['cube nets', '3D shapes', 'spatial reasoning'],
                resources: [],
            },
            {
                id: 'mirror-images',
                title: 'Mirror Images & Symmetry',
                description: 'Identify the mirror image of a shape or complete a symmetrical figure.',
                difficulty: 'Intermediate',
                timeToRead: '10 min',
                tags: ['mirror images', 'symmetry', 'reflection'],
                resources: [],
            },
        ],
    },
];

// ── Colour map ────────────────────────────────────────────────────────────────
const COLOUR = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', ring: 'ring-blue-400', activeBg: 'bg-blue-600' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-600', badge: 'bg-violet-100 text-violet-700', ring: 'ring-violet-400', activeBg: 'bg-violet-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', badge: 'bg-green-100 text-green-700', ring: 'ring-green-400', activeBg: 'bg-green-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700', ring: 'ring-amber-400', activeBg: 'bg-amber-500' },
};

const DIFFICULTY_COLOUR = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-amber-100 text-amber-700',
    Advanced: 'bg-red-100 text-red-700',
};

// ── Topic card ────────────────────────────────────────────────────────────────
const TopicCard = ({ topic, colour }) => {
    const c = COLOUR[colour];
    return (
        <div className={`bg-white rounded-xl border ${c.border} shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3`}>
            <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-gray-900 leading-snug">{topic.title}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${DIFFICULTY_COLOUR[topic.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                    {topic.difficulty}
                </span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed flex-1">{topic.description}</p>

            <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {topic.timeToRead}
                </span>
                {topic.tags.slice(0, 3).map(tag => (
                    <span key={tag} className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${c.bg} ${c.icon} font-medium`}>
                        <Tag className="w-2.5 h-2.5" />{tag}
                    </span>
                ))}
            </div>

            {topic.resources.length > 0 && (
                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Resources</p>
                    {topic.resources.map(r => (
                        <a
                            key={r.href}
                            href={r.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-1.5 text-xs font-medium ${c.icon} hover:underline`}
                        >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />{r.label}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const StudyMaterial = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSubject, setActiveSubject] = useState(null);
    const [activeDifficulty, setActiveDifficulty] = useState(null);

    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

    // Filter data
    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return STUDY_MATERIALS
            .filter(s => !activeSubject || s.subjectId === activeSubject)
            .map(s => ({
                ...s,
                topics: s.topics.filter(t => {
                    const matchesSearch = !q || [t.title, t.description, ...t.tags]
                        .some(str => str.toLowerCase().includes(q));
                    const matchesDifficulty = !activeDifficulty || t.difficulty === activeDifficulty;
                    // Normalize difficulty (fix any accidental spaces in data)
                    const normalizedDiff = t.difficulty?.trim();
                    const matchesDiffNorm = !activeDifficulty || normalizedDiff === activeDifficulty;
                    return matchesSearch && matchesDiffNorm;
                }),
            }))
            .filter(s => s.topics.length > 0);
    }, [searchQuery, activeSubject, activeDifficulty]);

    const totalTopics = STUDY_MATERIALS.reduce((acc, s) => acc + s.topics.length, 0);
    const filteredCount = filtered.reduce((acc, s) => acc + s.topics.length, 0);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Hero ── */}
            <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white pt-10 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                        <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" /> Logic Junior
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                        <span className="text-gray-300">Study Material</span>
                    </div>

                    <div className="flex items-start gap-4 mb-8">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 flex-shrink-0 mt-1">
                            <BookMarked className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Study Material</h1>
                            <p className="text-gray-400 text-[15px] leading-relaxed max-w-2xl">
                                Comprehensive revision guides for the <strong className="text-gray-300">UK 11+ Exam</strong> —
                                covering all four core subjects across GL Assessment and CEM formats.{' '}
                                <span className="text-blue-400 font-medium">{totalTopics} topics</span> and growing.
                            </p>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search topics, tags, or keywords…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15 transition-all text-sm"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-xs">✕</button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10">

                {/* ── Subject + difficulty filters ── */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* Subject pills */}
                    <div className="flex flex-wrap gap-2 flex-1">
                        <button
                            onClick={() => setActiveSubject(null)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${!activeSubject ? 'bg-gray-900 border-gray-900 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            All Subjects
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${!activeSubject ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {totalTopics}
                            </span>
                        </button>
                        {STUDY_MATERIALS.map(s => {
                            const Icon = s.icon;
                            const c = COLOUR[s.colour];
                            const active = activeSubject === s.subjectId;
                            return (
                                <button
                                    key={s.subjectId}
                                    onClick={() => setActiveSubject(active ? null : s.subjectId)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${active ? `${c.bg} ${c.border} ${c.icon} shadow-sm` : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {s.subject}
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${active ? c.badge : 'bg-gray-100 text-gray-500'}`}>
                                        {s.topics.length}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Difficulty filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex gap-1.5">
                            {difficulties.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setActiveDifficulty(activeDifficulty === d ? null : d)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${activeDifficulty === d
                                            ? DIFFICULTY_COLOUR[d] + ' border-current'
                                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Result count ── */}
                {(searchQuery || activeSubject || activeDifficulty) && (
                    <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                        <BarChart2 className="w-4 h-4 text-gray-400" />
                        Showing <strong className="text-gray-700">{filteredCount}</strong> of{' '}
                        <strong className="text-gray-700">{totalTopics}</strong> topics
                        {searchQuery && <> matching "<span className="text-blue-600">{searchQuery}</span>"</>}
                    </div>
                )}

                {/* ── Empty state ── */}
                {filtered.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center">
                        <Search className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium mb-1">No topics found</p>
                        <p className="text-sm text-gray-400">Try different keywords or clear the filters.</p>
                    </div>
                )}

                {/* ── Subject sections ── */}
                <div className="space-y-12">
                    {filtered.map(subjectData => {
                        const Icon = subjectData.icon;
                        const c = COLOUR[subjectData.colour];
                        return (
                            <section key={subjectData.subjectId} id={subjectData.subjectId}>
                                {/* Section header */}
                                <div className="flex items-center gap-3 mb-5">
                                    <div className={`w-10 h-10 rounded-2xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                                        <Icon className={`w-5 h-5 ${c.icon}`} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">{subjectData.subject}</h2>
                                        <p className="text-xs text-gray-500">{subjectData.description}</p>
                                    </div>
                                    <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
                                        {subjectData.topics.length} topics
                                    </span>
                                </div>

                                {/* Topic cards grid */}
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {subjectData.topics.map(topic => (
                                        <TopicCard key={topic.id} topic={topic} colour={subjectData.colour} />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>

                {/* ── CTA block ── */}
                <div className="mt-16 rounded-2xl bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white p-8 sm:p-10 text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 mx-auto mb-4">
                        <BookOpen className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Ready to put it into practice?</h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                        Reinforce what you've studied with our timed 11+ practice tests — designed to mirror real exam conditions.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 transition-all"
                    >
                        Browse Practice Tests
                    </Link>
                </div>

                {/* Bottom nav */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 pb-6">
                    <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                        ← Back to Home
                    </Link>
                    <p className="text-xs text-gray-400">© {new Date().getFullYear()} Logic Junior. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default StudyMaterial;
