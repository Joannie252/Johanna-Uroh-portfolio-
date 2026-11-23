import React, { useState, useEffect } from 'react';
import { MentorshipProgramme } from '../types';
import { getMentorshipProgrammes, resolveAssetUrl } from '../lib/api';
import { Link } from '../lib/router';
import {
  Compass,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Code2,
  Users2,
  Target,
  Zap,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  DollarSign,
  ShieldCheck,
  Award
} from 'lucide-react';

export const MentorshipPage: React.FC = () => {
  const [programmes, setProgrammes] = useState<MentorshipProgramme[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMentorshipProgrammes();
        setProgrammes(data);
      } catch (err: any) {
        console.error('Failed to load mentorship programmes:', err);
        setError('Failed to load mentorship programmes from the database.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const scrollToCatalog = () => {
    const el = document.getElementById('mentorship-catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'Who is this mentorship suited for?',
      a: 'This mentorship is built for beginners seeking clear, practical guidance without fluff, self-taught developers needing real accountability, designers expanding into frontend code, and career switchers aiming to build impressive, database-backed portfolio projects.',
    },
    {
      q: 'What happens after I submit my application?',
      a: 'We carefully review each application within 24 to 48 hours to evaluate your current skill level, availability, and learning goals. If there is a strong mutual fit, you will receive a direct message via WhatsApp or email with your onboarding details and kickoff schedule.',
    },
    {
      q: 'How are the sessions and communication structured?',
      a: 'Programmes combine interactive live video sessions (code walk-throughs, architecture planning, live debugging) with continuous asynchronous support via a dedicated private WhatsApp/Telegram chat for code reviews and rapid Q&A.',
    },
    {
      q: 'Do I need prior coding experience to join?',
      a: 'Not for our Beginner Web & Digital Foundations programme! We start from fundamental principles and build up your skills through hands-on practice. For Growth and 1-on-1 programmes, basic familiarity with HTML/CSS or JavaScript is recommended.',
    },
    {
      q: 'Will I receive feedback on my projects and code?',
      a: 'Yes, absolutely. Detailed code and portfolio reviews are a core pillar of our mentorship. Every milestone submission receives actionable feedback on code quality, design polish, Git commit cleanliness, and best practices.',
    },
  ];

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b143f] via-[#120d2a] to-[#0a0a14] text-white p-8 sm:p-12 md:p-16 mb-16 shadow-2xl border border-purple-500/25">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-purple-200 border border-white/15 backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-purple-300" />
              <span>Skills Mentorship &amp; Hands-On Coaching</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white font-display leading-[1.1]">
              Learn. Build. Grow.
            </h1>

            <p className="text-zinc-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl font-light">
              Practical mentorship designed to help you develop valuable digital skills, build confidence, create real projects and position yourself for opportunities.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <button
                id="explore-mentorship-cta"
                type="button"
                onClick={scrollToCatalog}
                className="btn-neon-primary neon-pulse px-6 py-3.5 text-sm"
              >
                <span>Explore Mentorship</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-xs text-zinc-400 flex items-center gap-2 pl-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Small cohorts &amp; dedicated 1-on-1 attention</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Value Proposition / Core Pillars */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">
              Why Mentorship Matters
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Move Beyond Tutorial Hell Into Real Engineering
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-3">
              Most online tutorials teach passive watching. Our practical mentorship focuses on intentional building, direct feedback, and career-defining proof of work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">Hands-on Project Building</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Work on functional, database-backed web applications and production workflows from week one.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">Line-by-Line Code Reviews</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Receive thorough PR feedback on architecture, readability, type-safety, and real deployment habits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Users2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">Continuous Accountability</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Weekly check-ins and direct async messaging keep you focused, motivated, and consistently unblocked.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">Opportunity Positioning</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Refine your portfolio, sharpen your technical resume, and prepare for interviews or freelance clients.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Programmes Catalog */}
        <div id="mentorship-catalog" className="scroll-mt-28 mb-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Available Programmes
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
                Choose Your Mentorship Track
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-right max-w-xs">
              Every track includes structured milestones, live sessions, and dedicated project mentoring.
            </p>
          </div>

          {error && (
            <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300 text-sm text-center mb-8">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] p-6 space-y-4 animate-pulse"
                >
                  <div className="h-56 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-16 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                </div>
              ))}
            </div>
          ) : programmes.length === 0 ? (
            <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
              <Compass className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                No active mentorship programmes listed
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                Check back shortly as upcoming cohort openings and dates are published regularly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {programmes.map((prog) => (
                <div
                  key={prog.id}
                  id={`programme-card-${prog.slug}`}
                  className={`relative flex flex-col rounded-3xl bg-white dark:bg-[#12141a] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
                    prog.featured
                      ? 'border-purple-500/60 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/40'
                      : 'border-zinc-200 dark:border-zinc-800/90'
                  }`}
                >
                  {/* Top Cover Image */}
                  <div className="relative h-52 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    <img
                      src={resolveAssetUrl(prog.coverImage)}
                      alt={prog.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Featured Pill */}
                    {prog.featured && (
                      <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold shadow-md">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Recommended Cohort</span>
                      </div>
                    )}

                    {/* Pricing Badge */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                      <div>
                        <span className="text-2xl font-black tracking-tight">
                          {prog.price > 0 ? `$${prog.price}` : 'Free / Scholarship'}
                        </span>
                        {prog.price > 0 && (
                          <span className="text-xs text-zinc-300 font-medium ml-1">
                            {prog.currency}
                          </span>
                        )}
                      </div>
                      <div className="text-xs bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 font-medium">
                        {prog.duration}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                        {prog.name}
                      </h3>

                      <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                        {prog.shortDescription}
                      </p>

                      {/* Meta Pills */}
                      <div className="pt-2 space-y-2 border-t border-zinc-100 dark:border-zinc-800/80">
                        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                          <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span><strong>Format:</strong> {prog.format}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                          <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span><strong>Sessions:</strong> {prog.sessions}</span>
                        </div>
                      </div>

                      {/* Included Highlights Preview */}
                      {prog.includedFeatures && prog.includedFeatures.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1.5">
                            Key Highlights:
                          </span>
                          <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                            {prog.includedFeatures.slice(0, 3).map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2.5">
                      <Link
                        id={`view-details-${prog.slug}`}
                        to={`/mentorship/${prog.slug}`}
                        className="btn-neon-secondary flex-1 py-2.5 px-3 text-xs font-semibold text-center"
                      >
                        View Details
                      </Link>

                      {prog.applicationEnabled ? (
                        <Link
                          id={`apply-now-${prog.slug}`}
                          to={`/mentorship/${prog.slug}/apply`}
                          className="btn-neon-primary flex-1 py-2.5 px-3 text-xs font-semibold text-center shadow-md flex items-center justify-center gap-1"
                        >
                          <span>Apply Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs font-semibold text-center cursor-not-allowed">
                          Cohort Full
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Mentorship Process / How It Works */}
        <div className="mb-24 rounded-3xl bg-zinc-50 dark:bg-[#0f1016] border border-zinc-200 dark:border-zinc-800/80 p-8 sm:p-12">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              The Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
              How The Mentorship Works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              A structured roadmap crafted to turn theoretical concepts into tangible, demonstrable capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#151722] border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
              <div className="text-purple-600 dark:text-purple-400 font-extrabold text-2xl">01</div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Apply &amp; Set Goals</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Submit your background and objectives so we can customize your milestones and match the right track.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#151722] border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
              <div className="text-purple-600 dark:text-purple-400 font-extrabold text-2xl">02</div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Onboarding &amp; Setup</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Gain access to the curriculum, private messaging community, schedule, and initial starter assets.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#151722] border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
              <div className="text-purple-600 dark:text-purple-400 font-extrabold text-2xl">03</div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Weekly Build Labs</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Attend interactive live sessions, write code, implement features, and receive feedback on your PRs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#151722] border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
              <div className="text-purple-600 dark:text-purple-400 font-extrabold text-2xl">04</div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Ship &amp; Position</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Graduate with a production-deployed flagship project, optimized portfolio, and clear career positioning.
              </p>
            </div>
          </div>
        </div>

        {/* 5. FAQ Section */}
        <div className="mb-24 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-semibold text-zinc-900 dark:text-white text-sm focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-purple-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Final Call to Action */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
              Ready to Accelerate Your Digital Skills?
            </h2>
            <p className="text-sm sm:text-base text-purple-100 max-w-lg mx-auto">
              Cohort sizes are intentionally kept intimate to guarantee hands-on attention. Submit your application today to secure your spot.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={scrollToCatalog}
                className="px-8 py-3.5 rounded-xl bg-white text-purple-900 hover:bg-zinc-100 font-bold text-sm shadow-xl hover:shadow-[0_0_24px_rgba(255,255,255,0.4)] hover:scale-[1.03] active:scale-[0.97] transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Browse Programmes &amp; Apply</span>
                <ArrowRight className="w-4 h-4 text-purple-900" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
