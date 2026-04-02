// src/components/blog/RelatedPosts.tsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

// Минимальный интерфейс — работает с любым типом постов
interface RelatedPostItem {
  id: string;
  slug: string;
  title: string;
  image: string;
  category: string;
}

interface RelatedPostsProps {
  posts: RelatedPostItem[];
  currentSlug: string;
}

export function RelatedPosts({ posts, currentSlug }: RelatedPostsProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const filteredPosts = posts.filter(p => p.slug !== currentSlug).slice(0, 3);

  if (filteredPosts.length === 0) return null;

  return (
    <section className="mt-16 pt-16 border-t">
      <h2 className="text-2xl font-bold mb-8">{t('blog.relatedPosts')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <article 
            key={post.id}
            className="group bg-card rounded-xl overflow-hidden border border-border/50 hover:shadow-lg transition-all duration-300"
          >
            <Link to={`/${lang}/blog/${post.slug}`} className="block">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-primary mb-2 block">
                  {post.category}
                </span>
                <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <span className="text-sm text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                  {t('blog.readMore')}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}