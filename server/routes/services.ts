import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { query, queryOne, execute } from '../db.js';
import { authenticateAdmin, verifyToken, AuthRequest } from '../auth.js';
import { ServiceItem } from '../types.js';

const router = express.Router();

function parseService(row: any): ServiceItem {
  return {
    ...row,
    active: Boolean(row.active),
    features: typeof row.features === 'string' ? JSON.parse(row.features || '[]') : row.features,
  };
}

// GET /api/services
router.get('/', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      if (verifyToken(authHeader.substring(7))) isAdmin = true;
    }

    let sql = 'SELECT * FROM services';
    if (!isAdmin) {
      sql += ' WHERE active = 1';
    }
    sql += ' ORDER BY orderIndex ASC, createdAt ASC';

    const rows = await query(sql);
    res.json(rows.map(parseService));
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: 'Failed to retrieve services' });
  }
});

// POST /api/services (Admin only)
router.post('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, icon = 'briefcase', features = [], orderIndex = 0, active = true } = req.body;
    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO services (id, title, description, icon, features, orderIndex, active, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title.trim(), description.trim(), icon, JSON.stringify(features), Number(orderIndex) || 0, active ? 1 : 0, now]
    );

    const created = await queryOne('SELECT * FROM services WHERE id = ?', [id]);
    res.status(201).json(parseService(created));
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// PUT /api/services/:id (Admin only)
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM services WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    const { title, description, icon, features, orderIndex, active } = req.body;

    await execute(
      `UPDATE services SET
        title = ?,
        description = ?,
        icon = ?,
        features = ?,
        orderIndex = ?,
        active = ?
       WHERE id = ?`,
      [
        title !== undefined ? title.trim() : existing.title,
        description !== undefined ? description.trim() : existing.description,
        icon !== undefined ? icon : existing.icon,
        features !== undefined ? JSON.stringify(features) : existing.features,
        orderIndex !== undefined ? Number(orderIndex) : existing.orderIndex,
        active !== undefined ? (active ? 1 : 0) : existing.active,
        id
      ]
    );

    const updated = await queryOne('SELECT * FROM services WHERE id = ?', [id]);
    res.json(parseService(updated));
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// DELETE /api/services/:id (Admin only)
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM services WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    await execute('DELETE FROM services WHERE id = ?', [id]);
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;
