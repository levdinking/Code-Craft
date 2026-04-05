const express = require('express');
const fs = require('fs');
const path = require('path');
const { projectRoot } = require('../lib/env');
const { postArticleToSocial } = require('../lib/social-poster');

const router = express.Router();

const BLOG_DIR = path.join(projectRoot, 'src', 'content', 'blog');

// POST /api/social/post/:articleId
router.post('/post/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const articleDir = path.join(BLOG_DIR, articleId);

    if (!fs.existsSync(articleDir)) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const result = await postArticleToSocial(articleId, projectRoot);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/social/status
router.get('/status', (req, res) => {
  try {
    const results = [];

    if (fs.existsSync(BLOG_DIR)) {
      const dirs = fs.readdirSync(BLOG_DIR).filter(item =>
        fs.statSync(path.join(BLOG_DIR, item)).isDirectory()
      );

      for (const dir of dirs) {
        const ruFile = path.join(BLOG_DIR, dir, 'ru.json');
        if (!fs.existsSync(ruFile)) continue;

        try {
          const article = JSON.parse(fs.readFileSync(ruFile, 'utf8'));
          if (!article.published) continue;

          const sentFiles = fs.readdirSync(path.join(BLOG_DIR, dir)).filter(f => f.endsWith('.sent'));
          let sentDate = null;
          if (sentFiles.length > 0) {
            try {
              sentDate = fs.readFileSync(path.join(BLOG_DIR, dir, sentFiles[0]), 'utf8').trim();
            } catch { /* ignore */ }
          }

          results.push({
            id: dir,
            title: article.title,
            slug: article.slug,
            posted: sentFiles.length > 0,
            sentDate,
          });
        } catch { /* skip */ }
      }
    }

    res.json({ articles: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
