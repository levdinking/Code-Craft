const express = require('express');
const router = express.Router();
const { loadPublications, savePublications } = require('../lib/pipeline-engine');
const { publishToNetworks } = require('../lib/social-networks');
const { optimizeForAllPlatforms } = require('../lib/viral-optimizer');
const { orchestrateSocialOnly } = require('../lib/publish-orchestrator');

// Получить все публикации
router.get('/', (req, res) => {
  try {
    const pubs = loadPublications();
    const { type, status } = req.query;

    let filtered = pubs;
    if (type) filtered = filtered.filter(p => p.type === type);
    if (status) filtered = filtered.filter(p => p.status === status);

    // Сортировка по дате (новые первые)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ publications: filtered, total: filtered.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить одну публикацию
router.get('/:id', (req, res) => {
  try {
    const pubs = loadPublications();
    const pub = pubs.find(p => p.id === req.params.id);
    if (!pub) return res.status(404).json({ error: 'Публикация не найдена' });
    res.json(pub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Опубликовать в соцсети вручную
router.post('/:id/publish', async (req, res) => {
  try {
    const pubs = loadPublications();
    const idx = pubs.findIndex(p => p.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'Публикация не найдена' });

    const pub = pubs[idx];
    const { networks } = req.body;
    const targetNets = networks || pub.targetNetworks;

    if (!targetNets.length) {
      return res.status(400).json({ error: 'Не указаны соцсети для публикации' });
    }

    pub.status = 'publishing';
    pubs[idx] = pub;
    savePublications(pubs);

    const payload = {
      text: pub.content?.ru || pub.topic,
      imageUrl: pub.image || null,
      videoUrl: pub.video || null,
    };

    const results = await publishToNetworks(targetNets, payload);

    const successNets = Object.entries(results)
      .filter(([, v]) => v.success)
      .map(([k]) => k);

    pub.publishedNetworks = [...new Set([...pub.publishedNetworks, ...successNets])];
    pub.status = successNets.length > 0 ? 'published' : 'error';
    if (successNets.length > 0) pub.publishedAt = new Date().toISOString();
    pubs[idx] = pub;
    savePublications(pubs);

    res.json({ publication: pub, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить публикацию
router.delete('/:id', (req, res) => {
  try {
    const pubs = loadPublications();
    const filtered = pubs.filter(p => p.id !== req.params.id);
    if (filtered.length === pubs.length) {
      return res.status(404).json({ error: 'Публикация не найдена' });
    }
    savePublications(filtered);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Вирусная оптимизация текста
router.post('/optimize', async (req, res) => {
  try {
    const { text, platforms, contentType = 'social-post', mediaType = 'none' } = req.body;
    if (!text) return res.status(400).json({ error: 'Текст обязателен' });
    if (!platforms || !platforms.length) return res.status(400).json({ error: 'Укажите платформы' });

    const optimized = await optimizeForAllPlatforms(text, platforms, contentType, mediaType);
    res.json(optimized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ручная публикация: текст + медиа → соцсети
router.post('/manual-publish', async (req, res) => {
  try {
    const { text, mediaUrl, mediaType, networks, optimize = true, contentType = 'social-post' } = req.body;
    if (!text) return res.status(400).json({ error: 'Текст обязателен' });
    if (!networks || !networks.length) return res.status(400).json({ error: 'Укажите соцсети' });

    const media = {};
    if (mediaUrl) {
      if (mediaType === 'video') media.videoUrl = mediaUrl;
      else media.imageUrl = mediaUrl;
    }

    const report = await orchestrateSocialOnly({
      type: contentType,
      content: text,
      media,
      targetNetworks: networks,
      optimize,
    });

    // Создаём запись публикации
    const pubs = loadPublications();
    const socialStep = report.steps.find(s => s.step === 'social-publish');
    const successNets = socialStep?.data
      ? Object.entries(socialStep.data).filter(([, v]) => v.success).map(([k]) => k)
      : [];

    const pub = {
      id: `pub-${Date.now()}`,
      type: contentType,
      subType: null,
      topic: text.substring(0, 100),
      content: { ru: text },
      image: media.imageUrl || null,
      video: media.videoUrl || null,
      targetNetworks: networks,
      publishedNetworks: successNets,
      status: successNets.length > 0 ? 'published' : 'error',
      pipelineJobId: null,
      createdAt: new Date().toISOString(),
      publishedAt: successNets.length > 0 ? new Date().toISOString() : null,
    };

    pubs.push(pub);
    savePublications(pubs);

    res.json({ publication: pub, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
