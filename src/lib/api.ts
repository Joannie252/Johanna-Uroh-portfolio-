import { Project, ServiceItem, TestimonialItem, ExperienceItem, ContactMessage, AdminUser, DashboardData, Product, MentorshipProgramme, MentorshipApplication, MentorshipApplicationStatus } from '../types';

const TOKEN_KEY = 'johanna_admin_token';

// Centralized API base URL for split Vercel frontend + Cloud Run CMS deployments.
// Empty string preserves relative same-origin requests in local dev and Google AI Studio.
const RAW_API_BASE_URL = (import.meta.env.VITE_API_URL || '').trim();
export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

export function apiUrl(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }
  const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
}

export function resolveAssetUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
  }
  return trimmed;
}

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

async function apiFetch(endpoint: string, init?: RequestInit): Promise<Response> {
  const url = apiUrl(endpoint);
  const method = (init?.method || 'GET').toUpperCase();

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err: any) {
    const reason = err?.message || 'Network or CORS request failed';
    console.error(`[API Network Error] ${method} ${url}: ${reason}`);
    throw new Error(`Unable to reach CMS API (${reason})`);
  }

  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (res.ok && contentType.includes('text/html') && !endpoint.includes('/stream')) {
    console.error(
      `[API Format Error] ${method} ${url} returned HTML (HTTP ${res.status}) instead of JSON. Check VITE_API_URL configuration.`
    );
    throw new Error('CMS API returned HTML instead of JSON. Verify VITE_API_URL points to the backend service.');
  }

  if (!res.ok) {
    console.warn(`[API HTTP ${res.status}] ${method} ${url}`);
  }

  return res;
}

async function parseJsonSafe<T = any>(res: Response, fallbackError: string): Promise<T> {
  const text = await res.text();
  if (!text) {
    if (!res.ok) throw new Error(fallbackError);
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    console.error(`[API Parse Error] Invalid JSON response (HTTP ${res.status}) from ${res.url || 'endpoint'}`);
    throw new Error(fallbackError);
  }
}

// Auth API
export async function loginAdmin(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJsonSafe<{ token: string; user: AdminUser; error?: string }>(res, 'Login failed');
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }
  setStoredToken(data.token);
  return data;
}

export async function logoutAdmin(): Promise<void> {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST', headers: getAuthHeaders() });
  } finally {
    removeStoredToken();
  }
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await apiFetch('/api/auth/me', {
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

  const res = await apiFetch(`/api/projects?${query.toString()}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) {
    const errBody = await parseJsonSafe<{ error?: string }>(res, 'Failed to fetch projects').catch(() => ({ error: undefined }));
    throw new Error(errBody.error || `Failed to fetch projects (HTTP ${res.status})`);
  }
  return parseJsonSafe<Project[]>(res, 'Invalid projects response from CMS');
}

export async function getProjectBySlug(slug: string, preview?: boolean): Promise<Project> {
  const query = preview ? '?preview=true' : '';
  const res = await apiFetch(`/api/projects/${encodeURIComponent(slug)}${query}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Project not found');
  }
  return res.json();
}

export async function createProject(data: Partial<Project>): Promise<Project> {
  const res = await apiFetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  const result = await parseJsonSafe<Project & { error?: string }>(res, 'Failed to create project');
  if (!res.ok) {
    throw new Error(result.error || 'Failed to create project');
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('portfolio_data_updated'));
  }
  return result;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  const res = await apiFetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  const result = await parseJsonSafe<Project & { error?: string }>(res, 'Failed to update project');
  if (!res.ok) {
    throw new Error(result.error || 'Failed to update project');
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('portfolio_data_updated'));
  }
  return result;
}

export async function publishProject(id: string): Promise<Project> {
  const res = await apiFetch(`/api/projects/${id}/publish`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  const result = await parseJsonSafe<Project & { error?: string }>(res, 'Failed to publish project');
  if (!res.ok) {
    throw new Error(result.error || 'Failed to publish project');
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('portfolio_data_updated'));
  }
  return result;
}

