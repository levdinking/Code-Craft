const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { getEnv, projectRoot } = require('./env');

const VK_API_VERSION = '5.199';
const SITE_URL = 'https://my.delimes.ru';

function escapeHtml(text = '') {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function checkImage(url) {
  try {
    await axios.head(url, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

async function sendTelegram(photoUrl, caption) {
  const TOKEN = getEnv('TELEGRAM_TOKEN');
  const CHAT_ID = getEnv('TELEGRAM_CHAT_ID');

  const url = photoUrl
    ? `https://api.telegram.org/bot${TOKEN}/sendPhoto`
    : `https://api.telegram.org/bot${TOKEN}/sendMessage`;

  const data = photoUrl
    ? { chat_id: CHAT_ID, photo: photoUrl, caption, parse_mode: 'HTML' }
    : { chat_id: CHAT_ID, text: caption, parse_mode: 'HTML' };

  for (let i = 0; i < 3; i++) {
    try {
      const res = await axios.post(url, data);
      return res.data;
    } catch (err) {
      console.log(`Telegram retry ${i + 1}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error('Telegram failed after retries');
}

async function uploadPhotoToVK(photoUrl) {
  const VK_TOKEN = getEnv('VK_TOKEN');
  const VK_GROUP_ID = getEnv('VK_GROUP_ID');

  const serverRes = await axios.get('https://api.vk.com/method/photos.getWallUploadServer', {
    params: { group_id: VK_GROUP_ID, access_token: VK_TOKEN, v: VK_API_VERSION }
  });
  if (serverRes.data.error) throw new Error(`getWallUploadServer: ${serverRes.data.error.error_msg}`);

  const uploadUrl = serverRes.data.response.upload_url;
  const imageRes = await axios.get(photoUrl, { responseType: 'arraybuffer', timeout: 10000 });

  const form = new FormData();
  form.append('photo', Buffer.from(imageRes.data), { filename: 'image.jpg', contentType: 'image/jpeg' });

  const uploadRes = await axios.post(uploadUrl, form, { headers: form.getHeaders(), timeout: 30000 });
  const { photo, server, hash } = uploadRes.data;

  const saveRes = await axios.get('https://api.vk.com/method/photos.saveWallPhoto', {
    params: { group_id: VK_GROUP_ID, photo, server, hash, access_token: VK_TOKEN, v: VK_API_VERSION }
  });
  if (saveRes.data.error) throw new Error(`saveWallPhoto: ${saveRes.data.error.error_msg}`);

  const savedPhoto = saveRes.data.response[0];
  return `photo${savedPhoto.owner_id}_${savedPhoto.id}`;
}

async function sendVK(text, photoUrl) {
  const VK_TOKEN = getEnv('VK_TOKEN', '');
  const VK_GROUP_ID = getEnv('VK_GROUP_ID', '');

  if (!VK_TOKEN || !VK_GROUP_ID) {
    console.log('VK not configured');
    return false;
  }

  try {
    let attachments = '';
    if (photoUrl) {
      const photoId = await uploadPhotoToVK(photoUrl);
      attachments = photoId;
    }

    const res = await axios.post('https://api.vk.com/method/wall.post', null, {
      params: { owner_id: -VK_GROUP_ID, message: text, attachments, access_token: VK_TOKEN, v: VK_API_VERSION }
    });
    if (res.data.error) throw new Error(res.data.error.error_msg);
    console.log('VK posted');
    return true;
  } catch (err) {
    console.log(`VK error: ${err.message}`);
    return false;
  }
}

async function postArticleToSocial(articleId, root) {
  const pr = root || projectRoot;
  const file = path.join(pr, 'src', 'content', 'blog', articleId, 'ru.json');

  if (!fs.existsSync(file)) throw new Error(`Article not found: ${articleId}`);

  const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const article = JSON.parse(raw);

  if (!article.slug || !article.title || !article.excerpt) {
    throw new Error('Article missing required fields');
  }

  const url = `${SITE_URL}/ru/blog/${article.slug}`;
  const caption = `<b>${escapeHtml(article.title)}</b>\n\n${escapeHtml(article.excerpt)}\n\n<a href="${url}">Читать полностью</a>`;

  let photoUrl = article.meta?.ogImage || null;
  if (photoUrl && !photoUrl.startsWith('http')) photoUrl = `${SITE_URL}${photoUrl}`;
  if (photoUrl && !(await checkImage(photoUrl))) photoUrl = null;

  const tgResult = await sendTelegram(photoUrl, caption);
  let vkResult = false;

  if (tgResult.ok) {
    console.log(`Telegram OK: ${article.slug}`);
    const vkText = `${article.title}\n\n${url}`;
    vkResult = await sendVK(vkText, photoUrl);

    // Create .sent marker
    const marker = path.join(pr, 'src', 'content', 'blog', articleId, `${article.slug}.sent`);
    fs.writeFileSync(marker, new Date().toISOString());
  }

  return { telegram: !!tgResult.ok, vk: vkResult };
}

module.exports = { postArticleToSocial, sendTelegram, sendVK };
