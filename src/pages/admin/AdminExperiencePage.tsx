import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { ExperienceItem } from '../../types';
import { getExperience, createExperience, updateExperience, deleteExperience } from '../../lib/api';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { PlusCircle, Edit, Trash2, Briefcase, GraduationCap } from 'lucide-react';

export const AdminExperiencePage: React.FC = () => {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<ExperienceItem> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExperienceItem | null>(null);

  const loadData = async () => {
    try {
      const data = await getExperience();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!editingItem?.role || !editingItem?.organization || !editingItem?.period) {
      alert('Please fill in role, organization, and time period.');
      return;
    }
    try {
      if (editingItem.id) {
        await updateExperience(editingItem.id, editingItem);
      } else {
        await createExperience(editingItem);
      }
      setEditingItem(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save experience item');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteExperience(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <AdminLayout activeTab="experience">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              Experience &amp; Education
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Manage professional roles, client tenures, and educational milestones.
            </p>
          </div>
          <button
            onClick={() =>
              setEditingItem({
                role: '',
                organization: '',
                period: '',
                description: '',
                type: 'experience',
                orderIndex: items.length,
              })
            }
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold flex items-center gap-2 self-start"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>

        {/* Inline Editor */}
        {editingItem && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-lg">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {editingItem.id ? 'Edit Entry' : 'New Timeline Entry'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-500 mb-1">
                  Type
                </label>
                <select
                  value={editingItem.type || 'experience'}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, type: e.target.value as any })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm"
                >
                  <option value="experience">Professional Experience</option>
                  <option value="education">Education &amp; Certification</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-500 mb-1">
                  Time Period (e.g. 2024 - Present)
                </label>
                <input
                  type="text"
                  placeholder="2024 - Present"
                  value={editingItem.period || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, period: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-500 mb-1">
                  Role / Degree / Certification
                </label>
                <input
                  type="text"
                  placeholder="e.g. Virtual Executive Assistant"
                  value={editingItem.role || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, role: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-500 mb-1">
                  Organization / Institution
                </label>
                <input
                  type="text"
                  placeholder="e.g. Independent Client Engagements"
                  value={editingItem.organization || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, organization: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs uppercase font-semibold text-zinc-500 mb-1">
                  Description / Responsibilities
                </label>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
              >
                Save Entry
              </button>
            </div>
          </div>
        )}

        {/* Timeline Entries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                    {item.period}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    {item.type}
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  {item.role}
                </h3>
                <p className="text-xs text-zinc-500 mb-3">
                  {item.organization}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 mt-4">
                <button
                  onClick={() => setEditingItem(item)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          title="Delete Timeline Entry"
          itemName={deleteTarget?.role || ''}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </AdminLayout>
  );
};
