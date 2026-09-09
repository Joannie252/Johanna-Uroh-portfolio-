import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { query, queryOne, execute, logActivity } from '../db.js';
import { authenticateAdmin, verifyToken, AuthRequest } from '../auth.js';
import { Project } from '../types.js';

const router = express.Router();

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateUniqueSlug(baseTitle: string, excludeId?: string): Promise<string> {
  let baseSlug = slugify(baseTitle);
  if (!baseSlug) baseSlug = 'project-' + Date.now();

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await queryOne(
      'SELECT id FROM projects WHERE slug = ?' + (excludeId ? ' AND id != ?' : ''),
      excludeId ? [slug, excludeId] : [slug]
    );
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

function parseProjectRow(row: any): Project {
  return {
    ...row,
    featured: Boolean(row.featured),
    services: typeof row.services === 'string' ? JSON.parse(row.services || '[]') : row.services,
    tools: typeof row.tools === 'string' ? JSON.parse(row.tools || '[]') : row.tools,
    images: typeof row.images === 'string' ? JSON.parse(row.images || '[]') : row.images,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : row.tags,
  };
}

// GET /api/projects
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, status, featured, limit } = req.query;

    // Check if requester is authenticated as admin
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.substring(7));
      if (payload) isAdmin = true;
    }

    let sql = 'SELECT * FROM projects WHERE 1=1';
    const params: any[] = [];

    // Public vs Admin filtering
    if (isAdmin && status) {
      if (status !== 'all') {
        sql += ' AND status = ?';
        params.push(status);
      }
    } else if (isAdmin && req.query.all === 'true') {
      // Return all for admin when explicitly requested
    } else {
      // Public visitors ONLY see PUBLISHED projects
      sql += " AND status = 'PUBLISHED'";
    }

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (featured === 'true') {
      sql += ' AND featured = 1';
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      sql += ' AND (title LIKE ? OR shortDescription LIKE ? OR description LIKE ? OR tools LIKE ? OR tags LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Sort: published projects by publishedAt DESC, drafts by updatedAt DESC
    sql += ' ORDER BY CASE WHEN status = "PUBLISHED" THEN 0 ELSE 1 END, publishedAt DESC, updatedAt DESC';

    if (limit && !isNaN(Number(limit))) {
      sql += ' LIMIT ?';
      params.push(Number(limit));
    }

    const rows = await query(sql, params);
    const projects = rows.map(parseProjectRow);
    res.json(projects);
  } catch (err: any) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to retrieve projects' });
  }
});

// GET /api/projects/:slug (slug or id)
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { preview, token } = req.query;

    // Query by slug or by id
    const row = await queryOne(
      'SELECT * FROM projects WHERE slug = ? OR id = ?',
      [slug, slug]
    );

    if (!row) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const project = parseProjectRow(row);

    // If project is not PUBLISHED, check admin authorization
    if (project.status !== 'PUBLISHED') {
      const authHeader = req.headers.authorization;
      let isAdmin = false;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const payload = verifyToken(authHeader.substring(7));
        if (payload) isAdmin = true;
      } else if (token && typeof token === 'string') {
        const payload = verifyToken(token);
        if (payload) isAdmin = true;
      }

      if (!isAdmin) {
        // Strict privacy: Draft projects must not be visible to normal visitors
        res.status(404).json({ error: 'Project not found' });
        return;
      }
    }

    res.json(project);
  } catch (err: any) {
    console.error('Error retrieving project:', err);
    res.status(500).json({ error: 'Failed to retrieve project details' });
  }
});

