const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { getEnv, projectRoot } = require('./env');
const { compressImage } = require('./image-compressor');
const { uploadSingleFile } = require('./ftp-upload');

async function generateArticleImage(title, articleId, root) {
  const pr = root || projectRoot;
  const apiKey = getEnv('QWEN_API_KEY', '');
  const apiUrl = getEnv('QWEN_API_URL', 'https://dashscope.aliyuncs.com/compatible-mode/v1');
  const localFallback = `/blog-images/og-${articleId}.jpg`;

  if (!apiKey || apiKey === 'YOUR_QWEN_API_KEY') {
    console.log('QWEN_API_KEY not configured, skipping image generation');
    return localFallback;
  }

  try {
    // Генерация через Qwen API
    const response = await axios.post(`${apiUrl}/images/generations`, {
      model: 'wanx-v1',
      input: {
        prompt: `Professional tech blog header image for article: "${title}". Modern, clean, minimalist design with subtle tech elements. Dark blue and teal color scheme. No text on image.`,
      },
      parameters: {
        size: '1024*576',
        n: 1,
      }
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });

    const imageUrl = response.data?.output?.results?.[0]?.url;
    if (!imageUrl) {
      console.log('No image URL in AI response, using placeholder');
      return localFallback;
    }

    // Скачиваем изображение во временный файл
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
    const outputDir = path.join(pr, 'public', 'blog-images');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `og-${articleId}.jpg`);
    fs.writeFileSync(outputPath, Buffer.from(imageResponse.data));
    console.log(`[ImageGen] Изображение скачано: ${outputPath}`);

    // Сжатие через Tinify
    await compressImage(outputPath);

    // Загрузка на FTP и получение публичного URL
    try {
      const remotePath = `blog-images/og-${articleId}.jpg`;
      const publicUrl = await uploadSingleFile(outputPath, remotePath);
      console.log(`[ImageGen] Загружено на FTP: ${publicUrl}`);

      // Удаляем локальный файл — он уже на FTP
      try { fs.unlinkSync(outputPath); } catch {}

      return publicUrl;
    } catch (ftpErr) {
      console.error(`[ImageGen] Ошибка FTP, используем локальный путь: ${ftpErr.message}`);
      return localFallback;
    }
  } catch (err) {
    console.error(`Image generation error: ${err.message}`);
    return localFallback;
  }
}

module.exports = { generateArticleImage };
