export interface BlogTranslation {
  slug: string;
  title: string;
  excerpt: string;
}

export interface BlogEntry {
  id: string;
  category: string;
  tags: string[];
  date: string;
  image: string;  // ← ДОБАВЛЕНО
  translations: Record<string, BlogTranslation>;
}

// Индекс всех статей блога
export const blogIndex: Record<string, BlogEntry> = {
  'website-creation-2026': {
    id: 'website-creation-2026',
    category: 'webdev',
    tags: ['создание сайтов', 'Next.js', 'Astro', 'SEO', 'производительность', '2026'],
    date: '2026-03-29',
    image: '/blog-images/og-website-creation-2026.jpg',  // ← ДОБАВЛЕНО
    translations: {
      ru: { 
        slug: 'sozdanie-sovremennogo-sayta-2026',
        title: 'Создание современного сайта в 2026',
        excerpt: 'Пошаговое руководство по созданию профессионального веб-сайта от идеи до запуска...'
      },
      de: { 
        slug: 'moderne-website-erstellen-2026',
        title: 'Moderne Website erstellen 2026',
        excerpt: 'Schritt-für-Schritt-Anleitung zur Erstellung einer professionellen Website...'
      },
      en: { 
        slug: 'modern-website-creation-2026',
        title: 'Modern Website Creation in 2026',
        excerpt: 'Step-by-step guide to creating a professional website from idea to launch...'
      }
    }
  },

  // ✅ AUTO-ADDED: nextjs-15-server-components-complete-guide
  'nextjs-15-server-components-complete-guide': {
    id: 'nextjs-15-server-components-complete-guide',
    category: 'webdev',
    tags: ['nextjs', 'react', 'server-components', 'performance', 'app-router', 'rsc', 'fullstack', '2026'],
    date: '2026-03-30',
    image: '/blog-images/og-nextjs-15-server-components-complete-guide.jpg',  // ← ДОБАВЛЕНО
    translations: {
      ru: { 
        slug: 'nextjs-15-server-components-polnoe-rukovodstvo',
        title: 'Next.js 15: Полное руководство по Server Components',
        excerpt: 'Разбираем React Server Components в Next.js 15: архитектура, гидратация, кэширование и практические ...'
      },
      de: { 
        slug: 'nextjs-15-server-components-komplette-anleitung',
        title: 'Next.js 15: Komplette Anleitung zu Server Components',
        excerpt: 'Tiefgehender Einblick in React Server Components in Next.js 15: Architektur, Hydration, Caching und ...'
      },
      en: { 
        slug: 'nextjs-15-server-components-complete-guide',
        title: 'Next.js 15: Complete Guide to Server Components',
        excerpt: 'Deep dive into React Server Components in Next.js 15: architecture, hydration, caching, and producti...'
      }
    }
  },

  // ✅ AUTO-ADDED: lighthouse-100-perfect-performance
  'lighthouse-100-perfect-performance': {
    id: 'lighthouse-100-perfect-performance',
    category: 'webdev',
    tags: ['Lighthouse', 'Core Web Vitals', 'производительность', 'LCP', 'INP', 'CLS', 'оптимизация', '2026'],
    date: '2026-03-31',
    image: '/blog-images/og-lighthouse-100.jpg',  // ← ДОБАВЛЕНО
    translations: {
      ru: { 
        slug: 'lighthouse-100-kak-dostich-idealnoy-proizvoditelnosti',
        title: 'Lighthouse 100: как достичь идеальной производительности',
        excerpt: 'Полное руководство по достижению 100 баллов в Google Lighthouse. Оптимизация LCP, INP, CLS и всех ме...'
      },
      de: { 
        slug: 'lighthouse-100-perfekte-performance-erreichen',
        title: 'Lighthouse 100: Wie man perfekte Performance erreicht',
        excerpt: 'Vollständige Anleitung zum Erreichen von 100 Punkten in Google Lighthouse. Optimierung von LCP, INP,...'
      },
      en: { 
        slug: 'lighthouse-100-how-to-achieve-perfect-performance',
        title: 'Lighthouse 100: How to Achieve Perfect Performance',
        excerpt: 'Complete guide to reaching 100 points in Google Lighthouse. Optimizing LCP, INP, CLS and all metrics...'
      }
    }
  },

  // ✅ AUTO-ADDED: typescript-5-7-complete-guide
  'typescript-5-7-complete-guide': {
    id: 'typescript-5-7-complete-guide',
    category: 'webdev',
    tags: ['TypeScript', 'JavaScript', 'ES2024', 'Node.js', 'Frontend', '2026'],
    date: '2026-04-02',
    image: '/blog-images/og-typescript-5-7.jpg',
    translations: {
      ru: { 
        slug: 'typescript-5-7-polnoye-rukovodstvo',
        title: 'TypeScript 5.7: полное руководство для веб-разработчиков',
        excerpt: 'Разбор ключевых нововведений TypeScript 5.7: от перезаписи относительных импортов до V8 Compile Cach...'
      },
      de: { 
        slug: 'typescript-5-7-vollstaendige-anleitung',
        title: 'TypeScript 5.7: Vollständige Anleitung für Webentwickler',
        excerpt: 'Tiefgehender Einblick in TypeScript 5.7: von Pfad-Umschreibung bis V8 Compile Caching. Wie man in 20...'
      },
      en: { 
        slug: 'typescript-5-7-complete-guide',
        title: 'TypeScript 5.7: Complete Guide for Web Developers',
        excerpt: 'Deep dive into TypeScript 5.7 features: from path rewriting to V8 Compile Caching. How to write type...'
      }
    }
  }
};

// Хелперы для работы с индексом
export function getPostIdBySlug(slug: string): string | null {
  for (const [id, entry] of Object.entries(blogIndex)) {
    for (const translation of Object.values(entry.translations)) {
      if (translation.slug === slug) return id;
    }
  }
  return null;
}

export function getSlugByIdAndLang(id: string, lang: string): string | null {
  return blogIndex[id]?.translations[lang]?.slug || null;
}

export function getAllSlugs(): string[] {
  return Object.values(blogIndex).flatMap(entry => 
    Object.values(entry.translations).map(t => t.slug)
  );
}

export function getAvailableLanguages(id: string): string[] {
  return Object.keys(blogIndex[id]?.translations || {});
}