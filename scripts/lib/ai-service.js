const axios = require('axios');
const { getEnv } = require('./env');

async function callQwenAI(messages, options = {}) {
  const apiKey = getEnv('QWEN_API_KEY', '');
  const apiUrl = getEnv('QWEN_API_URL', 'https://dashscope.aliyuncs.com/compatible-mode/v1');

  if (!apiKey || apiKey === 'YOUR_QWEN_API_KEY') {
    throw new Error('QWEN_API_KEY not configured. Please set it in .env');
  }

  const response = await axios.post(`${apiUrl}/chat/completions`, {
    model: options.model || 'qwen-plus',
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 4096,
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: options.timeout || 120000,
  });

  return response.data.choices[0].message.content;
}

async function generateTopics(existingArticles, existingTopics, count = 5) {
  const articleList = existingArticles.map(a => `- ${a.title} (${a.category})`).join('\n');
  const topicList = existingTopics.map(t => `- ${t.topic}`).join('\n');

  const prompt = `You are a content strategist for a web developer's portfolio blog (pavellevdin.dev).
The blog covers: web development, React, Next.js, TypeScript, CSS, performance, SEO, DevOps.

Existing articles:
${articleList || 'No articles yet'}

Already planned topics:
${topicList || 'None'}

Generate ${count} NEW unique blog post topics that:
1. Are relevant to modern web development in 2026
2. Don't duplicate existing articles or planned topics
3. Would attract organic search traffic
4. Are practical and actionable

Return ONLY a JSON array of objects with this structure:
[{"topic": "Article Title", "category": "webdev|frontend|seo|performance|devops", "suggestedTags": ["tag1", "tag2", "tag3"]}]`;

  const result = await callQwenAI([{ role: 'user', content: prompt }]);

  // Parse JSON from response
  const jsonMatch = result.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
}

async function writeArticle(topic, category, tags, existingArticles) {
  const prompt = `You are a senior web developer writing a technical blog post for pavellevdin.dev.
Write a comprehensive article about: "${topic}"
Category: ${category}
Tags: ${tags.join(', ')}

Write the article in 3 languages: Russian (ru), English (en), German (de).

Requirements:
- Professional, practical, actionable content
- Include code examples where relevant
- Use HTML formatting for content (h2, h3, p, pre, code, ul, li, strong, em)
- Each language version should be 1500-2500 words
- Generate a URL-friendly slug for each language

Return ONLY a JSON object:
{
  "id": "kebab-case-article-id",
  "category": "${category}",
  "tags": ${JSON.stringify(tags)},
  "date": "${new Date().toISOString().split('T')[0]}",
  "image": "/blog-images/og-ARTICLE_ID.jpg",
  "related": [],
  "translations": {
    "ru": {"slug": "...", "title": "...", "excerpt": "short description", "content": "full HTML content"},
    "en": {"slug": "...", "title": "...", "excerpt": "...", "content": "..."},
    "de": {"slug": "...", "title": "...", "excerpt": "...", "content": "..."}
  }
}`;

  const result = await callQwenAI(
    [{ role: 'user', content: prompt }],
    { maxTokens: 16000, timeout: 180000 }
  );

  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
}

// Генерация текста для соцсетей
async function generateSocialPost(topic, customPrompt = null) {
  const { renderPrompt } = require('./prompt-manager');
  const prompt = customPrompt || renderPrompt('social-post-text', { topic });

  const result = await callQwenAI(
    [{ role: 'user', content: prompt }],
    { maxTokens: 2000 }
  );

  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (jsonMatch) return JSON.parse(jsonMatch[0]);
  return { ru: result };
}

// Генерация сценария видео
async function generateVideoScript(topic, customPrompt = null) {
  const { renderPrompt } = require('./prompt-manager');
  const prompt = customPrompt || renderPrompt('video-script', { topic });

  const result = await callQwenAI(
    [{ role: 'user', content: prompt }],
    { maxTokens: 4000, timeout: 120000 }
  );

  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (jsonMatch) return JSON.parse(jsonMatch[0]);
  return { scenes: [], narration: { ru: result } };
}

// Генерация контента для сторис
async function generateStoryContent(topic, customPrompt = null) {
  const { renderPrompt } = require('./prompt-manager');
  const prompt = customPrompt || renderPrompt('story-content', { topic });

  const result = await callQwenAI(
    [{ role: 'user', content: prompt }],
    { maxTokens: 2000 }
  );

  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (jsonMatch) return JSON.parse(jsonMatch[0]);
  return { text: { ru: result }, visual_prompt: topic };
}

module.exports = {
  generateTopics,
  writeArticle,
  callQwenAI,
  generateSocialPost,
  generateVideoScript,
  generateStoryContent,
};
