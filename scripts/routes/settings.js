const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { loadConfig, saveConfig, updateNetworkConfig } = require('../lib/social-networks');
const { loadTemplates, updateTemplate } = require('../lib/prompt-manager');
const { getEnv, updateEnvVar, reloadEnv } = require('../lib/env');

// === Настройки соцсетей ===

// Получить конфигурацию соцсетей
router.get('/social', (req, res) => {
  try {
    const config = loadConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить настройки конкретной сети
router.put('/social/:network', (req, res) => {
  try {
    const { network } = req.params;
    const validNetworks = ['telegram', 'vk', 'facebook', 'instagram', 'youtube'];
    if (!validNetworks.includes(network)) {
      return res.status(400).json({ error: `Неизвестная сеть: ${network}` });
    }
    const config = updateNetworkConfig(network, req.body);
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Шаблоны промптов ===

// Получить все шаблоны
router.get('/prompts', (req, res) => {
  try {
    const templates = loadTemplates();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить конкретный шаблон
router.put('/prompts/:key', (req, res) => {
  try {
    const { key } = req.params;
    const { template } = req.body;
    if (!template) {
      return res.status(400).json({ error: 'Поле template обязательно' });
    }
    const templates = updateTemplate(key, template);
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Сбросить шаблон к значению по умолчанию
router.post('/prompts/:key/reset', (req, res) => {
  try {
    // Дефолтные шаблоны хранятся в файле — просто возвращаем текущие
    const templates = loadTemplates();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === API ключи ===

const API_KEYS_CONFIG = path.join(__dirname, '..', 'data', 'api-keys-config.json');

function loadApiKeysConfig() {
  return JSON.parse(fs.readFileSync(API_KEYS_CONFIG, 'utf8'));
}

/**
 * Маскировать значение ключа: первые 4 + **** + последние 4
 */
function maskValue(val) {
  if (!val) return null;
  if (val.length >= 8) return val.slice(0, 4) + '****' + val.slice(-4);
  if (val.length > 0) return '****';
  return null;
}

// Получить список API ключей (маскированные значения)
router.get('/api-keys', (req, res) => {
  try {
    const config = loadApiKeysConfig();
    const keys = config.keys.map(k => {
      const rawValue = getEnv(k.envVar, '');
      const isPlaceholder = !rawValue || rawValue.startsWith('YOUR_');
      return {
        id: k.id,
        name: k.name,
        description: k.description,
        maskedValue: isPlaceholder ? null : maskValue(rawValue),
        status: isPlaceholder ? 'not_configured' : 'configured',
        docUrl: k.docUrl,
        docLabel: k.docLabel,
        hasExtraVars: !!(k.extraEnvVars && k.extraEnvVars.length > 0),
        extraVars: (k.extraEnvVars || []).map(ev => ({
          key: ev,
          maskedValue: maskValue(getEnv(ev, '')),
          configured: !!getEnv(ev, ''),
        })),
      };
    });
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить API ключ
router.put('/api-keys/:keyId', (req, res) => {
  try {
    const { keyId } = req.params;
    const { value, extraVars } = req.body;
    const config = loadApiKeysConfig();
    const keyConfig = config.keys.find(k => k.id === keyId);
    if (!keyConfig) {
      return res.status(404).json({ error: `Ключ ${keyId} не найден` });
    }
    if (value !== undefined && value !== null) {
      updateEnvVar(keyConfig.envVar, value);
    }
    // Обновить дополнительные переменные (TELEGRAM_CHAT_ID, VK_GROUP_ID и т.д.)
    if (extraVars && keyConfig.extraEnvVars) {
      for (const [evKey, evValue] of Object.entries(extraVars)) {
        if (keyConfig.extraEnvVars.includes(evKey) && evValue !== undefined) {
          updateEnvVar(evKey, evValue);
        }
      }
    }
    // Вернуть обновлённую информацию
    const rawValue = getEnv(keyConfig.envVar, '');
    res.json({
      id: keyConfig.id,
      maskedValue: maskValue(rawValue),
      status: rawValue ? 'configured' : 'not_configured',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Тестировать API ключ
router.post('/api-keys/:keyId/test', async (req, res) => {
  const { keyId } = req.params;
  try {
    const config = loadApiKeysConfig();
    const keyConfig = config.keys.find(k => k.id === keyId);
    if (!keyConfig) {
      return res.status(404).json({ error: `Ключ ${keyId} не найден` });
    }

    const rawValue = getEnv(keyConfig.envVar, '');
    if (!rawValue || rawValue.startsWith('YOUR_')) {
      return res.json({ status: 'error', message: 'Ключ не настроен' });
    }

    let result;
    switch (keyId) {
      case 'qwen': {
        const { callQwenAI } = require('../lib/ai-service');
        await callQwenAI([{ role: 'user', content: 'Ответь одним словом: работает' }], { maxTokens: 10, timeout: 15000 });
        result = { status: 'ok', message: 'Qwen AI работает' };
        break;
      }
      case 'tinify': {
        const tinify = require('tinify');
        tinify.key = rawValue;
        await tinify.validate();
        const count = tinify.compressionCount || 0;
        result = { status: 'ok', message: `Tinify работает (${count}/500 сжатий)` };
        break;
      }
      case 'buffer': {
        const { getBufferStatus } = require('../lib/buffer-client');
        const bufferStatus = await getBufferStatus();
        result = { status: 'ok', message: `Buffer подключён (${bufferStatus.channels?.length || 0} каналов)` };
        break;
      }
      case 'telegram': {
        const axios = require('axios');
        const resp = await axios.get(`https://api.telegram.org/bot${rawValue}/getMe`, { timeout: 10000 });
        const botName = resp.data?.result?.username || 'unknown';
        result = { status: 'ok', message: `Telegram бот: @${botName}` };
        break;
      }
      case 'vk': {
        const axios = require('axios');
        const groupId = getEnv('VK_GROUP_ID', '');
        const resp = await axios.get('https://api.vk.com/method/groups.getById', {
          params: { group_id: groupId, access_token: rawValue, v: '5.199' },
          timeout: 10000,
        });
        const groupName = resp.data?.response?.groups?.[0]?.name || resp.data?.response?.[0]?.name || 'OK';
        result = { status: 'ok', message: `VK группа: ${groupName}` };
        break;
      }
      case 'ftp': {
        const ftp = require('basic-ftp');
        const client = new ftp.Client();
        client.ftp.verbose = false;
        try {
          await client.access({
            host: getEnv('FTP_HOST', ''),
            user: getEnv('FTP_USER', ''),
            password: getEnv('FTP_PASSWORD', ''),
            secure: false,
            port: parseInt(getEnv('FTP_PORT', '21'), 10),
          });
          result = { status: 'ok', message: `FTP подключён: ${getEnv('FTP_HOST', '')}` };
        } finally {
          client.close();
        }
        break;
      }
      default:
        result = { status: 'error', message: 'Тест не реализован для этого ключа' };
    }

    res.json(result);
  } catch (err) {
    res.json({ status: 'error', message: err.message });
  }
});

module.exports = router;
