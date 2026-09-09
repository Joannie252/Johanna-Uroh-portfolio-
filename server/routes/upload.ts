import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { authenticateAdmin, AuthRequest } from '../auth.js';

const router = express.Router();

const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer disk storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    cb(null, `img_${Date.now()}_${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, WebP, GIF, and SVG are accepted.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// POST /api/upload (Admin only)
router.post('/', authenticateAdmin, (req: AuthRequest, res: Response): void => {
  upload.single('file')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: 'File size exceeds maximum limit of 10MB.' });
        return;
      }
      res.status(400).json({ error: `Upload error: ${err.message}` });
      return;
    } else if (err) {
      res.status(400).json({ error: err.message || 'File upload failed.' });
      return;
    }

    if (!req.file) {
      // Check if base64 image was passed in body
      if (req.body && req.body.dataUrl) {
        try {
          const matches = req.body.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (!matches || matches.length !== 3) {
            res.status(400).json({ error: 'Invalid base64 image data' });
            return;
          }

          const mimeType = matches[1];
          const base64Data = matches[2];
          const extMap: Record<string, string> = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
            'image/gif': '.gif',
            'image/svg+xml': '.svg',
          };
          const ext = extMap[mimeType] || '.jpg';
          const filename = `img_${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`;
          const filePath = path.join(UPLOADS_DIR, filename);

          fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

          res.json({
            success: true,
            url: `/uploads/${filename}`,
            filename,
            size: Buffer.byteLength(base64Data, 'base64'),
            alt: req.body.alt || '',
          });
          return;
        } catch (e: any) {
          res.status(500).json({ error: 'Failed to process base64 image' });
          return;
        }
      }

      res.status(400).json({ error: 'No image file provided.' });
      return;
    }

    const publicUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: publicUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      alt: req.body.alt || '',
    });
  });
});

export default router;
