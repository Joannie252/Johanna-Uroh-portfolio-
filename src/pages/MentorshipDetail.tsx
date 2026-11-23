import React, { useState, useEffect } from 'react';
import { MentorshipProgramme } from '../types';
import { getMentorshipProgrammeBySlug, getMentorshipProgrammes, resolveAssetUrl } from '../lib/api';
import { Link } from '../lib/router';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Users2,
  BookOpen,
  Award,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Code2,
  Target,
  Zap,
  DollarSign
} from 'lucide-react';

interface MentorshipDetailProps {
  slug: string;
}

export const MentorshipDetailPage: React.FC<MentorshipDetailProps> = ({ slug }) => {
  const [programme, setProgramme] = useState<MentorshipProgramme | null>(null);
  const [otherProgrammes, setOtherProgrammes] = useState<MentorshipProgramme[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProgramme() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMentorshipProgrammeBySlug(slug);
        setProgramme(data);

        // Load other programmes for suggestions
        const all = await getMentorshipProgrammes({ limit: 4 });
        setOtherProgrammes(all.filter((p) => p.id !== data.id).slice(0, 2));
      } catch (err: any) {
        console.error('Failed to load mentorship programme:', err);
        setError(err.message || 'Mentorship programme not found or unavailable.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProgramme();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse space-y-8">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
              <div className="aspect-[16/10] bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
              <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="h-72 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !programme) {
    return (
      <div className="pt-36 pb-28 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Programme Not Found</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {error || 'This mentorship programme might be draft, moved, or deleted.'}
          </p>
          <Link
            to="/mentorship"
            className="btn-neon-primary px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-2 mt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Mentorship Tracks</span>
          </Link>
        </div>
      </div>
    );
  }

  const formattedPrice =
    programme.price === 0
      ? 'Free'
      : `$${programme.price.toFixed(0)} ${programme.currency}`;

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-8 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Link
            to="/mentorship"
            className="link-neon flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Mentorship Catalog</span>
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-white font-medium truncate max-w-xs">
            {programme.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Main Content (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-10">
            {/* Header / Intro */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {programme.duration} Mentorship
                </span>
                {programme.featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <Sparkles className="w-3 h-3" />
                    <span>Featured Cohort</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white font-display tracking-tight leading-tight">
                {programme.name}
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {programme.shortDescription}
              </p>
            </div>

            {/* Programme Cover Image */}
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl bg-zinc-100 dark:bg-zinc-800">
              <img
                src={resolveAssetUrl(programme.coverImage)}
                alt={programme.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white text-xs font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>{programme.format}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>{programme.sessions}</span>
                </div>
              </div>
            </div>

            {/* Full Programme Overview / Markdown */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>About This Mentorship</span>
              </h2>

              <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-zinc-600 dark:text-zinc-300 space-y-4 leading-relaxed whitespace-pre-line">
                {programme.fullDescription}
              </div>
            </div>

            {/* Curriculum Breakdown */}
            {programme.curriculum && programme.curriculum.length > 0 && (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] p-6 sm:p-8 space-y-5 shadow-sm">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>Curriculum &amp; Milestones</span>
                </h2>

                <div className="space-y-3">
                  {programme.curriculum.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-start gap-3.5"
                    >
                      <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 font-medium leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target Audience */}
            {programme.targetAudience && programme.targetAudience.length > 0 && (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] p-6 sm:p-8 space-y-5 shadow-sm">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Users2 className="w-5 h-5 text-indigo-500" />
                  <span>Who This Programme Is For</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {programme.targetAudience.map((audience, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-start gap-3"
                    >
                      <Target className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                        {audience}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's Included */}
            {programme.includedFeatures && programme.includedFeatures.length > 0 && (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] p-6 sm:p-8 space-y-5 shadow-sm">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Everything Included In Your Mentorship</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {programme.includedFeatures.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expected Outcomes */}
            {programme.expectedOutcomes && programme.expectedOutcomes.length > 0 && (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] p-6 sm:p-8 space-y-5 shadow-sm">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>What You Will Walk Away With</span>
                </h2>

                <div className="space-y-3">
                  {programme.expectedOutcomes.map((outcome, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-start gap-3"
                    >
                      <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 font-medium">
                        {outcome}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sticky Sidebar (4 cols) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Price Display */}
                <div className="space-y-1 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Programme Tuition
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight font-display">
                      {formattedPrice}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Includes all live sessions, async code reviews, and community access.
                  </p>
                </div>

                {/* Specs List */}
                <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                      Duration
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {programme.duration}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-purple-500" />
                      Sessions
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {programme.sessions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Users2 className="w-3.5 h-3.5 text-purple-500" />
                      Delivery
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-white text-right max-w-[180px] truncate">
                      {programme.format}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                      Status
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {programme.applicationEnabled ? 'Accepting Applications' : 'Waitlist Only'}
                    </span>
                  </div>
                </div>

                {/* Primary CTA */}
                {programme.applicationEnabled ? (
                  <Link
                    id="apply-programme-sidebar-btn"
                    to={`/mentorship/${programme.slug}/apply`}
                    className="w-full py-3.5 rounded-xl btn-neon-primary neon-pulse text-white font-bold text-sm text-center shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Apply for This Programme</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full py-3.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-400 font-bold text-sm text-center cursor-not-allowed"
                    >
                      Applications Currently Closed
                    </button>
                    <Link
                      to="/contact"
                      className="link-neon text-xs text-center block"
                    >
                      <span>Inquire about upcoming cohort dates</span>
                      <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                    </Link>
                  </div>
                )}

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-normal">
                    Applications are reviewed to ensure mutual fit and readiness before kickoff.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Programmes Recommendation */}
        {otherProgrammes.length > 0 && (
          <div className="mt-24 pt-12 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Other Mentorship Tracks
              </h3>
              <Link
                to="/mentorship"
                className="link-neon text-xs font-semibold"
              >
                <span>View all programmes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {otherProgrammes.map((other) => (
                <div
                  key={other.id}
                  className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] flex gap-4 items-center justify-between"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1">
                      {other.name}
                    </h4>
                    <p className="text-xs text-zinc-500 line-clamp-1">
                      {other.duration} • {other.sessions}
                    </p>
                  </div>
                  <Link
                    to={`/mentorship/${other.slug}`}
                    className="btn-neon-secondary px-3.5 py-2 text-xs font-semibold whitespace-nowrap"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
