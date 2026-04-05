const { callQwenAI } = require('./ai-service');
const { renderPrompt } = require('./prompt-manager');

/**
 * Правила оптимизации для каждой платформы
 */
const PLATFORM_RULES = {
  telegram: {
    maxChars: 4096,
    hashtagCount: '3-5',
    format: 'HTML',
    style: 'Эмодзи для визуального разделения, краткий и информативный стиль, призыв к действию',
  },
  vk: {
    maxChars: 16384,
    hashtagCount: '5-10',
    format: 'plain text',
    style: 'Неформальный тон, вопрос в конце для вовлечения, ссылка на источник',
  },
  facebook: {
    maxChars: 63206,
    hashtagCount: '3-5',
    format: 'plain text',
    style: 'Профессиональный но дружелюбный тон, вопрос для обсуждения, призыв делиться',
  },
  instagram: {
    maxChars: 2200,
    hashtagCount: '20-30',
    format: 'plain text',
    style: 'Короткий цепляющий текст, эмодзи, хештеги отдельным блоком в конце, призыв подписаться',
  },
  youtube: {
    maxTitleChars: 100,
    maxDescChars: 5000,
    tagCount: '10-15',
    format: 'plain text',
    style: 'Кликбейтный но честный заголовок, описание с timestamps и ссылками, релевантные теги',
  },
};

/**
 * Получить правила оптимизации для платформы
 */
function getOptimizationRules(platform) {
  return PLATFORM_RULES[platform] || null;
}

/**
 * Оптимизировать контент для одной платформы через ИИ
 */
async function optimizeForPlatform(originalText, platform, contentType = 'social-post', mediaType = 'none') {
  const rules = getOptimizationRules(platform);
  if (!rules) throw new Error(`Неизвестная платформа: ${platform}`);

  const templateKey = `viral-${platform}`;

  let prompt;
  try {
    prompt = renderPrompt(templateKey, {
      text: originalText,
      contentType,
      mediaType,
    });
  } catch {
    // Фоллбек, если шаблон не найден
    prompt = buildFallbackPrompt(originalText, platform, contentType, mediaType, rules);
  }

  const result = await callQwenAI(
    [{ role: 'user', content: prompt }],
    { maxTokens: 2000, timeout: 60000 }
  );

  // Парсинг JSON из ответа
  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // Если JSON невалидный — вернуть текст как есть
    }
  }

  return { text: result, hashtags: [], callToAction: '' };
}

/**
 * Создать промпт-фоллбек, если шаблон не найден
 */
function buildFallbackPrompt(text, platform, contentType, mediaType, rules) {
  if (platform === 'youtube') {
    return `Создай оптимизированные метаданные для YouTube видео на основе текста: "${text}".
Тип контента: ${contentType}. Медиа: ${mediaType}.
Требования: заголовок до ${rules.maxTitleChars} символов (цепляющий), описание до ${rules.maxDescChars} символов с timestamps и ссылками, ${rules.tagCount} тегов.
Верни ТОЛЬКО JSON: {"title": "...", "description": "...", "tags": [...], "callToAction": "..."}`;
  }

  return `Оптимизируй этот текст для ${platform}: "${text}".
Тип контента: ${contentType}. Медиа: ${mediaType}.
Формат: ${rules.format}. Максимум символов: ${rules.maxChars}. Хештеги: ${rules.hashtagCount}.
Стиль: ${rules.style}.
Верни ТОЛЬКО JSON: {"text": "оптимизированный текст", "hashtags": ["#тег1", "#тег2"], "callToAction": "призыв к действию"}`;
}

/**
 * Оптимизировать контент для всех указанных платформ параллельно
 */
async function optimizeForAllPlatforms(originalText, platforms, contentType = 'social-post', mediaType = 'none') {
  const results = {};

  const promises = platforms.map(async (platform) => {
    try {
      results[platform] = await optimizeForPlatform(originalText, platform, contentType, mediaType);
    } catch (err) {
      results[platform] = {
        text: originalText,
        hashtags: [],
        callToAction: '',
        error: err.message,
      };
    }
  });

  await Promise.all(promises);
  return results;
}

module.exports = {
  optimizeForPlatform,
  optimizeForAllPlatforms,
  getOptimizationRules,
  PLATFORM_RULES,
};
