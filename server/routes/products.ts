import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { query, queryOne, execute, logActivity } from '../db.js';
import { authenticateAdmin, verifyToken, AuthRequest } from '../auth.js';
import { Product } from '../types.js';

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
  if (!baseSlug) baseSlug = 'resource-' + Date.now();

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await queryOne(
      'SELECT id FROM products WHERE slug = ?' + (excludeId ? ' AND id != ?' : ''),
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
      // Return split by lines if not JSON
      return value.split('\n').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function parseProductRow(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.shortDescription,
    fullDescription: row.fullDescription,
    coverImage: row.coverImage,
    category: row.category,
    price: Number(row.price) || 0,
    currency: row.currency || 'USD',
    whatYouWillLearn: parseArrayField(row.whatYouWillLearn),
    targetAudience: parseArrayField(row.targetAudience),
    whatIncluded: parseArrayField(row.whatIncluded),
    previewUrl: row.previewUrl || undefined,
    purchaseUrl: row.purchaseUrl,
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// GET /api/products
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, featured, limit } = req.query;

    // Check if requester is authenticated admin
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.substring(7));
      if (payload) isAdmin = true;
    }

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    // Public visitors ONLY see published products
    if (!isAdmin || req.query.all !== 'true') {
      sql += ' AND published = 1';
    }

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (featured === 'true') {
      sql += ' AND featured = 1';
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(title) LIKE ? OR LOWER(shortDescription) LIKE ? OR LOWER(category) LIKE ?)';
      params.push(term, term, term);
    }

    sql += ' ORDER BY featured DESC, createdAt DESC';

    if (limit) {
      sql += ' LIMIT ?';
      params.push(Number(limit));
    }

    const rows = await query(sql, params);
    res.json(rows.map(parseProductRow));
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to retrieve digital products' });
  }
});

// GET /api/products/:idOrSlug
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;

    const authHeader = req.headers.authorization;
    let isAdmin = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.substring(7));
      if (payload) isAdmin = true;
    }

    const row = await queryOne(
      'SELECT * FROM products WHERE id = ? OR slug = ?',
      [idOrSlug, idOrSlug]
    );

    if (!row) {
      res.status(404).json({ error: 'Digital product not found' });
      return;
    }

    // Public cannot access unpublished products
    if (!Boolean(row.published) && !isAdmin) {
      res.status(404).json({ error: 'Digital product not found' });
      return;
    }

    res.json(parseProductRow(row));
  } catch (err) {
    console.error('Error fetching product by slug/id:', err);
    res.status(500).json({ error: 'Failed to retrieve digital product' });
  }
});

