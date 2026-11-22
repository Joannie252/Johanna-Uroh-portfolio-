import React, { useState, useEffect } from 'react';
import { Link } from '../lib/router';
import { Project, ServiceItem, TestimonialItem, Product, MentorshipProgramme } from '../types';
import { getProjects, getServices, getTestimonials, sendContactMessage, getProducts, getMentorshipProgrammes } from '../lib/api';
import { useSiteSettings } from '../context/SettingsContext';
import { ProjectCard } from '../components/ProjectCard';
import { AnimatedNetworkVisual } from '../components/AnimatedNetworkVisual';
import { HeroAnimeShowcase } from '../components/HeroAnimeShowcase';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Code2,
  Brain,
  Briefcase,
  FileText,
  GraduationCap,
  TrendingUp,
  Star,
  Layers,
  ArrowUpRight,
  Mail,
  Send,
  Clock,
  MapPin,
  AlertCircle,
  RefreshCw,
  Cpu,
  Workflow,
  Laptop,
  BookOpen,
  Compass,
  Users2,
  Calendar
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'AI',
  'Web Development',
  'Virtual Assistance',
  'Financial Education',
  'Content'
];

export const HomePage: React.FC = () => {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [latestProjects, setLatestProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { settings } = useSiteSettings();
  const profileName = settings.profile?.name || 'Johanna Uroh';
  const profileHeadline = settings.profile?.headline || 'AI Digital Specialist & Executive VA';
  const profileBio = settings.profile?.bio || 'I’m Johanna Uroh — a digital specialist working across AI, digital systems, virtual assistance, web solutions and practical digital skills. I combine technology, creativity and problem-solving to turn ideas into useful solutions.';
  const profilePicture = settings.profile?.profilePicture || '/uploads/johanna_uroh_avatar.jpg';

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredProgrammes, setFeaturedProgrammes] = useState<MentorshipProgramme[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Quick contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactService, setContactService] = useState('General Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);
  const [shakeSubmit, setShakeSubmit] = useState(false);

  const triggerSubmitShake = () => {
    setShakeSubmit(true);
    setTimeout(() => setShakeSubmit(false), 400);
  };

  const loadData = async (cat: string = selectedCategory) => {
    try {
      setIsLoading(true);
      setError(null);

      const featuredLimit = settings.portfolio?.featuredLimit || 3;

      // Fetch featured, latest by category, services, testimonials, products, and mentorship in parallel
      const [featured, latest, servs, tests, prods, mProgrammes] = await Promise.all([
        getProjects({ featured: true, limit: featuredLimit }),
        getProjects({
          category: cat === 'All' ? undefined : cat,
          limit: 6
        }),
        getServices(),
        getTestimonials(),
        getProducts({ featured: true, limit: 3 }).catch(() => [] as Product[]),
        getMentorshipProgrammes({ featured: true, limit: 3 }).catch(() => [] as MentorshipProgramme[])
      ]);

      setFeaturedProjects(featured);
      setLatestProjects(latest);
      setServices(servs.slice(0, 6));
      setTestimonials(tests);
      
      if (prods.length > 0) {
        setFeaturedProducts(prods);
      } else {
        // Fallback to published products if none explicitly marked featured
        const fallbackProds = await getProducts({ limit: 3 }).catch(() => [] as Product[]);
        setFeaturedProducts(fallbackProds.slice(0, 3));
      }

      if (mProgrammes.length > 0) {
        setFeaturedProgrammes(mProgrammes);
      } else {
        const fallbackM = await getMentorshipProgrammes({ limit: 3 }).catch(() => [] as MentorshipProgramme[]);
        setFeaturedProgrammes(fallbackM.slice(0, 3));
      }
    } catch (err: any) {
      console.error('Failed to load home data:', err);
      setError('Unable to fetch live database content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedCategory);

    const onDataUpdated = () => {
      loadData(selectedCategory);
    };
    window.addEventListener('portfolio_data_updated', onDataUpdated);
    return () => {
      window.removeEventListener('portfolio_data_updated', onDataUpdated);
    };
  }, [selectedCategory, settings.portfolio?.featuredLimit]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);
    setContactSuccess(null);

    if (!contactName.trim()) {
      setContactError('Please enter your name.');
      triggerSubmitShake();
      return;
    }
    if (!contactEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      setContactError('Please enter a valid email address.');
      triggerSubmitShake();
      return;
    }
    if (!contactMessage.trim() || contactMessage.trim().length < 10) {
      setContactError('Please enter a message of at least 10 characters.');
      triggerSubmitShake();
      return;
    }

    try {
      setIsSubmittingContact(true);
      const res = await sendContactMessage({
        name: contactName,
        email: contactEmail,
        service: contactService,
        message: contactMessage,
      });

      setContactSuccess(res.message || 'Thank you! Your message has been sent directly to Johanna.');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (err: any) {
      console.error('Homepage contact error:', err);
      setContactError(err.message || 'Failed to send message. Please try again.');
      triggerSubmitShake();
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const getServiceIcon = (iconName?: string) => {
    switch (iconName) {
      case 'sparkles':
        return <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      case 'code':
        return <Code2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      case 'file-text':
        return <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      case 'graduation-cap':
        return <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      case 'trending-up':
        return <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      default:
        return <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
    }
  };

  const skillsData = [
    {
      category: 'AI & Workflow Automation',
      icon: <Brain className="w-5 h-5 text-purple-500" />,
      description: 'Engineering reliable multi-turn prompt chains and embedding AI into executive workflows.',
      skills: ['Google AI Studio & Gemini', 'ChatGPT Custom Instructions', 'Prompt Chaining & System Design', 'Automated Research Pipelines', 'Structured Extraction']
    },
    {
      category: 'Virtual Assistance & Operations',
      icon: <Briefcase className="w-5 h-5 text-violet-500" />,
      description: 'Meticulous executive support ensuring calendar harmony and zero communication drop-offs.',
      skills: ['Inbox Zero & Email Filtering', 'Executive Calendar Protocols', 'Google Workspace Suite', 'Notion Knowledge Bases', 'Confidential Scheduling']
    },
    {
      category: 'Modern Web Development',
      icon: <Code2 className="w-5 h-5 text-indigo-500" />,
      description: 'Building responsive, database-driven web applications with clean component architecture.',
      skills: ['React & TypeScript', 'Tailwind CSS v4', 'Vite & Node.js', 'Express REST APIs', 'SQLite Data Modeling']
    },
    {
      category: 'Content & Education',
      icon: <FileText className="w-5 h-5 text-purple-500" />,
      description: 'Synthesizing complex technical and financial topics into clear, engaging learning resources.',
      skills: ['Financial Literacy Playbooks', 'Case Study Documentation', 'Technical Curriculum Design', 'Visual Presentations (Canva)', 'Workflow SOP Writing']
    }
  ];

  return (
    <div className="min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-12 md:pt-28 md:pb-16 overflow-hidden">
        {/* Ambient Gradient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/15 dark:bg-purple-600/20 blur-[150px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-12 space-y-8 lg:space-y-10">
          {/* Stylized 3D Anime / Cartoon Character + Synchronized Sequential Roles */}
          <HeroAnimeShowcase />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-center w-full">
            {/* Left Content Column */}
            <div className="lg:col-span-7 xl:col-span-7">
              {/* Clean Eyebrow */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-purple-700 dark:text-purple-300 mb-3 sm:mb-4"
              >
                AI &amp; Digital Systems
              </motion.p>

              {/* Dominant Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.06] font-hero-headline text-balance"
              >
                I Turn Ideas Into{' '}
                <span className="bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
                  Practical Digital Systems
                </span>
              </motion.h1>

              {/* Intro */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl font-light"
              >
                {profileBio}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-7 sm:mt-8 flex flex-wrap items-center gap-4 sm:gap-5"
              >
                <Link
                  id="hero-explore-work-btn"
                  to="/work"
                  className="btn-neon-primary neon-pulse px-7 py-4 text-sm sm:text-base font-semibold"
                >
                  <span>Explore My Work</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  id="hero-contact-btn"
                  to="/contact"
                  className="btn-neon-secondary px-7 py-4 text-sm sm:text-base font-semibold"
                >
                  Let&apos;s Work Together
                </Link>
              </motion.div>
            </div>

            {/* Right Visual Column: Profile & Animated Network Canvas */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 xl:col-span-5 relative w-full lg:max-w-md xl:max-w-lg lg:ml-auto"
            >
              <div className="relative rounded-3xl overflow-hidden bg-white/70 dark:bg-[#12141c]/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8">
                {/* Embedded Animated Network Canvas in background of card */}
                <div className="absolute inset-0 opacity-40 dark:opacity-50 pointer-events-auto">
                  <AnimatedNetworkVisual />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 space-y-6">
                  {/* Profile Header Badge */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        key={profilePicture}
                        src={profilePicture}
                        alt={profileName}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-purple-500/50 shadow-md"
                        onError={(e) => {
                          // Fallback to Unsplash portrait if not yet loaded
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop';
                        }}
                      />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#12141c] rounded-full" title="Online & Available" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                        {profileName}
                      </h3>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                        {profileHeadline}
                      </p>
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Available for Select Engagements
                      </div>
                    </div>
                  </div>

                  {/* Interactive Quick Links */}
                  <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                    <Link
                      to="/search"
                      className="inline-flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Search Projects &amp; Tech</span>
                    </Link>
                    <Link
                      to="/about"
                      className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium"
                    >
                      Read Bio &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Error Banner if data fetch fails */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadData()}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. FEATURED PROJECTS SECTION (Curated Highlights) */}
      {featuredProjects.length > 0 && (
        <section id="featured-work-section" className="py-16 md:py-24 bg-zinc-50/70 dark:bg-[#0e1017]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Curated Highlights
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mt-1">
                  Selected Work
                </h2>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm max-w-xl">
                  A selection of projects where I’ve turned ideas into practical digital solutions.
                </p>
              </div>
              <Link
                to="/work"
                className="mt-4 md:mt-0 link-neon text-sm font-semibold"
              >
                <span>View all work</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. LATEST PROJECTS WITH CATEGORY FILTERING */}
      <section id="latest-work-section" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Fresh From The CMS
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mt-1">
                Latest Work
              </h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm max-w-xl">
                Automatically synced with the database. When Johanna creates and publishes a project in the CMS, it immediately appears here.
              </p>
            </div>
            <Link
              to="/work"
              className="mt-4 md:mt-0 link-neon text-sm font-semibold"
            >
              <span>Explore all projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Category Filter Pills on Homepage */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                id={`home-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleCategorySelect(cat)}
                className={`pill-neon ${
                  selectedCategory === cat
                    ? 'pill-neon-active'
                    : 'pill-neon-inactive'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 animate-pulse space-y-4">
                  <div className="aspect-[16/10] bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                  <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
                </div>
              ))}
            </div>
          ) : latestProjects.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-2xl border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
              <Layers className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
              <p className="text-zinc-700 dark:text-zinc-300 font-medium">No published projects in this category yet.</p>
              <p className="text-xs text-zinc-500 mt-1">
                New projects published from the <code className="text-purple-600 dark:text-purple-400 font-mono">/admin</code> CMS will display here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. SERVICES SECTION (Database-Driven) */}
      <section id="services-section" className="py-16 md:py-24 bg-zinc-50/70 dark:bg-[#0e1017]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Areas of Expertise
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mt-1">
              Services &amp; Capabilities
            </h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm">
              Tailored digital execution designed to optimize workflows, build modern web experiences, and train individuals in modern digital skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800/80 p-6 flex flex-col justify-between hover:border-purple-500/40 transition-all shadow-sm hover:shadow-lg hover:shadow-purple-500/5"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center mb-4">
                    {getServiceIcon(service.icon)}
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {service.description}
                  </p>

                  {service.features && service.features.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {service.features.slice(0, 3).map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                  <Link
                    to={`/contact?service=${encodeURIComponent(service.title)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    <span>Inquire about this</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              <span>Explore all services in detail</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. SKILLS & TECHNICAL ARSENAL SECTION */}
      <section id="skills-section" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Technical Arsenal
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mt-1">
              Skills &amp; Capabilities Matrix
            </h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm">
              Cross-functional toolkit developed to deliver high operational speed, reliable code, and targeted AI systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillsData.map((cluster, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800/80 p-6 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center mb-4">
                    {cluster.icon}
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                    {cluster.category}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                    {cluster.description}
                  </p>
                  <ul className="space-y-2">
                    {cluster.skills.map((skill, sIdx) => (
                      <li key={sIdx} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. DIGITAL RESOURCES SECTION (Published & Featured Products) */}
      {featuredProducts.length > 0 && (
        <section id="digital-resources-section" className="py-16 md:py-24 bg-purple-50/30 dark:bg-purple-950/10 border-y border-purple-100 dark:border-purple-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="max-w-2xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Practical Blueprints &amp; Handouts</span>
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mt-1 font-display">
                  Digital Resources
                </h2>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
                  Practical course handouts, templates, and guides created to help people learn useful digital and career skills.
                </p>
              </div>

              <Link
                to="/resources"
                className="btn-neon-secondary px-5 py-2.5 text-xs font-semibold self-start md:self-auto shadow-sm"
              >
                <span>View All Resources</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.slice(0, 3).map((product) => {
                const formattedPrice =
                  product.price === 0
                    ? 'Free'
                    : product.currency === 'USD' || product.currency === '$'
                    ? `$${product.price}`
                    : `${product.currency} ${product.price}`;

                return (
                  <div
                    key={product.id}
                    id={`featured-product-${product.slug}`}
                    className="group flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#12141a] overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-purple-950/20 hover:-translate-y-1.5 transition-all duration-300"
                  >
                    <Link
                      to={`/resources/${product.slug}`}
                      className="relative aspect-[16/10] overflow-hidden block bg-zinc-100 dark:bg-zinc-800"
                    >
                      <img
                        src={product.coverImage}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/95 dark:bg-zinc-900/90 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm">
                          {product.category}
                        </span>
                      </div>
                    </Link>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <Link to={`/resources/${product.slug}`}>
                          <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                            {product.title}
                          </h3>
                        </Link>
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {product.shortDescription}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                            Price
                          </span>
                          <span className="text-lg font-bold text-zinc-900 dark:text-white font-display">
                            {formattedPrice}
                          </span>
                        </div>

                        <Link
                          to={`/resources/${product.slug}`}
                          className="btn-neon-secondary px-4 py-2 text-xs font-semibold shadow-sm"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 6.5. SKILLS MENTORSHIP SECTION */}
      {featuredProgrammes.length > 0 && (
        <section id="mentorship-preview-section" className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="max-w-2xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Personalized Hands-on Guidance</span>
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mt-1 font-display">
                  Learn. Build. Grow.
                </h2>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
                  Practical mentorship designed to help you develop valuable digital skills, build confidence, create real projects and position yourself for opportunities.
                </p>
              </div>

              <Link
                to="/mentorship"
                className="btn-neon-secondary px-5 py-2.5 text-xs font-semibold self-start md:self-auto shadow-sm"
              >
                <span>Explore Mentorship</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProgrammes.slice(0, 3).map((prog) => {
                const formattedPrice =
                  prog.price === 0
                    ? 'Free'
                    : prog.currency === 'USD' || prog.currency === '$'
                    ? `$${prog.price}`
                    : `${prog.currency} ${prog.price}`;

                return (
                  <div
                    key={prog.id}
                    id={`featured-mentorship-${prog.slug}`}
                    className="group flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#12141a] overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-purple-950/20 hover:-translate-y-1.5 transition-all duration-300"
                  >
                    <Link
                      to={`/mentorship/${prog.slug}`}
                      className="relative aspect-[16/10] overflow-hidden block bg-zinc-100 dark:bg-zinc-800"
                    >
                      <img
                        src={prog.coverImage}
                        alt={prog.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/95 dark:bg-zinc-900/90 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm">
                          {prog.duration}
                        </span>
                        {prog.featured && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-[11px] text-zinc-200 font-medium flex items-center justify-between">
                        <span>{prog.format}</span>
                        <span>{prog.sessions}</span>
                      </div>
                    </Link>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <Link to={`/mentorship/${prog.slug}`}>
                          <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                            {prog.name}
                          </h3>
                        </Link>
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {prog.shortDescription}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                            Tuition
                          </span>
                          <span className="text-lg font-bold text-zinc-900 dark:text-white font-display">
                            {formattedPrice}
                          </span>
                        </div>

                        <Link
                          to={`/mentorship/${prog.slug}`}
                          className="btn-neon-secondary px-4 py-2 text-xs font-semibold shadow-sm"
                        >
                          <span>Programme Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. ABOUT PREVIEW SECTION */}
      <section id="about-section" className="py-16 md:py-24 bg-zinc-50/70 dark:bg-[#0e1017]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                About {profileName}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mt-1">
                Blending Strategic Execution with Modern Tech
              </h2>
              <p className="mt-4 text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
                I believe modern work demands both foundational reliability and forward-looking digital fluency. Whether building full-stack web applications, engineering multi-step AI prompts in Google AI Studio, or structuring executive calendar protocols, my focus is always on tangible, practical utility.
              </p>
              <p className="mt-3 text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
                With a background spanning virtual assistance, content strategy, and digital skills education, I partner with founders, creators, and teams to turn ideas into polished digital realities.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/about"
                  className="btn-neon-primary px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
                >
                  <span>Read Full Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/work"
                  className="btn-neon-secondary px-5 py-2.5 text-sm font-semibold"
                >
                  View Case Studies
                </Link>
              </div>
            </div>

            {/* Visual Card / Highlights */}
            <div className="relative rounded-3xl bg-gradient-to-br from-purple-900/20 via-zinc-900 to-[#12141a] border border-zinc-800 p-8 text-white space-y-6 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold">
                Dynamic &amp; Self-Updating Architecture
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                This portfolio is backed by a custom Express backend and SQLite database. Projects, case studies, images, and services are managed directly from the private CMS dashboard at <code className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 font-mono text-xs">/admin</code>.
              </p>
              <div className="pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-zinc-400 block">CMS Engine</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Database Active
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block">Published Sync</span>
                  <span className="font-semibold text-zinc-200 mt-0.5 block">Zero Redeploys Needed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS (CMS BACKED) */}
      {testimonials.length > 0 && (
        <section id="testimonials-section" className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Collaborations
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mt-1">
                Client &amp; Partner Feedback
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((test) => (
                <div
                  key={test.id}
                  className="relative rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800/80 p-8 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(test.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      {test.isDemo && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                          Sample Demo Review
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed italic">
                      &ldquo;{test.content}&rdquo;
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-3">
                    {test.avatarUrl ? (
                      <img
                        src={test.avatarUrl}
                        alt={test.clientName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-600/20 text-purple-500 font-bold flex items-center justify-center text-sm">
                        {test.clientName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                        {test.clientName}
                      </h4>
                      <p className="text-xs text-zinc-500">
                        {test.role} {test.company ? `• ${test.company}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. CONTACT SECTION (Interactive Form Directly on Homepage) */}
      <section id="contact-section" className="py-20 md:py-28 bg-zinc-50/70 dark:bg-[#0e1017]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Context */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Let&apos;s Connect
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mt-1 font-display">
                  Have an idea you want to turn into something useful?
                </h2>
                <p className="mt-4 text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
                  Let&apos;s talk about what you&apos;re building.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 block">Direct Email</span>
                    <a href="mailto:urohjohanna25@gmail.com" className="font-semibold text-zinc-900 dark:text-white hover:text-purple-600 transition-colors">
                      urohjohanna25@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 block">Response Time</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">Typically within 24 business hours</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 block">Location</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">Remote Worldwide</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800/80 p-8 sm:p-10 shadow-sm">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                  Send a Quick Inquiry
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                  Saved directly to the database and viewable in the private CMS.
                </p>

                {contactSuccess ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
                      Message Delivered!
                    </h4>
                    <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300/90 max-w-sm mx-auto">
                      {contactSuccess}
                    </p>
                    <button
                      onClick={() => setContactSuccess(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors mt-2"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    {contactError && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{contactError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="home-contact-name" className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Name *
                        </label>
                        <input
                          id="home-contact-name"
                          type="text"
                          required
                          placeholder="Your name"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label htmlFor="home-contact-email" className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Email *
                        </label>
                        <input
                          id="home-contact-email"
                          type="email"
                          required
                          placeholder="Your email address"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="home-contact-service" className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Service Interest
                      </label>
                      <select
                        id="home-contact-service"
                        value={contactService}
                        onChange={(e) => setContactService(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Virtual Assistance">Virtual Assistance</option>
                        <option value="AI & Prompt Engineering">AI &amp; Prompt Engineering</option>
                        <option value="Website Development">Website Development</option>
                        <option value="Digital Skills Training">Digital Skills Training</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="home-contact-message" className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Message *
                      </label>
                      <textarea
                        id="home-contact-message"
                        required
                        rows={3}
                        placeholder="Tell me a bit about your project or operational requirements..."
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      />
                    </div>

                    <button
                      id="home-contact-submit-btn"
                      type="submit"
                      disabled={isSubmittingContact}
                      className={`w-full py-3.5 rounded-xl btn-neon-primary text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                        shakeSubmit ? 'neon-shake' : ''
                      }`}
                    >
                      {isSubmittingContact ? (
                        <span>Sending message...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
