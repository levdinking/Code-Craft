#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ftp = require('basic-ftp');

const inputFile = process.argv[2];

if (!inputFile) {
  console.error('❌ Usage: node add-article.cjs <path-to-article-input.json>');
  process.exit(1);
}

const inputPath = path.resolve(inputFile);
console.log('🔍 Input file:', inputPath);

if (!fs.existsSync(inputPath)) {
  console.error(`❌ File not found: ${inputPath}`);
  process.exit(1);
}

let articleData;
try {
  const rawData = fs.readFileSync(inputPath, 'utf8');
  articleData = JSON.parse(rawData);
  console.log(`✅ Parsed: ${articleData.id}`);
} catch (err) {
  console.error('❌ JSON parse error:', err.message);
  process.exit(1);
}

const { id, category, tags, date, image, related, translations } = articleData;
const scriptDir = __dirname;
const projectRoot = path.join(scriptDir, '..');

// Загрузка .env
function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  fs.readFileSync(filePath, 'utf8').split('\n').forEach(line => {
    if (!line || line.startsWith('#')) return;
    const [key, ...vals] = line.split('=');
    if (key) env[key.trim()] = vals.join('=').trim();
  });
  return env;
}

const env = loadEnv(path.join(projectRoot, '.env'));

// FTP конфиг из .env
const FTP_CONFIG = {
  host: env.FTP_HOST || 'ftp81.hostland.ru',
  user: env.FTP_USER || 'host1731061',
  password: env.FTP_PASSWORD || '',
  secure: false,
  port: parseInt(env.FTP_PORT || '21', 10)
};

const REMOTE_ROOT = env.FTP_REMOTE_ROOT || '/my.delimes.ru/htdocs/www/';

// 1. Создаём папку статьи
const articleDir = path.join(projectRoot, 'src', 'content', 'blog', id);
console.log(`📁 Directory: ${articleDir}`);

if (!fs.existsSync(articleDir)) {
  fs.mkdirSync(articleDir, { recursive: true });
  console.log(`✅ Directory created`);
} else {
  console.log(`⚠️ Directory already exists`);
}

// 2. Создаём JSON файлы
['ru', 'en', 'de'].forEach(lang => {
  if (!translations[lang]) {
    console.warn(`⚠️ Missing translation: ${lang}`);
    return;
  }

  const data = {
    id: articleData.id,
    slug: translations[lang].slug,
    lang,
    title: translations[lang].title,
    excerpt: translations[lang].excerpt,
    content: translations[lang].content,
    meta: {
      title: translations[lang].title + (lang === 'ru' ? ' | Полное руководство' : lang === 'de' ? ' | Vollständige Anleitung' : ' | Complete Guide'),
      description: translations[lang].excerpt,
      keywords: tags,
      ogImage: image,
      ogType: 'article',
      twitterCard: 'summary_large_image',
      canonical: `https://my.delimes.ru/${lang}/blog/${translations[lang].slug}`,
      articlePublishedTime: `${date}T10:00:00+03:00`,
      articleModifiedTime: `${date}T10:00:00+03:00`,
      articleSection: lang === 'ru' ? 'Веб-разработка' : lang === 'de' ? 'Webentwicklung' : 'Web Development',
      articleTags: tags.slice(0, 4),
      authorName: 'Pavel Levdin',
      authorUrl: `https://my.delimes.ru/${lang}/about`,
      breadcrumb: [
        { name: lang === 'ru' ? 'Блог' : 'Blog', url: `https://my.delimes.ru/${lang}/blog` },
        { name: lang === 'ru' ? 'Веб-разработка' : lang === 'de' ? 'Webentwicklung' : 'Web Development', url: `https://my.delimes.ru/${lang}/blog/category/${category}` }
      ]
    },
    author: {
      name: 'Pavel Levdin',
      role: lang === 'ru' ? 'Full-Stack разработчик' : lang === 'de' ? 'Full-Stack Entwickler' : 'Full-Stack Developer',
      bio: lang === 'ru' ? '10+ лет опыта в веб-разработке, специализация на React и Next.js' : lang === 'de' ? '10+ Jahre Erfahrung in Webentwicklung, Spezialisierung auf React und Next.js' : '10+ years of web development experience, specializing in React and Next.js',
      avatar: '/images/avatar.jpg'
    },
    date,
    updatedAt: date,
    readTime: lang === 'ru' ? '15 мин' : lang === 'de' ? '15 Min' : '15 min',
    category,
    tags,
    related: related || [],
    featured: false,
    views: 0,
    published: lang === 'ru' ? true : false
  };

  fs.writeFileSync(path.join(articleDir, `${lang}.json`), JSON.stringify(data, null, 2));
  console.log(`📝 ${lang}.json created${lang === 'ru' ? ' (published: true)' : ' (published: false)'}`);
});

