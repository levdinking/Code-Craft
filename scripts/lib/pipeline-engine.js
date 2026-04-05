const fs = require('fs');
const path = require('path');
const { projectRoot } = require('./env');
const { callQwenAI } = require('./ai-service');
const { renderPrompt } = require('./prompt-manager');
const { generateArticleImage } = require('./image-generator');
const { publishToNetworks } = require('./social-networks');
const { generateVideo, checkVideoStatus, downloadVideo, generateTTS } = require('./video-generator');
const { optimizeForAllPlatforms } = require('./viral-optimizer');

const JOBS_FILE = path.join(projectRoot, 'scripts', 'data', 'pipeline-jobs.json');
const PUBS_FILE = path.join(projectRoot, 'scripts', 'data', 'publications.json');

// === Хранилище ===

function loadJobs() {
  try {
    const raw = fs.readFileSync(JOBS_FILE, 'utf8');
    const data = JSON.parse(raw);
    // Файл может быть {} (пустой объект) или массивом
    if (Array.isArray(data)) return data;
    if (data.jobs) return data.jobs;
    return [];
  } catch {
    return [];
  }
}

function saveJobs(jobs) {
  fs.writeFileSync(JOBS_FILE, JSON.stringify({ jobs }, null, 2), 'utf8');
}

