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
import { seedDatabase } from './seed.js';

const app = express();

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
