import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { query, execute } from '../db.js';
import { Project } from '../types.js';

const router = express.Router();

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

// GET /api/search?q=... (Public search)
router.get('/', async (req: Request, res: Response) => {
  try {
    const rawQuery = (req.query.q as string) || '';
    const cleanQuery = rawQuery.trim();
    const categoryFilter = (req.query.category as string) || '';

    if (!cleanQuery) {
      res.json({
        query: '',
        total: 0,
        results: [],
        categories: [],
        tools: [],
      });
      return;
    }

    // Record search query frequency anonymously if >= 2 characters
    if (cleanQuery.length >= 2) {
      const now = new Date().toISOString();
      const normalizedQuery = cleanQuery.toLowerCase();
      const id = crypto.randomUUID();

      await execute(
        `INSERT INTO search_queries (id, query, count, lastSearchedAt)
         VALUES (?, ?, 1, ?)
         ON CONFLICT(query) DO UPDATE SET count = count + 1, lastSearchedAt = excluded.lastSearchedAt`,
        [id, normalizedQuery, now]
      );
    }

    // Only search published projects
    const allPublished = await query(
      "SELECT * FROM projects WHERE status = 'PUBLISHED' ORDER BY featured DESC, publishedAt DESC"
    );

    const parsedProjects = allPublished.map(parseProjectRow);
    const searchTerms = cleanQuery.toLowerCase().split(/\s+/).filter(Boolean);

    const filtered = parsedProjects.filter((p) => {
      // Category filter match if specified
      if (categoryFilter && categoryFilter !== 'All' && p.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }

      const searchableText = [
        p.title,
        p.shortDescription,
        p.description,
        p.category,
        p.challenge || '',
        p.solution || '',
        p.process || '',
        p.result || '',
        p.clientName || '',
        ...(p.tools || []),
        ...(p.services || []),
        ...(p.tags || []),
      ]
        .join(' ')
        .toLowerCase();

      // Check if all search terms appear in searchable text
      return searchTerms.every((term) => searchableText.includes(term));
    });

    // Extract available categories and tools from matches
    const categoriesSet = new Set<string>();
    const toolsSet = new Set<string>();
    for (const p of filtered) {
      if (p.category) categoriesSet.add(p.category);
      for (const t of p.tools || []) toolsSet.add(t);
    }

    res.json({
      query: cleanQuery,
      total: filtered.length,
      results: filtered,
      categories: Array.from(categoriesSet),
      tools: Array.from(toolsSet),
    });
  } catch (err) {
    console.error('Error executing search:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/search/popular (Public popular search suggestions)
router.get('/popular', async (req: Request, res: Response) => {
  try {
    const rows = await query<{ query: string; count: number }>(
      'SELECT query, count FROM search_queries ORDER BY count DESC LIMIT 8'
    );
    const defaultSuggestions = ['AI', 'Virtual Assistant', 'React', 'Google AI Studio', 'Web Development', 'Content Strategy'];
    const popular = rows.length > 0 ? rows.map((r) => r.query) : defaultSuggestions;
    res.json(popular);
  } catch (err) {
    res.json(['AI', 'Virtual Assistant', 'React', 'Google AI Studio', 'Automation']);
  }
});

export default router;
