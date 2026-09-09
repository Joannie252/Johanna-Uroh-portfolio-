import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { query, queryOne, execute } from '../db.js';
import { authenticateAdmin, verifyToken, AuthRequest } from '../auth.js';
import { TestimonialItem } from '../types.js';

const router = express.Router();

function parseTestimonial(row: any): TestimonialItem {
  return {
    ...row,
    active: Boolean(row.active),
    isDemo: Boolean(row.isDemo),
  };
}

// GET /api/testimonials
router.get('/', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      if (verifyToken(authHeader.substring(7))) isAdmin = true;
    }

    let sql = 'SELECT * FROM testimonials';
    if (!isAdmin) {
      sql += ' WHERE active = 1';
    }
    sql += ' ORDER BY createdAt DESC';

    const rows = await query(sql);
    res.json(rows.map(parseTestimonial));
  } catch (err) {
    console.error('Error fetching testimonials:', err);
    res.status(500).json({ error: 'Failed to retrieve testimonials' });
  }
});

// POST /api/testimonials (Admin only)
router.post('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { clientName, role, company, content, avatarUrl = '', rating = 5, projectTitle = '', active = true, isDemo = false } = req.body;
    if (!clientName || !content) {
      res.status(400).json({ error: 'Client name and testimonial content are required' });
      return;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO testimonials (id, clientName, role, company, content, avatarUrl, rating, projectTitle, active, isDemo, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, clientName.trim(), role || '', company || '', content.trim(), avatarUrl, Number(rating) || 5, projectTitle, active ? 1 : 0, isDemo ? 1 : 0, now]
    );

    const created = await queryOne('SELECT * FROM testimonials WHERE id = ?', [id]);
    res.status(201).json(parseTestimonial(created));
  } catch (err) {
    console.error('Error creating testimonial:', err);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

// PUT /api/testimonials/:id (Admin only)
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM testimonials WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Testimonial not found' });
      return;
    }

    const { clientName, role, company, content, avatarUrl, rating, projectTitle, active, isDemo } = req.body;

    await execute(
      `UPDATE testimonials SET
        clientName = ?,
        role = ?,
        company = ?,
        content = ?,
        avatarUrl = ?,
        rating = ?,
        projectTitle = ?,
        active = ?,
        isDemo = ?
       WHERE id = ?`,
      [
        clientName !== undefined ? clientName.trim() : existing.clientName,
        role !== undefined ? role : existing.role,
        company !== undefined ? company : existing.company,
        content !== undefined ? content.trim() : existing.content,
        avatarUrl !== undefined ? avatarUrl : existing.avatarUrl,
        rating !== undefined ? Number(rating) : existing.rating,
        projectTitle !== undefined ? projectTitle : existing.projectTitle,
        active !== undefined ? (active ? 1 : 0) : existing.active,
        isDemo !== undefined ? (isDemo ? 1 : 0) : existing.isDemo,
        id
      ]
    );

    const updated = await queryOne('SELECT * FROM testimonials WHERE id = ?', [id]);
    res.json(parseTestimonial(updated));
  } catch (err) {
    console.error('Error updating testimonial:', err);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// DELETE /api/testimonials/:id (Admin only)
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM testimonials WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Testimonial not found' });
      return;
    }

    await execute('DELETE FROM testimonials WHERE id = ?', [id]);
    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (err) {
    console.error('Error deleting testimonial:', err);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

export default router;
