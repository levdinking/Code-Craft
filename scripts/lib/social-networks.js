const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { getEnv, projectRoot } = require('./env');
const { getBufferChannelId, createBufferPost } = require('./buffer-client');

const CONFIG_FILE = path.join(projectRoot, 'scripts', 'data', 'social-config.json');
const VK_API_VERSION = '5.199';

// === Конфигурация ===

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { networks: {} };
  }
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

function getNetworkConfig(network) {
  const config = loadConfig();
  return config.networks[network] || null;
}

function updateNetworkConfig(network, updates) {
  const config = loadConfig();
  config.networks[network] = { ...config.networks[network], ...updates };
  saveConfig(config);
  return config;
}

function getEnabledNetworks() {
  const config = loadConfig();
  return Object.entries(config.networks)
    .filter(([, v]) => v.enabled && v.configured)
    .map(([k]) => k);
}

// === Telegram ===

async function sendToTelegram({ text, imageUrl, videoUrl }) {
  const TOKEN = getEnv('TELEGRAM_TOKEN');
  const CHAT_ID = getEnv('TELEGRAM_CHAT_ID');

  if (!TOKEN || !CHAT_ID) throw new Error('Telegram не настроен (TOKEN/CHAT_ID)');

  let url, data;

  if (videoUrl) {
    url = `https://api.telegram.org/bot${TOKEN}/sendVideo`;
    data = { chat_id: CHAT_ID, video: videoUrl, caption: text, parse_mode: 'HTML' };
  } else if (imageUrl) {
    url = `https://api.telegram.org/bot${TOKEN}/sendPhoto`;
    data = { chat_id: CHAT_ID, photo: imageUrl, caption: text, parse_mode: 'HTML' };
  } else {
    url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
    data = { chat_id: CHAT_ID, text, parse_mode: 'HTML' };
  }

  for (let i = 0; i < 3; i++) {
    try {
      const res = await axios.post(url, data);
      return { success: true, data: res.data };
    } catch (err) {
      console.log(`Telegram повтор ${i + 1}: ${err.message}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return { success: false, error: 'Telegram: не удалось после 3 попыток' };
}

// === VK ===

async function uploadPhotoToVK(photoUrl) {
  const VK_TOKEN = getEnv('VK_TOKEN');
  const VK_GROUP_ID = getEnv('VK_GROUP_ID');

  const serverRes = await axios.get('https://api.vk.com/method/photos.getWallUploadServer', {
    params: { group_id: VK_GROUP_ID, access_token: VK_TOKEN, v: VK_API_VERSION }
  });
  if (serverRes.data.error) throw new Error(`VK getWallUploadServer: ${serverRes.data.error.error_msg}`);

  const uploadUrl = serverRes.data.response.upload_url;
  const imageRes = await axios.get(photoUrl, { responseType: 'arraybuffer', timeout: 10000 });

  const form = new FormData();
  form.append('photo', Buffer.from(imageRes.data), { filename: 'image.jpg', contentType: 'image/jpeg' });

  const uploadRes = await axios.post(uploadUrl, form, { headers: form.getHeaders(), timeout: 30000 });
  const { photo, server, hash } = uploadRes.data;

  const saveRes = await axios.get('https://api.vk.com/method/photos.saveWallPhoto', {
    params: { group_id: VK_GROUP_ID, photo, server, hash, access_token: VK_TOKEN, v: VK_API_VERSION }
  });
  if (saveRes.data.error) throw new Error(`VK saveWallPhoto: ${saveRes.data.error.error_msg}`);

  const savedPhoto = saveRes.data.response[0];
  return `photo${savedPhoto.owner_id}_${savedPhoto.id}`;
}

async function sendToVK({ text, imageUrl, videoUrl }) {
  const VK_TOKEN = getEnv('VK_TOKEN', '');
  const VK_GROUP_ID = getEnv('VK_GROUP_ID', '');

  if (!VK_TOKEN || !VK_GROUP_ID) {
    return { success: false, error: 'VK не настроен' };
  }

  try {
    let attachments = '';
    if (imageUrl) {
      const photoId = await uploadPhotoToVK(imageUrl);
      attachments = photoId;
    }
    // Видео через VK API загружается отдельно — пока только текст+фото
    if (videoUrl && !imageUrl) {
      // TODO: Загрузка видео в VK
      console.log('VK: загрузка видео пока не поддерживается');
    }

    const res = await axios.post('https://api.vk.com/method/wall.post', null, {
      params: {
        owner_id: -VK_GROUP_ID,
        message: text,
        attachments,
        access_token: VK_TOKEN,
        v: VK_API_VERSION
      }
    });
    if (res.data.error) throw new Error(res.data.error.error_msg);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: `VK: ${err.message}` };
  }
}

// === Facebook (через Buffer) ===

async function sendToFacebook({ text, imageUrl, videoUrl }) {
  try {
    const channelId = await getBufferChannelId('facebook');
    const assets = {};
    if (imageUrl) assets.images = [imageUrl];
    if (videoUrl) assets.video = videoUrl;

    const result = await createBufferPost({
      text,
      channelIds: [channelId],
      mode: 'now',
      assets,
    });
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: `Facebook (Buffer): ${err.message}` };
  }
}

// === Instagram (через Buffer) ===

async function sendToInstagram({ text, imageUrl, videoUrl }) {
  try {
    const channelId = await getBufferChannelId('instagram');
    const assets = {};
    if (imageUrl) assets.images = [imageUrl];
    if (videoUrl) assets.video = videoUrl;

    const result = await createBufferPost({
      text,
      channelIds: [channelId],
      mode: 'now',
      assets,
    });
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: `Instagram (Buffer): ${err.message}` };
  }
}

// === YouTube (через Buffer) ===

async function sendToYouTube({ text, imageUrl, videoUrl }) {
  try {
    const channelId = await getBufferChannelId('youtube');
    const assets = {};
    if (videoUrl) assets.video = videoUrl;
    if (imageUrl && !videoUrl) assets.images = [imageUrl];

    const result = await createBufferPost({
      text,
      channelIds: [channelId],
      mode: 'now',
      assets,
    });
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: `YouTube (Buffer): ${err.message}` };
  }
}

// === Универсальная отправка ===

const NETWORK_SENDERS = {
  telegram: sendToTelegram,
  vk: sendToVK,
  facebook: sendToFacebook,
  instagram: sendToInstagram,
  youtube: sendToYouTube,
};

async function publishToNetworks(networks, payload) {
  const results = {};
  for (const network of networks) {
    const config = getNetworkConfig(network);
    if (!config || !config.enabled || !config.configured) {
      results[network] = { success: false, error: `${network} не настроен или отключён` };
      continue;
    }
    const sender = NETWORK_SENDERS[network];
    if (!sender) {
      results[network] = { success: false, error: `Неизвестная сеть: ${network}` };
      continue;
    }
    // Поддержка индивидуального payload для каждой сети
    const networkPayload = (payload && typeof payload === 'object' && payload[network] && payload[network].text)
      ? payload[network]
      : payload;
    results[network] = await sender(networkPayload);
  }
  return results;
}

module.exports = {
  loadConfig,
  saveConfig,
  getNetworkConfig,
  updateNetworkConfig,
  getEnabledNetworks,
  sendToTelegram,
  sendToVK,
  sendToFacebook,
  sendToInstagram,
  sendToYouTube,
  publishToNetworks,
};
