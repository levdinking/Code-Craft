const express = require('express');
const router = express.Router();
const { configureMulter, processUpload, uploadFromUrl } = require('../lib/media-manager');

const upload = configureMulter();

// Загрузка файла через multipart form-data
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не прикреплён' });
    }
    const result = await processUpload(req.file);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Загрузка файла по URL
router.post('/upload-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL обязателен' });
    }
    // Валидация URL: только http/https, запрет localhost и приватных IP
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return res.status(400).json({ error: 'Допустимы только http/https URL' });
      }
      const hostname = parsed.hostname.toLowerCase();
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' ||
          hostname.startsWith('10.') || hostname.startsWith('192.168.') ||
          hostname.startsWith('169.254.') || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) {
        return res.status(400).json({ error: 'Внутренние адреса запрещены' });
      }
    } catch {
      return res.status(400).json({ error: 'Некорректный URL' });
    }
    const result = await uploadFromUrl(url);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
