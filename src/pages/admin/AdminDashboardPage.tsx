import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Link } from '../../lib/router';
import { getDashboardStats, publishProject, unpublishProject, deleteProject, streamChatAdminAI } from '../../lib/api';
import { DashboardData } from '../../types';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import {
  FolderKanban,
  FileCheck2,
  FileEdit,
  Briefcase,
  Quote,
  Mail,
  PlusCircle,
  Edit,
  Eye,
  Trash2,
  ArrowRight,
  Sparkles,
  Send,
  Bot,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick AI Assistant state
  const [aiQuery, setAiQuery] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiCopied, setAiCopied] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await getDashboardStats();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickAsk = async (promptOverride?: string) => {
    const q = (promptOverride ?? aiQuery).trim();
    if (!q || aiLoading) return;

    setAiError(null);
    setAiReply('');
    setAiLoading(true);
    if (!promptOverride) setAiQuery('');

    try {
      await streamChatAdminAI(q, [], (delta) => {
        setAiReply((prev) => prev + delta);
      });
    } catch (err: any) {
      setAiError(err.message || 'AI Assistant failed to respond.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    try {
      if (currentStatus === 'PUBLISHED') {
        await unpublishProject(id);
      } else {
        await publishProject(id);
      }
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update project status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout activeTab="dashboard">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Real-time CMS control panel for Johanna Uroh&apos;s dynamic portfolio.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/projects/new"
              id="dashboard-add-project-btn"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-sm shadow-purple-600/20 flex items-center gap-2 hover:scale-[1.02] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add New Work</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total Projects */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase">Total Projects</span>
              <FolderKanban className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              {data?.stats.totalProjects ?? 0}
            </p>
          </div>

          {/* Published */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-emerald-500">
              <span className="text-xs font-semibold uppercase">Published</span>
              <FileCheck2 className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {data?.stats.publishedProjects ?? 0}
            </p>
          </div>

          {/* Drafts */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-amber-500">
              <span className="text-xs font-semibold uppercase">Drafts</span>
              <FileEdit className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
              {data?.stats.draftProjects ?? 0}
            </p>
          </div>

          {/* Services */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase">Services</span>
              <Briefcase className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              {data?.stats.totalServices ?? 0}
            </p>
          </div>

          {/* Testimonials */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase">Reviews</span>
              <Quote className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              {data?.stats.totalTestimonials ?? 0}
            </p>
          </div>

          {/* Messages */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase">Messages</span>
              <Mail className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                {data?.stats.unreadMessages ?? 0}
              </p>
              <span className="text-[10px] text-zinc-400">
                / {data?.stats.totalMessages ?? 0} total
              </span>
            </div>
          </div>
        </div>

        {/* Fast AI Assistant Quick-Ask Widget */}
        <div className="rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Quick AI Assistant
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Instant streamed answers powered by Gemini 4 Hydrogen using your portfolio data
                </p>
              </div>
            </div>
            <Link
              to="/admin/ai"
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 self-start sm:self-center"
            >
              <span>Open full AI workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuickAsk();
            }}
            className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/70 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus-within:border-purple-500"
          >
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask anything — draft a case study, write a client pitch, or suggest portfolio improvements..."
              disabled={aiLoading}
              className="flex-1 px-3.5 py-2 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!aiQuery.trim() || aiLoading}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{aiLoading ? 'Answering...' : 'Ask AI'}</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {[
              'Suggest 3 high-impact project ideas for my portfolio',
              'Draft a short client pitch email for my services',
              'Give me 3 SEO title & bio improvements',
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={aiLoading}
                onClick={() => handleQuickAsk(preset)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-purple-500/50 hover:text-purple-600 dark:hover:text-purple-400 text-xs text-zinc-600 dark:text-zinc-300 transition-colors disabled:opacity-50"
              >
                {preset}
              </button>
            ))}
          </div>

          {aiError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {(aiLoading || aiReply) && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
                  <Bot className="w-4 h-4" />
                  <span>{aiLoading && !aiReply ? 'Thinking...' : 'AI Response'}</span>
                </div>
                {aiReply && !aiLoading && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(aiReply);
                      setAiCopied(true);
                      setTimeout(() => setAiCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {aiCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {aiReply || (
                  <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce [animation-delay:0.3s]" />
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent Projects Table */}
        <div className="rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Recent Projects
              </h2>
              <p className="text-xs text-zinc-500">
                Manage status, edit contents, preview or publish instantly
              </p>
            </div>
            <Link
              to="/admin/projects"
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>View all projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-xs uppercase text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3 font-semibold">Project</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Updated</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-400">
                      Loading projects from database...
                    </td>
                  </tr>
                ) : !data?.recentProjects || data.recentProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                      No projects found. Click "+ Add New Work" to create one.
                    </td>
                  </tr>
                ) : (
                  data.recentProjects.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop'}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-white block">
                              {p.title}
                            </span>
                            <span className="text-xs text-zinc-400">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {p.category}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            p.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {p.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                        {/* Toggle Publish / Unpublish */}
                        <button
                          onClick={() => handleTogglePublish(p.id, p.status)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            p.status === 'PUBLISHED'
                              ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                          title={p.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        >
                          {p.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        </button>

                        {/* Preview */}
                        <a
                          href={`/work/${p.slug}?preview=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center"
                          title="Preview project"
                        >
                          <Eye className="w-4 h-4" />
                        </a>

                        {/* Edit */}
                        <Link
                          to={`/admin/projects/${p.id}/edit`}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center"
                          title="Edit project"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget({ id: p.id, title: p.title })}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 inline-flex items-center"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          title="Delete Portfolio Project"
          itemName={deleteTarget?.title || ''}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      </div>
    </AdminLayout>
  );
};
