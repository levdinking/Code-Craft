const express = require('express');
const fs = require('fs');
const path = require('path');
const { projectRoot } = require('../lib/env');

const router = express.Router();

// GET /api/stats
router.get('/', (req, res) => {
  try {
    const blogDir = path.join(projectRoot, 'src', 'content', 'blog');
    const topicsFile = path.join(projectRoot, 'scripts', 'data', 'article-topics.json');

    let totalArticles = 0;
    let publishedCount = 0;
    let draftCount = 0;
    let postedToSocialCount = 0;
    let lastPublishedDate = null;

    if (fs.existsSync(blogDir)) {
      const dirs = fs.readdirSync(blogDir).filter(item => {
        return fs.statSync(path.join(blogDir, item)).isDirectory();
      });

      totalArticles = dirs.length;

      for (const dir of dirs) {
        const ruFile = path.join(blogDir, dir, 'ru.json');
        if (fs.existsSync(ruFile)) {
          try {
            const article = JSON.parse(fs.readFileSync(ruFile, 'utf8'));
            if (article.published) {
              publishedCount++;
              if (!lastPublishedDate || article.date > lastPublishedDate) {
                lastPublishedDate = article.date;
              }
            } else {
              draftCount++;
            }

            // Check for .sent files
            const sentFiles = fs.readdirSync(path.join(blogDir, dir)).filter(f => f.endsWith('.sent'));
            if (sentFiles.length > 0) postedToSocialCount++;
          } catch { /* skip malformed files */ }
        }
      }
    }

    let pendingTopicsCount = 0;
    if (fs.existsSync(topicsFile)) {
      try {
        const topics = JSON.parse(fs.readFileSync(topicsFile, 'utf8'));
        pendingTopicsCount = topics.filter(t => t.status === 'pending').length;
      } catch { /* ignore */ }
    }

    res.json({
      totalArticles,
      publishedCount,
      draftCount,
      postedToSocialCount,
      pendingTopicsCount,
      lastPublishedDate,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