export async function unpublishProject(id: string): Promise<Project> {
  const res = await apiFetch(`/api/projects/${id}/unpublish`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  const result = await parseJsonSafe<Project & { error?: string }>(res, 'Failed to unpublish project');
  if (!res.ok) {
    throw new Error(result.error || 'Failed to unpublish project');
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('portfolio_data_updated'));
  }
  return result;
}

export async function deleteProject(id: string): Promise<void> {
  const res = await apiFetch(`/api/projects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.error || 'Failed to delete project');
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('portfolio_data_updated'));
  }
}

// Upload API
export async function uploadImageFile(file: File, alt?: string): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  if (alt) formData.append('alt', alt);

  const res = await apiFetch('/api/upload', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  const data = await parseJsonSafe<{ url: string; filename: string; error?: string }>(res, 'Failed to upload image');
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload image');
  }
  return data;
}

// Services API
export async function getServices(): Promise<ServiceItem[]> {
  const res = await apiFetch('/api/services', { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to load services (HTTP ${res.status})`);
  return res.json();
}

export async function createService(service: Partial<ServiceItem>): Promise<ServiceItem> {
  const res = await apiFetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(service),
  });
  const data = await parseJsonSafe<ServiceItem & { error?: string }>(res, 'Failed to create service');
  if (!res.ok) throw new Error(data.error || 'Failed to create service');
  return data;
}

export async function updateService(id: string, service: Partial<ServiceItem>): Promise<ServiceItem> {
  const res = await apiFetch(`/api/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(service),
  });
  const data = await parseJsonSafe<ServiceItem & { error?: string }>(res, 'Failed to update service');
  if (!res.ok) throw new Error(data.error || 'Failed to update service');
  return data;
}

export async function deleteService(id: string): Promise<void> {
  const res = await apiFetch(`/api/services/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete service');
}

// Testimonials API
export async function getTestimonials(): Promise<TestimonialItem[]> {
  const res = await apiFetch('/api/testimonials', { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to load testimonials (HTTP ${res.status})`);
  return res.json();
}

export async function createTestimonial(item: Partial<TestimonialItem>): Promise<TestimonialItem> {
  const res = await apiFetch('/api/testimonials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(item),
  });
  const data = await parseJsonSafe<TestimonialItem & { error?: string }>(res, 'Failed to create testimonial');
  if (!res.ok) throw new Error(data.error || 'Failed to create testimonial');
  return data;
}

export async function updateTestimonial(id: string, item: Partial<TestimonialItem>): Promise<TestimonialItem> {
  const res = await apiFetch(`/api/testimonials/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(item),
  });
  const data = await parseJsonSafe<TestimonialItem & { error?: string }>(res, 'Failed to update testimonial');
  if (!res.ok) throw new Error(data.error || 'Failed to update testimonial');
  return data;
}

export async function deleteTestimonial(id: string): Promise<void> {
  const res = await apiFetch(`/api/testimonials/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete testimonial');
}

// Experience API
export async function getExperience(type?: 'experience' | 'education'): Promise<ExperienceItem[]> {
  const query = type ? `?type=${type}` : '';
  const res = await apiFetch(`/api/experience${query}`);
  if (!res.ok) throw new Error('Failed to load experience items');
  return res.json();
}

export async function createExperience(item: Partial<ExperienceItem>): Promise<ExperienceItem> {
  const res = await apiFetch('/api/experience', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(item),
  });
  const data = await parseJsonSafe<ExperienceItem & { error?: string }>(res, 'Failed to save experience item');
  if (!res.ok) throw new Error(data.error || 'Failed to save experience item');
  return data;
}

export async function updateExperience(id: string, item: Partial<ExperienceItem>): Promise<ExperienceItem> {
  const res = await apiFetch(`/api/experience/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(item),
  });
  const data = await parseJsonSafe<ExperienceItem & { error?: string }>(res, 'Failed to update experience item');
  if (!res.ok) throw new Error(data.error || 'Failed to update experience item');
  return data;
}

