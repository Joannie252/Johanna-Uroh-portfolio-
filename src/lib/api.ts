import { Project, ServiceItem, TestimonialItem, ExperienceItem, ContactMessage, AdminUser, DashboardData, Product } from '../types';

const TOKEN_KEY = 'johanna_admin_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Auth API
export async function loginAdmin(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }
  setStoredToken(data.token);
  return data;
}

export async function logoutAdmin(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST', headers: getAuthHeaders() });
  } finally {
    removeStoredToken();
  }
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      removeStoredToken();
      return null;
    }
    const data = await res.json();
    return data.user;
  } catch {
    removeStoredToken();
    return null;
  }
}

// Projects API
export async function getProjects(params?: {
  category?: string;
  search?: string;
  status?: string;
  featured?: boolean;
  limit?: number;
  all?: boolean;
}): Promise<Project[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'All') query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  if (params?.featured) query.set('featured', 'true');
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.all) query.set('all', 'true');

  const res = await fetch(`/api/projects?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch projects');
  }
  return res.json();
}

export async function getProjectBySlug(slug: string, preview?: boolean): Promise<Project> {
  const query = preview ? '?preview=true' : '';
  const res = await fetch(`/api/projects/${encodeURIComponent(slug)}${query}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Project not found');
  }
  return res.json();
}

export async function createProject(data: Partial<Project>): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Failed to create project');
  }
  return result;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Failed to update project');
  }
  return result;
}

export async function publishProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}/publish`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Failed to publish project');
  }
  return result;
}

export async function unpublishProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}/unpublish`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Failed to unpublish project');
  }
  return result;
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.error || 'Failed to delete project');
  }
}

// Upload API
export async function uploadImageFile(file: File, alt?: string): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  if (alt) formData.append('alt', alt);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload image');
  }
  return data;
}

