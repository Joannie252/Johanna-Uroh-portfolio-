import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { query, queryOne, execute, logActivity } from '../db.js';
import { authenticateAdmin, verifyToken, AuthRequest } from '../auth.js';
import { MentorshipProgramme, MentorshipApplication, MentorshipApplicationStatus } from '../types.js';
import { sendMentorshipEmails } from '../email.js';

const router = express.Router();

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateUniqueSlug(baseName: string, excludeId?: string): Promise<string> {
  let baseSlug = slugify(baseName);
  if (!baseSlug) baseSlug = 'programme-' + Date.now();

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await queryOne(
      'SELECT id FROM mentorship_programmes WHERE slug = ?' + (excludeId ? ' AND id != ?' : ''),
      excludeId ? [slug, excludeId] : [slug]
    );
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

function parseArrayField(value: any): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value.split('\n').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function parseProgrammeRow(row: any): MentorshipProgramme {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.shortDescription,
    fullDescription: row.fullDescription,
    coverImage: row.coverImage,
    duration: row.duration,
    format: row.format,
    sessions: row.sessions,
    price: Number(row.price) || 0,
    currency: row.currency || 'USD',
    targetAudience: parseArrayField(row.targetAudience),
    curriculum: parseArrayField(row.curriculum),
    includedFeatures: parseArrayField(row.includedFeatures),
    expectedOutcomes: parseArrayField(row.expectedOutcomes),
    applicationEnabled: Boolean(row.applicationEnabled !== 0),
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function parseApplicationRow(row: any): MentorshipApplication {
  return {
    id: row.id,
    programmeId: row.programmeId,
    programmeName: row.programmeName,
    fullName: row.fullName,
    email: row.email,
    whatsapp: row.whatsapp,
    currentSkillLevel: row.currentSkillLevel,
    skillToLearn: row.skillToLearn,
    whyMentorship: row.whyMentorship,
    goals: row.goals,
    preferredProgramme: row.preferredProgramme,
    availability: row.availability,
    portfolioLink: row.portfolioLink || undefined,
    status: (row.status as MentorshipApplicationStatus) || 'New',
    notes: row.notes || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ==========================================
// PUBLIC PROGRAMME ENDPOINTS
// ==========================================

// GET /api/mentorship/programmes
router.get('/programmes', async (req: Request, res: Response) => {
  try {
    const { search, featured, limit } = req.query;

    const authHeader = req.headers.authorization;
    let isAdmin = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.substring(7));
      if (payload) isAdmin = true;
    }

    let sql = 'SELECT * FROM mentorship_programmes WHERE 1=1';
    const params: any[] = [];

    if (!isAdmin || req.query.all !== 'true') {
      sql += ' AND published = 1';
    }

    if (featured === 'true') {
      sql += ' AND featured = 1';
    }

    if (search && typeof search === 'string' && search.trim()) {
      sql += ' AND (name LIKE ? OR shortDescription LIKE ? OR fullDescription LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY featured DESC, createdAt DESC';

    if (limit && !isNaN(Number(limit))) {
      sql += ' LIMIT ?';
      params.push(Number(limit));
    }

    const rows = await query(sql, params);
    res.json(rows.map(parseProgrammeRow));
  } catch (err) {
    console.error('Error fetching mentorship programmes:', err);
    res.status(500).json({ error: 'Failed to retrieve mentorship programmes' });
  }
});

// GET /api/mentorship/programmes/:slug
router.get('/programmes/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const authHeader = req.headers.authorization;
    let isAdmin = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.substring(7));
      if (payload) isAdmin = true;
    }

    const row = await queryOne(
      'SELECT * FROM mentorship_programmes WHERE slug = ? OR id = ? LIMIT 1',
      [slug, slug]
    );

    if (!row) {
      res.status(404).json({ error: 'Mentorship programme not found' });
      return;
    }

    if (!Boolean(row.published) && !isAdmin) {
      res.status(404).json({ error: 'Mentorship programme not found' });
      return;
    }

    res.json(parseProgrammeRow(row));
  } catch (err) {
    console.error('Error fetching programme by slug:', err);
    res.status(500).json({ error: 'Failed to retrieve programme details' });
  }
});

