const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://barbacoatatemada.vercel.app';
const currentDate = new Date().toISOString().split('T')[0];

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/sistema-pedidos/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/privacidad</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${SITE_URL}/terminos</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;

const outputPath = path.join(__dirname, '..', 'sitemap.xml');

try {
  fs.writeFileSync(outputPath, sitemapContent, 'utf8');
  console.log(`✅ Sitemap generado con éxito en: ${outputPath}`);
} catch (error) {
  console.error('❌ Error al generar el sitemap:', error);
  process.exit(1);
}
