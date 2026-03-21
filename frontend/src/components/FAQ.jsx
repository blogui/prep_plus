import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';

/* ── Scroll animation via React state (avoids React overwriting classList) ── */
const useScrollVisible = (delay = 0) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return [ref, visible];
};

const faqs = [
  {
    question: 'Is Logic Junior aligned to the national curriculum?',
    answer: 'Yes, Logic Junior tests are meticulously aligned with national curriculum standards and follow the latest examination patterns to ensure comprehensive coverage of all required topics.',
  },
  {
    question: 'Is Logic Junior suitable for 11+ preparation?',
    answer: 'Absolutely! Logic Junior offers specialised test series designed specifically for 11+ entrance exams, with difficulty levels ranging from beginner to advanced.',
  },
  {
    question: 'What tests are available on Logic Junior?',
    answer: 'We offer a comprehensive range of tests including Mathematics, English, Reasoning, Science, and General Knowledge. Each category has multiple tests at different difficulty levels.',
  },
  {
    question: "How accurate are Logic Junior's practice tests?",
    answer: 'Our tests are created by subject matter experts and regularly updated based on actual exam patterns. They provide highly accurate simulations of real exams.',
  },
  {
    question: 'How do I know which practice tests my child should take?',
    answer: 'We recommend starting with beginner-level tests and progressively moving to higher difficulties. Our platform also provides personalised recommendations based on performance.',
  },
  {
    question: 'Can I track my progress over time?',
    answer: 'Yes! Our dashboard provides comprehensive analytics showing your performance trends, weak areas, and improvement over time across all tests.',
  },
];

/* ── Single FAQ item ── */
const FAQItem = ({ faq, index, openIndex, setOpenIndex }) => {
  const isOpen = openIndex === index;
  const [ref, visible] = useScrollVisible(index * 70);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
      className={`overflow-hidden rounded-xl border transition-shadow duration-300
                  ${isOpen
          ? 'border-blue-200 shadow-md shadow-blue-100/50'
          : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
        }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setOpenIndex(isOpen ? null : index)}
        className={`w-full flex items-center justify-between px-5 py-4 text-left gap-4 transition-colors duration-200
                    ${isOpen ? 'bg-white' : 'bg-white hover:bg-gray-50/80'}`}
        aria-expanded={isOpen}
      >
        {/* Left accent bar + question */}
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`flex-shrink-0 w-1 rounded-full self-stretch transition-colors duration-300
                        ${isOpen ? 'bg-gradient-to-b from-blue-500 to-violet-500' : 'bg-gray-200'}`}
            aria-hidden="true"
          />
          <span className={`font-semibold text-sm sm:text-base leading-snug ${isOpen ? 'text-blue-700' : 'text-gray-900'}`}>
            {faq.question}
          </span>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 transition-all duration-300
                      ${isOpen ? 'rotate-180 text-blue-600' : 'text-gray-400'}`}
        />
      </button>

      {/* Smooth accordion body — CSS max-height only (no extra opacity) */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? '300px' : '0px' }}
      >
        <div className="px-5 pb-5 pt-1 bg-blue-50/40 border-t border-blue-100">
          <p className="text-gray-600 text-sm leading-relaxed pl-4">{faq.answer}</p>
        </div>
      </div>
    </div>
  );
};

/* ── Main FAQ section ── */
const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [headerRef, headerVisible] = useScrollVisible(0);
  const [ctaRef, ctaVisible] = useScrollVisible(faqs.length * 70 + 100);

  return (
    <section id="faq-section" className="py-24 bg-white relative overflow-hidden">

      {/* Soft background blob */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-56 bg-violet-100/35 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">

        {/* ── Section header ── */}
        <div
          ref={headerRef}
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(18px)',
            transition: 'opacity 0.55s ease, transform 0.55s ease',
          }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-emerald-700 font-semibold">FAQs</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-gray-500 text-lg">
            Find answers to common questions about Logic Junior
          </p>
        </div>

        {/* ── Accordion ── */}
        <div className="space-y-3 mb-12">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              openIndex={openIndex}
              setOpenIndex={setOpenIndex}
            />
          ))}
        </div>

        {/* ── CTA card (gradient) ── */}
        <div
          ref={ctaRef}
          style={{
            opacity: ctaVisible ? 1 : 0,
            transform: ctaVisible ? 'translateY(0)' : 'translateY(18px)',
            transition: 'opacity 0.55s ease, transform 0.55s ease',
          }}
          className="rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="relative bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-8 text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/15 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-white font-bold text-lg mb-1">Still have questions?</p>
              <p className="text-white/70 text-sm mb-5">Our support team is happy to help you out</p>
              <a
                href="mailto:support@logicjunior.com"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                           bg-white text-blue-700 hover:bg-blue-50 transition-colors duration-200 shadow-lg"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FAQ;
