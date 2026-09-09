import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { ServiceItem } from '../../types';
import { getServices, createService, updateService, deleteService } from '../../lib/api';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { Plus, Edit, Trash2, Check, X, Sparkles, Briefcase, PlusCircle } from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [featureInput, setFeatureInput] = useState('');

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const data = await getServices();
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleSave = async () => {
    if (!editingService?.title || !editingService?.description) {
      alert('Please provide a title and description.');
      return;
    }

    try {
      if (editingService.id) {
        await updateService(editingService.id, editingService);
      } else {
        await createService(editingService);
      }
      setEditingService(null);
      await loadServices();
    } catch (err: any) {
      alert(err.message || 'Failed to save service');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteService(deleteTarget.id);
      setDeleteTarget(null);
      await loadServices();
    } catch (err: any) {
      alert(err.message || 'Failed to delete service');
    }
  };

  const addFeature = () => {
    if (!featureInput.trim() || !editingService) return;
    setEditingService({
      ...editingService,
      features: [...(editingService.features || []), featureInput.trim()],
    });
    setFeatureInput('');
  };

  const removeFeature = (idx: number) => {
    if (!editingService) return;
    setEditingService({
      ...editingService,
      features: (editingService.features || []).filter((_, i) => i !== idx),
    });
  };

  return (
    <AdminLayout activeTab="services">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              Manage Services
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Add and configure services shown on the public website.
            </p>
          </div>
          <button
            onClick={() =>
              setEditingService({
                title: '',
                description: '',
                icon: 'briefcase',
                features: [],
                active: true,
                orderIndex: services.length,
              })
            }
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold flex items-center gap-2 self-start"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>

        {/* Modal / Inline Editor */}
        {editingService && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-lg">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {editingService.id ? 'Edit Service' : 'New Service'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-500 mb-1">
                  Service Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI Prompt Engineering"
                  value={editingService.title || ''}
                  onChange={(e) =>
                    setEditingService({ ...editingService, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-500 mb-1">
                  Icon Style
                </label>
                <select
                  value={editingService.icon || 'briefcase'}
                  onChange={(e) =>
                    setEditingService({ ...editingService, icon: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm"
                >
                  <option value="briefcase">Briefcase (Virtual Assistance)</option>
                  <option value="sparkles">Brain / Sparkles (AI Prompting)</option>
                  <option value="code">Code (Vibe Coding / Web Dev)</option>
                  <option value="file-text">File Text (Content Strategy)</option>
                  <option value="graduation-cap">Graduation Cap (Digital Training)</option>
                  <option value="trending-up">Trending Up (Financial Ops)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs uppercase font-semibold text-zinc-500 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingService.description || ''}
                  onChange={(e) =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs uppercase font-semibold text-zinc-500 mb-1">
                  Key Deliverables / Features
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Prompt optimization library"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1 px-3.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editingService.features || []).map((feat, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex items-center gap-1.5"
                    >
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(i)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
              >
                Save Service
              </button>
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {service.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    {service.icon || 'briefcase'}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  {service.description}
                </p>

                {service.features && service.features.length > 0 && (
                  <ul className="space-y-1 mb-4">
                    {service.features.map((feat, i) => (
                      <li key={i} className="text-xs text-zinc-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                <button
                  onClick={() => setEditingService(service)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(service)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delete Modal */}
        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          title="Delete Service"
          itemName={deleteTarget?.title || ''}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </AdminLayout>
  );
};
