import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../types';
import { getProjects, recordSearchQuery } from '../lib/api';
import { ProjectCard } from '../components/ProjectCard';
import { Search, X, Sparkles, SlidersHorizontal, ArrowRight, Tag } from 'lucide-react';
import { Link, useRouter } from '../lib/router';

const POPULAR_TOOLS = [
  'React',
  'TypeScript',
  'Gemini AI',
  'Tailwind CSS',
  'Node.js',
  'Notion',
  'Zapier',
  'Python',
  'Google Sheets',
  'Figma',
];

const CATEGORIES = [
  'All',
  'AI',
  'Web Development',
  'Virtual Assistance',
  'Content',
  'Financial Education',
  'Education',
];

export const PublicSearchPage: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounced search recording to avoid logging every keystroke
  const recordedQueryRef = useRef<string>('');

  useEffect(() => {
    let isMounted = true;
    async function fetchResults() {
      try {
        setLoading(true);
        setError(null);

        const data = await getProjects({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          search: searchTerm.trim() || undefined,
        });

        if (!isMounted) return;

        // Filter by selected tool client-side if selected
        let filtered = data;
        if (selectedTool) {
          filtered = data.filter((p) =>
            p.tools?.some((t) => t.toLowerCase() === selectedTool.toLowerCase())
          );
        }

        setProjects(filtered);

        // Record search if search term has at least 2 characters and changed
        const trimmed = searchTerm.trim();
        if (trimmed.length >= 2 && trimmed !== recordedQueryRef.current) {
          recordedQueryRef.current = trimmed;
          recordSearchQuery(trimmed, filtered.length).catch(() => {});
        }
      } catch (err: any) {
        if (isMounted) {
          setError('Failed to fetch matching projects.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    const timer = setTimeout(fetchResults, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedCategory, selectedTool]);

  const handleClear = () => {
    setSearchTerm('');
    setSelectedTool(null);
    setSelectedCategory('All');
  };

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 mb-3">
            <Search className="w-3.5 h-3.5" />
            <span>Search Portfolio &amp; Case Studies</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Explore Johanna&rsquo;s Work
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base mt-2">
            Find projects, case studies, technologies, and workflows across AI systems, web development, and operations.
          </p>
        </div>

        {/* Search Box Card */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="global-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keywords, deliverables, technologies, or challenge..."
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm sm:text-base focus:outline-none focus:border-purple-500 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 absolute right-3.5 top-1/2 -translate-y-1/2"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="font-semibold text-zinc-400 shrink-0 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tool Chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
            <span className="font-semibold text-zinc-400 shrink-0 mr-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Filter by Tool:
            </span>
            {POPULAR_TOOLS.map((t) => {
              const isSelected = selectedTool === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTool(isSelected ? null : t)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-300'
                  }`}
                >
                  {t}
                </button>
              );
            })}
            {selectedTool && (
              <button
                type="button"
                onClick={() => setSelectedTool(null)}
                className="text-purple-600 dark:text-purple-400 font-semibold hover:underline text-[11px] ml-2"
              >
                Clear Tool
              </button>
            )}
          </div>
        </div>

        {/* Results Bar */}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div>
            Showing <strong className="text-zinc-900 dark:text-white">{projects.length}</strong>{' '}
            {projects.length === 1 ? 'project' : 'projects'}
            {(searchTerm || selectedCategory !== 'All' || selectedTool) && (
              <span> matching your filters</span>
            )}
          </div>
          {(searchTerm || selectedCategory !== 'All' || selectedTool) && (
            <button
              type="button"
              onClick={handleClear}
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Content list or empty state */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 rounded-2xl bg-zinc-100 dark:bg-zinc-800/40 animate-pulse border border-zinc-200/50 dark:border-zinc-800/50"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-center text-sm text-red-600 dark:text-red-300">
            {error}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          /* Empty state with recommendations */
          <div className="py-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              No matching projects found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              We couldn&rsquo;t find anything matching your search. Try different keywords, selecting &ldquo;All&rdquo; categories, or exploring popular topics below.
            </p>

            <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 block mb-2">
                Suggested Searches
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {['AI Automation', 'Executive Assistant', 'Financial Workshop', 'React Portfolio'].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setSearchTerm(suggestion);
                        setSelectedCategory('All');
                        setSelectedTool(null);
                      }}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              <span>View all projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
