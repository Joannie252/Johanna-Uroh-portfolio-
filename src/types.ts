export type ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ProjectImage {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  orderIndex: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  services: string[];
  tools: string[];
  clientName?: string;
  projectDate: string;
  projectUrl?: string;
  githubUrl?: string;
  coverImage: string;
  images: ProjectImage[];
  caseStudy?: string;
  challenge?: string;
  solution?: string;
  process?: string;
  result?: string;
  featured: boolean;
  status: ProjectStatus;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  features: string[];
  orderIndex: number;
  active: boolean;
  createdAt: string;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  role: string;
  company: string;
  content: string;
  avatarUrl?: string;
  rating: number;
  projectTitle?: string;
  active: boolean;
  isDemo?: boolean;
  createdAt: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  period: string;
  description: string;
  orderIndex: number;
  type: 'experience' | 'education';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  service?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdminUser {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  coverImage: string;
  category: string;
  price: number;
  currency: string;
  whatYouWillLearn: string[];
  targetAudience: string[];
  whatIncluded: string[];
  previewUrl?: string;
  purchaseUrl: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MentorshipApplicationStatus =
  | 'New'
  | 'Reviewing'
  | 'Accepted'
  | 'Rejected'
  | 'Contacted'
  | 'Completed';

export interface MentorshipProgramme {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  coverImage: string;
  duration: string;
  format: string;
  sessions: string;
  price: number;
  currency: string;
  targetAudience: string[];
  curriculum: string[];
  includedFeatures: string[];
  expectedOutcomes: string[];
  applicationEnabled: boolean;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipApplication {
  id: string;
  programmeId: string;
  programmeName: string;
  fullName: string;
  email: string;
  whatsapp: string;
  currentSkillLevel: string;
  skillToLearn: string;
  whyMentorship: string;
  goals: string;
  preferredProgramme: string;
  availability: string;
  portfolioLink?: string;
  status: MentorshipApplicationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  totalServices: number;
  totalTestimonials: number;
  unreadMessages: number;
  totalMessages: number;
}

export interface DashboardData {
  stats: AdminStats;
  recentProjects: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    status: ProjectStatus;
    featured: boolean;
    publishedAt: string | null;
    updatedAt: string;
    coverImage: string;
  }>;
  recentMessages: ContactMessage[];
}

export interface AnalyticsOverview {
  range: string;
  totals: {
    totalProjects: number;
    publishedProjects: number;
    draftProjects: number;
    featuredProjects: number;
    totalPortfolioViews: number;
    totalProjectViews: number;
    projectClicks: number;
    liveDemoClicks: number;
    githubClicks: number;
    contactFormSubmissions: number;
  };
  viewsOverTime: Array<{
    date: string;
    portfolioViews: number;
    projectViews: number;
  }>;
  mostViewedProjects: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    coverImage: string;
    views: number;
  }>;
  mostClickedProjects: Array<{
    id: string;
    title: string;
    slug: string;
    clicks: number;
  }>;
  popularCategories: Array<{
    category: string;
    count: number;
  }>;
}

export interface ProjectAnalytics {
  projectId: string;
  title: string;
  hasData: boolean;
  stats: {
    views: number;
    uniqueVisitors: number;
    liveDemoClicks: number;
    githubClicks: number;
    shares: number;
  };
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  entityTitle: string | null;
  adminEmail: string;
  details: string | null;
  createdAt: string;
  formattedDate: string;
  formattedTime: string;
}

export interface SiteSettings {
  profile: {
    name: string;
    headline: string;
    bio: string;
    profilePicture: string;
    email: string;
    socials: {
      linkedin?: string;
      github?: string;
      twitter?: string;
      [key: string]: string | undefined;
    };
  };
  portfolio: {
    defaultCategory: string;
    featuredLimit: number;
    itemsPerPage: number;
  };
  features: {
    aiEnabled: boolean;
    analyticsEnabled: boolean;
    animationIntensity: 'Full' | 'Reduced' | 'Off';
  };
}

export interface NotificationSettings {
  emailNotifications: boolean;
  notificationEmail: string;
  notifications: {
    newContactMessage: boolean;
    projectPublished: boolean;
    projectUpdated: boolean;
    newBlogPost: boolean;
    importantSystemAlerts: boolean;
  };
  isServiceConfigured: boolean;
  statusMessage: string;
}

export interface SearchQueryResult {
  query: string;
  total: number;
  results: Project[];
  categories: string[];
  tools: string[];
}

