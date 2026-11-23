import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { useRouter, Link } from '../../lib/router';
import { getProjects, publishProject, unpublishProject, deleteProject, resolveAssetUrl } from '../../lib/api';
import { Project, ProjectStatus } from '../../types';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import {
  PlusCircle,
  Search,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  ExternalLink,
  Layers,
  Calendar
} from 'lucide-react';

export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await getProjects({ all: true });
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleTogglePublish = async (id: string, currentStatus: ProjectStatus) => {
    try {
      if (currentStatus === 'PUBLISHED') {
        await unpublishProject(id);
      } else {
        await publishProject(id);
      }
      await loadProjects();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      await loadProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (activeFilter === 'PUBLISHED' && p.status !== 'PUBLISHED') return false;
    if (activeFilter === 'DRAFT' && p.status !== 'DRAFT') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminLayout activeTab="projects">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Manage Work &amp; Projects
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Create new work, edit contents, upload images, save drafts or publish.
            </p>
          </div>

          <Link
            id="admin-projects-add-btn"
            to="/admin/projects/new"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-sm shadow-purple-600/20 flex items-center gap-2 hover:scale-[1.02] transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Work</span>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1">
            {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeFilter === tab
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {tab === 'ALL' ? 'All Projects' : tab === 'PUBLISHED' ? 'Published' : 'Drafts'}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Projects Table */}
        <div className="rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-xs uppercase text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Project Title</th>
                  <th className="px-6 py-3.5 font-semibold">Category</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Date</th>
                  <th className="px-6 py-3.5 font-semibold">Featured</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                      Loading projects...
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-zinc-400">
                      <Layers className="w-10 h-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300">No projects found</p>
                      <p className="text-xs text-zinc-500 mt-1">Try switching filters or add a new project.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveAssetUrl(p.coverImage) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop'}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white block line-clamp-1">
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
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
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

                      <td className="px-6 py-4 text-xs text-zinc-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{p.projectDate}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {p.featured ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            Yes
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">No</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                        {/* Toggle Publish / Unpublish */}
                        <button
                          onClick={() => handleTogglePublish(p.id, p.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
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
                          title="Preview project in new tab"
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

        {/* Delete Modal */}
        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          title="Delete Project"
          itemName={deleteTarget?.title || ''}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      </div>
    </AdminLayout>
  );
};
