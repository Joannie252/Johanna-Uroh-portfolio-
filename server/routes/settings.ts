import express, { Request, Response } from 'express';
import { getAllSettings, getSetting, setSetting, logActivity } from '../db.js';
import { authenticateAdmin, AuthRequest } from '../auth.js';
import { sendTestEmail, getEmailConfig } from '../email.js';

const router = express.Router();

// Helper to check if email service is configured
function isEmailServiceConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

// 1. GET /api/settings (Public - returns public site profile and preferences)
router.get('/', async (req: Request, res: Response) => {
  try {
    const settings = await getAllSettings();
    // Return sanitized public settings (no secrets)
    res.json({
      profile: {
        name: settings.profile_name || 'Johanna Uroh',
        headline: settings.profile_headline || 'Virtual Assistant & AI Digital Specialist',
        bio: settings.profile_bio || 'I turn ideas into useful digital solutions.',
        profilePicture: settings.profile_picture || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
        logoImage: settings.profile_logo || settings.site_logo || '',
        email: settings.profile_email || 'urohjohanna25@gmail.com',
        socials: settings.profile_socials ? JSON.parse(settings.profile_socials) : {
          linkedin: 'https://linkedin.com',
          github: 'https://github.com',
          twitter: 'https://twitter.com',
        },
      },
      portfolio: {
        defaultCategory: settings.default_project_category || 'All',
        featuredLimit: Number(settings.featured_count_limit) || 3,
        itemsPerPage: Number(settings.items_per_page) || 6,
      },
      features: {
        aiEnabled: settings.ai_features_enabled !== 'false',
        analyticsEnabled: settings.analytics_enabled !== 'false',
        animationIntensity: settings.animation_intensity || 'Full', // 'Full' | 'Reduced' | 'Off'
      },
    });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to retrieve site settings' });
  }
});

// 2. GET /api/settings/all (Admin Only - returns all settings including notification configs)
router.get('/all', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const settings = await getAllSettings();
    res.json({
      settings,
      emailServiceConfigured: isEmailServiceConfigured(),
      emailServiceDetails: isEmailServiceConfigured()
        ? `Configured via SMTP (${process.env.SMTP_HOST})`
        : 'Email service is not configured (missing SMTP_HOST, SMTP_USER, SMTP_PASS in environment).',
    });
  } catch (err) {
    console.error('Error fetching admin settings:', err);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

// 3. PUT /api/settings (Admin Only - update batch settings)
router.put('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { updates } = req.body;
    if (!updates || typeof updates !== 'object') {
      res.status(400).json({ error: 'Updates object is required.' });
      return;
    }

    for (const [key, value] of Object.entries(updates)) {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      await setSetting(key, stringValue);
    }

    await logActivity(
      'SETTINGS_UPDATED',
      'settings',
      'site_settings',
      'Site Configuration',
      req.user?.email || 'admin',
      `Updated settings keys: ${Object.keys(updates).join(', ')}`
    );

    const updated = await getAllSettings();
    res.json({
      success: true,
      message: 'Settings updated successfully.',
      settings: updated,
    });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// 4. GET /api/settings/notifications (Admin Only - Notification settings)
router.get('/notifications', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const settings = await getAllSettings();
    res.json({
      emailNotifications: settings.email_notifications === 'true',
      notificationEmail: settings.notification_email || 'urohjohanna25@gmail.com',
      notifications: {
        newContactMessage: settings.notify_contact_message === 'true',
        projectPublished: settings.notify_project_published === 'true',
        projectUpdated: settings.notify_project_updated === 'true',
        newBlogPost: settings.notify_blog_post === 'true',
        importantSystemAlerts: settings.notify_system_alerts === 'true',
      },
      isServiceConfigured: isEmailServiceConfigured(),
      statusMessage: isEmailServiceConfigured()
        ? 'Email service is active and ready.'
        : 'Email service is not configured. (Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in environment variables to enable external SMTP dispatch).',
    });
  } catch (err) {
    console.error('Error retrieving notification settings:', err);
    res.status(500).json({ error: 'Failed to retrieve notification settings' });
  }
});

// 5. PUT /api/settings/notifications (Admin Only - Update Notification settings)
router.put('/notifications', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { emailNotifications, notificationEmail, notifications } = req.body;

    if (emailNotifications !== undefined) {
      await setSetting('email_notifications', emailNotifications ? 'true' : 'false');
    }
    if (notificationEmail !== undefined) {
      await setSetting('notification_email', String(notificationEmail).trim());
    }
    if (notifications && typeof notifications === 'object') {
      if (notifications.newContactMessage !== undefined) {
        await setSetting('notify_contact_message', notifications.newContactMessage ? 'true' : 'false');
      }
      if (notifications.projectPublished !== undefined) {
        await setSetting('notify_project_published', notifications.projectPublished ? 'true' : 'false');
      }
      if (notifications.projectUpdated !== undefined) {
        await setSetting('notify_project_updated', notifications.projectUpdated ? 'true' : 'false');
      }
      if (notifications.newBlogPost !== undefined) {
        await setSetting('notify_blog_post', notifications.newBlogPost ? 'true' : 'false');
      }
      if (notifications.importantSystemAlerts !== undefined) {
        await setSetting('notify_system_alerts', notifications.importantSystemAlerts ? 'true' : 'false');
      }
    }

    await logActivity(
      'NOTIFICATION_SETTINGS_UPDATED',
      'settings',
      'notifications',
      'Email Notification Settings',
      req.user?.email || 'admin',
      `Notifications master toggle: ${emailNotifications ? 'ON' : 'OFF'}`
    );

    res.json({
      success: true,
      message: 'Notification settings updated successfully.',
    });
  } catch (err) {
    console.error('Error updating notification settings:', err);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

// 6. POST /api/settings/test-email (Admin Only - Test Email Notification)
router.post('/test-email', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const config = await getEmailConfig();

    if (!isEmailServiceConfigured()) {
      res.status(400).json({
        success: false,
        configured: false,
        error: 'Email service is not fully configured. Please ensure SMTP_USER and SMTP_PASS are set.',
      });
      return;
    }

    const testResult = await sendTestEmail();

    if (!testResult.success) {
      res.status(500).json({
        success: false,
        configured: true,
        error: testResult.message,
      });
      return;
    }

    res.json({
      success: true,
      configured: true,
      message: testResult.message,
      targetEmail: config.adminEmail,
    });
  } catch (err: any) {
    console.error('Error testing email notification:', err);
    res.status(500).json({ error: err.message || 'Failed to execute email test' });
  }
});

export default router;
