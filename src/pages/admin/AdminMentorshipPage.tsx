import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { MentorshipProgramme, MentorshipApplication, MentorshipApplicationStatus } from '../../types';
import {
  getAdminMentorshipProgrammes,
  createMentorshipProgramme,
  updateMentorshipProgramme,
  deleteMentorshipProgramme,
  togglePublishMentorshipProgramme,
  toggleFeaturedMentorshipProgramme,
  getAdminMentorshipApplications,
  updateMentorshipApplicationStatus,
  deleteMentorshipApplication,
  resolveAssetUrl,
} from '../../lib/api';
import { ImageUpload } from '../../components/ImageUpload';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  Check,
  X,
  Compass,
  Sparkles,
  DollarSign,
  Layers,
  ArrowRight,
  Filter,
  Users2,
  Mail,
  Phone,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AdminMentorshipPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'programmes' | 'applications'>('programmes');

  // Programmes State
  const [programmes, setProgrammes] = useState<MentorshipProgramme[]>([]);
  const [isLoadingProgrammes, setIsLoadingProgrammes] = useState(true);
  const [programmeSearch, setProgrammeSearch] = useState('');
  const [programmeFilter, setProgrammeFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [deleteProgrammeTarget, setDeleteProgrammeTarget] = useState<MentorshipProgramme | null>(null);
  const [isDeletingProgramme, setIsDeletingProgramme] = useState(false);

  // Programme Modal State
  const [isProgrammeModalOpen, setIsProgrammeModalOpen] = useState(false);
  const [editingProgrammeId, setEditingProgrammeId] = useState<string | null>(null);
  const [isSavingProgramme, setIsSavingProgramme] = useState(false);
  const [programmeFormError, setProgrammeFormError] = useState<string | null>(null);

  // Programme Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [duration, setDuration] = useState('6 Weeks');
  const [format, setFormat] = useState('Live 1-on-1 + Guided Projects');
  const [sessions, setSessions] = useState('12 Sessions (2x weekly)');
  const [price, setPrice] = useState('99');
  const [currency, setCurrency] = useState('USD');
  const [targetAudienceText, setTargetAudienceText] = useState('');
  const [curriculumText, setCurriculumText] = useState('');
  const [includedFeaturesText, setIncludedFeaturesText] = useState('');
  const [expectedOutcomesText, setExpectedOutcomesText] = useState('');
  const [applicationEnabled, setApplicationEnabled] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);

  // Applications State
  const [applications, setApplications] = useState<MentorshipApplication[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('All');
  const [appProgrammeFilter, setAppProgrammeFilter] = useState<string>('All');
  const [selectedApp, setSelectedApp] = useState<MentorshipApplication | null>(null);
  const [deleteAppTarget, setDeleteAppTarget] = useState<MentorshipApplication | null>(null);
  const [isDeletingApp, setIsDeletingApp] = useState(false);
  const [appNotes, setAppNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Load Programmes
  const loadProgrammes = async () => {
    try {
      setIsLoadingProgrammes(true);
      const data = await getAdminMentorshipProgrammes();
      setProgrammes(data);
    } catch (err) {
      console.error('Failed to load programmes:', err);
    } finally {
      setIsLoadingProgrammes(false);
    }
  };

  // Load Applications
  const loadApplications = async () => {
    try {
      setIsLoadingApps(true);
      const data = await getAdminMentorshipApplications();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setIsLoadingApps(false);
    }
  };

  useEffect(() => {
    loadProgrammes();
    loadApplications();
  }, []);

  // Open modal to create programme
  const handleOpenCreateModal = () => {
    setEditingProgrammeId(null);
    setName('');
    setSlug('');
    setShortDescription('');
    setFullDescription('');
    setCoverImage('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop');
    setDuration('6 Weeks');
    setFormat('Live Weekly Workshops + Async Slack Q&A');
    setSessions('12 Sessions');
    setPrice('99');
    setCurrency('USD');
    setTargetAudienceText('Beginners building web development foundations\nSelf-taught developers needing structure\nDesigners transitioning into frontend engineering');
    setCurriculumText('Week 1: Modern Web Foundations & Semantic HTML\nWeek 2: CSS Layouts & Responsive Design\nWeek 3: JavaScript Core Concepts & DOM\nWeek 4: Async Data Fetching & APIs\nWeek 5: Git, GitHub & Tooling\nWeek 6: Capstone Project & Deployment');
    setIncludedFeaturesText('Live group workshops with paired coding\nLine-by-line code reviews on assignments\nPrivate communication channel\nVerified certificate of completion');
    setExpectedOutcomesText('Build and style responsive web apps\nGain confidence debugging modern code\nPublish real projects to your GitHub portfolio');
    setApplicationEnabled(true);
    setFeatured(false);
    setPublished(true);
    setProgrammeFormError(null);
    setIsProgrammeModalOpen(true);
  };

  // Open modal to edit programme
  const handleOpenEditModal = (prog: MentorshipProgramme) => {
    setEditingProgrammeId(prog.id);
    setName(prog.name);
    setSlug(prog.slug);
    setShortDescription(prog.shortDescription);
    setFullDescription(prog.fullDescription);
    setCoverImage(prog.coverImage);
    setDuration(prog.duration);
    setFormat(prog.format);
    setSessions(prog.sessions);
    setPrice(String(prog.price));
    setCurrency(prog.currency || 'USD');
    setTargetAudienceText(prog.targetAudience.join('\n'));
    setCurriculumText(prog.curriculum.join('\n'));
    setIncludedFeaturesText(prog.includedFeatures.join('\n'));
    setExpectedOutcomesText(prog.expectedOutcomes.join('\n'));
    setApplicationEnabled(prog.applicationEnabled);
    setFeatured(prog.featured);
    setPublished(prog.published);
    setProgrammeFormError(null);
    setIsProgrammeModalOpen(true);
  };

  const handleSaveProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    setProgrammeFormError(null);

    if (!name.trim() || !shortDescription.trim() || !fullDescription.trim()) {
      setProgrammeFormError('Please enter programme name, short summary, and full description.');
      return;
    }

    const payload: Partial<MentorshipProgramme> = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop',
      duration: duration.trim(),
      format: format.trim(),
      sessions: sessions.trim(),
      price: parseFloat(price) || 0,
      currency: currency.trim() || 'USD',
      targetAudience: targetAudienceText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      curriculum: curriculumText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      includedFeatures: includedFeaturesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      expectedOutcomes: expectedOutcomesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      applicationEnabled,
      featured,
      published,
    };

    try {
      setIsSavingProgramme(true);
      if (editingProgrammeId) {
        await updateMentorshipProgramme(editingProgrammeId, payload);
      } else {
        await createMentorshipProgramme(payload);
      }
      setIsProgrammeModalOpen(false);
      await loadProgrammes();
    } catch (err: any) {
      console.error('Failed to save programme:', err);
      setProgrammeFormError(err.message || 'Failed to save programme');
    } finally {
      setIsSavingProgramme(false);
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await togglePublishMentorshipProgramme(id);
      await loadProgrammes();
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await toggleFeaturedMentorshipProgramme(id);
      await loadProgrammes();
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
    }
  };

  const handleDeleteProgramme = async () => {
    if (!deleteProgrammeTarget) return;
    try {
      setIsDeletingProgramme(true);
      await deleteMentorshipProgramme(deleteProgrammeTarget.id);
      setDeleteProgrammeTarget(null);
      await loadProgrammes();
    } catch (err) {
      console.error('Failed to delete programme:', err);
    } finally {
      setIsDeletingProgramme(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: MentorshipApplicationStatus) => {
    try {
      const updated = await updateMentorshipApplicationStatus(appId, newStatus);
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
      if (selectedApp?.id === appId) {
        setSelectedApp(updated);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    try {
      setIsSavingNotes(true);
      const updated = await updateMentorshipApplicationStatus(
        selectedApp.id,
        selectedApp.status,
        appNotes
      );
      setApplications((prev) => prev.map((a) => (a.id === selectedApp.id ? updated : a)));
      setSelectedApp(updated);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!deleteAppTarget) return;
    try {
      setIsDeletingApp(true);
      await deleteMentorshipApplication(deleteAppTarget.id);
      setApplications((prev) => prev.filter((a) => a.id !== deleteAppTarget.id));
      if (selectedApp?.id === deleteAppTarget.id) {
        setSelectedApp(null);
      }
      setDeleteAppTarget(null);
    } catch (err) {
      console.error('Failed to delete application:', err);
    } finally {
      setIsDeletingApp(false);
    }
  };

  // Filter programmes
  const filteredProgrammes = programmes.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(programmeSearch.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(programmeSearch.toLowerCase());

    const matchesStatus =
      programmeFilter === 'ALL' ||
      (programmeFilter === 'PUBLISHED' && p.published) ||
      (programmeFilter === 'DRAFT' && !p.published);

    return matchesSearch && matchesStatus;
  });

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.email.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.whatsapp.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.skillToLearn.toLowerCase().includes(appSearch.toLowerCase());

    const matchesStatus = appStatusFilter === 'All' || app.status === appStatusFilter;
    const matchesProg = appProgrammeFilter === 'All' || app.programmeId === appProgrammeFilter;

    return matchesSearch && matchesStatus && matchesProg;
  });

  const newAppsCount = applications.filter((a) => a.status === 'New').length;

  const STATUS_COLORS: Record<MentorshipApplicationStatus, string> = {
    New: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    Reviewing: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Contacted: 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    Accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    Completed: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
  };

  return (
    <AdminLayout activeTab="/admin/mentorship">
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Mentorship CMS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white font-display">
              Mentorship Programmes &amp; Applications
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage cohort tracks, toggle visibility, review applicants, and track candidate progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="admin-new-programme-btn"
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Programme</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('programmes')}
            className={`pb-3.5 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'programmes'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Programmes ({programmes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-3.5 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Users2 className="w-4 h-4" />
            <span>Applications ({applications.length})</span>
            {newAppsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                {newAppsCount} new
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: PROGRAMMES */}
        {activeTab === 'programmes' && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search programmes by name or description..."
                  value={programmeSearch}
                  onChange={(e) => setProgrammeSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setProgrammeFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      programmeFilter === filter
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Programmes List */}
            {isLoadingProgrammes ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                ))}
              </div>
            ) : filteredProgrammes.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                <Compass className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
                <h3 className="font-bold text-zinc-900 dark:text-white">No programmes found</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Click &ldquo;Create Programme&rdquo; to add your first skills mentorship offering.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProgrammes.map((prog) => (
                  <div
                    key={prog.id}
                    className="flex flex-col justify-between rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-44 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                      <img
                        src={resolveAssetUrl(prog.coverImage)}
                        alt={prog.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        {prog.published ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/90 text-white">
                            Published
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-700 text-zinc-200">
                            Draft
                          </span>
                        )}
                        {prog.featured && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-xs font-extrabold">
                        {prog.price > 0 ? `$${prog.price} ${prog.currency}` : 'Free'}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-tight">
                          {prog.name}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                          {prog.shortDescription}
                        </p>
                        <div className="mt-3 text-[11px] text-zinc-500 flex items-center gap-3">
                          <span>{prog.duration}</span>
                          <span>•</span>
                          <span>{prog.sessions}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            title={prog.published ? 'Unpublish' : 'Publish'}
                            onClick={() => handleTogglePublish(prog.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                              prog.published
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100'
                            }`}
                          >
                            {prog.published ? 'Make Draft' : 'Publish'}
                          </button>

                          <button
                            title={prog.featured ? 'Unfeature' : 'Feature on Top'}
                            onClick={() => handleToggleFeatured(prog.id)}
                            className={`p-1.5 rounded-lg text-xs transition-colors ${
                              prog.featured
                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={`/mentorship/${prog.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => handleOpenEditModal(prog)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Programme"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteProgrammeTarget(prog)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Delete Programme"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search applicant name, email, WhatsApp..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Reviewing">Reviewing</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <select
                  value={appProgrammeFilter}
                  onChange={(e) => setAppProgrammeFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="All">All Programmes</option>
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Applications Table / Cards */}
            {isLoadingApps ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                ))}
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                <Users2 className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
                <h3 className="font-bold text-zinc-900 dark:text-white">No applications match your filter</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  When visitors submit applications from the public mentorship pages, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:border-purple-500/40"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                          {app.fullName}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_COLORS[app.status]}`}
                        >
                          {app.status}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                        Programme: {app.programmeName}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                        <a
                          href={`mailto:${app.email}`}
                          className="hover:text-purple-600 flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{app.email}</span>
                        </a>

                        <a
                          href={`https://wa.me/${app.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-emerald-600 flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp: {app.whatsapp}</span>
                        </a>

                        <span>
                          Level: <strong className="text-zinc-700 dark:text-zinc-200">{app.currentSkillLevel}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(app.id, e.target.value as MentorshipApplicationStatus)
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="New">New</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                      </select>

                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setAppNotes(app.notes || '');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 text-xs font-semibold hover:bg-purple-100 transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => setDeleteAppTarget(app)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* APPLICATION DETAILS MODAL / DRAWER */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#12141a] p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6">
              <button
                onClick={() => setSelectedApp(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[selectedApp.status]}`}
                >
                  {selectedApp.status}
                </span>
                <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white pt-2">
                  {selectedApp.fullName}
                </h2>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  Applied for: {selectedApp.programmeName} • Submitted{' '}
                  {new Date(selectedApp.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Contact details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 text-xs">
                <div>
                  <span className="text-zinc-400 block">Email:</span>
                  <a
                    href={`mailto:${selectedApp.email}`}
                    className="font-semibold text-purple-600 hover:underline"
                  >
                    {selectedApp.email}
                  </a>
                </div>
                <div>
                  <span className="text-zinc-400 block">WhatsApp / Phone:</span>
                  <a
                    href={`https://wa.me/${selectedApp.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-emerald-600 hover:underline"
                  >
                    {selectedApp.whatsapp}
                  </a>
                </div>
                <div>
                  <span className="text-zinc-400 block">Current Skill Level:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {selectedApp.currentSkillLevel}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block">Weekly Availability:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {selectedApp.availability}
                  </span>
                </div>
              </div>

              {/* Answers */}
              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                    Primary Skill to Learn:
                  </h4>
                  <p className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                    {selectedApp.skillToLearn}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                    Why Seeking Mentorship:
                  </h4>
                  <p className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {selectedApp.whyMentorship}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                    Key Goals &amp; Projects:
                  </h4>
                  <p className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {selectedApp.goals}
                  </p>
                </div>

                {selectedApp.portfolioLink && (
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                      Portfolio / GitHub:
                    </h4>
                    <a
                      href={selectedApp.portfolioLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-600 dark:text-purple-400 font-semibold underline break-all inline-flex items-center gap-1"
                    >
                      <span>{selectedApp.portfolioLink}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Admin Internal Notes */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Internal Notes &amp; Follow-up Logs:
                </label>
                <textarea
                  rows={3}
                  value={appNotes}
                  onChange={(e) => setAppNotes(e.target.value)}
                  placeholder="Record interview notes, payment status, WhatsApp chat dates..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  disabled={isSavingNotes}
                  onClick={handleSaveNotes}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PROGRAMME EDITOR MODAL */}
        {isProgrammeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#12141a] p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6">
              <button
                onClick={() => setIsProgrammeModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white font-display">
                  {editingProgrammeId ? 'Edit Mentorship Programme' : 'Create New Mentorship Programme'}
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Configure curriculum milestones, duration, pricing, and live cohort settings.
                </p>
              </div>

              {programmeFormError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{programmeFormError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProgramme} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Programme Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Modern Frontend & React Architecture"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Custom URL Slug (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. frontend-react-architecture"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Short Description * (Max 2 sentences)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Concise overview displayed on cards..."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Cover Image URL or Upload
                  </label>
                  <ImageUpload
                    value={coverImage}
                    onChange={setCoverImage}
                    placeholder="Enter image URL or upload cover photo..."
                  />
                </div>

                {/* Duration, Format, Sessions, Price */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 6 Weeks"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Format
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Live + Async"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Sessions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12 Sessions"
                      value={sessions}
                      onChange={(e) => setSessions(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Price ($ USD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Full Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Full Description (Markdown Supported) *
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Full in-depth narrative of the mentorship programme..."
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Target Audience & Curriculum */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Target Audience (One per line)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Beginners wanting structure&#10;Developers transitioning to React..."
                      value={targetAudienceText}
                      onChange={(e) => setTargetAudienceText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Curriculum Milestones (One per line)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Week 1: Core Fundamentals&#10;Week 2: Component Architecture..."
                      value={curriculumText}
                      onChange={(e) => setCurriculumText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Included Features & Expected Outcomes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Included Features (One per line)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="12 Live group sessions&#10;Private Telegram channel&#10;Direct PR code reviews..."
                      value={includedFeaturesText}
                      onChange={(e) => setIncludedFeaturesText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Expected Outcomes (One per line)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Ship a full-stack SaaS app&#10;Master TypeScript typing&#10;Confident technical interviews..."
                      value={expectedOutcomesText}
                      onChange={(e) => setExpectedOutcomesText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-800 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={applicationEnabled}
                      onChange={(e) => setApplicationEnabled(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Accepting Applications</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-800 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Featured On Top</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-800 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Published (Visible to Public)</span>
                  </label>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsProgrammeModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProgramme}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 disabled:opacity-50"
                  >
                    {isSavingProgramme ? 'Saving Programme...' : 'Save Programme'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Programme Modal */}
        <DeleteConfirmModal
          isOpen={deleteProgrammeTarget !== null}
          title="Delete Mentorship Programme"
          itemName={deleteProgrammeTarget?.name || ''}
          onConfirm={handleDeleteProgramme}
          onCancel={() => setDeleteProgrammeTarget(null)}
          isLoading={isDeletingProgramme}
        />

        {/* Delete Application Modal */}
        <DeleteConfirmModal
          isOpen={deleteAppTarget !== null}
          title="Delete Mentorship Application"
          itemName={deleteAppTarget?.fullName || ''}
          onConfirm={handleDeleteApplication}
          onCancel={() => setDeleteAppTarget(null)}
          isLoading={isDeletingApp}
        />
      </div>
    </AdminLayout>
  );
};
