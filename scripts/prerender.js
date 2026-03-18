#!/usr/bin/env node

/**
 * Post-build prerender script
 * Generates static HTML for SEO-critical pages by:
 * 1. Serving the built dist/ folder
 * 2. Using Puppeteer to visit each route
 * 3. Saving the rendered HTML back to dist/
 * 
 * Usage: node scripts/prerender.js
 * Run AFTER `npm run build`
 */

import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const PORT = 4173;

// Routes to prerender (public-facing SEO pages only)
const ROUTES = [
  '/',
  '/quem-somos',
  '/servicos',
  '/servicos/tracao-midia-paga',
  '/servicos/ecossistema-crm',
  '/servicos/automacao-inteligente',
  '/servicos/founder-led-growth',
  '/servicos/web-conversion',
  '/servicos/ai-operations',
  '/cases',
  '/blog',
  '/materiais',
  '/comunidade',
  '/metodologia',
  '/diagnostico',
  '/booking',
  '/agenda',
  '/score',
  '/score-revenue',
  '/score-site',
  '/score-founder',
  '/privacidade',
  '/termos-de-uso',
];

// Simple static file server for dist/
function createServer() {
  return http.createServer((req, res) => {
    let filePath = path.join(DIST_DIR, req.url === '/' ? '/index.html' : req.url);
    
    // SPA fallback: if file doesn't exist, serve index.html
    if (!fs.existsSync(filePath)) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.woff2': 'font/woff2',
      '.woff': 'font/woff',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (err) {
      res.writeHead(404);
      res.end('Not found');
    }
  });
}

async function prerender() {
  console.log('🔍 Starting prerender...\n');

  // Start server
  const server = createServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`📡 Server running on http://localhost:${PORT}\n`);

  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let successCount = 0;
  let failCount = 0;

  for (const route of ROUTES) {
    try {
      const page = await browser.newPage();
      
      // Navigate and wait for network idle
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: 'networkidle0',
        timeout: 15000,
      });

      // Wait a bit more for React to render
      await page.waitForSelector('#root', { timeout: 5000 });
      await new Promise(r => setTimeout(r, 2000));

      // Get rendered HTML
      const html = await page.content();
      
      // Determine output path
      const outputDir = path.join(DIST_DIR, route === '/' ? '' : route);
      const outputFile = route === '/' 
        ? path.join(DIST_DIR, 'index.html')
        : path.join(outputDir, 'index.html');

      // Create directory if needed
      if (route !== '/') {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Write HTML
      fs.writeFileSync(outputFile, html);
      successCount++;
      console.log(`✅ ${route} → ${path.relative(DIST_DIR, outputFile)}`);

      await page.close();
    } catch (err) {
      failCount++;
      console.log(`❌ ${route} → ${err.message}`);
    }
  }

  // Cleanup
  await browser.close();
  server.close();

  console.log(`\n📊 Prerender complete: ${successCount} success, ${failCount} failed`);
  console.log(`📁 Output: ${DIST_DIR}`);
}

prerender().catch(err => {
  console.error('❌ Prerender failed:', err);
  process.exit(1);
});
