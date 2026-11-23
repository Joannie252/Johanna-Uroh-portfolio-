import express from 'express';
import path from 'path';
import fs from 'fs';
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import uploadRouter from './routes/upload.js';
import servicesRouter from './routes/services.js';
import testimonialsRouter from './routes/testimonials.js';
import experienceRouter from './routes/experience.js';
import contactRouter from './routes/contact.js';
import statsRouter from './routes/stats.js';
import aiRouter from './routes/ai.js';
import analyticsRouter from './routes/analytics.js';
import searchRouter from './routes/search.js';
import activityRouter from './routes/activity.js';
import settingsRouter from './routes/settings.js';
import productsRouter from './routes/products.js';
import mentorshipRouter from './routes/mentorship.js';
import { seedDatabase } from './seed.js';

const app = express();

// Secure CORS configuration for Vercel frontend <-> Cloud Run CMS
const DEFAULT_ALLOWED_ORIGINS = [
  'https://johanna-uroh-portfolio-5gpr83qtd-joannie1.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '');
}

const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

const appOrigin = process.env.APP_URL ? [normalizeOrigin(process.env.APP_URL)] : [];

const allowedOrigins = new Set<string>([
  ...DEFAULT_ALLOWED_ORIGINS.map(normalizeOrigin),
  ...configuredOrigins,
  ...appOrigin,
]);

app.use((req, res, next) => {
  const rawOrigin = req.headers.origin;
  if (rawOrigin) {
    const origin = normalizeOrigin(rawOrigin);
    if (allowedOrigins.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '86400');
    } else if (req.method === 'OPTIONS') {
      res.status(403).json({ error: 'CORS origin not allowed' });
      return;
    }
  }

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Body parsers with support for large JSON / base64 image data
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads serving
app.use('/uploads', express.static(uploadDir));

// Ensure API responses are always fresh and never cached by browser
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Seed database on first run
seedDatabase().catch((err) => {
  console.error('Error during database seed:', err);
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/services', servicesRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/experience', experienceRouter);
app.use('/api/contact', contactRouter);
app.use('/api/stats', statsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/search', searchRouter);
app.use('/api/activity', activityRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/products', productsRouter);
app.use('/api/mentorship', mentorshipRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
