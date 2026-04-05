const fs = require('fs');
const path = require('path');
const { projectRoot } = require('./env');

function updateSitemap(root, id, date, translations) {
  const pr = root || projectRoot;
  const sitemapPath = path.join(pr, 'public', 'sitemap.xml');

  if (!fs.existsSync(sitemapPath)) {
    console.warn('sitemap.xml not found');
    return false;
  }

  let content = fs.readFileSync(sitemapPath, 'utf8');

  if (content.includes(translations.ru.slug)) {
    console.log('Sitemap entries already exist');
    return false;
  }

  const insertPos = content.lastIndexOf('</urlset>');
  if (insertPos === -1) {
    console.error('</urlset> not found in sitemap.xml');
    return false;
  }

  const newEntries = `
  <!-- AUTO-ADDED: ${id} -->
  <url>
    <loc>https://my.delimes.ru/de/blog/${translations.de.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://my.delimes.ru/en/blog/${translations.en.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://my.delimes.ru/ru/blog/${translations.ru.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;

  content = content.slice(0, insertPos) + newEntries + content.slice(insertPos);
  fs.writeFileSync(sitemapPath, content);
  console.log('sitemap.xml updated');
  return true;
}

module.exports = { updateSitemap };
