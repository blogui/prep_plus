import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, BarChart3, LogOut, User, ChevronDown, Menu, X, Shield } from 'lucide-react';

const Navbar = ({ user, onLogout, onLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Detect scroll to toggle glass effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const navigate = useNavigate();

  // Scroll to a section id — navigates to home first if needed
  const scrollToSection = (sectionId) => {
    setMobileOpen(false);
    const doScroll = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        const navbarHeight = 64; // matches h-16
        const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };
    if (location.pathname === '/') {
      doScroll();
    } else {
      navigate('/');
      // Wait one tick for the home page to mount, then scroll
      setTimeout(doScroll, 80);
    }
  };

  const isActive = (to) => location.pathname === to;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/85 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-gray-200/60'
        : 'bg-slate-900/70 backdrop-blur-md border-b border-white/10'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-md shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow duration-300">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Prep<span className={isScrolled ? 'text-gray-900' : 'text-white'}>Plus</span>
            </span>
          </Link>

          {/* ── Right Side Actions (Nav + Login/Avatar) ── */}
          <div className="hidden md:flex items-center gap-1">
            {/* Scroll nav links */}
            {[{ label: 'Tests', section: 'test-series-section' }, { label: 'FAQ', section: 'faq-section' }].map(({ label, section }) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isScrolled
                  ? 'text-gray-600 hover:text-blue-600 hover:bg-gray-100/80'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
              >
                {label}
              </button>
            ))}
            {user && (
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/dashboard')
                  ? isScrolled ? 'text-blue-600 bg-blue-50' : 'text-white bg-white/15'
                  : isScrolled ? 'text-gray-600 hover:text-blue-600 hover:bg-gray-100/80' : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
              >
                Dashboard
              </Link>
            )}
            {/* Separator */}
            <div className={`w-px h-5 mx-2 ${isScrolled ? 'bg-gray-200' : 'bg-white/20'}`} />
            {user ? (
              <>
                {/* Admin badge */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-100 hover:bg-violet-200 rounded-lg transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}

                {/* Avatar dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl border transition-all duration-200 ${isScrolled
                      ? 'border-gray-200/80 bg-white/70 hover:bg-white hover:border-gray-300 hover:shadow-sm'
                      : 'border-white/20 bg-white/10 hover:bg-white/20'
                      }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/30"
                    />
                    <span className={`text-sm font-medium max-w-[120px] truncate ${isScrolled ? 'text-gray-700' : 'text-white'
                      }`}>
                      {user.name}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''} ${isScrolled ? 'text-gray-400' : 'text-white/60'}`}
                    />
                  </button>

                  {/* Dropdown panel */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/10 border border-gray-100 py-1.5 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                        <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <div className="border-t border-gray-100 mt-1">
                        <button
                          onClick={() => { setDropdownOpen(false); onLogout(); }}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={onLogin}
                className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 overflow-hidden group"
              >
                {/* Shine sweep on hover */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out" />
                <User className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Login / Sign Up</span>
              </button>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled
              ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu panel ── */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-4 space-y-1 shadow-xl">
          {/* Scroll nav items */}
          {[{ label: 'Tests', section: 'test-series-section' }, { label: 'FAQ', section: 'faq-section' }].map(({ label, section }) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            >
              {label}
            </button>
          ))}
          {/* Dashboard — auth only */}
          {user && (
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
            >
              Dashboard
            </Link>
          )}

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-violet-700 hover:bg-violet-50 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={onLogin}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 shadow-md shadow-blue-500/30 transition-all"
              >
                <User className="w-4 h-4" />
                Login / Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;