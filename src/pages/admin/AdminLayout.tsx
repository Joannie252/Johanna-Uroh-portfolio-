import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getContactMessages } from '../../lib/api';
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  Briefcase,
  Quote,
  GraduationCap,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  Sun,
  Moon,
  Menu,
  X,
  Shield,
  Sparkles,
  BarChart3,
  History,
  Globe,
  ShoppingBag
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab }) => {
  const { path, navigate } = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check auth state
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Check unread messages count
  useEffect(() => {
    if (isAuthenticated) {
      getContactMessages()
        .then((msgs) => {
          const unread = msgs.filter((m) => !m.read).length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, path]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0b0c10]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const adminNavItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
    { name: 'Add Project', href: '/admin/projects/new', icon: PlusCircle, highlight: true },
    { name: 'Digital Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Services', href: '/admin/services', icon: Briefcase },
    { name: 'Testimonials', href: '/admin/testimonials', icon: Quote },
    {
      name: 'Messages',
      href: '/admin/messages',
      icon: Mail,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Activity', href: '/admin/activity', icon: History },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'AI Assistant', href: '/admin/ai', icon: Sparkles },
    { name: 'Experience', href: '/admin/experience', icon: GraduationCap },
  ];

  const currentPath = path.split('?')[0];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0e1017] text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#12141a] border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-violet-400 flex items-center justify-center text-white font-bold text-sm">
            JU
          </div>
          <span className="font-bold text-sm">Johanna CMS</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-64 bg-white dark:bg-[#12141a] border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between overflow-y-auto h-screen transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/60">
            <Link to="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-violet-400 flex items-center justify-center text-white font-bold text-base shadow-md shadow-purple-500/20">
                JU
              </div>
              <div>
                <span className="font-bold text-base tracking-tight block">
                  Johanna Uroh
                </span>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Portfolio Admin CMS
                </span>
              </div>
            </Link>
          </div>

          {/* Section: ADMIN */}
          <div className="p-4 space-y-1">
            <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Admin
            </div>
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const isActive = item.exact
                  ? currentPath === item.href
                  : currentPath.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20'
                        : item.highlight
                        ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          isActive
                            ? 'bg-white text-purple-700'
                            : 'bg-purple-600 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Sections: PUBLIC & ACCOUNT */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/60 space-y-4">
          {/* Section: PUBLIC */}
          <div>
            <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Public
            </div>
            <Link
              id="admin-view-website-btn"
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-purple-700 dark:text-purple-300 bg-purple-50/90 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 hover:shadow-md hover:shadow-purple-500/10 hover:border-purple-300 dark:hover:border-purple-700 hover:translate-x-1 transition-all duration-200"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform duration-200 shrink-0" />
                <span>View Website ↗</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200 shrink-0" />
            </Link>
          </div>

          {/* Section: ACCOUNT */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
            <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Account
            </div>

            {/* Current admin profile card */}
            <div className="px-2 py-1.5 mb-2.5 flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-purple-600/20 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-xs shrink-0">
                JU
              </div>
              <div className="truncate">
                <span className="text-xs font-semibold block truncate text-zinc-800 dark:text-zinc-200">
                  {user?.name || 'Johanna Uroh'}
                </span>
                <span className="text-[10px] text-zinc-400 block truncate">
                  {user?.email || 'urohjohanna25@gmail.com'}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              id="admin-logout-btn"
              onClick={async () => {
                setSidebarOpen(false);
                await handleLogout();
              }}
              className="w-full group flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100/90 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/60 hover:shadow-sm active:scale-[0.99] transition-all duration-200"
            >
              <LogOut className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
