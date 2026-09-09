import React, { useState, useEffect } from 'react';
import { Link, useRouter } from '../lib/router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Menu, X, Shield, ArrowRight, Search } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { path } = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Work', href: '/work' },
    { name: 'Resources', href: '/resources' },
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
          ? 'bg-[#0b0c10]/85 dark:bg-[#0b0c10]/85 bg-white/85 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-violet-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
            JU
          </div>
          <div>
            <span className="font-semibold text-lg tracking-tight text-zinc-900 dark:text-zinc-100 block leading-tight">
              Johanna Uroh
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium tracking-wide block">
              Digital Specialist &amp; AI
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
                    : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
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
            className="p-2.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-700" />}
          </button>

          {/* Admin CMS Access */}
          <Link
            id="admin-cms-nav-btn"
            to="/admin"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isAuthenticated
                ? 'bg-purple-600/10 text-purple-600 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-600/20'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
            }`}
            title="Content Management System"
          >
            <Shield className="w-3.5 h-3.5 text-purple-500" />
            <span>{isAuthenticated ? 'Admin CMS' : 'CMS Portal'}</span>
          </Link>

          {/* Contact CTA */}
          <Link
            id="nav-contact-cta"
            to="/contact"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium shadow-sm shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-purple-500/40 text-purple-600 dark:text-purple-400 text-sm font-medium"
            >
              <Shield className="w-4 h-4" />
              <span>Admin CMS Dashboard</span>
            </Link>
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