// POST /api/products (Admin only)
router.post('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      slug: customSlug,
      shortDescription,
      fullDescription,
      coverImage,
      category,
      price = 0,
      currency = 'USD',
      whatYouWillLearn = [],
      targetAudience = [],
      whatIncluded,
      whatsIncluded,
      previewUrl,
      purchaseUrl,
      featured = false,
      published = true,
    } = req.body;

    if (!title || !shortDescription || !fullDescription || !purchaseUrl) {
      res.status(400).json({ error: 'Title, short description, full description, and purchase URL are required.' });
      return;
    }

    const id = crypto.randomUUID();
    const slug = customSlug?.trim()
      ? await generateUniqueSlug(customSlug.trim())
      : await generateUniqueSlug(title);

    const now = new Date().toISOString();
    const finalIncluded = whatIncluded || whatsIncluded || req.body["what'sIncluded"] || [];

    await execute(
      `INSERT INTO products (
        id, title, slug, shortDescription, fullDescription, coverImage,
        category, price, currency, whatYouWillLearn, targetAudience,
        whatIncluded, previewUrl, purchaseUrl, featured, published,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title.trim(),
        slug,
        shortDescription.trim(),
        fullDescription.trim(),
        coverImage?.trim() || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
        category?.trim() || 'Guides & Handouts',
        Number(price) || 0,
        currency?.trim() || 'USD',
        JSON.stringify(Array.isArray(whatYouWillLearn) ? whatYouWillLearn : [whatYouWillLearn]),
        JSON.stringify(Array.isArray(targetAudience) ? targetAudience : [targetAudience]),
        JSON.stringify(Array.isArray(finalIncluded) ? finalIncluded : [finalIncluded]),
        previewUrl?.trim() || null,
        purchaseUrl.trim(),
        featured ? 1 : 0,
        published ? 1 : 0,
        now,
        now,
      ]
    );

    await logActivity(
      'CREATE_PRODUCT',
      'product',
      id,
      title.trim(),
      req.user?.email || 'admin',
      `Created digital product "${title.trim()}" ($${price} ${currency})`
    );

    const created = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
    res.status(201).json(parseProductRow(created));
  } catch (err: any) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

// PUT /api/products/:id (Admin only)
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Digital product not found' });
      return;
    }

    const {
      title,
      slug: customSlug,
      shortDescription,
      fullDescription,
      coverImage,
      category,
      price,
      currency,
      whatYouWillLearn,
      targetAudience,
      whatIncluded,
      whatsIncluded,
      previewUrl,
      purchaseUrl,
      featured,
      published,
    } = req.body;

    let newSlug = existing.slug;
    if (customSlug && customSlug.trim() !== existing.slug) {
      newSlug = await generateUniqueSlug(customSlug.trim(), id);
    } else if (title && title.trim() !== existing.title && !customSlug) {
      newSlug = await generateUniqueSlug(title.trim(), id);
    }

    const now = new Date().toISOString();
    const finalIncluded = whatIncluded ?? whatsIncluded ?? req.body["what'sIncluded"] ?? existing.whatIncluded;

    await execute(
      `UPDATE products SET
        title = ?,
        slug = ?,
        shortDescription = ?,
        fullDescription = ?,
        coverImage = ?,
        category = ?,
        price = ?,
        currency = ?,
        whatYouWillLearn = ?,
        targetAudience = ?,
        whatIncluded = ?,
        previewUrl = ?,
        purchaseUrl = ?,
        featured = ?,
        published = ?,
        updatedAt = ?
      WHERE id = ?`,
      [
        title !== undefined ? title.trim() : existing.title,
        newSlug,
        shortDescription !== undefined ? shortDescription.trim() : existing.shortDescription,
        fullDescription !== undefined ? fullDescription.trim() : existing.fullDescription,
        coverImage !== undefined ? coverImage.trim() : existing.coverImage,
        category !== undefined ? category.trim() : existing.category,
        price !== undefined ? Number(price) : existing.price,
        currency !== undefined ? currency.trim() : existing.currency,
        whatYouWillLearn !== undefined ? JSON.stringify(Array.isArray(whatYouWillLearn) ? whatYouWillLearn : [whatYouWillLearn]) : existing.whatYouWillLearn,
        targetAudience !== undefined ? JSON.stringify(Array.isArray(targetAudience) ? targetAudience : [targetAudience]) : existing.targetAudience,
        JSON.stringify(parseArrayField(finalIncluded)),
        previewUrl !== undefined ? (previewUrl ? previewUrl.trim() : null) : existing.previewUrl,
        purchaseUrl !== undefined ? purchaseUrl.trim() : existing.purchaseUrl,
        featured !== undefined ? (featured ? 1 : 0) : existing.featured,
        published !== undefined ? (published ? 1 : 0) : existing.published,
        now,
        id,
      ]
    );

    await logActivity(
      'UPDATE_PRODUCT',
      'product',
      id,
      title || existing.title,
      req.user?.email || 'admin',
      `Updated digital product "${title || existing.title}"`
    );

    const updated = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
    res.json(parseProductRow(updated));
  } catch (err: any) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

// PATCH /api/products/:id/publish (Admin only)
router.patch('/:id/publish', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { published } = req.body;

    const existing = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Digital product not found' });
      return;
    }

    const now = new Date().toISOString();
    const newStatus = published ? 1 : 0;

    await execute('UPDATE products SET published = ?, updatedAt = ? WHERE id = ?', [newStatus, now, id]);

    await logActivity(
      newStatus ? 'PUBLISH_PRODUCT' : 'UNPUBLISH_PRODUCT',
      'product',
      id,
      existing.title,
      req.user?.email || 'admin',
      `${newStatus ? 'Published' : 'Unpublished'} digital product "${existing.title}"`
    );

    const updated = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
    res.json(parseProductRow(updated));
  } catch (err: any) {
    console.error('Error toggling publish state:', err);
    res.status(500).json({ error: 'Failed to update product publish status' });
  }
});

// DELETE /api/products/:id (Admin only)
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Digital product not found' });
      return;
    }

    await execute('DELETE FROM products WHERE id = ?', [id]);

    await logActivity(
      'DELETE_PRODUCT',
      'product',
      id,
      existing.title,
      req.user?.email || 'admin',
      `Deleted digital product "${existing.title}"`
    );

    res.json({ success: true, message: 'Digital product deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete digital product' });
  }
});

export default router;
