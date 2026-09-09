import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { getActivityLogs } from '../../lib/api';
import { ActivityLog } from '../../types';
import {
  History,
  PlusCircle,
  FileEdit,
  CheckCircle2,
  EyeOff,
  Trash2,
  Settings,
  Shield,
  RefreshCw,
  Clock,
  User
} from 'lucide-react';

export const AdminActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      setRefreshing(true);
      const data = await getActivityLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'PROJECT_CREATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
            <PlusCircle className="w-3 h-3" />
            Project Created
          </span>
        );
      case 'PROJECT_EDITED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
            <FileEdit className="w-3 h-3" />
            Project Edited
          </span>
        );
      case 'PROJECT_PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
            <CheckCircle2 className="w-3 h-3" />
            Project Published
          </span>
        );
      case 'PROJECT_UNPUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
            <EyeOff className="w-3 h-3" />
            Project Moved to Draft
          </span>
        );
      case 'PROJECT_DELETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300">
            <Trash2 className="w-3 h-3" />
            Project Deleted
          </span>
        );
      case 'SETTINGS_UPDATED':
      case 'NOTIFICATION_SETTINGS_UPDATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
            <Settings className="w-3 h-3" />
            Settings Updated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            <Shield className="w-3 h-3" />
            {action.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
                <History className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Admin Activity History
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Audit log of all content management actions: project creations, edits, publishes, and setting changes.
            </p>
          </div>

          <button
            onClick={fetchLogs}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-400">Loading activity log...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#12141a] border border-dashed border-zinc-200 dark:border-zinc-800">
            <History className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No activity recorded yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              Whenever you create, edit, or publish projects, actions will appear here in chronological order.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#12141a] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Item Affected</th>
                    <th className="py-3 px-4">Admin</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-white max-w-xs truncate">
                        {log.entityTitle || log.entityId || 'System'}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{log.adminEmail}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>{log.formattedDate} at {log.formattedTime}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 max-w-sm truncate">
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