// POST /api/mentorship/apply (Public application submission)
router.post('/apply', async (req: Request, res: Response) => {
  try {
    const {
      programmeId,
      programmeSlug,
      fullName,
      email,
      whatsapp,
      currentSkillLevel,
      skillToLearn,
      whyMentorship,
      goals,
      preferredProgramme,
      availability,
      portfolioLink,
    } = req.body;

    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !whatsapp?.trim() ||
      !currentSkillLevel?.trim() ||
      !skillToLearn?.trim() ||
      !whyMentorship?.trim() ||
      !goals?.trim() ||
      !availability?.trim()
    ) {
      res.status(400).json({
        error:
          'Please complete all required fields: Full Name, Email, WhatsApp, Skill Level, Skill to Learn, Why Mentorship, Goals, and Availability.',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    // Resolve programme
    let progRow: any = null;
    if (programmeId) {
      progRow = await queryOne('SELECT * FROM mentorship_programmes WHERE id = ?', [programmeId]);
    } else if (programmeSlug) {
      progRow = await queryOne('SELECT * FROM mentorship_programmes WHERE slug = ?', [programmeSlug]);
    }

    const progId = progRow?.id || programmeId || 'general';
    const progName = progRow?.name || preferredProgramme || 'Skills Mentorship';

    if (progRow && progRow.applicationEnabled === 0) {
      res.status(400).json({
        error: 'Applications for this mentorship programme are currently closed.',
      });
      return;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO mentorship_applications (
        id, programmeId, programmeName, fullName, email, whatsapp,
        currentSkillLevel, skillToLearn, whyMentorship, goals,
        preferredProgramme, availability, portfolioLink, status, notes,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        progId,
        progName,
        fullName.trim(),
        email.trim().toLowerCase(),
        whatsapp.trim(),
        currentSkillLevel.trim(),
        skillToLearn.trim(),
        whyMentorship.trim(),
        goals.trim(),
        (preferredProgramme || progName).trim(),
        availability.trim(),
        portfolioLink?.trim() || null,
        'New',
        null,
        now,
        now,
      ]
    );

    await logActivity(
      'MENTORSHIP_APPLICATION',
      'mentorship_application',
      id,
      `${fullName.trim()} applied for ${progName}`,
      email.trim(),
      `New applicant: ${fullName.trim()} (${currentSkillLevel})`
    );

    // Automated Email Delivery (Humane confirmation to applicant + Admin notification)
    let emailDelivery = {
      attempted: false,
      applicantDelivered: false,
      adminDelivered: false,
      errors: [] as string[],
    };

    try {
      emailDelivery.attempted = true;
      const result = await sendMentorshipEmails({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: whatsapp.trim(),
        currentSkillLevel: currentSkillLevel.trim(),
        skillToLearn: skillToLearn.trim(),
        whyMentorship: whyMentorship.trim(),
        goals: goals.trim(),
        programmeName: progName,
        availability: availability.trim(),
        portfolioLink: portfolioLink?.trim() || undefined,
      });
      emailDelivery.applicantDelivered = result.applicantDelivered;
      emailDelivery.adminDelivered = result.adminDelivered;
      emailDelivery.errors = result.errors;
    } catch (emailErr: any) {
      console.error('[Mentorship Application] Failed to dispatch automated emails:', emailErr);
      emailDelivery.errors.push(emailErr.message || 'Unknown email error');
    }

    res.status(201).json({
      success: true,
      message: 'Your mentorship application has been submitted successfully! A confirmation email has been dispatched to your inbox.',
      applicationId: id,
      emailDelivery,
    });
  } catch (err: any) {
    console.error('Error submitting mentorship application:', err);
    res.status(500).json({ error: err.message || 'Failed to submit application' });
  }
});

// ==========================================
// ADMIN CMS ENDPOINTS (Protected)
// ==========================================

// GET /api/mentorship/admin/programmes (Admin list all)
router.get('/admin/programmes', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const rows = await query('SELECT * FROM mentorship_programmes ORDER BY createdAt DESC');
    res.json(rows.map(parseProgrammeRow));
  } catch (err) {
    console.error('Error fetching admin programmes:', err);
    res.status(500).json({ error: 'Failed to retrieve programmes' });
  }
});

