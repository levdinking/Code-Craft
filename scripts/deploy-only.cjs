#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ftp = require('basic-ftp');

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

console.log('🚀 Starting deployment process...\n');

// 1. Запускаем сборку
console.log('🏗️  Step 1: Building project...');
try {
  execSync('npm run build', {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  console.log('✅ Build completed!\n');
} catch (error) {
  console.error('❌ Build failed:', error.status);
  process.exit(1);
}

// 2. Генерируем статические HTML для Instant View (если есть статьи)
console.log('📄 Step 2: Generating static HTML for Instant View...');
generateStaticHtmlForAllArticles(projectRoot);
console.log('✅ Static HTML generation completed!\n');

// 3. Загружаем на FTP
console.log('📤 Step 3: Uploading to FTP...');

(async () => {
  try {
    await uploadToFTP(projectRoot, REMOTE_ROOT);
    console.log('\n✅ FTP upload completed!');

    // 4. Загружаем серверные файлы (Node.js) в каталог приложения
    const serverRemoteRoot = env.FTP_SERVER_ROOT || '/my.delimes.ru/project/app/';
    console.log('\n📤 Step 4: Uploading server files...');
    await uploadServerFiles(projectRoot, serverRemoteRoot);
    console.log('✅ Server files uploaded!');
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Deployment successful! Site is updated.');
    console.log('='.repeat(50));
    
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
  
  if (!fs.existsSync(distDir)) {
    throw new Error('dist/ folder not found. Build failed?');
  }
  
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

async function uploadDirRecursive(client, localDir, remoteRoot, baseDir, exclude) {
  const items = fs.readdirSync(localDir);
  
  for (const item of items) {
    // Пропускаем исключённые папки
    if (exclude && exclude.includes(item)) continue;

    const localPath = path.join(localDir, item);
    const relativePath = path.relative(baseDir, localPath);
    const remotePath = path.posix.join(remoteRoot, relativePath.replace(/\\/g, '/'));
    
    const stat = fs.statSync(localPath);
    
    if (stat.isDirectory()) {
      await client.ensureDir(remotePath);
      await uploadDirRecursive(client, localPath, remoteRoot, baseDir, exclude);
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

// ================= GENERATE STATIC HTML =================
function generateStaticHtmlForAllArticles(projectRoot) {
  const distDir = path.join(projectRoot, 'dist');
  const blogContentDir = path.join(projectRoot, 'src', 'content', 'blog');
  
  if (!fs.existsSync(blogContentDir)) {
    console.log('⚠️  Blog content directory not found');
    return;
  }
  
  const articleIds = fs.readdirSync(blogContentDir).filter(item => {
    const itemPath = path.join(blogContentDir, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  let generatedCount = 0;
  
  articleIds.forEach(id => {
    const articleDir = path.join(blogContentDir, id);
    ['ru', 'en', 'de'].forEach(lang => {
      const jsonPath = path.join(articleDir, `${lang}.json`);
      if (!fs.existsSync(jsonPath)) return;
      
      const article = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      // Получаем slug из файла статьи
      const slug = article.slug || id;
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
  <meta property="og:image" content="https://my.delimes.ru${article.meta?.ogImage || article.image || '/og-image.png'}">
  <meta property="og:url" content="https://my.delimes.ru/${lang}/blog/${slug}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Delimes">
  <meta property="article:published_time" content="${article.date || new Date().toISOString()}">
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
        <time datetime="${article.date || ''}">${article.date ? new Date(article.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</time>
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
      generatedCount++;
    });
  });
  
  console.log(`✅ Generated ${generatedCount} static HTML files`);
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

// ================= UPLOAD SERVER FILES =================
async function uploadServerFiles(projectRoot, serverRemoteRoot) {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  const scriptsDir = path.join(projectRoot, 'scripts');

  try {
    await client.access(FTP_CONFIG);
    console.log(`🔌 Connected for server upload`);

    // Загружаем scripts/ (кроме node_modules)
    await client.ensureDir(serverRemoteRoot + 'scripts/');
    await uploadDirRecursive(client, scriptsDir, serverRemoteRoot + 'scripts/', scriptsDir, ['node_modules']);

    // Загружаем .env с NODE_ENV=production
    const envPath = path.join(projectRoot, '.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      envContent = envContent.replace(/NODE_ENV=development/, 'NODE_ENV=production');
      const tmpEnv = path.join(projectRoot, '.tmp-server-env');
      fs.writeFileSync(tmpEnv, envContent);
      await client.uploadFrom(tmpEnv, serverRemoteRoot + '.env');
      fs.unlinkSync(tmpEnv);
      console.log('  ↑ .env (NODE_ENV=production)');
    }

    // Создаём package.json для серверного приложения с точкой входа и всеми зависимостями
    const scriptsPkg = JSON.parse(fs.readFileSync(path.join(scriptsDir, 'package.json'), 'utf8'));
    const serverPkg = {
      name: 'delimes-admin-server',
      version: '1.0.0',
      private: true,
      type: 'commonjs',
      scripts: { start: 'node scripts/server.js' },
      engines: { node: '>=18' },
      dependencies: scriptsPkg.dependencies || {},
    };
    const tmpPkg = path.join(projectRoot, '.tmp-server-package.json');
    fs.writeFileSync(tmpPkg, JSON.stringify(serverPkg, null, 2));
    await client.uploadFrom(tmpPkg, serverRemoteRoot + 'package.json');
    fs.unlinkSync(tmpPkg);
    console.log('  ↑ package.json (server entry + dependencies)');

  } finally {
    client.close();
  }
}