// 3. Обновляем blog-index.ts
updateBlogIndex(projectRoot, id, category, tags, date, image, translations);

// 4. Обновляем sitemap.xml
updateSitemap(projectRoot, id, date, translations);

// 5. Выводим информацию
console.log('\n' + '='.repeat(50));
console.log('✅ Article files created!');
console.log(`🖼️  Image: ${image}`);
console.log(`📂 Article ID: ${id}`);
console.log(`📅 Date: ${date}`);
console.log('='.repeat(50));

// 6. Запускаем сборку
console.log('\n🏗️  Starting build process...\n');

try {
  execSync('npm run build', {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  console.log('\n✅ Build completed!');
} catch (error) {
  console.error('\n❌ Build failed:', error.status);
  process.exit(1);
}

// 7. Генерируем статические HTML для Instant View (перед FTP)
console.log('\n📄 Generating static HTML for Instant View...\n');
generateStaticHtml(projectRoot, id, date, image, translations);

// 8. Загружаем на FTP
console.log('\n📤 Uploading to FTP...\n');

(async () => {
  try {
    await uploadToFTP(projectRoot, REMOTE_ROOT);
    console.log('\n✅ FTP upload completed!');
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 All done! Article is live on server.');
    console.log('='.repeat(50));
    console.log('\n📱 Next step: Run "node scripts/autopost.js" to post to Telegram and VK');
    
  } catch (err) {
    console.error('\n❌ FTP upload failed:', err.message);
    process.exit(1);
  }
})();

// ================= FTP UPLOAD =================
async function uploadToFTP(projectRoot, remoteRoot) {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  
  const distDir = path.join(projectRoot, 'dist');
  
  try {
    await client.access(FTP_CONFIG);
    console.log(`🔌 Connected to ${FTP_CONFIG.host}`);
    
    console.log('📁 Uploading dist/ folder...');
    
    // Загружаем без очистки (только добавляем/обновляем)
    await uploadDirRecursive(client, distDir, remoteRoot, distDir);
    
  } finally {
    client.close();
  }
}

async function uploadDirRecursive(client, localDir, remoteRoot, baseDir) {
  const items = fs.readdirSync(localDir);
  
  for (const item of items) {
    const localPath = path.join(localDir, item);
    const relativePath = path.relative(baseDir, localPath);
    const remotePath = path.posix.join(remoteRoot, relativePath.replace(/\\/g, '/'));
    
    const stat = fs.statSync(localPath);
    
    if (stat.isDirectory()) {
      await client.ensureDir(remotePath);
      await uploadDirRecursive(client, localPath, remoteRoot, baseDir);
    } else {
      try {
        await client.uploadFrom(localPath, remotePath);
        console.log(`  ↑ ${relativePath}`);
      } catch (err) {
        console.error(`  ✗ ${relativePath}: ${err.message}`);
      }
    }
  }
}

// ================= ОСТАЛЬНЫЕ ФУНКЦИИ =================
function updateBlogIndex(projectRoot, id, category, tags, date, image, translations) {
  const indexPath = path.join(projectRoot, 'src', 'data', 'blog-index.ts');
  console.log(`📝 Checking: ${indexPath}`);

  if (!fs.existsSync(indexPath)) {
    console.warn(`⚠️ blog-index.ts not found`);
    return;
  }

  let content = fs.readFileSync(indexPath, 'utf8');

  if (content.includes(`'${id}':`)) {
    console.log(`⚠️ Entry "${id}" already exists`);
    return;
  }

  const lastEntryPattern = /('[\w-]+':\s*\{[\s\S]*?\n\s*\})(\s*,?\s*)(\n\s*\};)/;
  const match = content.match(lastEntryPattern);

  if (!match) {
    console.error('❌ Could not find insertion point');
    return;
  }

  const lastEntryEnd = match.index + match[1].length;
  const hasComma = match[2].includes(',');
  const commaInsert = hasComma ? '' : ',';

  const newEntry = `${commaInsert}

  // ✅ AUTO-ADDED: ${id}
  '${id}': {
    id: '${id}',
    category: '${category}',
    tags: [${tags.map(t => `'${t}'`).join(', ')}],
    date: '${date}',
    image: '${image}',
    translations: {
      ru: { 
        slug: '${translations.ru.slug}',
        title: '${translations.ru.title}',
        excerpt: '${translations.ru.excerpt.substring(0, 100)}...'
      },
      de: { 
        slug: '${translations.de.slug}',
        title: '${translations.de.title}',
        excerpt: '${translations.de.excerpt.substring(0, 100)}...'
      },
      en: { 
        slug: '${translations.en.slug}',
        title: '${translations.en.title}',
        excerpt: '${translations.en.excerpt.substring(0, 100)}...'
      }
    }
  }`;

  content = content.slice(0, lastEntryEnd) + newEntry + content.slice(lastEntryEnd);
  fs.writeFileSync(indexPath, content);
  console.log('✅ blog-index.ts updated');
}

function updateSitemap(projectRoot, id, date, translations) {
  const sitemapPath = path.join(projectRoot, 'public', 'sitemap.xml');
  console.log(`🗺️  Checking: ${sitemapPath}`);

  if (!fs.existsSync(sitemapPath)) {
    console.warn(`⚠️ sitemap.xml not found`);
    return;
  }

  let content = fs.readFileSync(sitemapPath, 'utf8');

  if (content.includes(translations.ru.slug)) {
    console.log(`⚠️ Sitemap entries already exist`);
    return;
  }

  const insertPos = content.lastIndexOf('</urlset>');
  if (insertPos === -1) {
    console.error('❌ </urlset> not found');
    return;
  }

  const newEntries = `
  <!-- ✅ AUTO-ADDED: ${id} -->
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
  console.log('✅ sitemap.xml updated');
}

function generateStaticHtml(projectRoot, id, date, image, translations) {
  const distDir = path.join(projectRoot, 'dist');
  const articleDir = path.join(projectRoot, 'src', 'content', 'blog', id);
  
  ['ru', 'en', 'de'].forEach(lang => {
    const jsonPath = path.join(articleDir, `${lang}.json`);
    if (!fs.existsSync(jsonPath)) return;
    
    const article = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const slug = translations[lang].slug;
    const staticDir = path.join(distDir, lang, 'blog', slug);
    fs.mkdirSync(staticDir, { recursive: true });
    
    const contentHtml = cleanHtmlContent(article.content || '');
    
    const html = `<!DOCTYPE html>
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
        <time datetime="${date}">${new Date(date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
        · ${article.readTime || '10 min'}
      </div>
    </header>
    <div class="content">
      ${contentHtml}
    </div>
    <footer style="margin-top:3em;padding-top:2em;border-top:1px solid #eee">
      <p><a href="https://my.delimes.ru/${lang}/blog/${slug}" style="color:#2F8E92">🔗 ${lang === 'ru' ? 'Открыть полную версию' : lang === 'de' ? 'Vollständige Version öffnen' : 'Open full version'}</a></p>
    </footer>
  </article>
</body>
</html>`;
    
    fs.writeFileSync(path.join(staticDir, 'index.html'), html);
    console.log(`✅ Generated: /${lang}/blog/${slug}/index.html`);
  });
}

function cleanHtmlContent(content) {
  if (!content) return '<p>Content coming soon...</p>';
  
  // Если контент уже HTML (с тегами), оставляем как есть
  if (content.includes('<') && content.includes('>')) {
    return content;
  }
  
  // Иначе конвертируем markdown-подобный текст
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

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}