import { useMemo, useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { blogIndex } from '@/data/blog-index';
import type { BlogCategory, BlogTag } from '@/types/blog';

export interface BlogPostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  featured: boolean;
  views: number;
  lang: string;
}

export interface UseBlogReturn {
  posts: BlogPostListItem[];
  categories: BlogCategory[];
  tags: BlogTag[];
  featuredPosts: BlogPostListItem[];
  recentPosts: BlogPostListItem[];
  popularPosts: BlogPostListItem[];
  loading: boolean;
  getPostBySlug: (slug: string) => BlogPostListItem | undefined;
  getPostsByCategory: (categorySlug: string) => BlogPostListItem[];
  getPostsByTag: (tagSlug: string) => BlogPostListItem[];
  getRelatedPosts: (currentId: string, limit?: number) => BlogPostListItem[];
  searchPosts: (query: string) => BlogPostListItem[];
  getCategoryBySlug: (slug: string) => BlogCategory | undefined;
  getTagBySlug: (slug: string) => BlogTag | undefined;
  getAdjacentPosts: (slug: string) => { prev: BlogPostListItem | null; next: BlogPostListItem | null };
}

// Категории с переводами
const getCategories = (t: (key: string) => string, postCount: Record<string, number>): BlogCategory[] => [
  { 
    id: '1', 
    name: t('blog.categoryLabels.webdev'), 
    slug: 'webdev', 
    count: postCount['webdev'] || 0,
    description: t('blog.categoryLabels.webdevDesc')
  },
  { 
    id: '2', 
    name: t('blog.categoryLabels.seo'), 
    slug: 'seo', 
    count: postCount['seo'] || 0,
    description: t('blog.categoryLabels.seoDesc')
  },
  { 
    id: '3', 
    name: t('blog.categoryLabels.performance'), 
    slug: 'performance', 
    count: postCount['performance'] || 0,
    description: t('blog.categoryLabels.performanceDesc')
  },
];

// Теги с переводами
const getTags = (t: (key: string) => string, tagCount: Record<string, number>): BlogTag[] => [
  { id: '1', name: 'Next.js', slug: 'nextjs', count: tagCount['nextjs'] || 0 },
  { id: '2', name: 'Astro', slug: 'astro', count: tagCount['astro'] || 0 },
  { id: '3', name: t('blog.tagLabels.seo'), slug: 'seo', count: tagCount['seo'] || 0 },
  { id: '4', name: t('blog.tagLabels.performance'), slug: 'performance', count: tagCount['performance'] || 0 },
  { id: '5', name: '2026', slug: '2026', count: tagCount['2026'] || 0 },
];

export function useBlog(currentLang: string = 'ru'): UseBlogReturn {
  
  // ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ ЗДЕСЬ, ДО ЛЮБЫХ УСЛОВИЙ!
  const { t } = useTranslation();
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ ЛОГ 1: Проверяем с каким языком вызван хук
  console.log('🔵 useBlog called with currentLang:', currentLang);

  // useEffect после всех useState
  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      setPosts([]);
      
      const loadedPosts: BlogPostListItem[] = [];
      
      // ✅ ЛОГ 2: Проверяем что в индексе
      console.log('🟡 blogIndex entries:', Object.entries(blogIndex).length);
      
      for (const [id, entry] of Object.entries(blogIndex)) {
        const translation = entry.translations[currentLang];
        
        // ✅ ЛОГ 3: Проверяем найден ли перевод
        if (!translation) {
          console.warn(`❌ No translation for ${id} in ${currentLang}`);
          continue;
        }
        
        console.log(`✅ Found translation for ${id}:`, { slug: translation.slug, lang: currentLang });
        
        try {
          const module = await import(`@/content/blog/${id}/${currentLang}.json`);
          const data = module.default;
          
          loadedPosts.push({
            id,
            slug: translation.slug,
            title: data.title || translation.title,
            excerpt: data.excerpt || translation.excerpt,
            image: data.meta?.ogImage || '/blog-images/default.jpg',
            author: data.author?.name || 'Pavel Levdin',
            date: data.date || entry.date,
            readTime: data.readTime || '5 мин',
            category: data.category || entry.category,
            tags: data.tags || entry.tags,
            featured: data.featured || false,
            views: data.views || 0,
            lang: currentLang
          });
        } catch (error) {
          console.error(`Failed to load post ${id} in ${currentLang}:`, error);
        }
      }
      
      // ✅ ЛОГ 4: Итоговый результат
      console.log('🟢 Loaded posts:', loadedPosts.map(p => ({ id: p.id, slug: p.slug, lang: p.lang })));
      
      loadedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPosts(loadedPosts);
      setLoading(false);
    }
    
    loadPosts();
  }, [currentLang]);

  // Подсчёт категорий
  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [posts]);

  // Подсчёт тегов
  const tagCount = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => {
      p.tags.forEach(tag => {
        const slug = tag.toLowerCase().replace(/\s+/g, '-');
        counts[slug] = (counts[slug] || 0) + 1;
      });
    });
    return counts;
  }, [posts]);

  // Категории и теги с переводом
  const categories = useMemo(() => getCategories(t, categoryCount), [t, categoryCount]);
  const tags = useMemo(() => getTags(t, tagCount), [t, tagCount]);

  const featuredPosts = useMemo(() => posts.filter(p => p.featured).slice(0, 3), [posts]);
  const recentPosts = useMemo(() => posts.slice(0, 5), [posts]);
  const popularPosts = useMemo(() => [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5), [posts]);

  const getPostsByCategory = useCallback((categorySlug: string) => {
    return posts.filter(p => p.category === categorySlug);
  }, [posts]);

  const getPostsByTag = useCallback((tagSlug: string) => {
    return posts.filter(p => 
      p.tags.some(tag => tag.toLowerCase().replace(/\s+/g, '-') === tagSlug.toLowerCase())
    );
  }, [posts]);

  const getPostBySlug = useCallback((slug: string) => {
    return posts.find(p => p.slug === slug);
  }, [posts]);

  const getCategoryBySlug = useCallback((slug: string): BlogCategory | undefined => {
    return categories.find(c => c.slug === slug);
  }, [categories]);

  const getTagBySlug = useCallback((slug: string): BlogTag | undefined => {
    return tags.find(t => t.slug === slug);
  }, [tags]);

  const searchPosts = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return posts.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) ||
      p.excerpt.toLowerCase().includes(lowerQuery) ||
      p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [posts]);

  const getRelatedPosts = useCallback((postId: string, limit: number = 3) => {
    const entry = blogIndex[postId as keyof typeof blogIndex];
    if (!entry) return [];
    
    return posts
      .filter(p => 
        p.id !== postId && 
        (p.category === entry.category || p.tags.some(tag => entry.tags.includes(tag)))
      )
      .slice(0, limit);
  }, [posts]);

  const getAdjacentPosts = useCallback((slug: string) => {
    const currentIndex = posts.findIndex(p => p.slug === slug);
    if (currentIndex === -1) return { prev: null, next: null };
    
    return {
      prev: currentIndex > 0 ? posts[currentIndex - 1] : null,
      next: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null
    };
  }, [posts]);

  return {
    posts,
    categories,
    tags,
    featuredPosts,
    recentPosts,
    popularPosts,
    loading,
    getPostBySlug,
    getPostsByCategory,
    getPostsByTag,
    getRelatedPosts,
    searchPosts,
    getCategoryBySlug,
    getTagBySlug,
    getAdjacentPosts
  };
}