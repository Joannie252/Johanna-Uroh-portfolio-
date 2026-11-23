import React, { useState, useEffect, useRef } from 'react';
import { Link, useRouter } from '../lib/router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SettingsContext';
import { resolveAssetUrl } from '../lib/api';
import { Sun, Moon, Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { path, navigate } = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { settings } = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const displayName = settings.profile?.name || 'Johanna Uroh';
  const logoImage = settings.profile?.logoImage;
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'JU';
  const displayHeadline = settings.profile?.headline || 'Digital Specialist & AI';

  // 3-second long-press secret admin trigger on Johanna Uroh logo
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef(false);

  const startHold = () => {
    longPressTriggeredRef.current = false;
    setIsHolding(true);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }
    holdTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      setIsHolding(false);
      navigate(isAuthenticated ? '/admin' : '/admin/login');
    }, 3000);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (longPressTriggeredRef.current) {
      e.preventDefault();
      e.stopPropagation();
      longPressTriggeredRef.current = false;
      return;
    }
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  const navLinks = [
    { name: 'Work', href: '/work' },
    { name: 'Resources', href: '/resources' },
    { name: 'Mentorship', href: '/mentorship' },
    { name: 'Services', href: '/services' },
    { name: 'Search', href: '/search' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const currentPath = path.split('?')[0];

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 dark:bg-[#0b0c10]/85 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand / Secret Admin Access (Click & Hold for 3s) */}
        <div
          id="brand-logo-trigger"
          className="relative group flex items-center gap-3 cursor-pointer select-none"
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          onTouchCancel={cancelHold}
          onContextMenu={(e) => {
            if (isHolding || longPressTriggeredRef.current) {
              e.preventDefault();
            }
          }}
          onClick={handleLogoClick}
          title={displayName}
        >
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-purple-600 to-violet-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-purple-500/20 transition-all duration-200 ${
                isHolding
                  ? 'scale-95 shadow-[0_0_24px_rgba(168,85,247,0.7)] ring-2 ring-purple-400'
                  : 'group-hover:scale-105 group-hover:shadow-[0_0_16px_rgba(168,85,247,0.45)] group-active:scale-[0.98]'
              }`}
            >
              {logoImage ? (
                <img
                  key={logoImage}
                  src={resolveAssetUrl(logoImage)}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            {isHolding && (
              <svg className="absolute -inset-1 w-12 h-12 pointer-events-none -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="21"
                  fill="none"
                  stroke="currentColor"
                  className="text-purple-500 dark:text-purple-400"
                  strokeWidth="2.5"
                  strokeDasharray="132"
                  strokeDashoffset="132"
                  style={{
                    animation: 'hold-fill 3s linear forwards',
                  }}
                />
              </svg>
            )}
          </div>
          <div>
            <span className="font-semibold text-lg tracking-tight text-zinc-900 dark:text-zinc-100 block leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {displayName}
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium tracking-wide block truncate max-w-[200px]">
              {displayHeadline}
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`nav-item-neon px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 shadow-[0_0_12px_rgba(168,85,247,0.18)] border border-purple-200/60 dark:border-purple-800/50'
                    : 'text-zinc-600 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/25 border border-transparent'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right side items */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-purple-50/60 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-300 hover:shadow-[0_0_10px_rgba(168,85,247,0.2)] active:scale-[0.95] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-700" />}
          </button>

          {/* Contact CTA */}
          <Link
            id="nav-contact-cta"
            to="/contact"
            className="btn-neon-primary px-4 py-2 text-xs sm:text-sm shadow-sm"
          >
            <span>Let&apos;s Talk</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-700" />}
          </button>
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#121318] border-b border-zinc-200 dark:border-zinc-800 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-base font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium"
            >
              <span>Get In Touch</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
