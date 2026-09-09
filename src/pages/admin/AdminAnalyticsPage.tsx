import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { getAnalyticsOverview, getSearchAnalytics } from '../../lib/api';
import { AnalyticsOverview } from '../../types';
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  ExternalLink,
  Github,
  Mail,
  FolderKanban,
  CheckCircle2,
  FileEdit,
  Star,
  Search,
  Calendar,
  RefreshCw,
  Clock
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [searchQueries, setSearchQueries] = useState<Array<{ query: string; count: number; lastSearchedAt: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (selectedRange: string) => {
    try {
      setRefreshing(true);
      const [overview, searches] = await Promise.all([
        getAnalyticsOverview(selectedRange),
        getSearchAnalytics(),
      ]);
      setData(overview);
      setSearchQueries(searches);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(range);
  }, [range]);

  const ranges: Array<{ label: string; value: '7d' | '30d' | '90d' | '1y' | 'all' }> = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'Last year', value: '1y' },
    { label: 'All time', value: 'all' },
  ];

  const maxDailyViews = Math.max(
    1,
    ...(data?.viewsOverTime.map((d) => Math.max(d.portfolioViews, d.projectViews)) || [1])
  );

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Header with Date Range Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Project & Portfolio Analytics
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Real-time anonymous engagement metrics, project views, clicks, and search trends.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 ml-2 mr-1 text-zinc-400" />
              {ranges.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    range === r.value
                      ? 'bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-300 font-semibold shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => loadData(range)}
              disabled={refreshing}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-400">Loading portfolio analytics...</p>
          </div>
        ) : (
          <>
            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Total Projects */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-medium">Total Projects</span>
                  <FolderKanban className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {data?.totals.totalProjects ?? 0}
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-500">
                  <span className="text-emerald-600 font-medium">
                    {data?.totals.publishedProjects ?? 0} Published
                  </span>
                  <span>•</span>
                  <span>{data?.totals.draftProjects ?? 0} Draft</span>
                </div>
              </div>

              {/* Total Portfolio Views */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-medium">Portfolio Views</span>
                  <Eye className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {data?.totals.totalPortfolioViews ?? 0}
                </div>
                <p className="text-[11px] text-zinc-400 mt-2">
                  Visits across pages
                </p>
              </div>

              {/* Project Views */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-medium">Project Views</span>
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {data?.totals.totalProjectViews ?? 0}
                </div>
                <p className="text-[11px] text-zinc-400 mt-2">
                  Deep case study visits
                </p>
              </div>

              {/* Project Clicks */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-medium">Project Clicks</span>
                  <MousePointerClick className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {data?.totals.projectClicks ?? 0}
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-500">
                  <span>{data?.totals.liveDemoClicks ?? 0} Demo</span>
                  <span>•</span>
                  <span>{data?.totals.githubClicks ?? 0} GitHub</span>
                </div>
              </div>
            </div>

            {/* Secondary Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Featured Work</span>
                  <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{data?.totals.featuredProjects ?? 0}</span>
                </div>
                <Star className="w-4 h-4 text-amber-500" />
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Live Demo Clicks</span>
                  <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{data?.totals.liveDemoClicks ?? 0}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-purple-500" />
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">GitHub Repository Clicks</span>
                  <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{data?.totals.githubClicks ?? 0}</span>
                </div>
                <Github className="w-4 h-4 text-zinc-500" />
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Contact Submissions</span>
                  <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{data?.totals.contactFormSubmissions ?? 0}</span>
                </div>
                <Mail className="w-4 h-4 text-rose-500" />
              </div>
            </div>

            {/* Visual Chart: Views Over Time */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                    Views Over Time
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Portfolio visits vs specific project views
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-purple-600 inline-block" />
                    <span className="text-zinc-600 dark:text-zinc-300">Portfolio Views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                    <span className="text-zinc-600 dark:text-zinc-300">Project Views</span>
                  </div>
                </div>
              </div>

              {/* Chart Bars */}
              {(!data?.viewsOverTime || data.viewsOverTime.length === 0) ? (
                <div className="h-44 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <Eye className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                  <p className="text-xs font-medium text-zinc-500">No view events recorded in this date range yet.</p>
                  <p className="text-[11px] text-zinc-400 mt-1">As visitors browse your public portfolio, daily metrics will graph here automatically.</p>
                </div>
              ) : (
                <div className="h-48 flex items-end gap-2 pt-6 pb-2 overflow-x-auto">
                  {data.viewsOverTime.map((d, i) => {
                    const portPct = Math.round((d.portfolioViews / maxDailyViews) * 100);
                    const projPct = Math.round((d.projectViews / maxDailyViews) * 100);

                    return (
                      <div key={i} className="flex-1 min-w-[32px] flex flex-col items-center gap-1.5 group relative">
                        {/* Hover Tooltip */}
                        <div className="absolute -top-12 bg-zinc-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap shadow-lg">
                          <span className="font-semibold block">{d.date}</span>
                          <span>Portfolio: {d.portfolioViews} | Projects: {d.projectViews}</span>
                        </div>

                        {/* Dual Bars */}
                        <div className="w-full flex items-end justify-center gap-1 h-32">
                          <div
                            style={{ height: `${Math.max(portPct, 6)}%` }}
                            className="w-2.5 rounded-t bg-purple-600 group-hover:bg-purple-500 transition-all"
                          />
                          <div
                            style={{ height: `${Math.max(projPct, 6)}%` }}
                            className="w-2.5 rounded-t bg-emerald-500 group-hover:bg-emerald-400 transition-all"
                          />
                        </div>

                        <span className="text-[10px] text-zinc-400 truncate w-full text-center">
                          {d.date.substring(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Two-Column: Most Viewed Projects & Most Clicked Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Most Viewed Projects */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-4 flex items-center justify-between">
                  <span>Most Viewed Projects</span>
                  <span className="text-xs text-zinc-400 font-normal">Ranked by visits</span>
                </h2>

                {(!data?.mostViewedProjects || data.mostViewedProjects.length === 0) ? (
                  <div className="py-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                    No project views recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.mostViewedProjects.map((p, idx) => {
                      const maxViews = data.mostViewedProjects[0]?.views || 1;
                      const pct = Math.round((p.views / maxViews) * 100);

                      return (
                        <div key={p.id} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white truncate">
                              <span className="w-5 h-5 rounded-full bg-purple-600/10 text-purple-600 flex items-center justify-center text-[10px] shrink-0 font-bold">
                                {idx + 1}
                              </span>
                              <span className="truncate">{p.title}</span>
                            </div>
                            <span className="font-bold text-purple-600 dark:text-purple-400 shrink-0 ml-2">
                              {p.views} views
                            </span>
                          </div>
                          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-purple-600 h-full rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Most Clicked Projects */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-4 flex items-center justify-between">
                  <span>Most Clicked Projects</span>
                  <span className="text-xs text-zinc-400 font-normal">Live demo & repo clicks</span>
                </h2>

                {(!data?.mostClickedProjects || data.mostClickedProjects.length === 0) ? (
                  <div className="py-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                    No project link clicks recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.mostClickedProjects.map((p, idx) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white truncate">
                          <span className="w-5 h-5 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center text-[10px] shrink-0 font-bold">
                            {idx + 1}
                          </span>
                          <span className="truncate">{p.title}</span>
                        </div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
                          {p.clicks} clicks
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Popular Categories & Search History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular Categories */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-4">
                  Project Categories Breakdown
                </h2>
                {(!data?.popularCategories || data.popularCategories.length === 0) ? (
                  <div className="py-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                    No published project categories.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {data.popularCategories.map((c) => (
                      <div
                        key={c.category}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 text-xs"
                      >
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{c.category}</span>
                        <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-semibold">
                          {c.count} projects
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Aggregated Visitor Search Queries */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-purple-500" />
                    <span>Visitor Search Queries</span>
                  </div>
                  <span className="text-xs text-zinc-400 font-normal">Aggregated terms</span>
                </h2>

                {searchQueries.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                    No visitor searches recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {searchQueries.map((sq) => (
                      <div
                        key={sq.query}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">
                            &ldquo;{sq.query}&rdquo;
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {sq.count} searches
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};
