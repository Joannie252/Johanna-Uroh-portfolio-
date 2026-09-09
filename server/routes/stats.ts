import express, { Response } from 'express';
import { query, queryOne } from '../db.js';
import { authenticateAdmin, AuthRequest } from '../auth.js';

const router = express.Router();

// GET /api/stats (Admin overview statistics)
router.get('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const totalProjects = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM projects');
    const publishedProjects = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM projects WHERE status = "PUBLISHED"');
    const draftProjects = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM projects WHERE status = "DRAFT"');
    const totalServices = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM services WHERE active = 1');
    const totalTestimonials = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM testimonials');
    const unreadMessages = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM contact_messages WHERE read = 0');
    const totalMessages = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM contact_messages');

    // Recent 5 projects
    const recentProjects = await query(
      'SELECT id, title, slug, category, status, featured, publishedAt, updatedAt, coverImage FROM projects ORDER BY updatedAt DESC LIMIT 5'
    );

    // Recent 5 messages
    const recentMessages = await query(
      'SELECT id, name, email, service, message, read, createdAt FROM contact_messages ORDER BY createdAt DESC LIMIT 5'
    );

    res.json({
      stats: {
        totalProjects: totalProjects?.count || 0,
        publishedProjects: publishedProjects?.count || 0,
        draftProjects: draftProjects?.count || 0,
        totalServices: totalServices?.count || 0,
        totalTestimonials: totalTestimonials?.count || 0,
        unreadMessages: unreadMessages?.count || 0,
        totalMessages: totalMessages?.count || 0,
      },
      recentProjects: recentProjects.map(p => ({
        ...p,
        featured: Boolean(p.featured),
      })),
      recentMessages: recentMessages.map(m => ({
        ...m,
        read: Boolean(m.read),
      })),
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

export default router;
