import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { getProjects } from '../lib/api';
import { ProjectCard } from '../components/ProjectCard';
import { Search, Filter, Layers, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Web Development',
  'AI',
  'Virtual Assistance',
  'Content',
  'Education',
  'Financial Education',
  'Other',
];

export const WorkPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProjects({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined,
        });
        setProjects(data);
      } catch (err: any) {
        console.error('Failed to load portfolio projects:', err);
        setError('Failed to load portfolio projects from the database.');
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadProjects();
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Selected Projects &amp; Case Studies</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-display">
            Portfolio &amp; Work
          </h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed">
            A real-time, database-backed showcase of projects across AI workflow design, modern web applications, virtual operations, and digital skills education.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          {/* Categories Pill Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-work-input"
              type="text"
              placeholder="Search by title, tool, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-sm mb-8">
            {error}
          </div>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 animate-pulse space-y-4"
              >
                <div className="aspect-[16/10] bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-3xl border-zinc-300 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 max-w-lg mx-auto">
            <Layers className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
              No published projects found
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search query or switching to another category.'
                : 'Projects created and published from the CMS will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