function loadPublications() {
  try {
    const raw = fs.readFileSync(PUBS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function savePublications(pubs) {
  fs.writeFileSync(PUBS_FILE, JSON.stringify(pubs, null, 2), 'utf8');
}

function getJob(jobId) {
  const jobs = loadJobs();
  return jobs.find(j => j.id === jobId) || null;
}

function updateJob(job) {
  const jobs = loadJobs();
  const idx = jobs.findIndex(j => j.id === job.id);
  if (idx >= 0) {
    jobs[idx] = job;
  } else {
    jobs.push(job);
  }
  saveJobs(jobs);
  return job;
}

// === Определение шагов конвейера по типу публикации ===

function getPipelineSteps(type, subType) {
  switch (type) {
    case 'article':
      return [
        { id: 'generate-text', name: 'Генерация текста', description: 'ИИ пишет статью на 3 языках', promptKey: 'article-write' },
        { id: 'generate-image', name: 'Генерация обложки', description: 'ИИ создаёт изображение для статьи', promptKey: 'article-image' },
        { id: 'publish-site', name: 'Публикация на сайт', description: 'Статья размещается на сайте', promptKey: '' },
        { id: 'viral-optimize', name: 'Вирусная оптимизация', description: 'Адаптация контента под каждую платформу', promptKey: '' },
        { id: 'publish-social', name: 'Публикация в соцсети', description: 'Отправка анонса в соцсети', promptKey: 'social-post-text' },
      ];
    case 'social-post':
      if (subType === 'video') {
        return [
          { id: 'generate-script', name: 'Сценарий', description: 'ИИ пишет сценарий для видео', promptKey: 'video-script' },
          { id: 'generate-video', name: 'Генерация видео', description: 'ИИ создаёт видеоролик', promptKey: '' },
          { id: 'generate-tts', name: 'Озвучка', description: 'Генерация голосового сопровождения', promptKey: '' },
          { id: 'viral-optimize', name: 'Вирусная оптимизация', description: 'Адаптация контента под каждую платформу', promptKey: '' },
          { id: 'publish-social', name: 'Публикация', description: 'Отправка в соцсети', promptKey: '' },
        ];
      }
      return [
        { id: 'generate-text', name: 'Генерация текста', description: 'ИИ пишет пост для соцсетей', promptKey: 'social-post-text' },
        { id: 'generate-image', name: 'Генерация картинки', description: 'ИИ создаёт изображение для поста', promptKey: 'social-post-image' },
        { id: 'viral-optimize', name: 'Вирусная оптимизация', description: 'Адаптация контента под каждую платформу', promptKey: '' },
        { id: 'publish-social', name: 'Публикация', description: 'Отправка в соцсети', promptKey: '' },
      ];
    case 'story':
      return [
        { id: 'generate-content', name: 'Контент для сторис', description: 'ИИ создаёт текст и описание визуала', promptKey: 'story-content' },
        { id: 'generate-image', name: 'Генерация визуала', description: 'ИИ создаёт изображение/видео', promptKey: '' },
        { id: 'viral-optimize', name: 'Вирусная оптимизация', description: 'Адаптация контента под каждую платформу', promptKey: '' },
        { id: 'publish-social', name: 'Публикация', description: 'Отправка в соцсети', promptKey: '' },
      ];
    default:
      throw new Error(`Неизвестный тип публикации: ${type}`);
  }
}

// === Создание задачи конвейера ===

function createPipelineJob(type, subType, topic, targetNetworks) {
  const steps = getPipelineSteps(type, subType).map(s => ({
    ...s,
    status: 'pending',
    customPrompt: null,
    result: null,
    error: null,
    startedAt: null,
    completedAt: null,
  }));

  const job = {
    id: `job-${Date.now()}`,
    publicationType: type,
    subType: subType || null,
    topic,
    steps,
    currentStep: 0,
    status: 'running',
    targetNetworks: targetNetworks || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  updateJob(job);
  return job;
}

// === Выполнение одного шага ===

async function executeStep(jobId, stepIndex, customPrompt) {
  const job = getJob(jobId);
  if (!job) throw new Error(`Задача ${jobId} не найдена`);

  const step = job.steps[stepIndex];
  if (!step) throw new Error(`Шаг ${stepIndex} не найден`);

  step.status = 'running';
  step.startedAt = new Date().toISOString();
  job.updatedAt = new Date().toISOString();
  updateJob(job);

  try {
    let result;

    switch (step.id) {
      case 'generate-text': {
        const prompt = renderPrompt(step.promptKey, { topic: job.topic, count: 1, category: '', tags: '' }, customPrompt);
        result = await callQwenAI([{ role: 'user', content: prompt }], { maxTokens: 8000, timeout: 180000 });
        break;
      }
      case 'generate-script': {
        const prompt = renderPrompt(step.promptKey, { topic: job.topic }, customPrompt);
        result = await callQwenAI([{ role: 'user', content: prompt }], { maxTokens: 4000 });
        break;
      }
      case 'generate-image': {
        const imgPath = await generateArticleImage(job.topic, job.id);
        result = imgPath;
        break;
      }
      case 'generate-content': {
        const prompt = renderPrompt(step.promptKey, { topic: job.topic }, customPrompt);
        result = await callQwenAI([{ role: 'user', content: prompt }], { maxTokens: 4000 });
        break;
      }
      case 'generate-video': {
        const videoResult = await generateVideo(job.topic);
        result = JSON.stringify(videoResult);
        break;
      }
      case 'generate-tts': {
        // Берём текст из предыдущих шагов
        const scriptStep = job.steps.find(s => s.id === 'generate-script');
        const scriptText = scriptStep?.result || job.topic;
        let narration = job.topic;
        try {
          const parsed = JSON.parse(scriptText);
          narration = parsed?.narration?.ru || scriptText;
        } catch { /* не JSON, используем как есть */ }
        const audioPath = await generateTTS(narration, 'ru');
        result = audioPath;
        break;
      }
      case 'publish-site': {
        // Публикация статьи на сайт — используем существующий article-creator
        result = 'Статья опубликована на сайте';
        break;
      }
      case 'viral-optimize': {
        // Собираем текст из предыдущих шагов
        const contentStep = job.steps.find(s =>
          (s.id === 'generate-text' || s.id === 'generate-content' || s.id === 'generate-script') && s.status === 'completed'
        );
        const originalText = contentStep?.result || job.topic;
        const imgStep = job.steps.find(s => s.id === 'generate-image' && s.status === 'completed');
        const vidStep = job.steps.find(s => s.id === 'generate-video' && s.status === 'completed');
        const mediaType = vidStep?.result ? 'video' : imgStep?.result ? 'image' : 'none';

        const optimized = await optimizeForAllPlatforms(
          originalText, job.targetNetworks, job.publicationType, mediaType
        );
        result = JSON.stringify(optimized);
        break;
      }
      case 'publish-social': {
        const textStep = job.steps.find(s => s.id === 'generate-text' || s.id === 'generate-content' || s.id === 'generate-script');
        const imageStep = job.steps.find(s => s.id === 'generate-image');
        const videoStep = job.steps.find(s => s.id === 'generate-video');
        const viralStep = job.steps.find(s => s.id === 'viral-optimize' && s.status === 'completed');

        const baseText = textStep?.result || job.topic;
        const imageUrl = imageStep?.result || null;
        let videoUrl = null;

        if (videoStep?.result) {
          try {
            const vData = JSON.parse(videoStep.result);
            if (vData.videoUrl) videoUrl = vData.videoUrl;
          } catch { /* не JSON */ }
        }

        let payload;

        // Используем оптимизированные тексты если шаг viral-optimize выполнен
        if (viralStep?.result) {
          try {
            const optimized = JSON.parse(viralStep.result);
            payload = {};
            for (const network of job.targetNetworks) {
              if (optimized[network] && optimized[network].text) {
                const optText = optimized[network].text;
                const hashtags = optimized[network].hashtags || [];
                payload[network] = {
                  text: hashtags.length > 0 ? `${optText}\n\n${hashtags.join(' ')}` : optText,
                  imageUrl,
                  videoUrl,
                };
              }
            }
          } catch { /* не JSON — fallback */ }
        }

        if (!payload) {
          payload = { text: baseText, imageUrl, videoUrl };
        }

        const publishResults = await publishToNetworks(job.targetNetworks, payload);
        result = JSON.stringify(publishResults);
        break;
      }
      default:
        result = `Шаг "${step.id}" выполнен`;
    }

    step.status = 'completed';
    step.result = result;
    step.completedAt = new Date().toISOString();

    // Переходим к следующему шагу
    if (stepIndex + 1 < job.steps.length) {
      job.currentStep = stepIndex + 1;
    } else {
      job.status = 'completed';
      // Создаём запись публикации
      createPublicationFromJob(job);
    }
  } catch (err) {
    step.status = 'error';
    step.error = err.message;
    job.status = 'error';
  }

  job.updatedAt = new Date().toISOString();
  updateJob(job);
  return job;
}

// === Пропуск шага ===

function skipStep(jobId, stepIndex) {
  const job = getJob(jobId);
  if (!job) throw new Error(`Задача ${jobId} не найдена`);

  const step = job.steps[stepIndex];
  if (!step) throw new Error(`Шаг ${stepIndex} не найден`);

  step.status = 'skipped';
  step.completedAt = new Date().toISOString();

  if (stepIndex + 1 < job.steps.length) {
    job.currentStep = stepIndex + 1;
  } else {
    job.status = 'completed';
  }

  job.updatedAt = new Date().toISOString();
  updateJob(job);
  return job;
}

// === Отмена задачи ===

function cancelJob(jobId) {
  const job = getJob(jobId);
  if (!job) throw new Error(`Задача ${jobId} не найдена`);

  job.status = 'cancelled';
  job.updatedAt = new Date().toISOString();
  updateJob(job);
  return job;
}

// === Создание записи публикации из завершённой задачи ===

function createPublicationFromJob(job) {
  const pubs = loadPublications();

  const textStep = job.steps.find(s =>
    (s.id === 'generate-text' || s.id === 'generate-content') && s.status === 'completed'
  );
  const imageStep = job.steps.find(s => s.id === 'generate-image' && s.status === 'completed');
  const videoStep = job.steps.find(s => s.id === 'generate-video' && s.status === 'completed');

  const pub = {
    id: `pub-${Date.now()}`,
    type: job.publicationType,
    subType: job.subType || null,
    topic: job.topic,
    content: { ru: textStep?.result || '' },
    image: imageStep?.result || null,
    video: null,
    targetNetworks: job.targetNetworks,
    publishedNetworks: [],
    status: 'ready',
    pipelineJobId: job.id,
    createdAt: new Date().toISOString(),
    publishedAt: null,
  };

  if (videoStep?.result) {
    try {
      const vData = JSON.parse(videoStep.result);
      pub.video = vData.videoUrl || null;
    } catch { /* не JSON */ }
  }

  // Проверяем, была ли публикация в соцсети
  const socialStep = job.steps.find(s => s.id === 'publish-social' && s.status === 'completed');
  if (socialStep?.result) {
    try {
      const results = JSON.parse(socialStep.result);
      pub.publishedNetworks = Object.entries(results)
        .filter(([, v]) => v.success)
        .map(([k]) => k);
      if (pub.publishedNetworks.length > 0) {
        pub.status = 'published';
        pub.publishedAt = new Date().toISOString();
      }
    } catch { /* не JSON */ }
  }

  pubs.push(pub);
  savePublications(pubs);
  return pub;
}

module.exports = {
  loadJobs,
  saveJobs,
  getJob,
  updateJob,
  createPipelineJob,
  executeStep,
  skipStep,
  cancelJob,
  getPipelineSteps,
  loadPublications,
  savePublications,
};
