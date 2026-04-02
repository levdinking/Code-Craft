export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  category: string;
  published: boolean;
  featured?: boolean;
  views?: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  relatedPosts?: string[]; // IDs связанных статей
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
  description?: string;
  image?: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface BlogPostTranslation {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export type Language = 'ru' | 'de' | 'en';

export interface MultilingualBlogPost extends Omit<BlogPost, 'title' | 'excerpt' | 'content'> {
  translations: Record<Language, BlogPostTranslation>;
  defaultLanguage: Language;
}