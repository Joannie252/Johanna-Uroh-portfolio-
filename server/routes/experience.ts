import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { query, queryOne, execute } from '../db.js';
import { authenticateAdmin, AuthRequest } from '../auth.js';
import { ExperienceItem } from '../types.js';

const router = express.Router();

// GET /api/experience
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM experience';
    const params: any[] = [];
    if (type === 'experience' || type === 'education') {
      sql += ' WHERE type = ?';
      params.push(type);
    }
    sql += ' ORDER BY orderIndex ASC, createdAt DESC';

    const rows = await query<ExperienceItem>(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching experience items:', err);
    res.status(500).json({ error: 'Failed to retrieve experience items' });
  }
});

// POST /api/experience (Admin only)
router.post('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { role, organization, period, description, orderIndex = 0, type = 'experience' } = req.body;
    if (!role || !organization || !period) {
      res.status(400).json({ error: 'Role, organization, and period are required' });
      return;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO experience (id, role, organization, period, description, orderIndex, type, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, role.trim(), organization.trim(), period.trim(), description || '', Number(orderIndex) || 0, type, now]
    );

    const created = await queryOne('SELECT * FROM experience WHERE id = ?', [id]);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating experience item:', err);
    res.status(500).json({ error: 'Failed to create experience item' });
  }
});

// PUT /api/experience/:id (Admin only)
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM experience WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    const { role, organization, period, description, orderIndex, type } = req.body;

    await execute(
      `UPDATE experience SET
        role = ?,
        organization = ?,
        period = ?,
        description = ?,
        orderIndex = ?,
        type = ?
       WHERE id = ?`,
      [
        role !== undefined ? role.trim() : existing.role,
        organization !== undefined ? organization.trim() : existing.organization,
        period !== undefined ? period.trim() : existing.period,
        description !== undefined ? description : existing.description,
        orderIndex !== undefined ? Number(orderIndex) : existing.orderIndex,
        type !== undefined ? type : existing.type,
        id
      ]
    );

    const updated = await queryOne('SELECT * FROM experience WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    console.error('Error updating experience item:', err);
    res.status(500).json({ error: 'Failed to update experience item' });
  }
});

// DELETE /api/experience/:id (Admin only)
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM experience WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    await execute('DELETE FROM experience WHERE id = ?', [id]);
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting experience item:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;
