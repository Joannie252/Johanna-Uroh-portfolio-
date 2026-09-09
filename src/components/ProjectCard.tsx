import React from 'react';
import { Project } from '../types';
import { Link } from '../lib/router';
import { ArrowRight, Calendar, Sparkles } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, featured }) => {
  return (
    <div
      id={`project-card-${project.slug}`}
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800/80 hover:border-purple-500/50 dark:hover:border-purple-500/40 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 overflow-hidden"
    >
      {/* Cover Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={project.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'}
          alt={project.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges on image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-black/80 text-zinc-900 dark:text-white backdrop-blur-md shadow-sm">
            {project.category}
          </span>
          {featured && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600/90 text-white backdrop-blur-md flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{project.projectDate}</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
            <Link to={`/work/${project.slug}`}>
              {project.title}
            </Link>
          </h3>

          {/* Description */}
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {project.shortDescription}
          </p>

          {/* Tools / Tech Pills */}
          {project.tools && project.tools.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.tools.slice(0, 4).map((tool) => (
                <span
                  key={tool}
                  className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/50"
                >
                  {tool}
                </span>
              ))}
              {project.tools.length > 4 && (
                <span className="px-2 py-0.5 rounded-md text-xs text-zinc-500">
                  +{project.tools.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* View Case Study Button */}
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <Link
            id={`view-project-btn-${project.slug}`}
            to={`/work/${project.slug}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform"
          >
            <span>View Case Study</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          {project.services && project.services.length > 0 && (
            <span className="text-xs text-zinc-400 truncate max-w-[150px] text-right">
              {project.services[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
