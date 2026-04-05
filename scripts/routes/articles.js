const express = require('express');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { projectRoot } = require('../lib/env');
const { generateTopics, writeArticle } = require('../lib/ai-service');
const { generateArticleImage } = require('../lib/image-generator');
const { createArticleFiles } = require('../lib/article-creator');
const { updateBlogIndex } = require('../lib/blog-index-updater');
const { updateSitemap } = require('../lib/sitemap-updater');
const { generateStaticHtml, generateStaticHtmlForAllArticles } = require('../lib/static-html-generator');
const { uploadDistToFTP } = require('../lib/ftp-upload');

const router = express.Router();

const TOPICS_FILE = path.join(projectRoot, 'scripts', 'data', 'article-topics.json');
const BLOG_DIR = path.join(projectRoot, 'src', 'content', 'blog');

function readTopics() {
  if (!fs.existsSync(TOPICS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8')); } catch { return []; }
}

function writeTopics(topics) {
  fs.writeFileSync(TOPICS_FILE, JSON.stringify(topics, null, 2));
}

// GET /api/articles
router.get('/', (req, res) => {
  try {
    const articles = [];

    if (fs.existsSync(BLOG_DIR)) {
      const dirs = fs.readdirSync(BLOG_DIR).filter(item =>
        fs.statSync(path.join(BLOG_DIR, item)).isDirectory()
      );

      for (const dir of dirs) {
        const title = { ru: '', en: '', de: '' };
        let date = '';
        let category = '';
        let tags = [];
        let image = '';
        let status = 'written';
        let postedToSocial = false;
        let sentDate = null;

        for (const lang of ['ru', 'en', 'de']) {
          const file = path.join(BLOG_DIR, dir, `${lang}.json`);
          if (fs.existsSync(file)) {
            try {
              const data = JSON.parse(fs.readFileSync(file, 'utf8'));
              title[lang] = data.title || '';
              if (lang === 'ru') {
                date = data.date || '';
                category = data.category || '';
                tags = data.tags || [];
                image = data.meta?.ogImage || '';
                status = data.published ? 'published' : 'written';
              }
            } catch { /* skip */ }
          }
        }

        // Check .sent markers
        const sentFiles = fs.readdirSync(path.join(BLOG_DIR, dir)).filter(f => f.endsWith('.sent'));
        if (sentFiles.length > 0) {
          postedToSocial = true;
          try {
            sentDate = fs.readFileSync(path.join(BLOG_DIR, dir, sentFiles[0]), 'utf8').trim();
          } catch { /* ignore */ }
        }

        articles.push({ id: dir, title, date, category, tags, image, status, postedToSocial, sentDate });
      }
    }

    // Sort by date descending
    articles.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const topics = readTopics();
    res.json({ articles, topics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/articles/generate-topics
router.post('/generate-topics', async (req, res) => {
  try {
    const { count = 5 } = req.body || {};
    const topics = readTopics();

    // Get existing article titles
    const existingArticles = [];
    if (fs.existsSync(BLOG_DIR)) {
      const dirs = fs.readdirSync(BLOG_DIR).filter(item =>
        fs.statSync(path.join(BLOG_DIR, item)).isDirectory()
      );
      for (const dir of dirs) {
        const ruFile = path.join(BLOG_DIR, dir, 'ru.json');
        if (fs.existsSync(ruFile)) {
          try {
            const data = JSON.parse(fs.readFileSync(ruFile, 'utf8'));
            existingArticles.push({ title: data.title, category: data.category });
          } catch { /* skip */ }
        }
      }
    }

    const newTopics = await generateTopics(existingArticles, topics, count);

    const enrichedTopics = newTopics.map(t => ({
      id: t.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      topic: t.topic,
      category: t.category || 'webdev',
      suggestedTags: t.suggestedTags || [],
      status: 'pending',
      articleId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    topics.push(...enrichedTopics);
    writeTopics(topics);

    res.json({ topics: enrichedTopics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/articles/write/:topicId
router.post('/write/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const topics = readTopics();
    const topic = topics.find(t => t.id === topicId);

    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    if (topic.status !== 'pending') return res.status(400).json({ error: 'Topic already processed' });

    // Update status
    topic.status = 'writing';
    topic.updatedAt = new Date().toISOString();
    writeTopics(topics);

    // Get existing articles for context
    const existingArticles = [];
    if (fs.existsSync(BLOG_DIR)) {
      const dirs = fs.readdirSync(BLOG_DIR).filter(item =>
        fs.statSync(path.join(BLOG_DIR, item)).isDirectory()
      );
      for (const dir of dirs) {
        const ruFile = path.join(BLOG_DIR, dir, 'ru.json');
        if (fs.existsSync(ruFile)) {
          try {
            existingArticles.push(JSON.parse(fs.readFileSync(ruFile, 'utf8')));
          } catch { /* skip */ }
        }
      }
    }

    // Call AI to write
    const articleData = await writeArticle(topic.topic, topic.category, topic.suggestedTags, existingArticles);

    // Create article files
    createArticleFiles(articleData, projectRoot);
    updateBlogIndex(projectRoot, articleData.id, articleData.category, articleData.tags, articleData.date, articleData.image, articleData.translations);
    updateSitemap(projectRoot, articleData.id, articleData.date, articleData.translations);

    // Update topic status
    topic.status = 'written';
    topic.articleId = articleData.id;
    topic.updatedAt = new Date().toISOString();
    writeTopics(topics);

    res.json({ articleId: articleData.id, status: 'written' });
  } catch (err) {
    // Reset topic status on error
    try {
      const topics = readTopics();
      const topic = topics.find(t => t.id === req.params.topicId);
      if (topic && topic.status === 'writing') {
        topic.status = 'pending';
        topic.updatedAt = new Date().toISOString();
        writeTopics(topics);
      }
    } catch { /* ignore */ }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/articles/generate-image/:articleId
router.post('/generate-image/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const ruFile = path.join(BLOG_DIR, articleId, 'ru.json');

    if (!fs.existsSync(ruFile)) return res.status(404).json({ error: 'Article not found' });

    const article = JSON.parse(fs.readFileSync(ruFile, 'utf8'));
    const imagePath = await generateArticleImage(article.title, articleId, projectRoot);

    res.json({ imagePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/articles/publish/:articleId
router.post('/publish/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const articleDir = path.join(BLOG_DIR, articleId);

    if (!fs.existsSync(articleDir)) return res.status(404).json({ error: 'Article not found' });

    // Build project
    console.log('Building project...');
    execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
    console.log('Build complete');

    // Generate static HTML
    generateStaticHtmlForAllArticles(projectRoot);

    // FTP upload
    await uploadDistToFTP(projectRoot);

    res.json({ success: true, url: `https://my.delimes.ru/ru/blog/` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
