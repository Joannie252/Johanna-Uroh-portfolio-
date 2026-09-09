import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiApp from './server/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Mount API and static uploads
app.use(apiApp);

// Production static assets from dist
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback for all non-API GET requests
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on http://0.0.0.0:${PORT}`);
});
