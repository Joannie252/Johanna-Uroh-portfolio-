import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { query, queryOne, execute, getSetting } from '../db.js';
import { authenticateAdmin, AuthRequest } from '../auth.js';

const router = express.Router();

const ALLOWED_EVENTS = [
  'page_view',
  'project_view',
  'live_demo_click',
  'github_click',
  'contact_click',
  'project_share',
  'search_action',
];

// Helper to compute date filter threshold
function getThresholdDate(range: string): string {
  const now = new Date();
  switch (range) {
    case '7d':
      now.setDate(now.getDate() - 7);
      break;
    case '30d':
      now.setDate(now.getDate() - 30);
      break;
    case '90d':
      now.setDate(now.getDate() - 90);
      break;
    case '1y':
      now.setFullYear(now.getFullYear() - 1);
      break;
    case 'all':
    default:
      return '1970-01-01T00:00:00.000Z';
  }
  return now.toISOString();
}

// 1. POST /api/analytics/event (Public Anonymous Tracking)
router.post('/event', async (req: Request, res: Response) => {
  try {
    // Check if analytics is enabled in site_settings
    const enabled = await getSetting('analytics_enabled', 'true');
    if (enabled === 'false') {
      res.json({ success: true, tracked: false, reason: 'analytics_disabled' });
      return;
    }

    const { eventType, entityId, entityType, path, referrer, visitorId } = req.body;

    if (!eventType || !ALLOWED_EVENTS.includes(eventType)) {
      res.status(400).json({ error: 'Invalid or missing eventType.' });
      return;
    }

    // Anonymous visitor hash (no IP or personal information stored)
    const sanitizedVisitorId = visitorId
      ? crypto.createHash('sha256').update(String(visitorId)).digest('hex').substring(0, 16)
      : null;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO analytics_events (id, eventType, entityId, entityType, path, referrer, visitorId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        eventType,
        entityId || null,
        entityType || (eventType.startsWith('project_') ? 'project' : 'page'),
        path || '/',
        referrer || null,
        sanitizedVisitorId,
        now,
      ]
    );

    res.json({ success: true, id });
  } catch (err) {
    console.error('Error recording analytics event:', err);
    res.status(500).json({ error: 'Failed to record event' });
  }
});

// 2. GET /api/analytics/overview (Admin Only)
router.get('/overview', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const range = (req.query.range as string) || '30d';
    const startDate = getThresholdDate(range);

    // Project counts
    const totalProjects = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM projects');
    const publishedProjects = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM projects WHERE status = "PUBLISHED"');
    const draftProjects = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM projects WHERE status = "DRAFT"');
    const featuredProjects = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM projects WHERE featured = 1');

    // Event metrics within timeframe
    const totalPortfolioViews = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM analytics_events WHERE eventType = "page_view" AND createdAt >= ?',
      [startDate]
    );

    const totalProjectViews = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM analytics_events WHERE eventType = "project_view" AND createdAt >= ?',
      [startDate]
    );

    const liveDemoClicks = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM analytics_events WHERE eventType = "live_demo_click" AND createdAt >= ?',
      [startDate]
    );

    const githubClicks = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM analytics_events WHERE eventType = "github_click" AND createdAt >= ?',
      [startDate]
    );

    const contactFormSubmissions = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM contact_messages WHERE createdAt >= ?',
      [startDate]
    );

    const projectClicks = (liveDemoClicks?.count || 0) + (githubClicks?.count || 0);

    // Views over time (grouped by day YYYY-MM-DD)
    const viewsOverTime = await query<{ date: string; portfolioViews: number; projectViews: number }>(
      `SELECT
        substr(createdAt, 1, 10) as date,
        SUM(CASE WHEN eventType = 'page_view' THEN 1 ELSE 0 END) as portfolioViews,
        SUM(CASE WHEN eventType = 'project_view' THEN 1 ELSE 0 END) as projectViews
       FROM analytics_events
       WHERE createdAt >= ?
       GROUP BY substr(createdAt, 1, 10)
       ORDER BY date ASC`,
      [startDate]
    );

    // Most viewed projects
    const mostViewedProjects = await query<{
      id: string;
      title: string;
      slug: string;
      category: string;
      coverImage: string;
      views: number;
    }>(
      `SELECT
        p.id,
        p.title,
        p.slug,
        p.category,
        p.coverImage,
        COUNT(e.id) as views
       FROM projects p
       JOIN analytics_events e ON (e.entityId = p.id OR e.entityId = p.slug)
       WHERE e.eventType = 'project_view' AND e.createdAt >= ?
       GROUP BY p.id
       ORDER BY views DESC
       LIMIT 10`,
      [startDate]
    );

    // Most clicked projects (live demo + github clicks combined)
    const mostClickedProjects = await query<{
      id: string;
      title: string;
      slug: string;
      clicks: number;
    }>(
      `SELECT
        p.id,
        p.title,
        p.slug,
        COUNT(e.id) as clicks
       FROM projects p
       JOIN analytics_events e ON (e.entityId = p.id OR e.entityId = p.slug)
       WHERE e.eventType IN ('live_demo_click', 'github_click') AND e.createdAt >= ?
       GROUP BY p.id
       ORDER BY clicks DESC
       LIMIT 10`,
      [startDate]
    );

    // Most popular categories
    const popularCategories = await query<{ category: string; count: number }>(
      `SELECT category, COUNT(*) as count
       FROM projects
       WHERE status = 'PUBLISHED'
       GROUP BY category
       ORDER BY count DESC`
    );

    res.json({
      range,
      totals: {
        totalProjects: totalProjects?.count || 0,
        publishedProjects: publishedProjects?.count || 0,
        draftProjects: draftProjects?.count || 0,
        featuredProjects: featuredProjects?.count || 0,
        totalPortfolioViews: totalPortfolioViews?.count || 0,
        totalProjectViews: totalProjectViews?.count || 0,
        projectClicks,
        liveDemoClicks: liveDemoClicks?.count || 0,
        githubClicks: githubClicks?.count || 0,
        contactFormSubmissions: contactFormSubmissions?.count || 0,
      },
      viewsOverTime,
      mostViewedProjects,
      mostClickedProjects,
      popularCategories,
    });
  } catch (err) {
    console.error('Error retrieving analytics overview:', err);
    res.status(500).json({ error: 'Failed to retrieve analytics data' });
  }
});