// POST /api/projects (Admin only)
router.post('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      slug: customSlug,
      shortDescription,
      description,
      category,
      services = [],
      tools = [],
      clientName = '',
      projectDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      projectUrl = '',
      githubUrl = '',
      coverImage,
      images = [],
      caseStudy = '',
      challenge = '',
      solution = '',
      process = '',
      result = '',
      featured = false,
      status = 'DRAFT',
      tags = [],
      seoTitle,
      seoDescription,
    } = req.body;

    if (!title || !shortDescription || !category) {
      res.status(400).json({ error: 'Title, short description, and category are required' });
      return;
    }

    const id = crypto.randomUUID();
    const finalSlug = customSlug && customSlug.trim()
      ? await generateUniqueSlug(customSlug)
      : await generateUniqueSlug(title);

    const now = new Date().toISOString();
    const publishedAt = status === 'PUBLISHED' ? now : null;

    const defaultCover = coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop';

    await execute(
      `INSERT INTO projects (
        id, title, slug, shortDescription, description, category,
        services, tools, clientName, projectDate, projectUrl, githubUrl,
        coverImage, images, caseStudy, challenge, solution, process,
        result, featured, status, tags, seoTitle, seoDescription,
        createdAt, updatedAt, publishedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title.trim(),
        finalSlug,
        shortDescription.trim(),
        description || shortDescription,
        category,
        JSON.stringify(services),
        JSON.stringify(tools),
        clientName || null,
        projectDate,
        projectUrl || null,
        githubUrl || null,
        defaultCover,
        JSON.stringify(images),
        caseStudy || '',
        challenge || '',
        solution || '',
        process || '',
        result || '',
        featured ? 1 : 0,
        status,
        JSON.stringify(tags),
        seoTitle || `${title} | Johanna Uroh`,
        seoDescription || shortDescription,
        now,
        now,
        publishedAt
      ]
    );

    const created = await queryOne('SELECT * FROM projects WHERE id = ?', [id]);
    await logActivity('PROJECT_CREATED', 'project', id, title.trim(), req.user?.email || 'admin', `Category: ${category}, Status: ${status}`);
    res.status(201).json(parseProjectRow(created));
  } catch (err: any) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id (Admin only)
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM projects WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const {
      title,
      slug: customSlug,
      shortDescription,
      description,
      category,
      services,
      tools,
      clientName,
      projectDate,
      projectUrl,
      githubUrl,
      coverImage,
      images,
      caseStudy,
      challenge,
      solution,
      process,
      result,
      featured,
      status,
      tags,
      seoTitle,
      seoDescription,
    } = req.body;

    let finalSlug = existing.slug;
    if (customSlug && customSlug !== existing.slug) {
      finalSlug = await generateUniqueSlug(customSlug, id);
    } else if (!customSlug && title && title !== existing.title) {
      finalSlug = await generateUniqueSlug(title, id);
    }

    const now = new Date().toISOString();
    let publishedAt = existing.publishedAt;
    if (status === 'PUBLISHED' && (!existing.publishedAt || existing.status !== 'PUBLISHED')) {
      publishedAt = now;
    }

    await execute(
      `UPDATE projects SET
        title = ?,
        slug = ?,
        shortDescription = ?,
        description = ?,
        category = ?,
        services = ?,
        tools = ?,
        clientName = ?,
        projectDate = ?,
        projectUrl = ?,
        githubUrl = ?,
        coverImage = ?,
        images = ?,
        caseStudy = ?,
        challenge = ?,
        solution = ?,
        process = ?,
        result = ?,
        featured = ?,
        status = ?,
        tags = ?,
        seoTitle = ?,
        seoDescription = ?,
        updatedAt = ?,
        publishedAt = ?
      WHERE id = ?`,
      [
        title !== undefined ? title.trim() : existing.title,
        finalSlug,
        shortDescription !== undefined ? shortDescription.trim() : existing.shortDescription,
        description !== undefined ? description : existing.description,
        category !== undefined ? category : existing.category,
        services !== undefined ? JSON.stringify(services) : existing.services,
        tools !== undefined ? JSON.stringify(tools) : existing.tools,
        clientName !== undefined ? clientName : existing.clientName,
        projectDate !== undefined ? projectDate : existing.projectDate,
        projectUrl !== undefined ? projectUrl : existing.projectUrl,
        githubUrl !== undefined ? githubUrl : existing.githubUrl,
        coverImage !== undefined ? coverImage : existing.coverImage,
        images !== undefined ? JSON.stringify(images) : existing.images,
        caseStudy !== undefined ? caseStudy : existing.caseStudy,
        challenge !== undefined ? challenge : existing.challenge,
        solution !== undefined ? solution : existing.solution,
        process !== undefined ? process : existing.process,
        result !== undefined ? result : existing.result,
        featured !== undefined ? (featured ? 1 : 0) : existing.featured,
        status !== undefined ? status : existing.status,
        tags !== undefined ? JSON.stringify(tags) : existing.tags,
        seoTitle !== undefined ? seoTitle : existing.seoTitle,
        seoDescription !== undefined ? seoDescription : existing.seoDescription,
        now,
        publishedAt,
        id
      ]
    );

    const updated = await queryOne('SELECT * FROM projects WHERE id = ?', [id]);
    await logActivity('PROJECT_EDITED', 'project', id, updated.title, req.user?.email || 'admin', `Status: ${updated.status}`);
    res.json(parseProjectRow(updated));
  } catch (err: any) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// PATCH /api/projects/:id/publish (Admin only)
router.patch('/:id/publish', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM projects WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const now = new Date().toISOString();
    await execute(
      'UPDATE projects SET status = ?, publishedAt = ?, updatedAt = ? WHERE id = ?',
      ['PUBLISHED', now, now, id]
    );

    await logActivity('PROJECT_PUBLISHED', 'project', id, existing.title, req.user?.email || 'admin', 'Project published to public portfolio');
    const updated = await queryOne('SELECT * FROM projects WHERE id = ?', [id]);
    res.json(parseProjectRow(updated));
  } catch (err: any) {
    console.error('Error publishing project:', err);
    res.status(500).json({ error: 'Failed to publish project' });
  }
});

// PATCH /api/projects/:id/unpublish (Admin only)
router.patch('/:id/unpublish', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM projects WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const now = new Date().toISOString();
    await execute(
      'UPDATE projects SET status = ?, updatedAt = ? WHERE id = ?',
      ['DRAFT', now, id]
    );

    await logActivity('PROJECT_UNPUBLISHED', 'project', id, existing.title, req.user?.email || 'admin', 'Project changed to draft');
    const updated = await queryOne('SELECT * FROM projects WHERE id = ?', [id]);
    res.json(parseProjectRow(updated));
  } catch (err: any) {
    console.error('Error unpublishing project:', err);
    res.status(500).json({ error: 'Failed to unpublish project' });
  }
});

// DELETE /api/projects/:id (Admin only)
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM projects WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    await execute('DELETE FROM projects WHERE id = ?', [id]);
    await logActivity('PROJECT_DELETED', 'project', id, existing.title, req.user?.email || 'admin', 'Project removed from database');
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
