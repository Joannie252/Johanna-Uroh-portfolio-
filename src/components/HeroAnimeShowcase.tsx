import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSiteSettings } from '../context/SettingsContext';

export const PORTFOLIO_ROLES = [
  'AI & Prompt Engineering Specialist',
  'Executive Virtual Assistant',
  'Web Developer & Vibe Coder',
  'Content Strategist & Copywriter',
  'Digital Skills Mentor',
  'Financial Education Advocate',
] as const;

export const HeroAnimeShowcase: React.FC = () => {
  const { settings } = useSiteSettings();
  const animationIntensity = settings.features?.animationIntensity || 'Full';

  const [roleIndex, setRoleIndex] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [blinkGlow, setBlinkGlow] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const effectiveMotion: 'Full' | 'Reduced' | 'Off' = prefersReducedMotion
    ? 'Reduced'
    : animationIntensity;

  const clearAllTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const triggerBlinkToRole = (nextIndex?: number) => {
    if (effectiveMotion === 'Off') {
      if (typeof nextIndex === 'number') {
        setRoleIndex(nextIndex);
      } else {
        setRoleIndex((prev) => (prev + 1) % PORTFOLIO_ROLES.length);
      }
      return;
    }

    // Smooth blink cycle: close eyelids -> switch role at peak closure -> open eyelids
    setIsBlinking(true);
    setBlinkGlow(true);

    const swapTimer = window.setTimeout(() => {
      setRoleIndex((prev) =>
        typeof nextIndex === 'number' ? nextIndex : (prev + 1) % PORTFOLIO_ROLES.length
      );
    }, 105);

    const openTimer = window.setTimeout(() => {
      setIsBlinking(false);
    }, 200);

    const glowTimer = window.setTimeout(() => {
      setBlinkGlow(false);
    }, 520);

    timersRef.current.push(swapTimer, openTimer, glowTimer);
  };

  useEffect(() => {
    clearAllTimers();
    if (effectiveMotion === 'Off' || isPaused) {
      return;
    }

    const intervalMs = effectiveMotion === 'Reduced' ? 4000 : 3000;
    const intervalId = window.setInterval(() => {
      triggerBlinkToRole();
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
      clearAllTimers();
    };
  }, [effectiveMotion, isPaused]);

  const currentRole = PORTFOLIO_ROLES[roleIndex];

  return (
    <div
      className="relative rounded-3xl border border-purple-200/70 dark:border-purple-500/25 bg-white/85 dark:bg-[#12141e]/85 backdrop-blur-md shadow-xl shadow-purple-950/5 dark:shadow-purple-950/30 p-5 sm:p-6 lg:px-8 lg:py-6 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Refined ambient cartoon aura behind character */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -left-10 -top-12 w-72 h-72 rounded-full blur-3xl transition-opacity duration-500 ${
          blinkGlow
            ? 'bg-purple-500/30 dark:bg-purple-500/40 opacity-100'
            : 'bg-purple-500/15 dark:bg-purple-600/25 opacity-80'
        }`}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 w-80 h-56 bg-violet-500/10 dark:bg-indigo-500/15 blur-3xl rounded-full"
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 lg:gap-9">
        {/* Stylized 3D Anime / Cartoon Character Stage */}
        <div className="relative shrink-0 flex items-center justify-center">
          {/* Outer Cartoon Rim Halo */}
          <div
            aria-hidden="true"
            className={`absolute inset-1 rounded-full transition-all duration-300 ${
              blinkGlow
                ? 'bg-gradient-to-tr from-purple-500/45 via-violet-400/35 to-indigo-400/40 blur-lg scale-105'
                : 'bg-gradient-to-tr from-purple-500/25 via-violet-400/15 to-indigo-400/20 blur-md scale-100'
            }`}
          />

          {/* Floating Character Frame */}
          <motion.div
            animate={
              effectiveMotion === 'Full'
                ? { y: [0, -5, 0] }
                : { y: 0 }
            }
            transition={
              effectiveMotion === 'Full'
                ? { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }
                : undefined
            }
            onClick={() => triggerBlinkToRole()}
            role="button"
            tabIndex={0}
            aria-label="Animated character showcase — click to preview next role"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerBlinkToRole();
              }
            }}
            className={`relative w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full p-1 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-shadow duration-300 ${
              blinkGlow
                ? 'shadow-[0_0_28px_rgba(168,85,247,0.55)] ring-2 ring-purple-400/80 dark:ring-purple-400/70'
                : 'shadow-[0_0_18px_rgba(147,51,234,0.28)] ring-1 ring-purple-300/80 dark:ring-purple-500/40'
            } bg-gradient-to-b from-purple-100 via-violet-50 to-white dark:from-[#1f1b38] dark:via-[#17152b] dark:to-[#11121c]`}
          >
            {/* Inner Circular Portrait Canvas */}
            <div className="w-full h-full rounded-full overflow-hidden relative bg-gradient-to-b from-violet-100/80 via-purple-50/70 to-white dark:from-[#211b3d] dark:via-[#161428] dark:to-[#0f1018]">
              <svg
                viewBox="0 0 220 220"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* 3D Volumetric Skin Shading (Light-Skinned Warm Ivory-Peach) */}
                  <radialGradient id="animeSkinGrad" cx="46%" cy="38%" r="62%">
                    <stop offset="0%" stopColor="#FFF0E8" />
                    <stop offset="58%" stopColor="#FFE1D2" />
                    <stop offset="88%" stopColor="#F7C7B2" />
                    <stop offset="100%" stopColor="#EBB098" />
                  </radialGradient>

                  <linearGradient id="neckShadowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E4A78F" />
                    <stop offset="65%" stopColor="#FAD5C5" />
                    <stop offset="100%" stopColor="#FFE4D6" />
                  </linearGradient>

                  {/* 3D Soft Cheek Blush */}
                  <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FF8E9E" stopOpacity="0.48" />
                    <stop offset="70%" stopColor="#FF9EAB" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#FF9EAB" stopOpacity="0" />
                  </radialGradient>

                  {/* Hair 3D Cel-Shading (Rich Espresso-Violet) */}
                  <linearGradient id="hairMainGrad" x1="0.2" y1="0" x2="0.8" y2="1">
                    <stop offset="0%" stopColor="#3B2B58" />
                    <stop offset="45%" stopColor="#261B3B" />
                    <stop offset="100%" stopColor="#160F24" />
                  </linearGradient>

                  <linearGradient id="hairHighlightGrad" x1="0" y1="0" x2="1" y2="0.4">
                    <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.55" />
                    <stop offset="50%" stopColor="#DDD6FE" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.25" />
                  </linearGradient>

                  {/* 3D Anime Iris Gradient */}
                  <linearGradient id="irisGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2E1065" />
                    <stop offset="45%" stopColor="#6D28D9" />
                    <stop offset="82%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#DDD6FE" />
                  </linearGradient>

                  {/* Executive Blazer 3D Gradient */}
                  <linearGradient id="blazerGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#312E4A" />
                    <stop offset="55%" stopColor="#1E1B30" />
                    <stop offset="100%" stopColor="#131120" />
                  </linearGradient>

                  {/* Rim Glow Filter */}
                  <filter id="cartoonRimGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#A855F7" floodOpacity="0.5" />
                  </filter>
                </defs>

                {/* Subtle Studio Backlight Halo */}
                <circle cx="110" cy="102" r="76" fill="#A855F7" fillOpacity="0.12" />
                <circle cx="110" cy="102" r="58" fill="#C4B5FD" fillOpacity="0.14" />

                {/* Back Hair Volume */}
                <path
                  d="M48 98 C44 52, 74 28, 110 28 C146 28, 176 52, 172 98 C176 135, 168 164, 152 178 C142 162, 134 156, 110 156 C86 156, 78 162, 68 178 C52 164, 44 135, 48 98 Z"
                  fill="url(#hairMainGrad)"
                  filter="url(#cartoonRimGlow)"
                />

                {/* Torso & Executive Blazer (subtle breathing animation) */}
                <g
                  style={{
                    transformOrigin: '110px 195px',
                    transform:
                      effectiveMotion === 'Full'
                        ? blinkGlow
                          ? 'scale(1.015)'
                          : 'scale(1)'
                        : 'scale(1)',
                    transition: 'transform 350ms ease',
                  }}
                >
                  {/* Blazer Shoulders */}
                  <path
                    d="M36 222 C40 182, 66 164, 92 161 L128 161 C154 164, 180 182, 184 222 Z"
                    fill="url(#blazerGrad)"
                    stroke="#7C3AED"
                    strokeOpacity="0.35"
                    strokeWidth="1.5"
                  />
                  {/* Crisp Ivory Mock-Neck Inner Top */}
                  <path
                    d="M89 161 L110 198 L131 161 Z"
                    fill="#F8FAFC"
                  />
                  {/* Blazer Lapels */}
                  <path
                    d="M89 161 L77 182 L94 190 L110 214 L106 184 Z"
                    fill="#3B355C"
                    stroke="#6D28D9"
                    strokeOpacity="0.3"
                    strokeWidth="1"
                  />
                  <path
                    d="M131 161 L143 182 L126 190 L110 214 L114 184 Z"
                    fill="#3B355C"
                    stroke="#6D28D9"
                    strokeOpacity="0.3"
                    strokeWidth="1"
                  />
                  {/* Subtle Violet Lapel Spark Pin */}
                  <circle cx="136" cy="186" r="3.4" fill="#A855F7" />
                  <circle cx="135" cy="185" r="1.2" fill="#F5F3FF" />
                </g>

                {/* Neck */}
                <path
                  d="M96 138 L96 164 C96 171, 124 171, 124 164 L124 138 Z"
                  fill="url(#neckShadowGrad)"
                />

                {/* Ears */}
                <ellipse cx="64" cy="108" rx="7.5" ry="11.5" fill="#F8CBB6" />
                <ellipse cx="65" cy="109" rx="3.5" ry="6" fill="#E9AE96" opacity="0.6" />
                <ellipse cx="156" cy="108" rx="7.5" ry="11.5" fill="#F8CBB6" />
                <ellipse cx="155" cy="109" rx="3.5" ry="6" fill="#E9AE96" opacity="0.6" />

                {/* 3D Anime Head / Face */}
                <path
                  d="M65 86 C65 56, 86 44, 110 44 C134 44, 155 56, 155 86 C155 118, 140 144, 110 148 C80 144, 65 118, 65 86 Z"
                  fill="url(#animeSkinGrad)"
                  stroke="#E8AC95"
                  strokeWidth="1"
                />

                {/* Warm Cheek Blush */}
                <ellipse cx="81" cy="116" rx="11" ry="6.5" fill="url(#cheekBlush)" />
                <ellipse cx="139" cy="116" rx="11" ry="6.5" fill="url(#cheekBlush)" />

                {/* Soft Anime Nose */}
                <path
                  d="M109 107 Q112 111 108 114"
                  fill="none"
                  stroke="#D9947A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                {/* Friendly Confident Smile */}
                <path
                  d="M96 123 Q110 134 124 123"
                  fill="none"
                  stroke="#B85D5B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Subtle Smile Highlight */}
                <path
                  d="M104 131 Q110 134 116 131"
                  fill="none"
                  stroke="#FFF5F0"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  opacity="0.8"
                />

                {/* Eyebrows */}
                <path
                  d="M78 86 Q89 81 99 85"
                  fill="none"
                  stroke="#2B1E42"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                />
                <path
                  d="M121 85 Q131 81 142 86"
                  fill="none"
                  stroke="#2B1E42"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                />

                {/* LEFT EYE */}
                <g>
                  {isBlinking ? (
                    /* Cheerful Closed Blink Arc */
                    <path
                      d="M78 103 Q89 96 100 103"
                      fill="none"
                      stroke="#1F1433"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                  ) : (
                    <>
                      {/* Sclera */}
                      <ellipse cx="89" cy="102" rx="10.5" ry="11.5" fill="#FFFFFF" />
                      {/* 3D Iris */}
                      <ellipse cx="89.5" cy="102.5" rx="7.6" ry="9.2" fill="url(#irisGrad)" />
                      {/* Pupil */}
                      <ellipse cx="89.5" cy="102" rx="3.7" ry="4.5" fill="#17092E" />
                      {/* Glossy Anime Catchlights */}
                      <circle cx="86" cy="98" r="2.7" fill="#FFFFFF" />
                      <circle cx="93" cy="107" r="1.3" fill="#FFFFFF" opacity="0.9" />
                      {/* Upper Eyelash Line */}
                      <path
                        d="M77 98 Q89 89 101 99"
                        fill="none"
                        stroke="#1B102E"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                      />
                      {/* Subtle Lower Lid */}
                      <path
                        d="M82 113 Q89 115 96 113"
                        fill="none"
                        stroke="#D49A86"
                        strokeWidth="1.1"
                        strokeLinecap="round"
                      />
                    </>
                  )}
                </g>

                {/* RIGHT EYE */}
                <g>
                  {isBlinking ? (
                    /* Cheerful Closed Blink Arc */
                    <path
                      d="M120 103 Q131 96 142 103"
                      fill="none"
                      stroke="#1F1433"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                  ) : (
                    <>
                      {/* Sclera */}
                      <ellipse cx="131" cy="102" rx="10.5" ry="11.5" fill="#FFFFFF" />
                      {/* 3D Iris */}
                      <ellipse cx="130.5" cy="102.5" rx="7.6" ry="9.2" fill="url(#irisGrad)" />
                      {/* Pupil */}
                      <ellipse cx="130.5" cy="102" rx="3.7" ry="4.5" fill="#17092E" />
                      {/* Glossy Anime Catchlights */}
                      <circle cx="127" cy="98" r="2.7" fill="#FFFFFF" />
                      <circle cx="134" cy="107" r="1.3" fill="#FFFFFF" opacity="0.9" />
                      {/* Upper Eyelash Line */}
                      <path
                        d="M119 99 Q131 89 143 98"
                        fill="none"
                        stroke="#1B102E"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                      />
                      {/* Subtle Lower Lid */}
                      <path
                        d="M124 113 Q131 115 138 113"
                        fill="none"
                        stroke="#D49A86"
                        strokeWidth="1.1"
                        strokeLinecap="round"
                      />
                    </>
                  )}
                </g>

                {/* Front Hair Bangs & Side Framing Strands */}
                <path
                  d="M60 94 C60 52, 82 32, 110 32 C138 32, 160 52, 160 94 C157 74, 148 64, 136 62 C138 72, 134 82, 126 86 C125 74, 119 64, 110 58 C104 70, 95 79, 86 84 C84 72, 78 65, 72 64 C66 72, 62 82, 60 94 Z"
                  fill="url(#hairMainGrad)"
                />
                {/* Side Locks Framing Cheekbones */}
                <path
                  d="M61 78 C56 102, 58 128, 68 148 C65 126, 65 104, 67 84 Z"
                  fill="#261B3B"
                />
                <path
                  d="M159 78 C164 102, 162 128, 152 148 C155 126, 155 104, 153 84 Z"
                  fill="#261B3B"
                />

                {/* 3D Anime Hair Specular Shine Ribbon */}
                <path
                  d="M78 52 Q96 42 116 46 Q104 51 86 57 Z"
                  fill="url(#hairHighlightGrad)"
                />
                <path
                  d="M124 48 Q138 51 146 60 Q134 56 122 53 Z"
                  fill="url(#hairHighlightGrad)"
                  opacity="0.75"
                />
              </svg>
            </div>
          </motion.div>

          {/* Subtle Cartoon Sparkle Accents */}
          {effectiveMotion === 'Full' && (
            <>
              <motion.svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-purple-500 dark:text-purple-300 absolute -top-1 right-1 pointer-events-none"
                animate={{
                  scale: blinkGlow ? [1, 1.35, 1] : [0.9, 1.1, 0.9],
                  opacity: blinkGlow ? [0.8, 1, 0.8] : [0.45, 0.85, 0.45],
                }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path
                  fill="currentColor"
                  d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8Z"
                />
              </motion.svg>
              <motion.svg
                viewBox="0 0 24 24"
                className="w-3 h-3 text-violet-400 dark:text-violet-300 absolute bottom-2 -left-1 pointer-events-none"
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.35, 0.75, 0.35],
                }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              >
                <path
                  fill="currentColor"
                  d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8Z"
                />
              </motion.svg>
            </>
          )}
        </div>

        {/* Sequential Role Display Column */}
        <div className="flex-1 min-w-0 text-center md:text-left space-y-3">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-semibold text-purple-700 dark:text-purple-300">
            <span>Multi-Disciplinary Digital Specialist</span>
            <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-600">·</span>
            <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
              Role {String(roleIndex + 1).padStart(2, '0')} of {String(PORTFOLIO_ROLES.length).padStart(2, '0')}
            </span>
          </div>

          {/* Animated Role Title synced to Character Blink */}
          <div className="min-h-[3rem] sm:min-h-[3.25rem] flex items-center justify-center md:justify-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentRole}
                initial={
                  effectiveMotion === 'Off'
                    ? false
                    : { opacity: 0, y: 8, filter: 'blur(3px)' }
                }
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={
                  effectiveMotion === 'Off'
                    ? undefined
                    : { opacity: 0, y: -8, filter: 'blur(3px)' }
                }
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
              >
                <span
                  className="font-hero-headline text-2xl sm:text-3xl lg:text-[2.15rem] font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-purple-700 to-violet-600 dark:from-white dark:via-purple-200 dark:to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(168,85,247,0.22)] dark:drop-shadow-[0_0_20px_rgba(168,85,247,0.38)]"
                >
                  {currentRole}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Interactive Role Sequence Strip (All 6 Roles Clickable & High-Contrast) */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
            {PORTFOLIO_ROLES.map((role, idx) => {
              const isActive = idx === roleIndex;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => triggerBlinkToRole(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-[0_0_14px_rgba(147,51,234,0.45)]'
                      : 'bg-zinc-100/90 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-700 dark:hover:text-purple-300'
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
