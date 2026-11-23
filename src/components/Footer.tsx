import React from 'react';
import { Link } from '../lib/router';
import { Mail, Heart } from 'lucide-react';
import { useSiteSettings } from '../context/SettingsContext';
import { resolveAssetUrl } from '../lib/api';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useSiteSettings();

  const displayName = settings.profile?.name || 'Johanna Uroh';
  const logoImage = settings.profile?.logoImage;
  const displayBio = settings.profile?.bio || 'Digital professional exploring the intersection of AI, technology, content, virtual assistance, and practical digital skills. Building real, database-backed digital solutions for businesses and visionary leaders.';
  const displayEmail = settings.profile?.email || 'urohjohanna25@gmail.com';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'JU';

  return (
    <footer className="bg-zinc-100 dark:bg-[#08090c] border-t border-zinc-200 dark:border-zinc-800/80 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Bio Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-tr from-purple-600 to-violet-400 flex items-center justify-center text-white font-bold text-sm">
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
              <span className="font-semibold text-lg text-zinc-900 dark:text-white">
                {displayName}
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-md leading-relaxed">
              {displayBio}
            </p>
            <div className="pt-2 flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
              <Mail className="w-4 h-4 text-purple-500" />
              <a href={`mailto:${displayEmail}`} className="link-neon">
                {displayEmail}
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link to="/" className="link-neon">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/work" className="link-neon">
                  Featured &amp; All Work
                </Link>
              </li>
              <li>
                <Link to="/resources" className="link-neon">
                  Digital Resources
                </Link>
              </li>
              <li>
                <Link to="/mentorship" className="link-neon">
                  Skills Mentorship
                </Link>
              </li>
              <li>
                <Link to="/services" className="link-neon">
                  Services Offered
                </Link>
              </li>
              <li>
                <Link to="/about" className="link-neon">
                  About &amp; Journey
                </Link>
              </li>
              <li>
                <Link to="/contact" className="link-neon">
                  Get In Touch
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <p>© {currentYear} {displayName}. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with intentional design and dynamic database</span>
            <Heart className="w-3 h-3 text-purple-500 fill-purple-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
