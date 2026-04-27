import React, { useEffect, useRef } from 'react';
import { UserPlus, BookOpen, CheckSquare, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── Intersection-observer fade ── */
const useFadeIn = (delay = 0) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('jrn-show'), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return ref;
};

const steps = [
  {
    icon: UserPlus,
    label: 'Step 1',
    title: 'Create a Free Account',
    description:
      'Sign up in under a minute. No credit card, no commitment. You get instant access to your personalised dashboard and free tests from the moment you join.',
    detail: '🎉 It only takes 30 seconds',
    gradFrom: 'from-blue-500',
    gradTo: 'to-violet-600',
    glowColor: 'shadow-blue-500/30',
    accentBg: 'bg-blue-50',
    accentText: 'text-blue-700',
    accentBorder: 'border-blue-100',
    nodeColor: 'bg-blue-500',
  },
  {
    icon: BookOpen,
    label: 'Step 2',
    title: 'Explore & Choose a Test',
    description:
      'Browse our library of expert-crafted tests organised by subject, difficulty, and exam type. Filter by category to zero in on exactly what you need.',
    detail: '📚 500+ questions across all subjects',
    gradFrom: 'from-violet-500',
    gradTo: 'to-purple-600',
    glowColor: 'shadow-violet-500/30',
    accentBg: 'bg-violet-50',
    accentText: 'text-violet-700',
    accentBorder: 'border-violet-100',
    nodeColor: 'bg-violet-500',
  },
  {
    icon: CheckSquare,
    label: 'Step 3',
    title: 'Take the Test',
    description:
      "Sit a realistic, timed assessment just like the real exam. Navigate freely between questions, flag tricky ones to revisit, and submit when you're ready.",
    detail: '⏱ Timed, real-exam conditions',
    gradFrom: 'from-emerald-500',
    gradTo: 'to-teal-500',
    glowColor: 'shadow-emerald-500/30',
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-700',
    accentBorder: 'border-emerald-100',
    nodeColor: 'bg-emerald-500',
  },
  {
    icon: Award,
    label: 'Step 4',
    title: 'Review Results & Keep Improving',
    description:
      'Get an instant score breakdown with detailed explanations for every answer. Track your progress over time in your dashboard and watch your scores climb.',
    detail: '📈 Performance insights after every test',
    gradFrom: 'from-amber-500',
    gradTo: 'to-orange-500',
    glowColor: 'shadow-amber-500/30',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-700',
    accentBorder: 'border-amber-100',
    nodeColor: 'bg-amber-500',
  },
];

