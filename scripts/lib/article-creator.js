const fs = require('fs');
const path = require('path');
const { projectRoot } = require('./env');

function createArticleFiles(articleData, root) {
  const pr = root || projectRoot;
  const { id, category, tags, date, image, related, translations } = articleData;
  const articleDir = path.join(pr, 'src', 'content', 'blog', id);

  if (!fs.existsSync(articleDir)) {
    fs.mkdirSync(articleDir, { recursive: true });
    console.log(`Directory created: ${articleDir}`);
  }

  ['ru', 'en', 'de'].forEach(lang => {
    if (!translations[lang]) {
      console.warn(`Missing translation: ${lang}`);
      return;
    }

    const data = {
      id,
      slug: translations[lang].slug,
      lang,
      title: translations[lang].title,
      excerpt: translations[lang].excerpt,
      content: translations[lang].content,
      meta: {
        title: translations[lang].title + (lang === 'ru' ? ' | Полное руководство' : lang === 'de' ? ' | Vollständige Anleitung' : ' | Complete Guide'),
        description: translations[lang].excerpt,
        keywords: tags,
        ogImage: image,
        ogType: 'article',
        twitterCard: 'summary_large_image',
        canonical: `https://my.delimes.ru/${lang}/blog/${translations[lang].slug}`,
        articlePublishedTime: `${date}T10:00:00+03:00`,
        articleModifiedTime: `${date}T10:00:00+03:00`,
        articleSection: lang === 'ru' ? 'Веб-разработка' : lang === 'de' ? 'Webentwicklung' : 'Web Development',
        articleTags: tags.slice(0, 4),
        authorName: 'Pavel Levdin',
        authorUrl: `https://my.delimes.ru/${lang}/about`,
        breadcrumb: [
          { name: lang === 'ru' ? 'Блог' : 'Blog', url: `https://my.delimes.ru/${lang}/blog` },
          { name: lang === 'ru' ? 'Веб-разработка' : lang === 'de' ? 'Webentwicklung' : 'Web Development', url: `https://my.delimes.ru/${lang}/blog/category/${category}` }
        ]
      },
      author: {
        name: 'Pavel Levdin',
        role: lang === 'ru' ? 'Full-Stack разработчик' : lang === 'de' ? 'Full-Stack Entwickler' : 'Full-Stack Developer',
        bio: lang === 'ru' ? '10+ лет опыта в веб-разработке, специализация на React и Next.js' : lang === 'de' ? '10+ Jahre Erfahrung in Webentwicklung, Spezialisierung auf React und Next.js' : '10+ years of web development experience, specializing in React and Next.js',
        avatar: '/images/avatar.jpg'
      },
      date,
      updatedAt: date,
      readTime: lang === 'ru' ? '15 мин' : lang === 'de' ? '15 Min' : '15 min',
      category,
      tags,
      related: related || [],
      featured: false,
      views: 0,
      published: lang === 'ru'
    };

    fs.writeFileSync(path.join(articleDir, `${lang}.json`), JSON.stringify(data, null, 2));
    console.log(`${lang}.json created${lang === 'ru' ? ' (published: true)' : ' (published: false)'}`);
  });

  return articleDir;
}

module.exports = { createArticleFiles };
