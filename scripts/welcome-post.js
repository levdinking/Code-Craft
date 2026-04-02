const fs = require('fs');
const path = require('path');
const https = require('https');

const scriptDir = __dirname;
const projectRoot = path.join(scriptDir, '..');

// Читаем .env файл
const envPath = path.join(projectRoot, '.env');
let env = {};

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  env = Object.fromEntries(
    envContent
      .split('\n')
      .filter(line => line.includes('=') && !line.startsWith('#'))
      .map(line => {
        const [key, ...valueParts] = line.split('=');
        return [key.trim(), valueParts.join('=').trim()];
      })
  );
} catch (err) {
  console.error('❌ Не найден файл .env');
  process.exit(1);
}

const TOKEN = env.TELEGRAM_TOKEN;
const CHAT_ID = env.TELEGRAM_CHAT_ID;

if (!TOKEN || !CHAT_ID) {
  console.error('❌ Не заданы TELEGRAM_TOKEN или TELEGRAM_CHAT_ID в .env');
  process.exit(1);
}

// ✅ ПРОВЕРЬ: текст должен быть здесь
const text = `👋 <b>Добро пожаловать в Code &amp; Craft!</b>

<b>Pavel Levdin</b>
Full-Stack Разработчик

Создаю современные сайты, веб-приложения и решения для автоматизации. Помогаю бизнесу расти через качественные цифровые продукты.

<b>📊 Цифры говорят сами за себя:</b>
• 10+ лет опыта в разработке
• 50+ успешных проектов
• 101% довольных клиентов

<b>🚀 Что я делаю:</b>

<b>💻 Разработка сайтов</b>
Современные, адаптивные сайты с чистым кодом

<b>⚡ Веб-приложения</b>
Сложные приложения с богатым функционалом

<b>📈 SEO и оптимизация</b>
Оптимизация для поисковых систем

<b>🤖 Автоматизация процессов</b>
Автоматизация бизнес-процессов

<b>🎯 MVP и стартапы</b>
Быстрая разработка продуктов

<b>🔧 Поддержка и сопровождение</b>
Постоянная поддержка проектов

<b>🔗 Ссылки:</b>
🌐 <a href="https://my.delimes.ru">Сайт</a>
💼 <a href="https://my.delimes.ru/portfolio">Портфолио</a>
📧 <a href="https://my.delimes.ru/contact">Связаться</a>

<b>📬 Подписывайтесь!</b>
Статьи о веб-разработке, проекты и советы.

#вебразработка #fullstack #созданиесайтов #react #nextjs`;

// Проверка что текст не пустой
if (!text || text.trim().length === 0) {
  console.error('❌ Текст сообщения пуст!');
  process.exit(1);
}

console.log('📨 Отправка приветственного поста...');
console.log(`📊 Длина текста: ${text.length} символов`);

// HTTP запрос
const data = JSON.stringify({
  chat_id: CHAT_ID,
  text: text,
  parse_mode: 'HTML',
  disable_web_page_preview: false
});

const options = {
  hostname: 'api.telegram.org',
  port: 443,
  path: `/bot${TOKEN}/sendMessage`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(responseData);
      if (result.ok) {
        console.log('✅ Пост успешно опубликован!');
      } else {
        console.error('❌ Ошибка Telegram:', result.description);
      }
    } catch (e) {
      console.error('❌ Ошибка парсинга ответа:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Ошибка сети:', error.message);
});

req.write(data);
req.end();