const express = require('express');
const router = express.Router();
const { getBufferStatus, getChannels, getOrganizationId, resetCache } = require('../lib/buffer-client');

// Статус подключения Buffer
router.get('/status', async (req, res) => {
  try {
    const status = await getBufferStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Список каналов Buffer
router.get('/channels', async (req, res) => {
  try {
    const orgId = await getOrganizationId();
    const channels = await getChannels(orgId);
    res.json({ channels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Сброс кэша каналов
router.post('/reset-cache', (req, res) => {
  resetCache();
  res.json({ success: true, message: 'Кэш Buffer сброшен' });
});

module.exports = router;
