import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { RouterProvider, useRouter, matchPath, Link } from './lib/router';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Public Pages
import { HomePage } from './pages/HomePage';
import { WorkPage } from './pages/WorkPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PublicSearchPage } from './pages/PublicSearchPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { MentorshipPage } from './pages/Mentorship';
import { MentorshipDetailPage } from './pages/MentorshipDetail';
import { MentorshipApplyPage } from './pages/MentorshipApply';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminProjectEditorPage } from './pages/admin/AdminProjectEditorPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminMentorshipPage } from './pages/admin/AdminMentorshipPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminTestimonialsPage } from './pages/admin/AdminTestimonialsPage';
import { AdminExperiencePage } from './pages/admin/AdminExperiencePage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminAIPage } from './pages/admin/AdminAIPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminActivityPage } from './pages/admin/AdminActivityPage';

const AppContent: React.FC = () => {
  const { path } = useRouter();
  const cleanPath = path.split('?')[0];

  // Check Admin Routes first
  if (cleanPath === '/admin/login') {
    return <AdminLoginPage />;
  }

  if (cleanPath === '/admin' || cleanPath === '/admin/dashboard') {
    return <AdminDashboardPage />;
  }

  if (cleanPath === '/admin/projects/new') {
    return <AdminProjectEditorPage />;
  }

  const editMatch = matchPath('/admin/projects/:id/edit', cleanPath);
  if (editMatch.matches) {
    return <AdminProjectEditorPage projectId={editMatch.params.id} />;
  }

  if (cleanPath === '/admin/projects') {
    return <AdminProjectsPage />;
  }

  if (cleanPath === '/admin/products') {
    return <AdminProductsPage />;
  }

  if (cleanPath === '/admin/mentorship') {
    return <AdminMentorshipPage />;
  }

  if (cleanPath === '/admin/services') {
    return <AdminServicesPage />;
  }

  if (cleanPath === '/admin/testimonials') {
    return <AdminTestimonialsPage />;
  }

  if (cleanPath === '/admin/experience') {
    return <AdminExperiencePage />;
  }

  if (cleanPath === '/admin/messages') {
    return <AdminMessagesPage />;
  }

  if (cleanPath === '/admin/ai') {
    return <AdminAIPage />;
  }

  if (cleanPath === '/admin/analytics') {
    return <AdminAnalyticsPage />;
  }

  if (cleanPath === '/admin/activity') {
    return <AdminActivityPage />;
  }

  if (cleanPath === '/admin/settings') {
    return <AdminSettingsPage />;
  }

  // Public Routes (wrapped in Navbar and Footer)
  let pageContent: React.ReactNode = null;

  if (cleanPath === '/') {
    pageContent = <HomePage />;
  } else if (cleanPath === '/work') {
    pageContent = <WorkPage />;
  } else if (cleanPath === '/resources') {
    pageContent = <ResourcesPage />;
  } else if (cleanPath === '/mentorship') {
    pageContent = <MentorshipPage />;
  } else if (cleanPath === '/mentorship/apply') {
    pageContent = <MentorshipApplyPage />;
  } else if (cleanPath === '/search') {
    pageContent = <PublicSearchPage />;
  } else if (cleanPath === '/services') {
    pageContent = <ServicesPage />;
  } else if (cleanPath === '/about') {
    pageContent = <AboutPage />;
  } else if (cleanPath === '/contact') {
    pageContent = <ContactPage />;
  } else {
    // Dynamic single project check: /work/:slug
    const workMatch = matchPath('/work/:slug', cleanPath);
    const resourceMatch = matchPath('/resources/:slug', cleanPath);
    const mentorshipApplyMatch = matchPath('/mentorship/:slug/apply', cleanPath);
    const mentorshipMatch = matchPath('/mentorship/:slug', cleanPath);

    if (workMatch.matches) {
      pageContent = <ProjectDetailPage slug={workMatch.params.slug} />;
    } else if (resourceMatch.matches) {
      pageContent = <ResourceDetailPage slug={resourceMatch.params.slug} />;
    } else if (mentorshipApplyMatch.matches) {
      pageContent = <MentorshipApplyPage slug={mentorshipApplyMatch.params.slug} />;
    } else if (mentorshipMatch.matches) {
      pageContent = <MentorshipDetailPage slug={mentorshipMatch.params.slug} />;
    } else {
      // 404 Not Found
      pageContent = (
        <div className="pt-36 pb-28 text-center min-h-[70vh] flex flex-col items-center justify-center px-4">
          <h1 className="text-6xl font-extrabold text-purple-600 font-display">404</h1>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">Page Not Found</h2>
          <p className="text-sm text-zinc-500 max-w-sm mt-2">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            to="/"
            className="mt-6 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors"
          >
            Return to Home
          </Link>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0b0c10] text-zinc-900 dark:text-zinc-100 selection:bg-purple-500 selection:text-white transition-colors duration-200">
      <Navbar />
      <div className="flex-1">{pageContent}</div>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <RouterProvider>
            <AppContent />
          </RouterProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
