#!/usr/bin/env node

/**
 * Post-build prerender script
 * Generates static HTML for SEO-critical pages by:
 * 1. Fetching dynamic routes from Supabase
 * 2. Serving the built dist/ folder
 * 3. Using Puppeteer to visit each route
 * 4. Saving the rendered HTML back to dist/
 * 5. Generating an updated sitemap.xml
 * 
 * Usage: node scripts/prerender.js
 * Run AFTER `npm run build`
 */

import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const PORT = 4173;

// Base Routes to prerender (Static)
const STATIC_ROUTES = [
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
      '.ico': 'image/x-icon',
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

function generateSitemap(routes) {
  const baseUrl = 'https://revhackers.com.br';
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (const route of routes) {
    let priority = '0.7';
    let changefreq = 'monthly';
    
    if (route === '/') { priority = '1.0'; changefreq = 'weekly'; }
    else if (route === '/blog') { priority = '0.9'; changefreq = 'weekly'; }
    else if (route.startsWith('/blog/')) { priority = '0.8'; changefreq = 'monthly'; }

    sitemap += `
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }

  sitemap += `\n</urlset>`;
  
  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`✅ Generated dynamic sitemap.xml with ${routes.length} URLs`);
}

async function fetchDynamicRoutes() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not found in .env, skipping dynamic routes');
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  let dynamicRoutes = [];

  try {
    // Fetch Blog Posts
    const { data: posts, error: errorPosts } = await supabase.from('blog_posts').select('slug');
    if (!errorPosts && posts) {
      const postRoutes = posts.map(p => `/blog/${p.slug}`);
      dynamicRoutes.push(...postRoutes);
      console.log(`📌 Found ${postRoutes.length} dynamic blog posts.`);
    }

    // Fetch Cases
    const { data: cases, error: errorCases } = await supabase.from('cases').select('slug').eq('published', true);
    if (!errorCases && cases) {
      const caseRoutes = cases.map(c => `/cases/${c.slug}`);
      dynamicRoutes.push(...caseRoutes);
      console.log(`📌 Found ${caseRoutes.length} dynamic cases.`);
    }

    // Fetch Materials
    const { data: materials, error: errorMaterials } = await supabase.from('materials').select('slug').eq('published', true);
    if (!errorMaterials && materials) {
      const matRoutes = materials.map(m => `/materiais/${m.slug}`);
      dynamicRoutes.push(...matRoutes);
      console.log(`📌 Found ${matRoutes.length} dynamic materials.`);
    }

  } catch (err) {
    console.error('❌ Error fetching dynamic routes from Supabase:', err);
  }

  return dynamicRoutes;
}

async function prerender() {
  console.log('🔍 Starting dynamic route fetching...\n');
  const dynamicRoutes = await fetchDynamicRoutes();
  const allRoutes = [...STATIC_ROUTES, ...dynamicRoutes];
  
  console.log(`\n🗺️ Total routes to prerender: ${allRoutes.length}`);

  // Start server
  const server = createServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`\n📡 Server running on http://localhost:${PORT}\n`);

  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let successCount = 0;
  let failCount = 0;

  for (const route of allRoutes) {
    try {
      const page = await browser.newPage();
      
      // Navigate and wait for network idle
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: 'networkidle0',
        timeout: 35000,
      });

      // Wait a bit more for React to render
      await page.waitForSelector('#root', { timeout: 10000 }).catch(() => {});
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
      console.log(`❌ Failed: ${route} → ${err.message}`);
    }
  }

  // Cleanup
  await browser.close();
  server.close();

  // Generate sitemap
  console.log('\n📝 Generating unified Sitemap...');
  generateSitemap(allRoutes);

  console.log(`\n📊 Prerender complete: ${successCount} success, ${failCount} failed`);
  console.log(`📁 Output: ${DIST_DIR}`);
}

prerender().catch(err => {
  console.error('❌ Prerender failed:', err);
  process.exit(1);
});