/* ── One journey step (alternating left / right) ── */
const JourneyStep = ({ step, index }) => {
  const isRight = index % 2 === 0; // even → content on right, odd → content on left
  const cardRef = useFadeIn(index * 100);
  const iconRef = useFadeIn(index * 100 + 60);
  const Icon = step.icon;

  return (
    <div className="relative flex items-center justify-center gap-0 min-h-[180px]">

      {/* ── LEFT SIDE ── */}
      <div className="flex-1 flex justify-end pr-10 lg:pr-14">
        {!isRight && (
          /* Content card on the left for odd steps */
          <div
            ref={cardRef}
            className={`jrn-card jrn-from-left w-full max-w-sm bg-white rounded-2xl border ${step.accentBorder}
                        shadow-sm hover:shadow-md transition-shadow duration-300 p-6`}
          >
            <StepContent step={step} />
          </div>
        )}
        {isRight && (
          /* Icon on the left for even steps */
          <div ref={iconRef} className="jrn-card jrn-from-left flex flex-col items-center gap-3">
            <StepIcon step={step} Icon={Icon} />
          </div>
        )}
      </div>

      {/* ── CENTRE SPINE NODE ── */}
      <div className="flex-shrink-0 flex flex-col items-center relative z-10">
        <div
          className={`w-5 h-5 rounded-full border-4 border-white ${step.nodeColor} shadow-lg ring-4 ring-white/60`}
        />
      </div>

      {/* ── RIGHT SIDE ── */}
      <div className="flex-1 flex justify-start pl-10 lg:pl-14">
        {isRight && (
          /* Content card on the right for even steps */
          <div
            ref={cardRef}
            className={`jrn-card jrn-from-right w-full max-w-sm bg-white rounded-2xl border ${step.accentBorder}
                        shadow-sm hover:shadow-md transition-shadow duration-300 p-6`}
          >
            <StepContent step={step} />
          </div>
        )}
        {!isRight && (
          /* Icon on the right for odd steps */
          <div ref={iconRef} className="jrn-card jrn-from-right flex flex-col items-center gap-3">
            <StepIcon step={step} Icon={Icon} />
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Shared icon block ── */
const StepIcon = ({ step, Icon }) => (
  <div className="flex flex-col items-center gap-2">
    <div
      className={`w-16 h-16 rounded-2xl flex items-center justify-center
                  bg-gradient-to-br ${step.gradFrom} ${step.gradTo}
                  shadow-xl ${step.glowColor}`}
    >
      <Icon className="w-8 h-8 text-white" />
    </div>
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${step.accentBg} ${step.accentText}`}>
      {step.label}
    </span>
  </div>
);

/* ── Shared content block ── */
const StepContent = ({ step }) => (
  <div>
    <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">{step.title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed mb-3">{step.description}</p>
    <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-lg ${step.accentBg} ${step.accentText}`}>
      {step.detail}
    </span>
  </div>
);

/* ─────────────────────────── Mobile layout ─────────────────────────── */
const MobileStep = ({ step, index }) => {
  const ref = useFadeIn(index * 100);
  const Icon = step.icon;
  const isLast = index === steps.length - 1;
  return (
    <div ref={ref} className="jrn-card jrn-from-right relative pl-12">
      {/* Vertical line */}
      {!isLast && (
        <div
          className={`absolute left-[1.35rem] top-16 bottom-0 w-0.5 bg-gradient-to-b ${step.gradFrom} ${step.gradTo} opacity-30`}
        />
      )}
      {/* Node + icon */}
      <div className="absolute left-2 top-1">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center
                      bg-gradient-to-br ${step.gradFrom} ${step.gradTo} shadow-lg ${step.glowColor}`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className={`bg-white rounded-2xl border ${step.accentBorder} shadow-sm p-5 mb-6`}>
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${step.accentBg} ${step.accentText} mb-3`}>
          {step.label}
        </span>
        <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-3">{step.description}</p>
        <span className={`inline-block text-xs font-medium px-3 py-1.5 rounded-lg ${step.accentBg} ${step.accentText}`}>
          {step.detail}
        </span>
      </div>
    </div>
  );
};

/* ─────────────────────────── Main component ─────────────────────────── */
const HowItWorks = () => {
  const headerRef = useFadeIn(0);
  const ctaRef = useFadeIn(steps.length * 110 + 100);
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">

      {/* Animation styles */}
      <style>{`
        .jrn-card       { opacity: 0; transition: opacity 0.55s ease, transform 0.55s ease; }
        .jrn-from-right { transform: translateX(32px); }
        .jrn-from-left  { transform: translateX(-32px); }
        .jrn-header     { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .jrn-card.jrn-show, .jrn-header.jrn-show { opacity: 1; transform: translate(0, 0); }
      `}</style>

      {/* Background accent blob */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/60 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div ref={headerRef} className="jrn-header text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-200 bg-violet-50 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-sm text-violet-600 font-semibold">Your Journey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            From sign-up to{' '}
            <span className="bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">
              exam-ready
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
            Here's what your experience looks like at every stage on Logic Junior.
          </p>
        </div>

        {/* ── DESKTOP: zigzag timeline ── */}
        <div className="hidden lg:block relative">
          {/* Central vertical gradient spine */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-violet-400 via-emerald-400 to-amber-400 opacity-30" />

          <div className="flex flex-col gap-12">
            {steps.map((step, index) => (
              <JourneyStep key={index} step={step} index={index} />
            ))}
          </div>
        </div>

        {/* ── MOBILE / TABLET: left-aligned timeline ── */}
        <div className="lg:hidden">
          {steps.map((step, index) => (
            <MobileStep key={index} step={step} index={index} />
          ))}
        </div>

        {/* ── CTA ── */}
        <div ref={ctaRef} className="jrn-card jrn-from-right mt-14 text-center">
          <button
            onClick={() => {
              const el = document.getElementById('test-series-section');
              if (el) {
                const top = el.getBoundingClientRect().top + window.scrollY - 64;
                window.scrollTo({ top, behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white
                       bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500
                       shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 group"
          >
            Start Your Journey
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
          <p className="mt-2 text-xs text-gray-400">Free to start — no credit card required</p>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
