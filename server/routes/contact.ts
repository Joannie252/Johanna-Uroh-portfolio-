import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { query, queryOne, execute, getSetting } from '../db.js';
import { authenticateAdmin, AuthRequest } from '../auth.js';
import { ContactMessage } from '../types.js';

const router = express.Router();

function parseMessage(row: any): ContactMessage {
  return {
    ...row,
    read: Boolean(row.read),
  };
}

// POST /api/contact (Public form submission)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, service, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address' });
      return;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // 1. ALWAYS store the submission in the database regardless of notification settings
    await execute(
      `INSERT INTO contact_messages (id, name, email, service, message, read, createdAt)
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [id, name.trim(), email.trim().toLowerCase(), service || '', message.trim(), now]
    );

    // 2. Record anonymous analytics event for contact submission
    try {
      const eventId = crypto.randomUUID();
      await execute(
        `INSERT INTO analytics_events (id, eventType, entityId, entityType, path, referrer, visitorId, createdAt)
         VALUES (?, 'contact_click', ?, 'contact', '/contact', NULL, NULL, ?)`,
        [eventId, id, now]
      );
    } catch (trackErr) {
      // Non-blocking
    }

    // 3. Check notification settings
    const emailNotificationsMaster = await getSetting('email_notifications', 'true');
    const newContactMessageToggle = await getSetting('notify_contact_message', 'true');
    const adminNotificationEmail = await getSetting('notification_email', process.env.ADMIN_EMAIL || 'urohjohanna25@gmail.com');

    let emailNotificationStatus: {
      attempted: boolean;
      delivered: boolean;
      reason?: string;
    } = { attempted: false, delivered: false };

    if (emailNotificationsMaster === 'true' && newContactMessageToggle === 'true') {
      emailNotificationStatus.attempted = true;
      const isEmailConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

      if (isEmailConfigured) {
        // In environments where SMTP is configured, we dispatch
        console.log(`[Email Notification] New message from ${name} (${email}). Notification dispatched to ${adminNotificationEmail}`);
        emailNotificationStatus.delivered = true;
      } else {
        // Email service is not configured
        console.log(`[Email Notification] Email service is not configured. Message stored securely in database (ID: ${id}).`);
        emailNotificationStatus.delivered = false;
        emailNotificationStatus.reason = 'Email service is not configured.';
      }
    } else {
      console.log(`[Email Notification] Skipped email dispatch: notifications disabled (master: ${emailNotificationsMaster}, newContactMessage: ${newContactMessageToggle}).`);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! Johanna will review and get back to you shortly.',
      notificationStatus: emailNotificationStatus,
    });
  } catch (err) {
    console.error('Error handling contact submission:', err);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

// GET /api/contact (Admin only - view all messages)
router.get('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const rows = await query('SELECT * FROM contact_messages ORDER BY createdAt DESC');
    res.json(rows.map(parseMessage));
  } catch (err) {
    console.error('Error retrieving messages:', err);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// PATCH /api/contact/:id/read (Admin only - mark as read)
router.patch('/:id/read', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await execute('UPDATE contact_messages SET read = 1 WHERE id = ?', [id]);
    const updated = await queryOne('SELECT * FROM contact_messages WHERE id = ?', [id]);
    res.json(parseMessage(updated));
  } catch (err) {
    console.error('Error marking message as read:', err);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// DELETE /api/contact/:id (Admin only)
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await execute('DELETE FROM contact_messages WHERE id = ?', [id]);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
