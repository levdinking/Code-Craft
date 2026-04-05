const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { getEnv, projectRoot } = require('./env');
const { uploadSingleFile } = require('./ftp-upload');

const OUTPUT_DIR = path.join(projectRoot, 'public', 'media', 'videos');

// Qwen DashScope видеогенерация
async function generateVideo(prompt, options = {}) {
  const apiKey = getEnv('QWEN_API_KEY', '');
  if (!apiKey || apiKey === 'YOUR_QWEN_API_KEY') {
    throw new Error('QWEN_API_KEY не настроен');
  }

  // Создаём задачу на генерацию видео
  const taskResponse = await axios.post(
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/generation',
    {
      model: options.model || 'wanx-v1',
      input: { prompt },
      parameters: {
        duration: options.duration || 5,
        resolution: options.resolution || '720p',
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      timeout: 30000,
    }
  );

  const taskId = taskResponse.data?.output?.task_id;
  if (!taskId) throw new Error('Не удалось создать задачу видеогенерации');

  return { taskId, status: 'processing' };
}

// Проверка статуса задачи
async function checkVideoStatus(taskId) {
  const apiKey = getEnv('QWEN_API_KEY', '');

  const response = await axios.get(
    `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
    {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      timeout: 15000,
    }
  );

  const output = response.data?.output;
  if (!output) throw new Error('Пустой ответ от DashScope');

  return {
    taskId,
    status: output.task_status, // PENDING, RUNNING, SUCCEEDED, FAILED
    videoUrl: output.video_url || null,
    error: output.message || null,
  };
}

// Скачивание готового видео → FTP → публичный URL
async function downloadVideo(videoUrl, filename) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputPath = path.join(OUTPUT_DIR, filename);
  const response = await axios.get(videoUrl, {
    responseType: 'arraybuffer',
    timeout: 120000,
  });

  fs.writeFileSync(outputPath, Buffer.from(response.data));
  console.log(`[VideoGen] Видео скачано: ${outputPath}`);

  // Загрузка на FTP
  try {
    const remotePath = `media/videos/${filename}`;
    const publicUrl = await uploadSingleFile(outputPath, remotePath);
    console.log(`[VideoGen] Загружено на FTP: ${publicUrl}`);
    try { fs.unlinkSync(outputPath); } catch {}
    return publicUrl;
  } catch (ftpErr) {
    console.error(`[VideoGen] Ошибка FTP, используем локальный путь: ${ftpErr.message}`);
    return `/media/videos/${filename}`;
  }
}

// Генерация озвучки через Qwen TTS → FTP → публичный URL
async function generateTTS(text, lang = 'ru', options = {}) {
  const apiKey = getEnv('QWEN_API_KEY', '');
  if (!apiKey || apiKey === 'YOUR_QWEN_API_KEY') {
    throw new Error('QWEN_API_KEY не настроен');
  }

  // Выбор голоса по языку
  const voices = {
    ru: 'sambert-zhiyan-v1',
    en: 'sambert-zhimiao-emo-v1',
    de: 'sambert-zhide-v1',
  };

  const response = await axios.post(
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2audio/generation',
    {
      model: voices[lang] || voices.ru,
      input: { text },
      parameters: {
        format: 'mp3',
        sample_rate: 48000,
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
      responseType: 'arraybuffer',
    }
  );

  // Сохраняем аудио во временный файл
  const audioDir = path.join(projectRoot, 'public', 'media', 'audio');
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

  const filename = `tts-${Date.now()}-${lang}.mp3`;
  const outputPath = path.join(audioDir, filename);
  fs.writeFileSync(outputPath, Buffer.from(response.data));
  console.log(`[TTS] Аудио сохранено: ${outputPath}`);

  // Загрузка на FTP
  try {
    const remotePath = `media/audio/${filename}`;
    const publicUrl = await uploadSingleFile(outputPath, remotePath);
    console.log(`[TTS] Загружено на FTP: ${publicUrl}`);
    try { fs.unlinkSync(outputPath); } catch {}
    return publicUrl;
  } catch (ftpErr) {
    console.error(`[TTS] Ошибка FTP, используем локальный путь: ${ftpErr.message}`);
    return `/media/audio/${filename}`;
  }
}

module.exports = {
  generateVideo,
  checkVideoStatus,
  downloadVideo,
  generateTTS,
};
