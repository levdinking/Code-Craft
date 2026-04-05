const fs = require('fs');
const path = require('path');
const tinify = require('tinify');
const { getEnv } = require('./env');

// Поддерживаемые расширения для сжатия
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Проверить, является ли файл изображением (по расширению)
 */
function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Сжать изображение через Tinify API
 * Graceful degradation: при отсутствии ключа или ошибке — возвращает оригинал
 * @param {string} localFilePath — абсолютный путь к файлу
 * @returns {Promise<string>} — путь к сжатому файлу (тот же путь, файл перезаписан)
 */
async function compressImage(localFilePath) {
  const apiKey = getEnv('TINIFY_API_KEY', '');
  if (!apiKey) {
    console.log('[Tinify] API ключ не настроен, пропускаем сжатие');
    return localFilePath;
  }

  if (!fs.existsSync(localFilePath)) {
    console.error(`[Tinify] Файл не найден: ${localFilePath}`);
    return localFilePath;
  }

  if (!isImageFile(localFilePath)) {
    console.log(`[Tinify] Файл не является изображением: ${path.basename(localFilePath)}`);
    return localFilePath;
  }

  try {
    const originalSize = fs.statSync(localFilePath).size;
    tinify.key = apiKey;

    // Сжимаем и перезаписываем файл
    await tinify.fromFile(localFilePath).toFile(localFilePath);

    const compressedSize = fs.statSync(localFilePath).size;
    const saved = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    console.log(`[Tinify] Сжато: ${path.basename(localFilePath)} — ${formatSize(originalSize)} → ${formatSize(compressedSize)} (−${saved}%)`);

    // Логируем оставшееся кол-во сжатий в этом месяце
    if (tinify.compressionCount !== null) {
      console.log(`[Tinify] Использовано сжатий: ${tinify.compressionCount}/500`);
    }

    return localFilePath;
  } catch (err) {
    // Ошибка 429 — лимит исчерпан
    if (err.status === 429) {
      console.error('[Tinify] Лимит сжатий исчерпан (500/месяц). Пропускаем сжатие.');
    } else {
      console.error(`[Tinify] Ошибка сжатия: ${err.message}`);
    }
    return localFilePath;
  }
}

/**
 * Форматирование размера файла
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

module.exports = {
  compressImage,
  isImageFile,
};
