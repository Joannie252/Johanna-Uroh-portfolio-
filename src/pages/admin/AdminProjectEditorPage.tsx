import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { useRouter, Link } from '../../lib/router';
import {
  createProject,
  updateProject,
  getProjects,
  publishProject,
  unpublishProject,
  deleteProject,
  uploadImageFile
} from '../../lib/api';
import { Project, ProjectImage, ProjectStatus } from '../../types';
import { ImageUpload } from '../../components/ImageUpload';
import { ProjectImageGallery } from '../../components/ProjectImageGallery';
import { AITextImprover } from '../../components/AITextImprover';
import { AIProjectGeneratorModal } from '../../components/AIProjectGeneratorModal';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import {
  Save,
  ArrowLeft,
  Eye,
  Trash2,
  Sparkles,
  Plus,
  X,
  Check,
  AlertCircle,
  Upload,
  Globe,
  Github,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';

const CATEGORIES = [
  'Web Development',
  'AI',
  'Virtual Assistance',
  'Content',
  'Education',
  'Financial Education',
  'Other',
];

const PREDEFINED_TOOLS = [
  'ChatGPT',
  'Google AI Studio',
  'Gemini API',
  'Claude',
  'React',
  'TypeScript',
  'Tailwind CSS',
  'Node.js',
  'Express',
  'SQLite',
  'Notion',
  'Google Workspace',
  'Canva',
  'Python',
  'Figma',
];

const PREDEFINED_SERVICES = [
  'AI Prompt Engineering',
  'Website Development',
  'Content Creation',
  'Virtual Assistance',
  'Workflow Automation',
  'Digital Skills Training',
  'Executive Calendar & Inbox Management',
];

interface AdminProjectEditorPageProps {
  projectId?: string;
}

export const AdminProjectEditorPage: React.FC<AdminProjectEditorPageProps> = ({ projectId }) => {
  const { navigate } = useRouter();
  const isEditing = Boolean(projectId);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('AI');
  const [projectDate, setProjectDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [clientName, setClientName] = useState('');
  const [tools, setTools] = useState<string[]>([]);
  const [customTool, setCustomTool] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<ProjectImage[]>([]);
  const [challenge, setChallenge] = useState('');
  const [solution, setSolution] = useState('');
  const [process, setProcess] = useState('');
  const [result, setResult] = useState('');
  const [caseStudy, setCaseStudy] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<ProjectStatus>('DRAFT');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Auto-generate slug from title if not manually touched
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited && !isEditing) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  // Load existing project if editing
  useEffect(() => {
    if (!projectId) return;

    async function loadProject() {
      try {
        setIsLoading(true);
        const allProjects = await getProjects({ all: true });
        const match = allProjects.find((p) => p.id === projectId);
        if (!match) {
          setErrorMsg('Project not found');
          return;
        }

        setTitle(match.title);
        setSlug(match.slug);
        setSlugManuallyEdited(true);
        setShortDescription(match.shortDescription || '');
        setDescription(match.description || '');
        setCategory(match.category || 'AI');
        setProjectDate(match.projectDate || '');
        setClientName(match.clientName || '');
        setTools(match.tools || []);
        setServices(match.services || []);
        setProjectUrl(match.projectUrl || '');
        setGithubUrl(match.githubUrl || '');
        setCoverImage(match.coverImage || '');
        setGalleryImages(match.images || []);
        setChallenge(match.challenge || '');
        setSolution(match.solution || '');
        setProcess(match.process || '');
        setResult(match.result || '');
        setCaseStudy(match.caseStudy || '');
        setFeatured(Boolean(match.featured));
        setStatus(match.status || 'DRAFT');
      } catch (err: any) {
        console.error('Failed to load project:', err);
        setErrorMsg('Failed to load project details.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  // Tool toggle
  const toggleTool = (tool: string) => {
    setTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const addCustomTool = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (customTool.trim() && !tools.includes(customTool.trim())) {
      setTools([...tools, customTool.trim()]);
      setCustomTool('');
    }
  };

  // Service toggle
  const toggleService = (serv: string) => {
    setServices((prev) =>
      prev.includes(serv) ? prev.filter((s) => s !== serv) : [...prev, serv]
    );
  };

  const addCustomService = () => {
    if (customService.trim() && !services.includes(customService.trim())) {
      setServices([...services, customService.trim()]);
      setCustomService('');
    }
  };

  // Gallery image handling
  const handleGalleryUpload = async (file: File) => {
    try {
      const res = await uploadImageFile(file);
      const newImg: ProjectImage = {
        id: Math.random().toString(36).substring(2, 9),
        url: res.url,
        orderIndex: galleryImages.length,
      };
      setGalleryImages([...galleryImages, newImg]);
    } catch (err) {
      alert('Failed to upload image.');
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  // Save / Publish
  const handleSave = async (targetStatus: ProjectStatus) => {
    setErrorMsg(null);
    setSuccessNotice(null);

    if (!title.trim()) {
      setErrorMsg('Please provide a project title.');
      return;
    }

    if (!slug.trim()) {
      setErrorMsg('Please specify a URL slug for this project.');
      return;
    }

    if (!shortDescription.trim()) {
      setErrorMsg('Please enter a short summary description for project cards.');
      return;
    }

    try {
      setIsSaving(true);
      const payload: Partial<Project> = {
        title: title.trim(),
        slug: slug.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        category,
        projectDate,
        clientName: clientName.trim() || undefined,
        tools,
        services,
        projectUrl: projectUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
        images: galleryImages,
        challenge: challenge.trim() || undefined,
        solution: solution.trim() || undefined,
        process: process.trim() || undefined,
        result: result.trim() || undefined,
        caseStudy: caseStudy.trim() || undefined,
        featured,
        status: targetStatus,
      };

      let savedProject: Project;
      if (isEditing && projectId) {
        savedProject = await updateProject(projectId, payload);
      } else {
        savedProject = await createProject(payload);
      }

      setStatus(targetStatus);
      setSuccessNotice(
        targetStatus === 'PUBLISHED'
          ? 'Project published successfully! It is now live on the public portfolio.'
          : 'Project saved as Draft. It remains private until published.'
      );

      // If just created, navigate to edit page so they can continue refining
      if (!isEditing) {
        navigate(`/admin/projects/${savedProject.id}/edit`);
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      setErrorMsg(err.message || 'Failed to save project.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!projectId) return;
    try {
      setIsDeleting(true);
      await deleteProject(projectId);
      navigate('/admin/projects');
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout activeTab="projects">
        <div className="py-20 text-center text-zinc-400">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Loading project editor...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="projects">
      <div className="space-y-8 max-w-5xl pb-16">
        {/* Top bar with back navigation & action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-zinc-50/90 dark:bg-[#0e1017]/90 backdrop-blur-md py-4 z-30 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/projects"
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {isEditing ? 'Edit Project' : 'Add New Work'}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    status === 'PUBLISHED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  {status}
                </span>
                {slug && (
                  <span className="text-xs text-zinc-400">
                    /work/{slug}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* AI Generator Button */}
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="px-3.5 py-2 rounded-xl border border-purple-300 dark:border-purple-800/80 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors flex items-center gap-1.5 shadow-xs"
              title="Generate case study with AI"
            >
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Generate with AI</span>
            </button>

            {/* Preview Button */}
            {slug && (
              <a
                id="editor-preview-btn"
                href={`/work/${slug}?preview=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </a>
            )}

            {/* Save Actions */}
            {status === 'PUBLISHED' ? (
              <>
                <button
                  id="unpublish-project-btn"
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('DRAFT')}
                  className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
                  title="Hide from public portfolio"
                >
                  {isSaving ? 'Updating...' : 'Unpublish to Draft'}
                </button>
                <button
                  id="publish-project-btn"
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('PUBLISHED')}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save & Keep Live'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  id="save-draft-btn"
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('DRAFT')}
                  className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  id="publish-project-btn"
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('PUBLISHED')}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSaving ? 'Publishing...' : 'Publish Live'}</span>
                </button>
              </>
            )}

            {/* Delete button if editing */}
            {isEditing && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Delete project"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Feedback Notices */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successNotice && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* SECTION 1: Core Information */}
        <div className="rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800">
            1. Core Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Project Title <span className="text-purple-500">*</span>
              </label>
              <input
                id="project-title-input"
                type="text"
                required
                placeholder="e.g. AI Prompt Engineering Workflow & Knowledge Base"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium text-base focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                URL Slug <span className="text-purple-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 rounded-l-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs border border-r-0 border-zinc-200 dark:border-zinc-800">
                  /work/
                </span>
                <input
                  id="project-slug-input"
                  type="text"
                  required
                  placeholder="ai-prompt-engineering"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  className="w-full px-4 py-2.5 rounded-r-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Category <span className="text-purple-500">*</span>
              </label>
              <select
                id="project-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Date */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Project Date (e.g. 2026-03 or Spring 2026)
              </label>
              <input
                id="project-date-input"
                type="text"
                placeholder="2026-03"
                value={projectDate}
                onChange={(e) => setProjectDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Client / Partner Name */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Client / Partner Name (Optional)
              </label>
              <input
                id="project-client-input"
                type="text"
                placeholder="e.g. Executive Client / Self-Directed Project"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Short Description */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300">
                  Short Description (Cards &amp; Previews) <span className="text-purple-500">*</span>
                </label>
                <AITextImprover
                  currentText={shortDescription}
                  onImproved={(text) => setShortDescription(text)}
                  label="Improve with AI"
                />
              </div>
              <textarea
                id="project-short-desc-input"
                rows={2}
                required
                placeholder="A concise 1-2 sentence overview of the project and its value..."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Media & Cover Image */}
        <div className="rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                2. Project Images &amp; Gallery
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage cover image, screenshots, captions, reordering, and accessible alt-text.
              </p>
            </div>
          </div>

          <ProjectImageGallery
            coverImage={coverImage}
            onCoverImageChange={setCoverImage}
            images={galleryImages}
            onImagesChange={setGalleryImages}
            projectTitle={title}
          />
        </div>

        {/* SECTION 3: Tools & Services Tagging */}
        <div className="rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800">
            3. Tools &amp; Services
          </h2>

          <div className="space-y-6">
            {/* Tools */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Tools Used (Click to toggle or add custom tool)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PREDEFINED_TOOLS.map((tool) => {
                  const isSelected = tools.includes(tool);
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleTool(tool)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {tool}
                    </button>
                  );
                })}
              </div>

              {/* Custom Tool Input */}
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="Add custom tool..."
                  value={customTool}
                  onChange={(e) => setCustomTool(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTool(e))}
                  className="px-3 py-1.5 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 flex-1"
                />
                <button
                  type="button"
                  onClick={addCustomTool}
                  className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Services */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Services Provided
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PREDEFINED_SERVICES.map((serv) => {
                  const isSelected = services.includes(serv);
                  return (
                    <button
                      key={serv}
                      type="button"
                      onClick={() => toggleService(serv)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {serv}
                    </button>
                  );
                })}
              </div>

              {/* Custom Service Input */}
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="Add custom service..."
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomService())}
                  className="px-3 py-1.5 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 flex-1"
                />
                <button
                  type="button"
                  onClick={addCustomService}
                  className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Case Study Breakdown */}
        <div className="rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                4. Deep-Dive Case Study Content
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Structured narrative for detailed project pages. Use AI Improver to refine clarity and impact.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Case Study with AI</span>
            </button>
          </div>

          <div className="space-y-5">
            {/* Full description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300">
                  Full Project Overview
                </label>
                <AITextImprover
                  currentText={description}
                  onImproved={(text) => setDescription(text)}
                />
              </div>
              <textarea
                id="project-full-desc-input"
                rows={4}
                placeholder="Comprehensive background, context, and objectives of the work..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* The Challenge */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300">
                  The Challenge
                </label>
                <AITextImprover
                  currentText={challenge}
                  onImproved={(text) => setChallenge(text)}
                />
              </div>
              <textarea
                id="project-challenge-input"
                rows={3}
                placeholder="What was the bottleneck, pain point, or problem being solved?"
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* The Solution */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300">
                  The Solution / Approach
                </label>
                <AITextImprover
                  currentText={solution}
                  onImproved={(text) => setSolution(text)}
                />
              </div>
              <textarea
                id="project-solution-input"
                rows={3}
                placeholder="How did Johanna solve this? What architecture, prompt system, or strategy was deployed?"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* The Process */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300">
                  The Process &amp; Methodology
                </label>
                <AITextImprover
                  currentText={process}
                  onImproved={(text) => setProcess(text)}
                />
              </div>
              <textarea
                id="project-process-input"
                rows={3}
                placeholder="Step-by-step phases, iteration, testing, and implementation details..."
                value={process}
                onChange={(e) => setProcess(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* The Result */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300">
                  The Result &amp; Impact
                </label>
                <AITextImprover
                  currentText={result}
                  onImproved={(text) => setResult(text)}
                />
              </div>
              <textarea
                id="project-result-input"
                rows={3}
                placeholder="Measurable outcomes, efficiency gains, and final deliverables achieved..."
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Links & Visibility Settings */}
        <div className="rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800">
            5. External Links &amp; Visibility
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Live Demo / Project URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="project-live-url-input"
                  type="url"
                  placeholder="https://example.com"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Source Code / GitHub URL
              </label>
              <div className="relative">
                <Github className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="project-github-url-input"
                  type="url"
                  placeholder="https://github.com/..."
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  id="project-featured-checkbox"
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-zinc-300 dark:border-zinc-700"
                />
                <div>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white block">
                    Feature on Homepage Highlights
                  </span>
                  <span className="text-xs text-zinc-500">
                    If enabled, this project will appear in the top curated "Featured Work" section.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Bottom Floating Bar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-500">
            Current status: <strong className="text-zinc-900 dark:text-white">{status}</strong>
            {status === 'PUBLISHED'
              ? ' • This project is live on your public portfolio.'
              : ' • This project is private and only visible in admin preview.'}
          </div>

          <div className="flex items-center gap-3">
            {status === 'PUBLISHED' ? (
              <>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('DRAFT')}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Updating...' : 'Unpublish to Draft'}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('PUBLISHED')}
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md shadow-purple-600/20 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save & Keep Live'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('DRAFT')}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('PUBLISHED')}
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md shadow-purple-600/20 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSaving ? 'Publishing...' : 'Publish Live'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Delete Modal */}
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          title="Delete Project"
          itemName={title || 'this project'}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={isDeleting}
        />

        {/* AI Generator Modal */}
        <AIProjectGeneratorModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          initialTitle={title}
          initialCategory={category}
          onApply={(data) => {
            if (data.shortDescription) setShortDescription(data.shortDescription);
            if (data.description) setDescription(data.description);
            if (data.challenge) setChallenge(data.challenge);
            if (data.solution) setSolution(data.solution);
            if (data.suggestedTools && data.suggestedTools.length > 0) {
              setTools((prev) => Array.from(new Set([...prev, ...data.suggestedTools!])));
            }
          }}
        />
      </div>
    </AdminLayout>
  );
};
