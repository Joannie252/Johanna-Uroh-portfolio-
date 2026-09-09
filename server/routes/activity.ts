import express, { Response } from 'express';
import { query } from '../db.js';
import { authenticateAdmin, AuthRequest } from '../auth.js';

const router = express.Router();

// GET /api/activity (Admin Only - View all recorded admin activity)
router.get('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const rows = await query(
      `SELECT id, action, entityType, entityId, entityTitle, adminEmail, details, createdAt
       FROM activity_logs
       ORDER BY createdAt DESC
       LIMIT ?`,
      [limit]
    );

    const formatted = rows.map((r: any) => {
      const dateObj = new Date(r.createdAt);
      return {
        ...r,
        formattedDate: dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        formattedTime: dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching activity logs:', err);
    res.status(500).json({ error: 'Failed to retrieve activity history' });
  }
});

export default router;
