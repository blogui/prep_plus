import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  MapPin,
  Phone,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MessageCircle,
  BookOpen,
  ShieldCheck,
  Lock,
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  // Same pattern as Navbar — navigate to home first if needed, then scroll
  const scrollToSection = (sectionId) => {
    const doScroll = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        const navbarHeight = 64;
        const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };
    if (location.pathname === '/') {
      doScroll();
    } else {
      navigate('/');
      setTimeout(doScroll, 80);
    }
  };

  // ── Platform-specific link columns (Suggestion 3) ──
  const footerLinks = {
    Platform: [
      { label: 'All Tests', href: '#test-series-section' },
      { label: 'Free Tests', href: '#test-series-section' },
      { label: 'Premium Plans', href: '#', to: '/payment' },
      // { label: 'Leaderboard', href: '#' },
    ],
    Learn: [
      { label: 'Study Material', href: '#', to: '/study-material' },
      { label: 'Syllabus', href: '#', to: '/syllabus' },
      // { label: 'Tips & Tricks', href: '#' },
      { label: 'Blog', href: '#' },
    ],
    Support: [
      { label: 'Help Center', href: '#', to: '/help-center' },
      { label: 'Contact Us', href: '#', to: '/contact-support' },
      { label: 'FAQs', href: '#', scrollTo: 'faq-section' },
      // { label: 'Report a Bug', href: '#', to: '/report-a-bug' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '#', to: '/privacy-policy' },
      { label: 'Terms of Service', href: '#', to: '/terms-of-service' },
      { label: 'Refund Policy', href: '#', to: '/refund-policy' },
      { label: 'Cookie Policy', href: '#', to: '/cookie-policy' },
    ],
  };

  // ── Social links with safe external attributes (Suggestion 5) ──
  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: MessageCircle, label: 'WhatsApp', href: '#' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 w-full" role="contentinfo">
      <div className="px-4 pt-16 pb-0">

        {/* ── Main Footer Grid ── */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">

          {/* ── Brand Section (Suggestion 1) ── */}
          <div className="lg:col-span-2">

            {/* Logo mark — mirrors the Navbar design */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 flex-shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Prep</span>
                <span className="text-white">Plus</span>
              </span>
            </div>

            {/* Accent separator line */}
            <div className="h-px mb-4 bg-gradient-to-r from-blue-500/40 via-violet-500/20 to-transparent rounded-full" />

            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Empowering students with expert-crafted tests and personalised learning experiences.
            </p>

            {/* Contact info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">support@logicjunior.com</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">India 🇮🇳</span>
              </div>
            </div>
          </div>

          {/* ── Link Columns ── */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        aria-label={link.label}
                        className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    ) : link.scrollTo ? (
                      <button
                        onClick={() => scrollToSection(link.scrollTo)}
                        aria-label={link.label}
                        className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 text-left"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        aria-label={link.label}
                        className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Gradient Divider (Suggestion 6) ── */}
        <div className="max-w-7xl mx-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
        </div>

        {/* ── Bottom Bar (Suggestion 6) ── */}
        <div className="max-w-7xl mx-auto py-6 flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Copyright + Trust Badges */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} Prep Plus. All rights reserved.
            </p>
            {/* Trust badges */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-800 border border-gray-700 rounded-full px-2.5 py-1">
                <Lock className="w-3 h-3 text-green-400" />
                SSL Secured
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-800 border border-gray-700 rounded-full px-2.5 py-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                Razorpay
              </span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:inline">Follow us</span>
            <div className="flex gap-2">
              {socialLinks.map(({ icon: Icon, label, href }, index) => (
                <a
                  key={index}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
