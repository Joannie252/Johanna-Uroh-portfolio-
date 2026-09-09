import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { TestimonialItem } from '../../types';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../../lib/api';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { PlusCircle, Edit, Trash2, Star, Quote } from 'lucide-react';

export const AdminTestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<TestimonialItem> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TestimonialItem | null>(null);

  const loadData = async () => {
    try {
      const data = await getTestimonials();
      setTestimonials(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!editingItem?.clientName || !editingItem?.content) {
      alert('Please enter a client name and review content.');
      return;
    }
    try {
      if (editingItem.id) {
        await updateTestimonial(editingItem.id, editingItem);
      } else {
        await createTestimonial(editingItem);
      }
      setEditingItem(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save testimonial');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTestimonial(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete testimonial');
    }
  };

  return (
    <AdminLayout activeTab="testimonials">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              Manage Testimonials
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Add authentic reviews from clients, colleagues, and collaborators.
            </p>
          </div>
          <button
            onClick={() =>
              setEditingItem({
                clientName: '',
                role: '',
                company: '',
                content: '',
                rating: 5,
                active: true,
                isDemo: false,
              })
            }
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold flex items-center gap-2 self-start"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Testimonial</span>
          </button>
        </div>

        {/* Modal / Inline Editor */}
        {editingItem && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-lg">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {editingItem.id ? 'Edit Testimonial' : 'New Testimonial'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-500 mb-1">
                  Client / Partner Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={editingItem.clientName || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, clientName: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-500 mb-1">
                  Role &amp; Company
                </label>
                <input
                  type="text"
                  placeholder="e.g. Founder, Horizon Media"
                  value={editingItem.role || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, role: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs uppercase font-semibold text-zinc-500 mb-1">
                  Review Content
                </label>
                <textarea
                  rows={3}
                  value={editingItem.content || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, content: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-500 mb-1">
                  Star Rating (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={editingItem.rating || 5}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, rating: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  id="isDemo-check"
                  type="checkbox"
                  checked={editingItem.isDemo || false}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, isDemo: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="isDemo-check" className="text-xs text-zinc-600 dark:text-zinc-400">
                  Mark as Demo / Placeholder review
                </label>
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
                Save
              </button>
            </div>
          </div>
        )}

        {/* Testimonials List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex text-amber-400">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  {item.isDemo && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      Demo Sample
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 italic mb-4">
                  &ldquo;{item.content}&rdquo;
                </p>
                <div className="text-xs">
                  <span className="font-bold text-zinc-900 dark:text-white block">
                    {item.clientName}
                  </span>
                  <span className="text-zinc-500">
                    {item.role} {item.company ? `• ${item.company}` : ''}
                  </span>
                </div>
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
          title="Delete Testimonial"
          itemName={deleteTarget?.clientName || ''}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </AdminLayout>
  );
};
