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
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  createdAt: string;
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