// Services API
export async function getServices(): Promise<ServiceItem[]> {
  const res = await fetch('/api/services', { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to load services');
  return res.json();
}

export async function createService(service: Partial<ServiceItem>): Promise<ServiceItem> {
  const res = await fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(service),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create service');
  return data;
}

export async function updateService(id: string, service: Partial<ServiceItem>): Promise<ServiceItem> {
  const res = await fetch(`/api/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(service),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update service');
  return data;
}

export async function deleteService(id: string): Promise<void> {
  const res = await fetch(`/api/services/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete service');
}

// Testimonials API
export async function getTestimonials(): Promise<TestimonialItem[]> {
  const res = await fetch('/api/testimonials', { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to load testimonials');
  return res.json();
}

export async function createTestimonial(item: Partial<TestimonialItem>): Promise<TestimonialItem> {
  const res = await fetch('/api/testimonials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(item),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create testimonial');
  return data;
}

export async function updateTestimonial(id: string, item: Partial<TestimonialItem>): Promise<TestimonialItem> {
  const res = await fetch(`/api/testimonials/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(item),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update testimonial');
  return data;
}

export async function deleteTestimonial(id: string): Promise<void> {
  const res = await fetch(`/api/testimonials/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete testimonial');
}

// Experience API
export async function getExperience(type?: 'experience' | 'education'): Promise<ExperienceItem[]> {
  const query = type ? `?type=${type}` : '';
  const res = await fetch(`/api/experience${query}`);
  if (!res.ok) throw new Error('Failed to load experience items');
  return res.json();
}

export async function createExperience(item: Partial<ExperienceItem>): Promise<ExperienceItem> {
  const res = await fetch('/api/experience', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(item),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save experience item');
  return data;
}

export async function updateExperience(id: string, item: Partial<ExperienceItem>): Promise<ExperienceItem> {
  const res = await fetch(`/api/experience/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(item),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update experience item');
  return data;
}

export async function deleteExperience(id: string): Promise<void> {
  const res = await fetch(`/api/experience/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete item');
}

// Contact API
export async function sendContactMessage(data: {
  name: string;
  email: string;
  service?: string;
  message: string;
}): Promise<{ message: string }> {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Failed to send message');
  }
  return result;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const res = await fetch('/api/contact', { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to load messages');
  return res.json();
}

export async function markMessageRead(id: string): Promise<ContactMessage> {
  const res = await fetch(`/api/contact/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to update message');
  return data;
}

export async function deleteContactMessage(id: string): Promise<void> {
  const res = await fetch(`/api/contact/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete message');
}

// Stats API
export async function getDashboardStats(): Promise<DashboardData> {
  const res = await fetch('/api/stats', { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to retrieve dashboard stats');
  return res.json();
}

// AI API
export async function generateProjectDetails(params: {
  title: string;
  category?: string;
  tools?: string[];
  clientName?: string;
  existingInfo?: string;
  requestedField?: string;
  notes?: string;
}): Promise<any> {
  const res = await fetch('/api/ai/generate-project-details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to generate project details');
  return data.data;
}

export const generateProjectWithAI = generateProjectDetails;

export async function improveTextWithAI(
  textOrParams:
    | {
        mode?: 'improve' | 'professional' | 'concise' | 'engaging' | 'grammar';
        context?: string;
        text: string;
      }
    | string,
  instruction?: string
): Promise<any> {
  const body =
    typeof textOrParams === 'string'
      ? { text: textOrParams, mode: 'improve', context: instruction }
      : textOrParams;

  const res = await fetch('/api/ai/improve-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to improve text');
  if (typeof textOrParams === 'string') {
    return data.suggestion || data.text || '';
  }
  return data;
}

export const improveTextAPI = improveTextWithAI;

export async function generateAltTextWithAI(
  paramsOrContext:
    | {
        imageUrl?: string;
        projectTitle?: string;
        filename?: string;
        context?: string;
      }
    | string,
  maybeTitle?: string
): Promise<string> {
  const body =
    typeof paramsOrContext === 'string'
      ? { filename: paramsOrContext, projectTitle: maybeTitle }
      : paramsOrContext;

  const res = await fetch('/api/ai/generate-alt-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to generate alt text');
  return data.altText;
}

export const generateAltTextAPI = generateAltTextWithAI;

export async function chatAdminAI(
  message: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  const res = await fetch('/api/ai/chat-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ message, conversationHistory }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'AI Assistant request failed');
  return data.reply;
}

export async function chatPublicAI(
  message: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<{ reply: string; suggestedAction?: string }> {
  const res = await fetch('/api/ai/chat-public', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationHistory }),
  });
  const data = await res.json();
  return {
    reply: data.reply || "I'd be happy to share more about Johanna's work! Would you like to check out her projects or get in touch?",
    suggestedAction: data.suggestedAction,
  };
}

// Analytics API
let anonymousVisitorId: string | null = null;
function getVisitorId(): string {
  if (!anonymousVisitorId) {
    let stored = localStorage.getItem('johanna_visitor_id');
    if (!stored) {
      stored = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('johanna_visitor_id', stored);
    }
    anonymousVisitorId = stored;
  }
  return anonymousVisitorId;
}

export async function recordAnalyticsEvent(event: {
  eventType: 'page_view' | 'project_view' | 'live_demo_click' | 'github_click' | 'contact_click' | 'project_share' | 'search_action';
  entityId?: string;
  entityType?: string;
  path?: string;
  referrer?: string;
}): Promise<void> {
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        path: event.path || window.location.pathname,
        referrer: event.referrer || document.referrer || null,
        visitorId: getVisitorId(),
      }),
    });
  } catch {
    // Non-blocking analytics
  }
}

export async function getAnalyticsOverview(range: string = '30d'): Promise<import('../types').AnalyticsOverview> {
  const res = await fetch(`/api/analytics/overview?range=${range}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to retrieve analytics overview');
  return res.json();
}

export async function getProjectAnalytics(idOrSlug: string): Promise<import('../types').ProjectAnalytics> {
  const res = await fetch(`/api/analytics/project/${encodeURIComponent(idOrSlug)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to retrieve project analytics');
  return res.json();
}

export async function getSearchAnalytics(): Promise<Array<{ query: string; count: number; lastSearchedAt: string }>> {
  const res = await fetch('/api/analytics/searches', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to retrieve search analytics');
  return res.json();
}

// Search API
export async function searchProjects(query: string, category?: string): Promise<import('../types').SearchQueryResult> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (category && category !== 'All') params.set('category', category);

  const res = await fetch(`/api/search?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to search projects');
  return res.json();
}

export async function getPopularSearches(): Promise<string[]> {
  try {
    const res = await fetch('/api/search/popular');
    if (!res.ok) return ['AI', 'Virtual Assistant', 'React', 'Google AI Studio'];
    return res.json();
  } catch {
    return ['AI', 'Virtual Assistant', 'React', 'Google AI Studio'];
  }
}

export async function recordSearchQuery(query: string, resultCount?: number): Promise<void> {
  if (!query || !query.trim()) return;
  try {
    await fetch('/api/analytics/search-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.trim(), resultCount }),
    });
  } catch {
    // Non-blocking
  }
}

// Activity Log API
export async function getActivityLogs(): Promise<import('../types').ActivityLog[]> {
  const res = await fetch('/api/activity', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to retrieve activity log');
  return res.json();
}

// Settings API
export async function getPublicSettings(): Promise<import('../types').SiteSettings> {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('Failed to load site settings');
  return res.json();
}

export async function getAdminSettings(): Promise<{
  settings: Record<string, string>;
  emailServiceConfigured: boolean;
  emailServiceDetails: string;
}> {
  const res = await fetch('/api/settings/all', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function updateAdminSettings(updates: Record<string, any>): Promise<void> {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ updates }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to update settings');
  }
}

export async function getNotificationSettings(): Promise<import('../types').NotificationSettings> {
  const res = await fetch('/api/settings/notifications', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load notification settings');
  return res.json();
}

export async function updateNotificationSettings(data: {
  emailNotifications: boolean;
  notificationEmail: string;
  notifications: {
    newContactMessage: boolean;
    projectPublished: boolean;
    projectUpdated: boolean;
    newBlogPost: boolean;
    importantSystemAlerts: boolean;
  };
}): Promise<void> {
  const res = await fetch('/api/settings/notifications', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update notification settings');
  }
}

export async function testEmailNotification(): Promise<{ message: string }> {
  const res = await fetch('/api/settings/test-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Email test failed');
  }
  return data;
}

// Digital Products API
export async function getProducts(params?: {
  category?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  all?: boolean;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'All') query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.featured) query.set('featured', 'true');
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.all) query.set('all', 'true');

  const res = await fetch(`/api/products?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch digital products');
  }
  return res.json();
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Digital product not found');
  }
  return res.json();
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create digital product');
  }
  return data;
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update digital product');
  }
  return data;
}

export async function publishProduct(id: string): Promise<Product> {
  const res = await fetch(`/api/products/${encodeURIComponent(id)}/publish`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ published: true }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to publish digital product');
  }
  return data;
}

export async function unpublishProduct(id: string): Promise<Product> {
  const res = await fetch(`/api/products/${encodeURIComponent(id)}/publish`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ published: false }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to unpublish digital product');
  }
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete digital product');
  }
}


