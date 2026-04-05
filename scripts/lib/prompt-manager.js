const fs = require('fs');
const path = require('path');
const { projectRoot } = require('./env');

const TEMPLATES_FILE = path.join(projectRoot, 'scripts', 'data', 'prompt-templates.json');

function loadTemplates() {
  try {
    const raw = fs.readFileSync(TEMPLATES_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveTemplates(templates) {
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf8');
}

function getTemplate(key) {
  const templates = loadTemplates();
  return templates[key] || null;
}

function updateTemplate(key, template) {
  const templates = loadTemplates();
  templates[key] = template;
  saveTemplates(templates);
  return templates;
}

// Подставляет переменные вида {{variable}} в шаблон
function renderPrompt(templateKey, variables = {}, customPrompt = null) {
  const template = customPrompt || getTemplate(templateKey);
  if (!template) throw new Error(`Шаблон промпта "${templateKey}" не найден`);

  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  }
  return result;
}

module.exports = { loadTemplates, saveTemplates, getTemplate, updateTemplate, renderPrompt };
