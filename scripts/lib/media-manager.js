const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { projectRoot } = require('./env');
const { uploadSingleFile } = require('./ftp-upload');
const { compressImage, isImageFile } = require('./image-compressor');

const UPLOADS_DIR = path.join(projectRoot, 'scripts', 'data', 'uploads');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/quicktime',
];

// Убедиться, что папка uploads существует
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Настроить multer middleware для загрузки файлов
 */
function configureMulter() {
  const multer = require('multer');

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || getExtByMime(file.mimetype);
      const name = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      cb(null, name);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Недопустимый тип файла: ${file.mimetype}. Разрешены: изображения и видео.`));
    }
  };

  return multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });
}

/**
 * Определить расширение по MIME-типу
 */
function getExtByMime(mime) {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
  };
  return map[mime] || '.bin';
}

/**
 * Определить тип медиа (image/video) по MIME
 */
function getMediaType(mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'unknown';
}

/**
 * Сформировать удалённый путь для медиафайла
 */
function getRemotePath(filename) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `media/uploads/${year}/${month}/${filename}`;
}

/**
 * Обработать загруженный файл: залить на FTP, удалить локальный
 */
async function processUpload(file) {
  const localPath = file.path;
  const remotePath = getRemotePath(file.filename);
  const mediaType = getMediaType(file.mimetype);

  try {
    // Сжатие изображений через Tinify перед загрузкой на FTP
    if (isImageFile(file.filename)) {
      await compressImage(localPath);
    }
    const url = await uploadSingleFile(localPath, remotePath);
    return { url, type: mediaType, filename: file.filename, remotePath };
  } finally {
    // Удалить временный файл
    try {
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    } catch (e) {
      console.error(`Не удалось удалить temp-файл: ${e.message}`);
    }
  }
}

/**
 * Скачать файл по URL и загрузить на FTP
 */
async function uploadFromUrl(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
  const contentType = response.headers['content-type'] || 'image/jpeg';
  const ext = getExtByMime(contentType);
  const filename = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const localPath = path.join(UPLOADS_DIR, filename);

  fs.writeFileSync(localPath, response.data);

  // Сжатие изображений через Tinify перед загрузкой на FTP
  if (isImageFile(filename)) {
    await compressImage(localPath);
  }

  const remotePath = getRemotePath(filename);
  const mediaType = getMediaType(contentType);

  try {
    const publicUrl = await uploadSingleFile(localPath, remotePath);
    return { url: publicUrl, type: mediaType, filename, remotePath };
  } finally {
    try {
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    } catch (e) {
      console.error(`Не удалось удалить temp-файл: ${e.message}`);
    }
  }
}

module.exports = {
  configureMulter,
  processUpload,
  uploadFromUrl,
  getMediaType,
  getRemotePath,
  UPLOADS_DIR,
};
