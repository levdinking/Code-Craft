const axios = require('axios');
const { getEnv } = require('./env');

const BUFFER_API_URL = 'https://api.buffer.com';

// Кэш каналов Buffer
let _channelsCache = null;
let _organizationId = null;

/**
 * Выполнить GraphQL запрос к Buffer API
 */
async function bufferGraphQL(query, variables = {}) {
  const apiKey = getEnv('BUFFER_API_KEY', '');
  if (!apiKey) {
    throw new Error('BUFFER_API_KEY не настроен');
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await axios.post(BUFFER_API_URL, { query, variables }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      if (res.data.errors && res.data.errors.length > 0) {
        const errMsg = res.data.errors.map(e => e.message).join('; ');
        throw new Error(`Buffer GraphQL: ${errMsg}`);
      }

      return res.data.data;
    } catch (err) {
      if (attempt < 2) {
        console.log(`Buffer повтор ${attempt + 1}: ${err.message}`);
        await new Promise(r => setTimeout(r, 2000));
      } else {
        throw err;
      }
    }
  }
}

/**
 * Получить список организаций аккаунта
 */
async function getOrganizations() {
  const data = await bufferGraphQL(`
    query {
      account {
        id
        email
        organizations {
          id
          name
        }
      }
    }
  `);
  return data.account.organizations || [];
}

/**
 * Получить ID первой организации (кэшируется)
 */
async function getOrganizationId() {
  if (_organizationId) return _organizationId;
  const orgs = await getOrganizations();
  if (orgs.length === 0) throw new Error('Buffer: нет организаций в аккаунте');
  _organizationId = orgs[0].id;
  return _organizationId;
}

/**
 * Получить список каналов организации
 */
async function getChannels(organizationId) {
  if (!organizationId) {
    organizationId = await getOrganizationId();
  }

  const data = await bufferGraphQL(`
    query GetChannels($input: ChannelsInput!) {
      channels(input: $input) {
        id
        name
        service
      }
    }
  `, { input: { organizationId } });

  return data.channels || [];
}

/**
 * Получить ID канала Buffer по типу сервиса (facebook, instagram, youtube)
 * Результат кэшируется
 */
async function getBufferChannelId(service) {
  if (!_channelsCache) {
    const orgId = await getOrganizationId();
    _channelsCache = await getChannels(orgId);
  }

  const channel = _channelsCache.find(ch => ch.service === service);
  if (!channel) {
    throw new Error(`Buffer: канал для ${service} не найден. Подключите его в Buffer.com`);
  }
  return channel.id;
}

/**
 * Создать пост в Buffer
 */
async function createBufferPost({ text, channelIds, mode = 'now', assets = {} }) {
  if (!channelIds || channelIds.length === 0) {
    throw new Error('Buffer: не указаны каналы для публикации');
  }

  const input = {
    text,
    channelIds,
    schedulingType: mode === 'now' ? 'now' : 'automatic',
  };

  // Добавляем медиа-ассеты, если есть
  if (assets.images && assets.images.length > 0) {
    input.assets = { images: assets.images.map(url => ({ url })) };
  }
  if (assets.video) {
    input.assets = { ...input.assets, video: { url: assets.video } };
  }

  const data = await bufferGraphQL(`
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        text
        status
      }
    }
  `, { input });

  return data.createPost;
}

/**
 * Проверить статус подключения Buffer и получить каналы
 */
async function getBufferStatus() {
  try {
    const apiKey = getEnv('BUFFER_API_KEY', '');
    if (!apiKey) {
      return { connected: false, error: 'BUFFER_API_KEY не настроен', channels: [] };
    }

    const orgs = await getOrganizations();
    if (orgs.length === 0) {
      return { connected: false, error: 'Нет организаций', channels: [] };
    }

    const orgId = orgs[0].id;
    _organizationId = orgId;

    const channels = await getChannels(orgId);
    _channelsCache = channels;

    return {
      connected: true,
      organizationId: orgId,
      organizationName: orgs[0].name,
      channels: channels.map(ch => ({
        id: ch.id,
        name: ch.name,
        service: ch.service,
      })),
    };
  } catch (err) {
    return { connected: false, error: err.message, channels: [] };
  }
}

/**
 * Сбросить кэш каналов (при смене настроек)
 */
function resetCache() {
  _channelsCache = null;
  _organizationId = null;
}

module.exports = {
  bufferGraphQL,
  getOrganizations,
  getOrganizationId,
  getChannels,
  getBufferChannelId,
  createBufferPost,
  getBufferStatus,
  resetCache,
};
