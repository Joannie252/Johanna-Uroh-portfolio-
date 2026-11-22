import React, { useState, useEffect } from 'react';
import { MentorshipProgramme } from '../types';
import {
  getMentorshipProgrammeBySlug,
  getMentorshipProgrammes,
  submitMentorshipApplication,
} from '../lib/api';
import { Link } from '../lib/router';
import {
  ArrowLeft,
  CheckCircle2,
  Send,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Clock,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface MentorshipApplyPageProps {
  slug?: string;
}

export const MentorshipApplyPage: React.FC<MentorshipApplyPageProps> = ({ slug }) => {
  const [selectedProgramme, setSelectedProgramme] = useState<MentorshipProgramme | null>(null);
  const [availableProgrammes, setAvailableProgrammes] = useState<MentorshipProgramme[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [shakeSubmit, setShakeSubmit] = useState<boolean>(false);

  const triggerSubmitShake = () => {
    setShakeSubmit(true);
    setTimeout(() => setShakeSubmit(false), 400);
  };

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [currentSkillLevel, setCurrentSkillLevel] = useState('Beginner');
  const [skillToLearn, setSkillToLearn] = useState('');
  const [whyMentorship, setWhyMentorship] = useState('');
  const [goals, setGoals] = useState('');
  const [programmeId, setProgrammeId] = useState('');
  const [availability, setAvailability] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const progs = await getMentorshipProgrammes();
        setAvailableProgrammes(progs);

        if (slug) {
          const match = progs.find((p) => p.slug === slug);
          if (match) {
            setSelectedProgramme(match);
            setProgrammeId(match.id);
            setSkillToLearn(match.name);
          } else {
            // Try fetching by slug directly
            const fetched = await getMentorshipProgrammeBySlug(slug);
            setSelectedProgramme(fetched);
            setProgrammeId(fetched.id);
            setSkillToLearn(fetched.name);
          }
        } else if (progs.length > 0) {
          setSelectedProgramme(progs[0]);
          setProgrammeId(progs[0].id);
          setSkillToLearn(progs[0].name);
        }
      } catch (err: any) {
        console.error('Failed to load programme context for application:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [slug]);

  const handleProgrammeChange = (id: string) => {
    setProgrammeId(id);
    const prog = availableProgrammes.find((p) => p.id === id);
    if (prog) {
      setSelectedProgramme(prog);
      if (!skillToLearn || availableProgrammes.some((p) => p.name === skillToLearn)) {
        setSkillToLearn(prog.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Basic client validation
    if (!fullName.trim() || !email.trim() || !whatsapp.trim()) {
      setSubmitError('Please fill in your name, email, and WhatsApp number.');
      triggerSubmitShake();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setSubmitError('Please enter a valid email address.');
      triggerSubmitShake();
      return;
    }

    if (!whyMentorship.trim() || !goals.trim() || !availability.trim()) {
      setSubmitError('Please answer the motivation, goals, and availability questions.');
      triggerSubmitShake();
      return;
    }

    try {
      setIsSubmitting(true);
      await submitMentorshipApplication({
        programmeId: selectedProgramme?.id || programmeId,
        programmeSlug: selectedProgramme?.slug || slug,
        preferredProgramme: selectedProgramme?.name || 'General Skills Mentorship',
        fullName: fullName.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        currentSkillLevel,
        skillToLearn: skillToLearn.trim() || selectedProgramme?.name || 'Full-Stack Development',
        whyMentorship: whyMentorship.trim(),
        goals: goals.trim(),
        availability: availability.trim(),
        portfolioLink: portfolioLink.trim() || undefined,
      });

      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Application submission error:', err);
      setSubmitError(err.message || 'Failed to submit application. Please try again.');
      triggerSubmitShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="pt-36 pb-28 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Application Received
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                You&apos;re One Step Closer!
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-zinc-900 dark:text-white">{fullName}</strong>! We have received your application for{' '}
                <strong className="text-purple-600 dark:text-purple-400">
                  {selectedProgramme?.name || 'Skills Mentorship'}
                </strong>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 text-left space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
              <div className="font-bold text-zinc-900 dark:text-white text-sm">What happens next?</div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-600 font-bold text-[11px] flex items-center justify-center shrink-0">
                  1
                </span>
                <span>We review your learning goals, background, and scheduling availability.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-600 font-bold text-[11px] flex items-center justify-center shrink-0">
                  2
                </span>
                <span>You will receive a response via WhatsApp ({whatsapp}) or email ({email}) within 24–48 hours.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-600 font-bold text-[11px] flex items-center justify-center shrink-0">
                  3
                </span>
                <span>Upon acceptance, you&apos;ll be provided your onboarding package, calendar invites, and kickoff details.</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/mentorship"
                className="w-full sm:w-auto px-6 py-3 btn-neon-primary text-xs font-semibold"
              >
                Return to Mentorship Tracks
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto px-6 py-3 btn-neon-secondary text-xs font-semibold"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Link
            to={slug ? `/mentorship/${slug}` : '/mentorship'}
            className="link-neon flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{selectedProgramme ? `Back to ${selectedProgramme.name}` : 'Back to Mentorship'}</span>
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-white font-medium">Application</span>
        </div>

        {/* Selected Programme Callout Card */}
        {selectedProgramme && (
          <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-zinc-900/40 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Target Programme
              </span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {selectedProgramme.name}
              </h2>
              <p className="text-xs text-zinc-400">
                {selectedProgramme.duration} • {selectedProgramme.format} • {selectedProgramme.sessions}
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-xs text-zinc-400 block">Tuition:</span>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-300">
                {selectedProgramme.price > 0
                  ? `$${selectedProgramme.price} ${selectedProgramme.currency}`
                  : 'Free / Scholarship'}
              </span>
            </div>
          </div>
        )}

        {/* Header Title */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white font-display tracking-tight">
            Apply for Mentorship
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Please fill out the form below with honest, detailed responses. We use your answers to ensure this mentorship will be genuinely impactful for your current skills and career goals.
          </p>
        </div>

        {/* Application Form */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12141a] p-6 sm:p-10 shadow-xl">
          {submitError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Programme Selector if multiple available */}
            {availableProgrammes.length > 1 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  Select Mentorship Programme <span className="text-red-500">*</span>
                </label>
                <select
                  id="mentorship-programme-select"
                  value={programmeId}
                  onChange={(e) => handleProgrammeChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                >
                  {availableProgrammes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.duration} — {p.price > 0 ? `$${p.price}` : 'Free'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="applicant-fullname"
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="applicant-email"
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* WhatsApp Number and Skill Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  WhatsApp / Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="applicant-whatsapp"
                  type="text"
                  required
                  placeholder="+1 (555) 000-0000 or international format"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Used for private direct check-ins and session links.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  Current Skill Level <span className="text-red-500">*</span>
                </label>
                <select
                  id="applicant-skill-level"
                  value={currentSkillLevel}
                  onChange={(e) => setCurrentSkillLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="Beginner">Complete Beginner (Starting out)</option>
                  <option value="Early Learner">Early Learner (Know some HTML/CSS/basics)</option>
                  <option value="Intermediate">Intermediate (Building apps, need polish &amp; architecture)</option>
                  <option value="Career Transition">Career Transition (Switching into tech from another field)</option>
                </select>
              </div>
            </div>

            {/* Skill You Want to Learn */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                What skill or technology do you primarily want to learn? <span className="text-red-500">*</span>
              </label>
              <input
                id="applicant-skill-to-learn"
                type="text"
                required
                placeholder="e.g. Modern Frontend (React + TypeScript), Full-Stack APIs, Practical AI Workflows"
                value={skillToLearn}
                onChange={(e) => setSkillToLearn(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Why Mentorship */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                Why are you seeking mentorship at this point in your journey? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="applicant-why-mentorship"
                rows={3}
                required
                placeholder="Share your current challenges (e.g. tutorial fatigue, lack of structure, needing code reviews, looking for high-ticket clients)..."
                value={whyMentorship}
                onChange={(e) => setWhyMentorship(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Key Goals */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                What specific goals or project do you want to accomplish? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="applicant-goals"
                rows={3}
                required
                placeholder="e.g. Build and launch a full-stack SaaS MVP, land my first junior developer role, rebuild my portfolio with real client work..."
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Availability and Portfolio Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  Weekly Availability <span className="text-red-500">*</span>
                </label>
                <input
                  id="applicant-availability"
                  type="text"
                  required
                  placeholder="e.g. Evenings (GMT+1), Weekends, 10-15 hrs/week"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  GitHub, Portfolio or LinkedIn <span className="text-zinc-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="applicant-portfolio-link"
                  type="url"
                  placeholder="https://github.com/yourhandle or https://linkedin.com/in/..."
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Privacy & Commitment Note */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 text-xs text-zinc-500 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <span>
                Your personal contact information will be kept strictly private and used solely for communication regarding your mentorship application.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="submit-mentorship-application-btn"
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl btn-neon-primary text-sm font-bold shadow-xl flex items-center justify-center gap-2 ${
                  shakeSubmit ? 'neon-shake' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Mentorship Application</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
