import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { ContactMessage } from '../../types';
import { getContactMessages, markMessageRead, deleteContactMessage } from '../../lib/api';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { Mail, Trash2, CheckCircle2, Clock, Reply, Inbox } from 'lucide-react';

export const AdminMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const data = await getContactMessages();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markMessageRead(id);
      await loadMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteContactMessage(deleteTarget.id);
      setDeleteTarget(null);
      await loadMessages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout activeTab="messages">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            Client Messages &amp; Inquiries
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Submitted inquiries from the public website contact form.
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-zinc-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800">
            <Inbox className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
            <h3 className="font-bold text-zinc-800 dark:text-zinc-200">No Messages Yet</h3>
            <p className="text-xs text-zinc-500 mt-1">
              New submissions from your contact form will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-6 rounded-3xl border transition-all ${
                  msg.read
                    ? 'bg-white dark:bg-[#12141a] border-zinc-200 dark:border-zinc-800'
                    : 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/80 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-base text-zinc-900 dark:text-white">
                      {msg.name}
                    </span>
                    <a
                      href={`mailto:${msg.email}?subject=Re: Inquiry from Johanna Uroh Portfolio`}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <Reply className="w-3 h-3" />
                      <span>{msg.email}</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    {msg.service && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {msg.service}
                      </span>
                    )}
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line mb-4">
                  {msg.message}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                  <div>
                    {!msg.read && (
                      <button
                        onClick={() => handleMarkRead(msg.id)}
                        className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as read</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setDeleteTarget(msg)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          title="Delete Message"
          itemName={`message from ${deleteTarget?.name}`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </AdminLayout>
  );
};
