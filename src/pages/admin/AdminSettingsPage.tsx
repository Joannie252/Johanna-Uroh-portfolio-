import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { useRouter } from '../../lib/router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  getAdminSettings,
  updateAdminSettings,
  getNotificationSettings,
  updateNotificationSettings,
  testEmailNotification,
  uploadImageFile,
  resolveAssetUrl
} from '../../lib/api';
import {
  Settings,
  User,
  FolderKanban,
  Sparkles,
  BarChart3,
  Bell,
  Palette,
  Check,
  AlertCircle,
  Upload,
  RefreshCw,
  Send,
  Shield,
  Sliders,
  Sun,
  Moon
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { path } = useRouter();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Determine active section from URL or default to profile
  const isNotificationsUrl = path.includes('/notifications');
  const [activeTab, setActiveTab] = useState<'profile' | 'portfolio' | 'ai' | 'analytics' | 'notifications' | 'appearance'>(
    isNotificationsUrl ? 'notifications' : 'profile'
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings State
  const [profileName, setProfileName] = useState('Johanna Uroh');
  const [profileHeadline, setProfileHeadline] = useState('Virtual Assistant & AI Digital Specialist');
  const [profileBio, setProfileBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [profileEmail, setProfileEmail] = useState('urohjohanna25@gmail.com');
  const [socialLinkedin, setSocialLinkedin] = useState('');
  const [socialGithub, setSocialGithub] = useState('');
  const [socialTwitter, setSocialTwitter] = useState('');

  // Portfolio
  const [defaultCategory, setDefaultCategory] = useState('All');
  const [featuredLimit, setFeaturedLimit] = useState(3);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // AI & Analytics
  const [aiEnabled, setAiEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState('urohjohanna25@gmail.com');
  const [notifyContactMessage, setNotifyContactMessage] = useState(true);
  const [notifyProjectPublished, setNotifyProjectPublished] = useState(true);
  const [notifyProjectUpdated, setNotifyProjectUpdated] = useState(false);
  const [notifyBlogPost, setNotifyBlogPost] = useState(false);
  const [notifySystemAlerts, setNotifySystemAlerts] = useState(true);
  const [emailServiceConfigured, setEmailServiceConfigured] = useState(false);
  const [emailServiceDetails, setEmailServiceDetails] = useState('');
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Appearance
  const [animationIntensity, setAnimationIntensity] = useState<'Full' | 'Reduced' | 'Off'>('Full');

  const [uploadingPic, setUploadingPic] = useState(false);
  const [logoImage, setLogoImage] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const initials = profileName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'JU';

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [settingsRes, notifRes] = await Promise.all([
          getAdminSettings(),
          getNotificationSettings(),
        ]);

        const s = settingsRes.settings;
        setProfileName(s.profile_name || 'Johanna Uroh');
        setProfileHeadline(s.profile_headline || 'Virtual Assistant & AI Digital Specialist');
        setProfileBio(s.profile_bio || '');
        setProfilePicture(s.profile_picture || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop');
        setLogoImage(s.profile_logo || s.site_logo || '');
        setProfileEmail(s.profile_email || user?.email || 'urohjohanna25@gmail.com');

        if (s.profile_socials) {
          try {
            const socials = JSON.parse(s.profile_socials);
            setSocialLinkedin(socials.linkedin || '');
            setSocialGithub(socials.github || '');
            setSocialTwitter(socials.twitter || '');
          } catch {}
        }

        setDefaultCategory(s.default_project_category || 'All');
        setFeaturedLimit(Number(s.featured_count_limit) || 3);
        setItemsPerPage(Number(s.items_per_page) || 6);

        setAiEnabled(s.ai_features_enabled !== 'false');
        setAnalyticsEnabled(s.analytics_enabled !== 'false');
        setAnimationIntensity((s.animation_intensity as any) || 'Full');

        // Notifications
        setEmailNotifications(notifRes.emailNotifications);
        setNotificationEmail(notifRes.notificationEmail || s.profile_email || 'urohjohanna25@gmail.com');
        setNotifyContactMessage(notifRes.notifications.newContactMessage);
        setNotifyProjectPublished(notifRes.notifications.projectPublished);
        setNotifyProjectUpdated(notifRes.notifications.projectUpdated);
        setNotifyBlogPost(notifRes.notifications.newBlogPost);
        setNotifySystemAlerts(notifRes.notifications.importantSystemAlerts);
        setEmailServiceConfigured(notifRes.isServiceConfigured);
        setEmailServiceDetails(notifRes.statusMessage);
      } catch (err: any) {
        console.error('Failed to load settings:', err);
        setErrorMessage('Failed to load settings from server.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPic(true);
      const res = await uploadImageFile(file, 'Profile Portrait');
      setProfilePicture(res.url);
    } catch (err: any) {
      alert(err.message || 'Failed to upload profile image.');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const res = await uploadImageFile(file, 'Brand Logo');
      setLogoImage(res.url);
    } catch (err: any) {
      alert(err.message || 'Failed to upload logo image.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage(null);
      setSaveSuccess(false);

      const updates: Record<string, any> = {
        profile_name: profileName,
        profile_headline: profileHeadline,
        profile_bio: profileBio,
        profile_picture: profilePicture,
        profile_logo: logoImage,
        site_logo: logoImage,
        profile_email: profileEmail,
        profile_socials: JSON.stringify({
          linkedin: socialLinkedin,
          github: socialGithub,
          twitter: socialTwitter,
        }),
        default_project_category: defaultCategory,
        featured_count_limit: String(featuredLimit),
        items_per_page: String(itemsPerPage),
        ai_features_enabled: aiEnabled ? 'true' : 'false',
        analytics_enabled: analyticsEnabled ? 'true' : 'false',
        animation_intensity: animationIntensity,
        email_notifications: emailNotifications ? 'true' : 'false',
        notification_email: notificationEmail,
        notify_contact_message: notifyContactMessage ? 'true' : 'false',
        notify_project_published: notifyProjectPublished ? 'true' : 'false',
        notify_project_updated: notifyProjectUpdated ? 'true' : 'false',
        notify_blog_post: notifyBlogPost ? 'true' : 'false',
        notify_system_alerts: notifySystemAlerts ? 'true' : 'false',
      };

      await updateAdminSettings(updates);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setTestEmailLoading(true);
      setTestEmailResult(null);
      const res = await testEmailNotification();
      setTestEmailResult({ success: true, message: res.message });
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        message: err.message || 'Email service is not configured.',
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'portfolio', label: 'Portfolio', icon: FolderKanban },
    { id: 'ai', label: 'AI Features', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ] as const;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
                <Settings className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Portfolio &amp; CMS Settings
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Configure your profile information, email notification triggers, AI integrations, and display preferences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl">
                <Check className="w-3.5 h-3.5" />
                Settings Saved!
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save All Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-400">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. PROFILE SETTINGS */}
            {activeTab === 'profile' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 space-y-6 shadow-sm">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  Profile Information
                </h2>

                {/* Profile Picture */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Profile Picture (Hero &amp; About)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0">
                      {profilePicture ? (
                        <img
                          src={resolveAssetUrl(profilePicture)}
                          alt="Johanna Uroh Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold text-lg">
                          JU
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-purple-600" />
                        <span>{uploadingPic ? 'Uploading...' : 'Upload New Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                          disabled={uploadingPic}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={profilePicture}
                        onChange={(e) => setProfilePicture(e.target.value)}
                        placeholder="Or enter direct image URL..."
                        className="block w-full sm:w-96 text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Brand Logo Image (Navbar, Footer, Admin CMS) */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Brand Logo Image (Navbar, Footer &amp; Main Website)
                    </label>
                    {logoImage && (
                      <button
                        type="button"
                        onClick={() => setLogoImage('')}
                        className="text-[11px] text-rose-500 hover:text-rose-600 font-medium transition-colors"
                      >
                        Reset to default monogram
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
                    Upload your custom logo image (PNG with transparent background, SVG, or JPG recommended). It immediately displays in the main website top navigation bar, footer, and admin header upon saving.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-tr from-purple-600 to-violet-400 border border-purple-500/30 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-purple-500/20 shrink-0">
                      {logoImage ? (
                        <img
                          src={resolveAssetUrl(logoImage)}
                          alt="Brand Logo Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5 text-purple-600" />
                          <span>{uploadingLogo ? 'Uploading Logo...' : 'Upload Logo Image'}</span>
                          <input
                            type="file"
                            accept="image/*,.svg"
                            onChange={handleLogoUpload}
                            disabled={uploadingLogo}
                            className="hidden"
                          />
                        </label>
                        {logoImage && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Custom logo configured
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={logoImage}
                        onChange={(e) => setLogoImage(e.target.value)}
                        placeholder="Or paste direct logo image URL..."
                        className="block w-full sm:w-96 text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Real-time Preview Mockup */}
                  <div className="mt-3.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-2">
                      Live Preview Appearance (Navbar &amp; Footer)
                    </span>
                    <div className="flex flex-wrap items-center gap-6">
                      {/* Navbar Preview */}
                      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0b0c10] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-tr from-purple-600 to-violet-400 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                          {logoImage ? (
                            <img src={resolveAssetUrl(logoImage)} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            initials
                          )}
                        </div>
                        <div className="leading-tight">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-white block">
                            {profileName || 'Johanna Uroh'}
                          </span>
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 block">
                            Navbar Brand
                          </span>
                        </div>
                      </div>

                      {/* Footer Preview */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800">
                        <div className="w-6 h-6 rounded-md overflow-hidden bg-gradient-to-tr from-purple-600 to-violet-400 flex items-center justify-center text-white font-bold text-xs">
                          {logoImage ? (
                            <img src={resolveAssetUrl(logoImage)} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            initials
                          )}
                        </div>
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Footer Brand Mark
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      value={profileHeadline}
                      onChange={(e) => setProfileHeadline(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Bio &amp; Philosophy (Displays in Hero and About sections)
                  </label>
                  <textarea
                    rows={3}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Public Contact Email
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full sm:w-96 text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Social Links */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Social Profiles</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[11px] text-zinc-400 block mb-1">LinkedIn URL</span>
                      <input
                        type="url"
                        value={socialLinkedin}
                        onChange={(e) => setSocialLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-400 block mb-1">GitHub URL</span>
                      <input
                        type="url"
                        value={socialGithub}
                        onChange={(e) => setSocialGithub(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-400 block mb-1">Twitter / X URL</span>
                      <input
                        type="url"
                        value={socialTwitter}
                        onChange={(e) => setSocialTwitter(e.target.value)}
                        placeholder="https://twitter.com/..."
                        className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PORTFOLIO SETTINGS */}
            {activeTab === 'portfolio' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 space-y-6 shadow-sm">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  Portfolio CMS Settings
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Default Project Category
                    </label>
                    <select
                      value={defaultCategory}
                      onChange={(e) => setDefaultCategory(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="All">All Categories</option>
                      <option value="AI">AI &amp; Automation</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Virtual Assistance">Virtual Assistance</option>
                      <option value="Financial Education">Financial Education</option>
                      <option value="Productivity">Productivity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Featured Work Homepage Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={featuredLimit}
                      onChange={(e) => setFeaturedLimit(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Projects Per Page (Archive)
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={24}
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. AI SETTINGS */}
            {activeTab === 'ai' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 space-y-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                      AI Capabilities &amp; Model Integration
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Powers the public AI widget and CMS content generators
                    </p>
                  </div>
                  {/* Master Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiEnabled}
                      onChange={(e) => setAiEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 text-xs space-y-2">
                  <div className="font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Gemini 4 Hydrogen Engine Connected</span>
                  </div>
                  <p className="text-purple-700 dark:text-purple-400">
                    The AI operates server-side with strict grounding on Johanna&apos;s verified portfolio database. It strictly obeys privacy constraints and never publishes content automatically without your approval.
                  </p>
                </div>
              </div>
            )}

            {/* 4. ANALYTICS SETTINGS */}
            {activeTab === 'analytics' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 space-y-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                      Analytics &amp; Engagement Tracking
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Anonymous telemetry for page views, project views, and link clicks
                    </p>
                  </div>
                  {/* Master Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5">
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Privacy-First Architecture:
                  </p>
                  <p>
                    No personal data, cookies, or IP addresses are stored. Analytics events are aggregated anonymously to provide you with insights into which projects and services resonate most with your audience.
                  </p>
                </div>
              </div>
            )}

            {/* 5. NOTIFICATIONS SETTINGS */}
            {activeTab === 'notifications' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 space-y-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                      Email Notification Settings
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Configure automated alerts when clients reach out or projects are published
                    </p>
                  </div>
                  {/* Master Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Notifications: {emailNotifications ? 'ON' : 'OFF'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                {/* Service Status Notice */}
                <div
                  className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    emailServiceConfigured
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="font-semibold block">Email Service Status</span>
                      <span>{emailServiceDetails}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleTestEmail}
                    disabled={testEmailLoading}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>{testEmailLoading ? 'Testing...' : 'Test Delivery'}</span>
                  </button>
                </div>

                {testEmailResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      testEmailResult.success
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50'
                    }`}
                  >
                    {testEmailResult.success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{testEmailResult.message}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Administrator Notification Email Address
                  </label>
                  <input
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    className="w-full sm:w-96 text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Contact form submissions are always recorded in the database regardless of notification status.
                  </p>
                </div>

                {/* Sub-Toggles */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Individual Notification Triggers
                  </h3>

                  <div className="space-y-3">
                    {/* New Contact Message */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                      <div>
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                          New Contact Message
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Receive an email alert whenever a visitor submits the contact form
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifyContactMessage}
                          disabled={!emailNotifications}
                          onChange={(e) => setNotifyContactMessage(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 peer-disabled:opacity-40"></div>
                      </label>
                    </div>

                    {/* Project Published */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                      <div>
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                          Project Published
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Confirmation alert when a new project goes live on the public portfolio
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifyProjectPublished}
                          disabled={!emailNotifications}
                          onChange={(e) => setNotifyProjectPublished(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 peer-disabled:opacity-40"></div>
                      </label>
                    </div>

                    {/* Project Updated */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                      <div>
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                          Project Updated
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Alert when an existing project is modified in the CMS
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifyProjectUpdated}
                          disabled={!emailNotifications}
                          onChange={(e) => setNotifyProjectUpdated(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 peer-disabled:opacity-40"></div>
                      </label>
                    </div>

                    {/* New Blog Post */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                      <div>
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                          New Blog Post
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Notification upon publishing articles or case study insights
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifyBlogPost}
                          disabled={!emailNotifications}
                          onChange={(e) => setNotifyBlogPost(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 peer-disabled:opacity-40"></div>
                      </label>
                    </div>

                    {/* Important System Alerts */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                      <div>
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                          Important System Alerts
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Security notices, login alerts, and system database backups
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifySystemAlerts}
                          disabled={!emailNotifications}
                          onChange={(e) => setNotifySystemAlerts(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 peer-disabled:opacity-40"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. APPEARANCE SETTINGS */}
            {activeTab === 'appearance' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 space-y-6 shadow-sm">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  Appearance &amp; Animation Preferences
                </h2>

                {/* Theme Mode */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Interface Theme Mode
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => theme === 'dark' && toggleTheme()}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        theme === 'light'
                          ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Light Theme</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => theme === 'light' && toggleTheme()}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        theme === 'dark'
                          ? 'border-purple-600 bg-purple-950/40 text-purple-300 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <Moon className="w-4 h-4 text-purple-400" />
                      <span>Dark Theme</span>
                    </button>
                  </div>
                </div>

                {/* Animation Intensity */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Animation Intensity
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(['Full', 'Reduced', 'Off'] as const).map((intensity) => (
                      <button
                        key={intensity}
                        type="button"
                        onClick={() => setAnimationIntensity(intensity)}
                        className={`p-3 text-left rounded-xl border text-xs transition-all ${
                          animationIntensity === intensity
                            ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-300 font-bold shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span>{intensity} Animation</span>
                          {animationIntensity === intensity && (
                            <Check className="w-3.5 h-3.5 text-purple-600" />
                          )}
                        </div>
                        <p className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
                          {intensity === 'Full'
                            ? 'Subtle interactive network visual, smooth micro-interactions, and card entrance effects.'
                            : intensity === 'Reduced'
                            ? 'Standard static transitions, respectful of low motion preferences.'
                            : 'Completely static transitions without motion effects.'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
