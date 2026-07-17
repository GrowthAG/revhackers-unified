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

function parseArguments(argv) {
  const options = {
    offline: false,
    distDir: null,
    browserExecutable: null,
    browserProfile: null,
  };

  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];

    if (argument === '--offline') {
      options.offline = true;
      continue;
    }

    const valueOptions = {
      '--dist-dir': 'distDir',
      '--browser-executable': 'browserExecutable',
      '--browser-profile': 'browserProfile',
    };
    const optionName = valueOptions[argument];
    if (!optionName || !argv[index + 1]) {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }

    options[optionName] = argv[++index];
  }

  if (options.offline && (!options.distDir || !options.browserExecutable || !options.browserProfile)) {
    throw new Error('Offline prerender requires --dist-dir, --browser-executable and --browser-profile.');
  }
  if (!options.offline && (options.distDir || options.browserExecutable || options.browserProfile)) {
    throw new Error('Offline-only arguments require the explicit --offline flag.');
  }

  return options;
}

const options = parseArguments(process.argv.slice(2));
const OFFLINE_MODE = options.offline;

// Offline validation must not load local credentials. The Vite half of the
// build uses a temporary empty envDir and explicit loopback placeholders.
if (!OFFLINE_MODE) {
  dotenv.config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = options.distDir
  ? path.resolve(options.distDir)
  : path.resolve(__dirname, '../dist');
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
  '/score',
  '/score-revenue',
  '/score-site',
  '/score-founder',
  '/privacidade',
  '/termos-de-uso',
];

// Routes that should NOT be prerendered or included in sitemap
const EXCLUDED_FROM_SITEMAP = [
  '/agenda',           // redirect to /booking
  '/agenda-giulliano', // iframe-only thin content
  '/agenda-luna',
  '/agenda-linkedin',
  '/agenda-kickoff',
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
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (const route of routes) {
    // Skip excluded routes
    if (EXCLUDED_FROM_SITEMAP.includes(route)) continue;
    
    // Skip test/placeholder content
    if (route.includes('post-teste')) continue;
    
    let priority = '0.5';
    let changefreq = 'monthly';
    
    if (route === '/') { priority = '1.0'; changefreq = 'weekly'; }
    else if (route === '/blog' || route === '/servicos') { priority = '0.9'; changefreq = 'weekly'; }
    else if (route === '/cases' || route === '/diagnostico' || route === '/materiais') { priority = '0.8'; changefreq = 'weekly'; }
    else if (route.startsWith('/blog/')) { priority = '0.7'; changefreq = 'monthly'; }
    else if (route.startsWith('/cases/')) { priority = '0.6'; changefreq = 'monthly'; }
    else if (route.startsWith('/servicos/')) { priority = '0.7'; changefreq = 'monthly'; }
    else if (route.startsWith('/materiais/')) { priority = '0.6'; changefreq = 'monthly'; }
    else if (route === '/booking' || route === '/quem-somos' || route === '/metodologia') { priority = '0.7'; changefreq = 'monthly'; }
    else if (route.startsWith('/score')) { priority = '0.6'; changefreq = 'monthly'; }
    else if (route === '/privacidade' || route === '/termos-de-uso') { priority = '0.3'; changefreq = 'yearly'; }

    sitemap += `\n  <url>\n    <loc>${baseUrl}${route}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }

  sitemap += `\n</urlset>`;
  
  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`✅ Generated dynamic sitemap.xml with ${routes.length} URLs (excl. ${EXCLUDED_FROM_SITEMAP.length} blocked)`);
}

async function fetchDynamicRoutes() {
  if (OFFLINE_MODE) {
    console.log('🔒 Offline mode: dynamic Supabase routes are disabled.');
    return [];
  }

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
  let server;
  let browser;
  let successCount = 0;
  let failCount = 0;
  let blockedExternalRequestCount = 0;

  try {
    console.log('🔍 Starting dynamic route fetching...\n');
    const dynamicRoutes = await fetchDynamicRoutes();
    const allRoutes = [...STATIC_ROUTES, ...dynamicRoutes];

    console.log(`\n🗺️ Total routes to prerender: ${allRoutes.length}`);

    server = createServer();
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      if (OFFLINE_MODE) {
        server.listen(PORT, '127.0.0.1', resolve);
      } else {
        server.listen(PORT, resolve);
      }
    });
    console.log(`\n📡 Server running on http://localhost:${PORT}\n`);

    browser = await puppeteer.launch({
      headless: 'new',
      ...(OFFLINE_MODE
        ? {
            executablePath: options.browserExecutable,
            userDataDir: options.browserProfile,
          }
        : {}),
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    for (const route of allRoutes) {
      let page;

      try {
        page = await browser.newPage();

        if (OFFLINE_MODE) {
          await page.setRequestInterception(true);
          page.on('request', request => {
            let isLocalRequest = false;

            try {
              const requestUrl = new URL(request.url());
              isLocalRequest =
                requestUrl.protocol === 'data:' ||
                requestUrl.protocol === 'blob:' ||
                (
                  ['localhost', '127.0.0.1', '[::1]'].includes(requestUrl.hostname) &&
                  requestUrl.port === String(PORT)
                );
            } catch {
              isLocalRequest = false;
            }

            if (isLocalRequest) {
              void request.continue();
            } else {
              blockedExternalRequestCount++;
              void request.abort('blockedbyclient');
            }
          });
        }

        await page.goto(`http://localhost:${PORT}${route}`, {
          waitUntil: 'networkidle0',
          timeout: 35000,
        });

        await page.waitForSelector('#root', { timeout: 10000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 2000));

        const html = await page.content();
        const outputDir = path.join(DIST_DIR, route === '/' ? '' : route);
        const outputFile = route === '/'
          ? path.join(DIST_DIR, 'index.html')
          : path.join(outputDir, 'index.html');

        if (route !== '/') {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputFile, html);
        successCount++;
        console.log(`✅ ${route} → ${path.relative(DIST_DIR, outputFile)}`);
      } catch (err) {
        failCount++;
        console.log(`❌ Failed: ${route} → ${err.message}`);
      } finally {
        if (page) {
          await page.close().catch(error => {
            console.error(`⚠️ Failed to close page for ${route}: ${error.message}`);
          });
        }
      }
    }

    console.log('\n📝 Generating unified Sitemap...');
    generateSitemap(allRoutes);

    console.log(`\n📊 Prerender complete: ${successCount} success, ${failCount} failed`);
    if (OFFLINE_MODE) {
      console.log(`🔒 Offline mode blocked ${blockedExternalRequestCount} external browser requests before network access.`);
    }
    console.log(`📁 Output: ${DIST_DIR}`);

    if (failCount > 0) {
      throw new Error(`Prerender failed for ${failCount} route(s).`);
    }
  } finally {
    if (browser) {
      await browser.close().catch(error => {
        console.error(`⚠️ Failed to close browser: ${error.message}`);
      });
    }
    if (server?.listening) {
      await new Promise(resolve => server.close(resolve));
    }
    if (OFFLINE_MODE && options.browserProfile) {
      fs.rmSync(options.browserProfile, { recursive: true, force: true });
    }
  }
}

prerender().catch(err => {
  console.error('❌ Prerender failed:', err);
  process.exit(1);
});
