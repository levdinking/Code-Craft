const fs = require('fs');
const path = require('path');
const { projectRoot } = require('./env');

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cleanHtmlContent(content) {
  if (!content) return '<p>Content coming soon...</p>';
  if (content.includes('<') && content.includes('>')) return content;
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h])(.+)$/gim, '<p>$1</p>');
}

function generateArticleHtml(article, lang, slug, date, image) {
  const contentHtml = cleanHtmlContent(article.content || '');
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta property="og:title" content="${escapeHtml(article.title)}">
  <meta property="og:description" content="${escapeHtml(article.excerpt)}">
  <meta property="og:image" content="https://my.delimes.ru${image}">
  <meta property="og:url" content="https://my.delimes.ru/${lang}/blog/${slug}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Delimes">
  <meta property="article:published_time" content="${date}T10:00:00+03:00">
  <meta property="article:author" content="Pavel Levdin">
  <title>${escapeHtml(article.title)} | Delimes</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;max-width:800px;margin:0 auto;padding:20px;color:#333}
    h1{color:#0B1C3E;font-size:2em;margin-bottom:.5em}
    .meta{color:#6B7A99;font-size:.9em;margin-bottom:2em}
    img{max-width:100%;height:auto;border-radius:8px}
    pre{background:#f4f4f4;padding:15px;border-radius:8px;overflow-x:auto}
    code{background:#f4f4f4;padding:2px 6px;border-radius:4px;font-family:monospace}
  </style>
</head>
<body>
  <article>
    <header>
      <h1>${escapeHtml(article.title)}</h1>
      <div class="meta">
        <time datetime="${date}">${date ? new Date(date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</time>
        · ${article.readTime || '10 min'}
      </div>
    </header>
    <div class="content">${contentHtml}</div>
    <footer style="margin-top:3em;padding-top:2em;border-top:1px solid #eee">
      <p><a href="https://my.delimes.ru/${lang}/blog/${slug}" style="color:#2F8E92">${lang === 'ru' ? 'Открыть полную версию' : lang === 'de' ? 'Vollständige Version öffnen' : 'Open full version'}</a></p>
    </footer>
  </article>
</body>
</html>`;
}

function generateStaticHtml(root, id, date, image, translations) {
  const pr = root || projectRoot;
  const distDir = path.join(pr, 'dist');
  const articleDir = path.join(pr, 'src', 'content', 'blog', id);

  ['ru', 'en', 'de'].forEach(lang => {
    const jsonPath = path.join(articleDir, `${lang}.json`);
    if (!fs.existsSync(jsonPath)) return;
    const article = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const slug = translations[lang].slug;
    const staticDir = path.join(distDir, lang, 'blog', slug);
    fs.mkdirSync(staticDir, { recursive: true });
    const html = generateArticleHtml(article, lang, slug, date, image);
    fs.writeFileSync(path.join(staticDir, 'index.html'), html);
    console.log(`Generated: /${lang}/blog/${slug}/index.html`);
  });
}

function generateStaticHtmlForAllArticles(root) {
  const pr = root || projectRoot;
  const distDir = path.join(pr, 'dist');
  const blogContentDir = path.join(pr, 'src', 'content', 'blog');

  if (!fs.existsSync(blogContentDir)) {
    console.log('Blog content directory not found');
    return 0;
  }

  const articleIds = fs.readdirSync(blogContentDir).filter(item => {
    return fs.statSync(path.join(blogContentDir, item)).isDirectory();
  });

  let count = 0;
  articleIds.forEach(id => {
    const articleDir = path.join(blogContentDir, id);
    ['ru', 'en', 'de'].forEach(lang => {
      const jsonPath = path.join(articleDir, `${lang}.json`);
      if (!fs.existsSync(jsonPath)) return;
      const article = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const slug = article.slug || id;
      const staticDir = path.join(distDir, lang, 'blog', slug);
      fs.mkdirSync(staticDir, { recursive: true });
      const html = generateArticleHtml(article, lang, slug, article.date || '', article.meta?.ogImage || '/og-image.png');
      fs.writeFileSync(path.join(staticDir, 'index.html'), html);
      count++;
    });
  });

  console.log(`Generated ${count} static HTML files`);
  return count;
}

module.exports = { generateStaticHtml, generateStaticHtmlForAllArticles, escapeHtml, cleanHtmlContent };
