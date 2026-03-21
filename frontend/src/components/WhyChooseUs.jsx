import React, { useEffect, useRef } from 'react';
import { CheckCircle, Zap, Users, TrendingUp } from 'lucide-react';

/* ── Scroll-triggered fade-in-up hook ── */
const useFadeInUp = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('wcu-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
};

const features = [
  {
    icon: CheckCircle,
    title: 'Expert-Crafted Content',
    description: 'Tests designed by industry professionals with years of experience in competitive exams.',
    metric: '500+ questions',
    from: 'from-blue-500',
    to: 'to-violet-600',
    glow: 'shadow-blue-500/30',
    border: 'hover:border-blue-500/40',
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    description: 'Get detailed explanations and performance analytics immediately after completing each test.',
    metric: 'Results in seconds',
    from: 'from-violet-500',
    to: 'to-purple-600',
    glow: 'shadow-violet-500/30',
    border: 'hover:border-violet-500/40',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Learn from thousands of students, share insights, and compare your performance with peers.',
    metric: '10,000+ students',
    from: 'from-emerald-500',
    to: 'to-teal-600',
    glow: 'shadow-emerald-500/30',
    border: 'hover:border-emerald-500/40',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Comprehensive analytics dashboard to monitor your improvement over time.',
    metric: 'Live dashboard',
    from: 'from-amber-500',
    to: 'to-orange-500',
    glow: 'shadow-amber-500/30',
    border: 'hover:border-amber-500/40',
  },
];

/* ── Individual feature card ── */
const FeatureCard = ({ feature, delay }) => {
  const ref = useFadeInUp();
  const Icon = feature.icon;
  return (
    <div
      ref={ref}
      className="wcu-card group relative bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col gap-4
                 hover:-translate-y-1.5 hover:border-white/20 transition-all duration-300 cursor-default"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${feature.from} ${feature.to} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${feature.from} ${feature.to} shadow-lg ${feature.glow} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <div>
        <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
        <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
      </div>

      {/* Metric badge */}
      <div className="mt-auto pt-3 border-t border-white/10">
        <span className={`text-xs font-semibold bg-gradient-to-r ${feature.from} ${feature.to} bg-clip-text text-transparent`}>
          ✦ {feature.metric}
        </span>
      </div>
    </div>
  );
};

const WhyChooseUs = () => {
  const headerRef = useFadeInUp();

  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
    >
      {/* Inline styles for animations */}
      <style>{`
        .wcu-card { opacity: 0; transform: translateY(28px); transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease, border-color 0.3s ease, translate 0.3s ease; }
        .wcu-card.wcu-visible { opacity: 1; transform: translateY(0); }
        .wcu-header { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .wcu-header.wcu-visible { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%]  w-96 h-96 rounded-full bg-blue-600/15   blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-80 h-80 rounded-full bg-violet-600/20 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div ref={headerRef} className="wcu-header text-center mb-14">
          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 backdrop-blur-sm mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-sm text-blue-300 font-medium">Why Us</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Logic Junior
            </span>
          </h2>
          <p className="text-lg text-white/55 max-w-2xl mx-auto">
            Join thousands of successful students who have achieved their goals with our platform
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
