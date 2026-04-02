const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// ================= CONSTANTS =================
const VK_API_VERSION = '5.199';

// ================= PATHS =================
const scriptDir = __dirname;
const projectRoot = path.join(scriptDir, '..');

// ================= ENV =================
function loadEnv(filePath) {
  const env = {};
  const content = fs.readFileSync(filePath, 'utf8');

  content.split('\n').forEach(line => {
    if (!line || line.startsWith('#')) return;
    const [key, ...vals] = line.split('=');
    env[key.trim()] = vals.join('=').trim();
  });

  return env;
}

const envPath = path.join(projectRoot, '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env не найден');
  process.exit(1);
}

const env = loadEnv(envPath);

const TOKEN = env.TELEGRAM_TOKEN;
const CHAT_ID = env.TELEGRAM_CHAT_ID;
const VK_TOKEN = env.VK_TOKEN;
const VK_GROUP_ID = env.VK_GROUP_ID;

if (!TOKEN || !CHAT_ID) {
  console.error('❌ Нет TELEGRAM_TOKEN или TELEGRAM_CHAT_ID');
  process.exit(1);
}

// ================= CONFIG =================
const BLOG_DIR = path.join(projectRoot, 'src/content/blog');
const SITE_URL = 'https://my.delimes.ru';
const LOG_FILE = path.join(projectRoot, 'autopost.log');

// ================= UTILS =================
function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  console.log(line.trim());
  fs.appendFileSync(LOG_FILE, line);
}

function escapeHtml(text = '') {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function checkImage(url) {
  try {
    await axios.head(url, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

// ================= TELEGRAM =================
async function sendTelegram(photoUrl, caption) {
  const url = photoUrl
    ? `https://api.telegram.org/bot${TOKEN}/sendPhoto`
    : `https://api.telegram.org/bot${TOKEN}/sendMessage`;

  const data = photoUrl
    ? {
        chat_id: CHAT_ID,
        photo: photoUrl,
        caption,
        parse_mode: 'HTML'
      }
    : {
        chat_id: CHAT_ID,
        text: caption,
        parse_mode: 'HTML'
      };

  for (let i = 0; i < 3; i++) {
    try {
      const res = await axios.post(url, data);
      return res.data;
    } catch (err) {
      log(`⚠️ Telegram retry ${i + 1}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  throw new Error('Telegram failed after retries');
}

// ================= VK =================

// 1. Загрузка фото в VK
async function uploadPhotoToVK(photoUrl) {
  const serverRes = await axios.get('https://api.vk.com/method/photos.getWallUploadServer', {
    params: {
      group_id: VK_GROUP_ID,
      access_token: VK_TOKEN,
      v: VK_API_VERSION
    }
  });

  if (serverRes.data.error) {
    throw new Error(`getWallUploadServer: ${serverRes.data.error.error_msg}`);
  }

  const uploadUrl = serverRes.data.response.upload_url;

  const imageRes = await axios.get(photoUrl, {
    responseType: 'arraybuffer',
    timeout: 10000
  });

  const form = new FormData();
  form.append('photo', Buffer.from(imageRes.data), {
    filename: 'image.jpg',
    contentType: 'image/jpeg'
  });

  const uploadRes = await axios.post(uploadUrl, form, {
    headers: form.getHeaders(),
    timeout: 30000
  });

  const { photo, server, hash } = uploadRes.data;

  const saveRes = await axios.get('https://api.vk.com/method/photos.saveWallPhoto', {
    params: {
      group_id: VK_GROUP_ID,
      photo,
      server,
      hash,
      access_token: VK_TOKEN,
      v: VK_API_VERSION
    }
  });

  if (saveRes.data.error) {
    throw new Error(`saveWallPhoto: ${saveRes.data.error.error_msg}`);
  }

  const savedPhoto = saveRes.data.response[0];

  return `photo${savedPhoto.owner_id}_${savedPhoto.id}`;
}

// 2. Пост в VK
async function sendVK(text, photoUrl) {
  if (!VK_TOKEN || !VK_GROUP_ID) {
    log('⚠️ VK не настроен (нет токена или ID группы)');
    return false;
  }

  try {
    let attachments = '';

    if (photoUrl) {
      const photoId = await uploadPhotoToVK(photoUrl);
      attachments = photoId;
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

    if (res.data.error) {
      throw new Error(res.data.error.error_msg);
    }

    log('✅ VK отправлено');
    return true;
  } catch (err) {
    log(`❌ VK ошибка: ${err.message}`);
    return false;
  }
}

// ================= MAIN =================
async function processArticle(article, dir) {
  const url = `${SITE_URL}/ru/blog/${article.slug}`;

  const caption =
    `📝 <b>${escapeHtml(article.title)}</b>\n\n` +
    `${escapeHtml(article.excerpt)}\n\n` +
    `🔗 <a href="${url}">Читать полностью →</a>`;

  let photoUrl = article.meta?.ogImage || null;

  if (photoUrl && !photoUrl.startsWith('http')) {
    photoUrl = `${SITE_URL}${photoUrl}`;
  }

  if (photoUrl && !(await checkImage(photoUrl))) {
    log('⚠️ Фото недоступно, отправка без фото');
    photoUrl = null;
  }

  // Telegram
  const tgResult = await sendTelegram(photoUrl, caption);

  if (tgResult.ok) {
    log(`✅ Telegram: ${article.slug}`);

    // VK (текст чуть проще)
    const vkText = `${article.title}\n\n${url}`;
    await sendVK(vkText, photoUrl);

    return true;
  }

  log('❌ Telegram ошибка');
  return false;
}

async function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    log('❌ BLOG_DIR не найден');
    return;
  }

  const dirs = fs.readdirSync(BLOG_DIR);
  let sent = 0;

  for (const dir of dirs) {
    const file = path.join(BLOG_DIR, dir, 'ru.json');
    if (!fs.existsSync(file)) continue;

    let article;

    try {
      const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
      article = JSON.parse(raw);
    } catch {
      log(`❌ Ошибка JSON: ${dir}`);
      continue;
    }

    if (!article.slug || !article.title || !article.excerpt) continue;
    if (!article.published) continue;

    const marker = path.join(BLOG_DIR, dir, `${article.slug}.sent`);
    if (fs.existsSync(marker)) continue;

    const ok = await processArticle(article, dir);

    if (ok) {
      fs.writeFileSync(marker, new Date().toISOString());
      sent++;
    }
  }

  log(`📊 Отправлено: ${sent}`);
}

main().catch(err => {
  log(`❌ Критическая ошибка: ${err.message}`);
  process.exit(1);
});