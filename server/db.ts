import fs from 'fs';
import path from 'path';
import initSqlJs, { Database, SqlValue } from 'sql.js';

let dbInstance: Database | null = null;
const DB_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_PATH = path.join(DB_DIR, 'portfolio.db');

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (err) {
      console.error('Failed to load existing SQLite database, creating new one:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  initSchema(dbInstance);
  saveDb();
  return dbInstance;
}

export function saveDb(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err);
  }
}

function initSchema(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      shortDescription TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      services TEXT NOT NULL, -- JSON array
      tools TEXT NOT NULL,    -- JSON array
      clientName TEXT,
      projectDate TEXT NOT NULL,
      projectUrl TEXT,
      githubUrl TEXT,
      coverImage TEXT NOT NULL,
      images TEXT NOT NULL,   -- JSON array of ProjectImage
      caseStudy TEXT,
      challenge TEXT,
      solution TEXT,
      process TEXT,
      result TEXT,
      featured INTEGER DEFAULT 0,
      status TEXT DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, ARCHIVED
      tags TEXT NOT NULL,     -- JSON array
      seoTitle TEXT,
      seoDescription TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      publishedAt TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    CREATE INDEX IF NOT EXISTS idx_projects_publishedAt ON projects(publishedAt);
    CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
    CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT,
      features TEXT NOT NULL, -- JSON array
      orderIndex INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      clientName TEXT NOT NULL,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      content TEXT NOT NULL,
      avatarUrl TEXT,
      rating INTEGER DEFAULT 5,
      projectTitle TEXT,
      active INTEGER DEFAULT 1,
      isDemo INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS experience (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      organization TEXT NOT NULL,
      period TEXT NOT NULL,
      description TEXT NOT NULL,
      orderIndex INTEGER DEFAULT 0,
      type TEXT NOT NULL, -- 'experience' or 'education'
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      service TEXT,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      eventType TEXT NOT NULL,
      entityId TEXT,
      entityType TEXT,
      path TEXT NOT NULL,
      referrer TEXT,
      visitorId TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_eventType ON analytics_events(eventType);
    CREATE INDEX IF NOT EXISTS idx_analytics_entityId ON analytics_events(entityId);
    CREATE INDEX IF NOT EXISTS idx_analytics_createdAt ON analytics_events(createdAt);

    CREATE TABLE IF NOT EXISTS search_queries (
      id TEXT PRIMARY KEY,
      query TEXT UNIQUE NOT NULL,
      count INTEGER DEFAULT 1,
      lastSearchedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_search_count ON search_queries(count);

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      entityType TEXT NOT NULL,
      entityId TEXT,
      entityTitle TEXT,
      adminEmail TEXT NOT NULL,
      details TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_activity_createdAt ON activity_logs(createdAt);

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      shortDescription TEXT NOT NULL,
      fullDescription TEXT NOT NULL,
      coverImage TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      whatYouWillLearn TEXT NOT NULL,
      targetAudience TEXT NOT NULL,
      whatIncluded TEXT NOT NULL,
      previewUrl TEXT,
      purchaseUrl TEXT NOT NULL,
      featured INTEGER DEFAULT 0,
      published INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_products_published ON products(published);
    CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

    CREATE TABLE IF NOT EXISTS mentorship_programmes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      shortDescription TEXT NOT NULL,
      fullDescription TEXT NOT NULL,
      coverImage TEXT NOT NULL,
      duration TEXT NOT NULL,
      format TEXT NOT NULL,
      sessions TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      targetAudience TEXT NOT NULL,
      curriculum TEXT NOT NULL,
      includedFeatures TEXT NOT NULL,
      expectedOutcomes TEXT NOT NULL,
      applicationEnabled INTEGER DEFAULT 1,
      featured INTEGER DEFAULT 0,
      published INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_mentorship_prog_slug ON mentorship_programmes(slug);
    CREATE INDEX IF NOT EXISTS idx_mentorship_prog_published ON mentorship_programmes(published);
    CREATE INDEX IF NOT EXISTS idx_mentorship_prog_featured ON mentorship_programmes(featured);

    CREATE TABLE IF NOT EXISTS mentorship_applications (
      id TEXT PRIMARY KEY,
      programmeId TEXT NOT NULL,
      programmeName TEXT NOT NULL,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      currentSkillLevel TEXT NOT NULL,
      skillToLearn TEXT NOT NULL,
      whyMentorship TEXT NOT NULL,
      goals TEXT NOT NULL,
      preferredProgramme TEXT NOT NULL,
      availability TEXT NOT NULL,
      portfolioLink TEXT,
      status TEXT NOT NULL DEFAULT 'New',
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_mentorship_app_progId ON mentorship_applications(programmeId);
    CREATE INDEX IF NOT EXISTS idx_mentorship_app_status ON mentorship_applications(status);
    CREATE INDEX IF NOT EXISTS idx_mentorship_app_createdAt ON mentorship_applications(createdAt);
  `);
}

export async function query<T = any>(sql: string, params: SqlValue[] = []): Promise<T[]> {
  const db = await getDb();
  const stmt = db.prepare(sql);
  if (params && params.length > 0) {
    stmt.bind(params);
  }
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return results;
}

export async function queryOne<T = any>(sql: string, params: SqlValue[] = []): Promise<T | null> {
  const list = await query<T>(sql, params);
  return list.length > 0 ? list[0] : null;
}

export async function execute(sql: string, params: SqlValue[] = []): Promise<void> {
  const db = await getDb();
  db.run(sql, params);
  saveDb();
}

export async function logActivity(
  action: string,
  entityType: string,
  entityId: string | null,
  entityTitle: string | null,
  adminEmail: string,
  details?: string
): Promise<void> {
  try {
    const id = (await import('crypto')).randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO activity_logs (id, action, entityType, entityId, entityTitle, adminEmail, details, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, action, entityType, entityId || null, entityTitle || null, adminEmail || 'admin', details || null, now]
    );
  } catch (err) {
    console.error('Failed to log admin activity:', err);
  }
}

export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const row = await queryOne<{ value: string }>('SELECT value FROM site_settings WHERE key = ?', [key]);
    return row ? row.value : defaultValue;
  } catch (err) {
    console.error(`Error reading setting [${key}]:`, err);
    return defaultValue;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  const now = new Date().toISOString();
  await execute(
    `INSERT INTO site_settings (key, value, updatedAt) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt`,
    [key, value, now]
  );
}

export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const rows = await query<{ key: string; value: string }>('SELECT key, value FROM site_settings');
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    return settings;
  } catch (err) {
    console.error('Error reading all site settings:', err);
    return {};
  }
}

