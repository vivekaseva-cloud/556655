/**
 * Production Express Server for Hostinger VPS / Node.js Hosting
 * Serves the compiled Neti Bharatam Vite React SPA from the /dist folder.
 */
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

// Serve static assets with cache headers
app.use(express.static(DIST_DIR, {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    // Service Worker and Manifest should not be cached
    if (filePath.endsWith('sw.js') || filePath.endsWith('registerSW.js') || filePath.endsWith('manifest.webmanifest')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    // HTML entry point
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Health check endpoint for Hostinger / uptime monitors
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback: All unrecognized routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Neti Bharatam] Server is running on port ${PORT}`);
  console.log(`Serving static files from: ${DIST_DIR}`);
});