// POST /api/mentorship/admin/programmes (Create programme)
router.post('/admin/programmes', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      slug: customSlug,
      shortDescription,
      fullDescription,
      coverImage,
      duration,
      format,
      sessions,
      price = 0,
      currency = 'USD',
      targetAudience = [],
      curriculum = [],
      includedFeatures = [],
      expectedOutcomes = [],
      applicationEnabled = true,
      featured = false,
      published = true,
    } = req.body;

    if (!name?.trim() || !shortDescription?.trim() || !fullDescription?.trim()) {
      res.status(400).json({
        error: 'Programme name, short description, and full description are required.',
      });
      return;
    }

    const id = crypto.randomUUID();
    const slug = customSlug?.trim()
      ? await generateUniqueSlug(customSlug.trim())
      : await generateUniqueSlug(name);

    const now = new Date().toISOString();

    await execute(
      `INSERT INTO mentorship_programmes (
        id, name, slug, shortDescription, fullDescription, coverImage,
        duration, format, sessions, price, currency, targetAudience,
        curriculum, includedFeatures, expectedOutcomes, applicationEnabled,
        featured, published, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name.trim(),
        slug,
        shortDescription.trim(),
        fullDescription.trim(),
        coverImage?.trim() || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop',
        duration?.trim() || '6 Weeks',
        format?.trim() || 'Live 1-on-1 + Guided Projects',
        sessions?.trim() || '12 Sessions',
        Number(price) || 0,
        currency?.trim() || 'USD',
        JSON.stringify(Array.isArray(targetAudience) ? targetAudience : [targetAudience]),
        JSON.stringify(Array.isArray(curriculum) ? curriculum : [curriculum]),
        JSON.stringify(Array.isArray(includedFeatures) ? includedFeatures : [includedFeatures]),
        JSON.stringify(Array.isArray(expectedOutcomes) ? expectedOutcomes : [expectedOutcomes]),
        applicationEnabled ? 1 : 0,
        featured ? 1 : 0,
        published ? 1 : 0,
        now,
        now,
      ]
    );

    await logActivity(
      'CREATE_MENTORSHIP_PROGRAMME',
      'mentorship_programme',
      id,
      name.trim(),
      req.user?.email || 'admin',
      `Created mentorship programme "${name.trim()}"`
    );

    const created = await queryOne('SELECT * FROM mentorship_programmes WHERE id = ?', [id]);
    res.status(201).json(parseProgrammeRow(created));
  } catch (err: any) {
    console.error('Error creating programme:', err);
    res.status(500).json({ error: err.message || 'Failed to create programme' });
  }
});

// PUT /api/mentorship/admin/programmes/:id (Update programme)
router.put('/admin/programmes/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM mentorship_programmes WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Mentorship programme not found' });
      return;
    }

    const {
      name,
      slug: customSlug,
      shortDescription,
      fullDescription,
      coverImage,
      duration,
      format,
      sessions,
      price,
      currency,
      targetAudience,
      curriculum,
      includedFeatures,
      expectedOutcomes,
      applicationEnabled,
      featured,
      published,
    } = req.body;

    let finalSlug = existing.slug;
    if (customSlug && customSlug.trim() && customSlug.trim() !== existing.slug) {
      finalSlug = await generateUniqueSlug(customSlug.trim(), id);
    } else if (name && name.trim() !== existing.name && (!customSlug || !customSlug.trim())) {
      finalSlug = await generateUniqueSlug(name.trim(), id);
    }

    const now = new Date().toISOString();

    await execute(
      `UPDATE mentorship_programmes SET
        name = ?,
        slug = ?,
        shortDescription = ?,
        fullDescription = ?,
        coverImage = ?,
        duration = ?,
        format = ?,
        sessions = ?,
        price = ?,
        currency = ?,
        targetAudience = ?,
        curriculum = ?,
        includedFeatures = ?,
        expectedOutcomes = ?,
        applicationEnabled = ?,
        featured = ?,
        published = ?,
        updatedAt = ?
      WHERE id = ?`,
      [
        name !== undefined ? name.trim() : existing.name,
        finalSlug,
        shortDescription !== undefined ? shortDescription.trim() : existing.shortDescription,
        fullDescription !== undefined ? fullDescription.trim() : existing.fullDescription,
        coverImage !== undefined ? coverImage.trim() : existing.coverImage,
        duration !== undefined ? duration.trim() : existing.duration,
        format !== undefined ? format.trim() : existing.format,
        sessions !== undefined ? sessions.trim() : existing.sessions,
        price !== undefined ? Number(price) : existing.price,
        currency !== undefined ? currency.trim() : existing.currency,
        targetAudience !== undefined
          ? JSON.stringify(Array.isArray(targetAudience) ? targetAudience : [targetAudience])
          : existing.targetAudience,
        curriculum !== undefined
          ? JSON.stringify(Array.isArray(curriculum) ? curriculum : [curriculum])
          : existing.curriculum,
        includedFeatures !== undefined
          ? JSON.stringify(Array.isArray(includedFeatures) ? includedFeatures : [includedFeatures])
          : existing.includedFeatures,
        expectedOutcomes !== undefined
          ? JSON.stringify(Array.isArray(expectedOutcomes) ? expectedOutcomes : [expectedOutcomes])
          : existing.expectedOutcomes,
        applicationEnabled !== undefined ? (applicationEnabled ? 1 : 0) : existing.applicationEnabled,
        featured !== undefined ? (featured ? 1 : 0) : existing.featured,
        published !== undefined ? (published ? 1 : 0) : existing.published,
        now,
        id,
      ]
    );

    await logActivity(
      'UPDATE_MENTORSHIP_PROGRAMME',
      'mentorship_programme',
      id,
      name !== undefined ? name.trim() : existing.name,
      req.user?.email || 'admin',
      `Updated mentorship programme "${name || existing.name}"`
    );

    const updated = await queryOne('SELECT * FROM mentorship_programmes WHERE id = ?', [id]);
    res.json(parseProgrammeRow(updated));
  } catch (err: any) {
    console.error('Error updating programme:', err);
    res.status(500).json({ error: err.message || 'Failed to update programme' });
  }
});

// DELETE /api/mentorship/admin/programmes/:id
router.delete('/admin/programmes/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM mentorship_programmes WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Mentorship programme not found' });
      return;
    }

    await execute('DELETE FROM mentorship_programmes WHERE id = ?', [id]);

    await logActivity(
      'DELETE_MENTORSHIP_PROGRAMME',
      'mentorship_programme',
      id,
      existing.name,
      req.user?.email || 'admin',
      `Deleted mentorship programme "${existing.name}"`
    );

    res.json({ success: true, message: 'Programme deleted successfully' });
  } catch (err) {
    console.error('Error deleting programme:', err);
    res.status(500).json({ error: 'Failed to delete programme' });
  }
});

// PATCH /api/mentorship/admin/programmes/:id/toggle-publish
router.patch('/admin/programmes/:id/toggle-publish', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM mentorship_programmes WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Programme not found' });
      return;
    }

    const newStatus = existing.published === 1 ? 0 : 1;
    const now = new Date().toISOString();
    await execute(
      'UPDATE mentorship_programmes SET published = ?, updatedAt = ? WHERE id = ?',
      [newStatus, now, id]
    );

    await logActivity(
      'UPDATE_MENTORSHIP_PROGRAMME',
      'mentorship_programme',
      id,
      existing.name,
      req.user?.email || 'admin',
      `Toggled published status to ${newStatus === 1 ? 'published' : 'draft'}`
    );

    const updated = await queryOne('SELECT * FROM mentorship_programmes WHERE id = ?', [id]);
    res.json(parseProgrammeRow(updated));
  } catch (err) {
    console.error('Error toggling programme published status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// PATCH /api/mentorship/admin/programmes/:id/toggle-featured
router.patch('/admin/programmes/:id/toggle-featured', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM mentorship_programmes WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Programme not found' });
      return;
    }

    const newFeatured = existing.featured === 1 ? 0 : 1;
    const now = new Date().toISOString();
    await execute(
      'UPDATE mentorship_programmes SET featured = ?, updatedAt = ? WHERE id = ?',
      [newFeatured, now, id]
    );

    const updated = await queryOne('SELECT * FROM mentorship_programmes WHERE id = ?', [id]);
    res.json(parseProgrammeRow(updated));
  } catch (err) {
    console.error('Error toggling featured status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ==========================================
// ADMIN APPLICATIONS MANAGEMENT (Protected)
// ==========================================

// GET /api/mentorship/admin/applications
router.get('/admin/applications', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, programmeId, search } = req.query;

    let sql = 'SELECT * FROM mentorship_applications WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'All') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (programmeId && programmeId !== 'All') {
      sql += ' AND programmeId = ?';
      params.push(programmeId);
    }

    if (search && typeof search === 'string' && search.trim()) {
      sql += ' AND (fullName LIKE ? OR email LIKE ? OR whatsapp LIKE ? OR skillToLearn LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY createdAt DESC';

    const rows = await query(sql, params);
    res.json(rows.map(parseApplicationRow));
  } catch (err) {
    console.error('Error fetching mentorship applications:', err);
    res.status(500).json({ error: 'Failed to retrieve applications' });
  }
});

// GET /api/mentorship/admin/applications/:id
router.get('/admin/applications/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const row = await queryOne('SELECT * FROM mentorship_applications WHERE id = ?', [id]);
    if (!row) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    res.json(parseApplicationRow(row));
  } catch (err) {
    console.error('Error fetching application:', err);
    res.status(500).json({ error: 'Failed to retrieve application' });
  }
});

// PATCH /api/mentorship/admin/applications/:id/status
router.patch('/admin/applications/:id/status', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses: MentorshipApplicationStatus[] = [
      'New',
      'Reviewing',
      'Accepted',
      'Rejected',
      'Contacted',
      'Completed',
    ];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const existing = await queryOne('SELECT * FROM mentorship_applications WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    const now = new Date().toISOString();
    const updatedNotes = notes !== undefined ? notes : existing.notes;

    await execute(
      'UPDATE mentorship_applications SET status = ?, notes = ?, updatedAt = ? WHERE id = ?',
      [status, updatedNotes, now, id]
    );

    await logActivity(
      'UPDATE_APPLICATION_STATUS',
      'mentorship_application',
      id,
      `${existing.fullName} - ${status}`,
      req.user?.email || 'admin',
      `Changed application status for ${existing.fullName} from ${existing.status} to ${status}`
    );

    const updated = await queryOne('SELECT * FROM mentorship_applications WHERE id = ?', [id]);
    res.json(parseApplicationRow(updated));
  } catch (err) {
    console.error('Error updating application status:', err);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// DELETE /api/mentorship/admin/applications/:id
router.delete('/admin/applications/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM mentorship_applications WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    await execute('DELETE FROM mentorship_applications WHERE id = ?', [id]);

    await logActivity(
      'DELETE_APPLICATION',
      'mentorship_application',
      id,
      existing.fullName,
      req.user?.email || 'admin',
      `Deleted application from ${existing.fullName}`
    );

    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (err) {
    console.error('Error deleting application:', err);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

export default router;
