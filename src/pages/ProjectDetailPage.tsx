import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { getProjectBySlug, getProjects, resolveAssetUrl } from '../lib/api';
import { ProjectCard } from '../components/ProjectCard';
import { Link, useRouter } from '../lib/router';
import {
  Calendar,
  ExternalLink,
  Github,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle,
  Eye,
  AlertCircle
} from 'lucide-react';

interface ProjectDetailPageProps {
  slug: string;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ slug }) => {
  const { path } = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(null);

  const isPreviewMode = path.includes('preview=true');

  useEffect(() => {
    async function loadProject() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getProjectBySlug(slug, isPreviewMode);
        setProject(data);

        // Fetch related projects (same category or general)
        const allPublished = await getProjects({ limit: 4 });
        setRelatedProjects(allPublished.filter((p) => p.id !== data.id).slice(0, 3));
      } catch (err: any) {
        console.error('Failed to load project:', err);
        setError(err.message || 'Project not found or private');
      } finally {
        setIsLoading(false);
      }
    }

    loadProject();

    const onDataUpdated = () => {
      loadProject();
    };
    window.addEventListener('portfolio_data_updated', onDataUpdated);

    return () => {
      window.removeEventListener('portfolio_data_updated', onDataUpdated);
    };
  }, [slug, isPreviewMode]);

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse space-y-8">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-28" />
          <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
          <div className="aspect-[16/9] bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
          <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Project Not Found or Private
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            This project might still be in draft mode or the link is incorrect. Normal visitors can only view published work.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link
              to="/work"
              className="btn-neon-primary px-4 py-2 text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portfolio</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="pt-28 pb-24 min-h-screen">
      {/* Draft Preview Notification Banner */}
      {project.status === 'DRAFT' && (
        <div className="mb-6 bg-amber-500/10 border-y border-amber-500/30 py-3 px-4 text-center">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400">
            <Eye className="w-4 h-4" />
            <span>
              <strong>Admin Preview Mode:</strong> This project is currently a <strong>DRAFT</strong> and is not visible to public visitors.
            </span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/work"
          className="link-neon text-sm font-medium mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all projects</span>
        </Link>

        {/* Header Information */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {project.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <Calendar className="w-3.5 h-3.5" />
              {project.projectDate}
            </span>
            {project.clientName && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                • Client: {project.clientName}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-[1.15] font-display">
            {project.title}
          </h1>

          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed font-light">
            {project.shortDescription}
          </p>
        </div>

        {/* Hero Cover Image */}
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 mb-12">
          <img
            src={resolveAssetUrl(project.coverImage) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Project Meta Bar (Tools & Services & Links) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-zinc-50 dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 mb-12">
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-2">
              Services Provided
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {project.services && project.services.length > 0 ? (
                project.services.map((serv) => (
                  <span
                    key={serv}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                  >
                    {serv}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500">General Consultation</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-2">
              Tools &amp; Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {project.tools && project.tools.length > 0 ? (
                project.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60"
                  >
                    {tool}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500">Custom Workflows</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-2">
              Project Links
            </h4>
            <div className="flex flex-col gap-2">
              {project.projectUrl ? (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-neon text-xs font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Live Project</span>
                </a>
              ) : (
                <span className="text-xs text-zinc-500 italic">No live link provided</span>
              )}

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>View Source Code</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Sections: Overview, Challenge, Solution, Process, Results */}
        <div className="space-y-12 mb-16 text-zinc-800 dark:text-zinc-200">
          {/* Full Overview / Description */}
          {project.description && (
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Project Overview
              </h2>
              <div className="text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-300 whitespace-pre-line">
                {project.description}
              </div>
            </section>
          )}

          {/* Challenge */}
          {project.challenge && (
            <section className="p-6 sm:p-8 rounded-2xl bg-zinc-50 dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                The Challenge
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {project.challenge}
              </p>
            </section>
          )}

          {/* Solution */}
          {project.solution && (
            <section className="p-6 sm:p-8 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-3">
              <h3 className="text-xl font-bold text-purple-950 dark:text-purple-200 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                The Solution
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {project.solution}
              </p>
            </section>
          )}

          {/* Process */}
          {project.process && (
            <section className="space-y-3">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                The Process &amp; Methodology
              </h3>
              <div className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {project.process}
              </div>
            </section>
          )}

          {/* Result */}
          {project.result && (
            <section className="p-6 sm:p-8 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
              <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-300">
                Key Results &amp; Impact
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {project.result}
              </p>
            </section>
          )}

          {/* Gallery Images */}
          {project.images && project.images.length > 0 && (
            <section className="space-y-4 pt-6">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Project Gallery
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.images.map((img) => (
                  <div
                    key={img.id || img.url}
                    onClick={() => setSelectedGalleryImg(img.url)}
                    className="cursor-pointer group relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 aspect-[16/10]"
                  >
                    <img
                      src={resolveAssetUrl(img.url)}
                      alt={img.alt || project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                      Click to expand
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Live CTA buttons */}
        <div className="pt-8 pb-16 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-neon-primary px-6 py-3 text-sm font-semibold shadow-md inline-flex items-center gap-2"
              >
                <span>View Live Project</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-neon-secondary px-6 py-3 text-sm font-semibold inline-flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                <span>View Source Code</span>
              </a>
            )}
          </div>

          <Link
            to="/contact"
            className="link-neon text-sm font-semibold"
          >
            <span>Have a similar project? Let&apos;s talk</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* More of my work */}
        {relatedProjects.length > 0 && (
          <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
              More of my work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox modal for gallery images */}
      {selectedGalleryImg && (
        <div
          onClick={() => setSelectedGalleryImg(null)}
          className="fixed inset-0 z-50 bg-black/90 p-4 flex items-center justify-center cursor-pointer"
        >
          <div className="max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img
              src={resolveAssetUrl(selectedGalleryImg)}
              alt="Expanded preview"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </article>
  );
};