export async function deleteExperience(id: string): Promise<void> {
  const res = await apiFetch(`/api/experience/${id}`, {
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
  const res = await apiFetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await parseJsonSafe<{ message: string; error?: string }>(res, 'Failed to send message');
  if (!res.ok) {
    throw new Error(result.error || 'Failed to send message');
  }
  return result;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const res = await apiFetch('/api/contact', { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to load messages');
  return res.json();
}

export async function markMessageRead(id: string): Promise<ContactMessage> {
  const res = await apiFetch(`/api/contact/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  const data = await parseJsonSafe<ContactMessage>(res, 'Failed to update message');
  if (!res.ok) throw new Error('Failed to update message');
  return data;
}

export async function deleteContactMessage(id: string): Promise<void> {
  const res = await apiFetch(`/api/contact/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete message');
}

// Stats API
export async function getDashboardStats(): Promise<DashboardData> {
  const res = await apiFetch('/api/stats', { headers: getAuthHeaders() });
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
  const res = await apiFetch('/api/ai/generate-project-details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(params),
  });
  const data = await parseJsonSafe<any>(res, 'Failed to generate project details');
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

  const res = await apiFetch('/api/ai/improve-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  const data = await parseJsonSafe<any>(res, 'Failed to improve text');
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

  const res = await apiFetch('/api/ai/generate-alt-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  const data = await parseJsonSafe<{ altText: string; error?: string }>(res, 'Failed to generate alt text');
  if (!res.ok) throw new Error(data.error || 'Failed to generate alt text');
  return data.altText;
}

export const generateAltTextAPI = generateAltTextWithAI;

export async function chatAdminAI(
  message: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  const res = await apiFetch('/api/ai/chat-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ message, conversationHistory }),
  });
  const data = await parseJsonSafe<{ reply: string; error?: string }>(res, 'AI Assistant request failed');
  if (!res.ok) throw new Error(data.error || 'AI Assistant request failed');
  return data.reply;
}

export async function streamChatAdminAI(
  message: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  onChunk: (delta: string) => void
): Promise<string> {
  const res = await apiFetch('/api/ai/chat-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ message, conversationHistory, stream: true }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'AI Assistant request failed');
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('text/event-stream') || !res.body) {
    const data = await res.json();
    const reply = data.reply || '';
    if (reply) onChunk(reply);
    return reply;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullReply = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';

    for (const part of parts) {
      const lines = part.split('\n');
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const raw = line.slice(5).trim();
        if (!raw) continue;
        let parsed: any;
        try {
          parsed = JSON.parse(raw);
        } catch {
          continue;
        }
        if (parsed.error) {
          throw new Error(parsed.error);
        }
        if (parsed.chunk) {
          fullReply += parsed.chunk;
          onChunk(parsed.chunk);
        }
      }
    }
  }

  return fullReply;
}

export async function chatPublicAI(
  message: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<{ reply: string; suggestedAction?: string }> {
  const res = await apiFetch('/api/ai/chat-public', {
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
    await apiFetch('/api/analytics/event', {
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
  const res = await apiFetch(`/api/analytics/overview?range=${range}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to retrieve analytics overview');
  return res.json();
}

export async function getProjectAnalytics(idOrSlug: string): Promise<import('../types').ProjectAnalytics> {
  const res = await apiFetch(`/api/analytics/project/${encodeURIComponent(idOrSlug)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to retrieve project analytics');
  return res.json();
}

export async function getSearchAnalytics(): Promise<Array<{ query: string; count: number; lastSearchedAt: string }>> {
  const res = await apiFetch('/api/analytics/searches', {
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

  const res = await apiFetch(`/api/search?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to search projects');
  return res.json();
}

export async function getPopularSearches(): Promise<string[]> {
  try {
    const res = await apiFetch('/api/search/popular');
    if (!res.ok) return ['AI', 'Virtual Assistant', 'React', 'Google AI Studio'];
    return res.json();
  } catch {
    return ['AI', 'Virtual Assistant', 'React', 'Google AI Studio'];
  }
}

export async function recordSearchQuery(query: string, resultCount?: number): Promise<void> {
  if (!query || !query.trim()) return;
  try {
    await apiFetch('/api/analytics/search-record', {
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
  const res = await apiFetch('/api/activity', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to retrieve activity log');
  return res.json();
}

// Settings API
export async function getPublicSettings(): Promise<import('../types').SiteSettings> {
  const res = await apiFetch('/api/settings', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load site settings');
  return res.json();
}

export async function getAdminSettings(): Promise<{
  settings: Record<string, string>;
  emailServiceConfigured: boolean;
  emailServiceDetails: string;
}> {
  const res = await apiFetch('/api/settings/all', {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function updateAdminSettings(updates: Record<string, any>): Promise<void> {
  const res = await apiFetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ updates }),
  });
  if (!res.ok) {
    const data = await parseJsonSafe<{ error?: string }>(res, 'Failed to update settings');
    throw new Error(data.error || 'Failed to update settings');
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('portfolio_settings_updated'));
    window.dispatchEvent(new CustomEvent('portfolio_data_updated'));
  }
}

export async function getNotificationSettings(): Promise<import('../types').NotificationSettings> {
  const res = await apiFetch('/api/settings/notifications', {
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
  const res = await apiFetch('/api/settings/notifications', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await parseJsonSafe<{ error?: string }>(res, 'Failed to update notification settings');
    throw new Error(err.error || 'Failed to update notification settings');
  }
}

export async function testEmailNotification(): Promise<{ message: string }> {
  const res = await apiFetch('/api/settings/test-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  const data = await parseJsonSafe<{ message: string; error?: string }>(res, 'Email test failed');
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

  const res = await apiFetch(`/api/products?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch digital products');
  }
  return res.json();
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const res = await apiFetch(`/api/products/${encodeURIComponent(slug)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Digital product not found');
  }
  return res.json();
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const res = await apiFetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(productData),
  });
  const data = await parseJsonSafe<Product & { error?: string }>(res, 'Failed to create digital product');
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create digital product');
  }
  return data;
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  const res = await apiFetch(`/api/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(productData),
  });
  const data = await parseJsonSafe<Product & { error?: string }>(res, 'Failed to update digital product');
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update digital product');
  }
  return data;
}

export async function publishProduct(id: string): Promise<Product> {
  const res = await apiFetch(`/api/products/${encodeURIComponent(id)}/publish`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ published: true }),
  });
  const data = await parseJsonSafe<Product & { error?: string }>(res, 'Failed to publish digital product');
  if (!res.ok) {
    throw new Error(data.error || 'Failed to publish digital product');
  }
  return data;
}

export async function unpublishProduct(id: string): Promise<Product> {
  const res = await apiFetch(`/api/products/${encodeURIComponent(id)}/publish`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ published: false }),
  });
  const data = await parseJsonSafe<Product & { error?: string }>(res, 'Failed to unpublish digital product');
  if (!res.ok) {
    throw new Error(data.error || 'Failed to unpublish digital product');
  }
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await apiFetch(`/api/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await parseJsonSafe<{ error?: string }>(res, 'Failed to delete digital product');
    throw new Error(data.error || 'Failed to delete digital product');
  }
}

// ==========================================
// MENTORSHIP API
// ==========================================

export async function getMentorshipProgrammes(params?: {
  search?: string;
  featured?: boolean;
  limit?: number;
  all?: boolean;
}): Promise<MentorshipProgramme[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.featured !== undefined) query.set('featured', String(params.featured));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.all) query.set('all', 'true');

  const res = await apiFetch(`/api/mentorship/programmes?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch mentorship programmes');
  }
  return res.json();
}

export async function getMentorshipProgrammeBySlug(slug: string): Promise<MentorshipProgramme> {
  const res = await apiFetch(`/api/mentorship/programmes/${encodeURIComponent(slug)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Mentorship programme not found');
  }
  return res.json();
}

export async function submitMentorshipApplication(data: {
  programmeId?: string;
  programmeSlug?: string;
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
}): Promise<{ success: boolean; message: string; applicationId: string }> {
  const res = await apiFetch('/api/mentorship/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await parseJsonSafe<{ success: boolean; message: string; applicationId: string; error?: string }>(
    res,
    'Failed to submit mentorship application'
  );
  if (!res.ok) {
    throw new Error(json.error || 'Failed to submit mentorship application');
  }
  return json;
}

export async function getAdminMentorshipProgrammes(): Promise<MentorshipProgramme[]> {
  const res = await apiFetch('/api/mentorship/admin/programmes', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch admin mentorship programmes');
  }
  return res.json();
}

export async function createMentorshipProgramme(
  programmeData: Partial<MentorshipProgramme>
): Promise<MentorshipProgramme> {
  const res = await apiFetch('/api/mentorship/admin/programmes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(programmeData),
  });
  const data = await parseJsonSafe<MentorshipProgramme & { error?: string }>(res, 'Failed to create mentorship programme');
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create mentorship programme');
  }
  return data;
}

export async function updateMentorshipProgramme(
  id: string,
  programmeData: Partial<MentorshipProgramme>
): Promise<MentorshipProgramme> {
  const res = await apiFetch(`/api/mentorship/admin/programmes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(programmeData),
  });
  const data = await parseJsonSafe<MentorshipProgramme & { error?: string }>(res, 'Failed to update mentorship programme');
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update mentorship programme');
  }
  return data;
}

export async function deleteMentorshipProgramme(id: string): Promise<void> {
  const res = await apiFetch(`/api/mentorship/admin/programmes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await parseJsonSafe<{ error?: string }>(res, 'Failed to delete mentorship programme');
    throw new Error(data.error || 'Failed to delete mentorship programme');
  }
}

export async function togglePublishMentorshipProgramme(id: string): Promise<MentorshipProgramme> {
  const res = await apiFetch(`/api/mentorship/admin/programmes/${encodeURIComponent(id)}/toggle-publish`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  const data = await parseJsonSafe<MentorshipProgramme & { error?: string }>(res, 'Failed to toggle published status');
  if (!res.ok) {
    throw new Error(data.error || 'Failed to toggle published status');
  }
  return data;
}

export async function toggleFeaturedMentorshipProgramme(id: string): Promise<MentorshipProgramme> {
  const res = await apiFetch(`/api/mentorship/admin/programmes/${encodeURIComponent(id)}/toggle-featured`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  const data = await parseJsonSafe<MentorshipProgramme & { error?: string }>(res, 'Failed to toggle featured status');
  if (!res.ok) {
    throw new Error(data.error || 'Failed to toggle featured status');
  }
  return data;
}

export async function getAdminMentorshipApplications(params?: {
  status?: string;
  programmeId?: string;
  search?: string;
}): Promise<MentorshipApplication[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.programmeId) query.set('programmeId', params.programmeId);
  if (params?.search) query.set('search', params.search);

  const res = await apiFetch(`/api/mentorship/admin/applications?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch mentorship applications');
  }
  return res.json();
}

export async function updateMentorshipApplicationStatus(
  id: string,
  status: MentorshipApplicationStatus,
  notes?: string
): Promise<MentorshipApplication> {
  const res = await apiFetch(`/api/mentorship/admin/applications/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ status, notes }),
  });
  const data = await parseJsonSafe<MentorshipApplication & { error?: string }>(res, 'Failed to update application status');
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update application status');
  }
  return data;
}

export async function deleteMentorshipApplication(id: string): Promise<void> {
  const res = await apiFetch(`/api/mentorship/admin/applications/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await parseJsonSafe<{ error?: string }>(res, 'Failed to delete application');
    throw new Error(data.error || 'Failed to delete application');
  }
}
