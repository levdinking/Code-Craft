const fs = require('fs');
const path = require('path');
const { projectRoot } = require('./env');

function updateBlogIndex(root, id, category, tags, date, image, translations) {
  const pr = root || projectRoot;
  const indexPath = path.join(pr, 'src', 'data', 'blog-index.ts');

  if (!fs.existsSync(indexPath)) {
    console.warn('blog-index.ts not found');
    return false;
  }

  let content = fs.readFileSync(indexPath, 'utf8');

  if (content.includes(`'${id}':`)) {
    console.log(`Entry "${id}" already exists in blog-index.ts`);
    return false;
  }

  const lastEntryPattern = /('[\w-]+':\s*\{[\s\S]*?\n\s*\})(\s*,?\s*)(\n\s*\};)/;
  const match = content.match(lastEntryPattern);

  if (!match) {
    console.error('Could not find insertion point in blog-index.ts');
    return false;
  }

  const lastEntryEnd = match.index + match[1].length;
  const hasComma = match[2].includes(',');
  const commaInsert = hasComma ? '' : ',';

  const truncate = (str, len) => str && str.length > len ? str.substring(0, len) + '...' : str;

  const newEntry = `${commaInsert}

  // AUTO-ADDED: ${id}
  '${id}': {
    id: '${id}',
    category: '${category}',
    tags: [${tags.map(t => `'${t}'`).join(', ')}],
    date: '${date}',
    image: '${image}',
    translations: {
      ru: { 
        slug: '${translations.ru.slug}',
        title: '${translations.ru.title}',
        excerpt: '${truncate(translations.ru.excerpt, 100)}'
      },
      de: { 
        slug: '${translations.de.slug}',
        title: '${translations.de.title}',
        excerpt: '${truncate(translations.de.excerpt, 100)}'
      },
      en: { 
        slug: '${translations.en.slug}',
        title: '${translations.en.title}',
        excerpt: '${truncate(translations.en.excerpt, 100)}'
      }
    }
  }`;

  content = content.slice(0, lastEntryEnd) + newEntry + content.slice(lastEntryEnd);
  fs.writeFileSync(indexPath, content);
  console.log('blog-index.ts updated');
  return true;
}

module.exports = { updateBlogIndex };
