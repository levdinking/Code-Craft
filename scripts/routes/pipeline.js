const express = require('express');
const router = express.Router();
const {
  createPipelineJob,
  getJob,
  loadJobs,
  executeStep,
  skipStep,
  cancelJob,
  getPipelineSteps,
} = require('../lib/pipeline-engine');

// Получить все задачи конвейера
router.get('/jobs', (req, res) => {
  try {
    const jobs = loadJobs();
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить конкретную задачу
router.get('/jobs/:id', (req, res) => {
  try {
    const job = getJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Задача не найдена' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать новую задачу конвейера
router.post('/start', (req, res) => {
  try {
    const { type, subType, topic, targetNetworks } = req.body;
    if (!type || !topic) {
      return res.status(400).json({ error: 'Требуются поля type и topic' });
    }
    const job = createPipelineJob(type, subType || null, topic, targetNetworks || []);
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Выполнить текущий шаг
router.post('/jobs/:id/execute', async (req, res) => {
  try {
    const { customPrompt } = req.body;
    const job = getJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Задача не найдена' });
    if (job.status !== 'running' && job.status !== 'error') {
      return res.status(400).json({ error: `Задача в статусе "${job.status}", выполнение невозможно` });
    }

    const updatedJob = await executeStep(req.params.id, job.currentStep, customPrompt || null);
    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Пропустить текущий шаг
router.post('/jobs/:id/skip', (req, res) => {
  try {
    const job = getJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Задача не найдена' });

    const updatedJob = skipStep(req.params.id, job.currentStep);
    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Отменить задачу
router.post('/jobs/:id/cancel', (req, res) => {
  try {
    const updatedJob = cancelJob(req.params.id);
    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить шаги для типа публикации (для предпросмотра)
router.get('/steps/:type', (req, res) => {
  try {
    const { type } = req.params;
    const { subType } = req.query;
    const steps = getPipelineSteps(type, subType || null);
    res.json({ steps });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
