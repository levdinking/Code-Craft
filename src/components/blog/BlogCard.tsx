import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Eye, ArrowUpRight } from 'lucide-react';
import type { BlogPost } from '@/types/blog';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
  priority?: boolean;
}

export function BlogCard({ post, featured = false, priority = false }: BlogCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  if (featured) {
    return (
      <article className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-xl transition-all duration-300 md:col-span-2">
        <Link to={`/${lang}/blog/${post.slug}`} className="block md:flex">
          <div className="md:w-1/2 aspect-video md:aspect-auto overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading={priority ? 'eager' : 'lazy'}
            />
          </div>
          <div className="p-6 md:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                {post.category}
              </span>
              {post.featured && (
                <span className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-600 rounded-full">
                  ★ {t('blog.featuredBadge')}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <p className="text-muted-foreground mb-4 line-clamp-3">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
              {post.views && (
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.views.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-lg transition-all duration-300 flex flex-col">
      <Link to={`/${lang}/blog/${post.slug}`} className="block">
        <div className="aspect-video overflow-hidden relative">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading={priority ? 'eager' : 'lazy'}
          />
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 text-xs font-medium bg-primary/90 text-primary-foreground rounded-full backdrop-blur-sm">
              {post.category}
            </span>
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-1">
        <Link to={`/${lang}/blog/${post.slug}`}>
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(post.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
          </div>
          <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </article>
  );
}