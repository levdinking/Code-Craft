import type { BlogPost } from '@/types/blog';

export interface LoadedBlogPost extends BlogPost {
  availableLanguages: string[];
  currentLang: string;
}

export async function loadBlogPost(id: string, lang: string): Promise<LoadedBlogPost | null> {
  try {
    // Динамический импорт JSON файла статьи
    const module = await import(`@/content/blog/${id}/${lang}.json`);
    const post = module.default;
    
    // Загружаем индекс для определения доступных языков
    const { blogIndex } = await import('./blog-index');
    const entry = blogIndex[id];
    
    if (!entry) return null;
    
    const availableLanguages = Object.keys(entry.translations);
    
    return {
      ...post,
      availableLanguages,
      currentLang: lang
    } as LoadedBlogPost;
  } catch (error) {
    console.error(`Failed to load blog post ${id} in ${lang}:`, error);
    return null;
  }
}

export async function loadBlogPostBySlug(slug: string, lang: string): Promise<LoadedBlogPost | null> {
  const { getPostIdBySlug } = await import('./blog-index');
  const id = getPostIdBySlug(slug);
  if (!id) return null;
  return loadBlogPost(id, lang);
}

// Загрузка списка статей для языка (только из индекса, без полного контента)
export async function getBlogList(lang: string) {
  const { blogIndex } = await import('./blog-index');
  
  return Object.values(blogIndex).map(entry => ({
    id: entry.id,
    ...entry.translations[lang],
    category: entry.category,
    tags: entry.tags,
    date: entry.date,
    image: entry.image  // ← ДОБАВЛЕНО
  })).filter(post => post.slug); // Только если есть перевод на этот язык
}