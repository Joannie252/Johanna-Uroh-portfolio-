import express from 'express';
import path from 'path';
import fs from 'fs';
import apiApp from './server/app';

const app = express();
const PORT = 3000;

// Mount API and static uploads
app.use(apiApp);

// Production static assets from dist
const distPath = path.resolve(__dirname, 'dist');
const staticPath = fs.existsSync(path.resolve(__dirname, 'index.html')) ? __dirname : distPath;
app.use(express.static(staticPath));

// SPA fallback for all non-API GET requests
app.get('*', (req, res) => {
  res.sendFile(path.resolve(staticPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on http://0.0.0.0:${PORT}`);
});