// 3. GET /api/analytics/project/:id (Admin Only - Project Specific Stats)
router.get('/project/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const project = await queryOne('SELECT id, title, slug, status FROM projects WHERE id = ? OR slug = ?', [id, id]);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const projectId = project.id;
    const projectSlug = project.slug;

    // Total views
    const viewsRow = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM analytics_events
       WHERE eventType = 'project_view' AND (entityId = ? OR entityId = ?)`,
      [projectId, projectSlug]
    );

    // Unique visitors (distinct visitorId)
    const uniqueRow = await queryOne<{ count: number }>(
      `SELECT COUNT(DISTINCT visitorId) as count FROM analytics_events
       WHERE eventType = 'project_view' AND (entityId = ? OR entityId = ?) AND visitorId IS NOT NULL`,
      [projectId, projectSlug]
    );

    // Live demo clicks
    const liveDemoRow = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM analytics_events
       WHERE eventType = 'live_demo_click' AND (entityId = ? OR entityId = ?)`,
      [projectId, projectSlug]
    );

    // GitHub clicks
    const githubRow = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM analytics_events
       WHERE eventType = 'github_click' AND (entityId = ? OR entityId = ?)`,
      [projectId, projectSlug]
    );

    // Project shares
    const shareRow = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM analytics_events
       WHERE eventType = 'project_share' AND (entityId = ? OR entityId = ?)`,
      [projectId, projectSlug]
    );

    const views = viewsRow?.count || 0;
    const uniqueVisitors = uniqueRow?.count || (views > 0 ? 1 : 0);
    const liveDemoClicks = liveDemoRow?.count || 0;
    const githubClicks = githubRow?.count || 0;
    const shares = shareRow?.count || 0;

    const hasData = views > 0 || liveDemoClicks > 0 || githubClicks > 0 || shares > 0;

    res.json({
      projectId,
      title: project.title,
      hasData,
      stats: {
        views,
        uniqueVisitors,
        liveDemoClicks,
        githubClicks,
        shares,
      },
    });
  } catch (err) {
    console.error('Error fetching project analytics:', err);
    res.status(500).json({ error: 'Failed to retrieve project analytics' });
  }
});

// 4. GET /api/analytics/searches (Admin Only - Aggregated search queries)
router.get('/searches', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const rows = await query<{ query: string; count: number; lastSearchedAt: string }>(
      'SELECT query, count, lastSearchedAt FROM search_queries ORDER BY count DESC LIMIT 50'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching search analytics:', err);
    res.status(500).json({ error: 'Failed to retrieve search analytics' });
  }
});

// 5. POST /api/analytics/search-record (Record search term)
router.post('/search-record', async (req: Request, res: Response) => {
  try {
    const { query: searchQuery } = req.body;
    if (!searchQuery || !searchQuery.trim()) {
      res.json({ success: false });
      return;
    }
    const clean = searchQuery.trim().toLowerCase();
    const now = new Date().toISOString();
    const existing = await queryOne<{ id: string; count: number }>(
      'SELECT id, count FROM search_queries WHERE query = ?',
      [clean]
    );
    if (existing) {
      await execute(
        'UPDATE search_queries SET count = count + 1, lastSearchedAt = ? WHERE id = ?',
        [now, existing.id]
      );
    } else {
      const id = crypto.randomUUID();
      await execute(
        'INSERT INTO search_queries (id, query, count, lastSearchedAt) VALUES (?, ?, 1, ?)',
        [id, clean, now]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error recording search query:', err);
    res.json({ success: false });
  }
});

export default router;
