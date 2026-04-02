import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { BlogCategory, BlogTag } from '@/types/blog';

interface SidebarPost {
  id: string;
  slug: string;
  title: string;
  image: string;
}

interface BlogSidebarProps {
  categories: BlogCategory[];
  tags: BlogTag[];
  recentPosts?: SidebarPost[];
  popularPosts?: SidebarPost[];
}

export function BlogSidebar({ categories, tags, recentPosts, popularPosts }: BlogSidebarProps) {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || 'ru';

  return (
    <aside className="space-y-6">
      {/* Категории */}
      <div className="bg-card rounded-2xl p-6 border border-border/50">
        <h3 className="text-lg font-semibold mb-4">{t('blog.categories')}</h3>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Link 
                to={`/${currentLang}/blog/category/${category.slug}`} 
                className="flex justify-between items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{category.name}</span>
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                  {category.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Недавние статьи */}
      {recentPosts && recentPosts.length > 0 && (
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <h3 className="text-lg font-semibold mb-4">{t('blog.recentPosts')}</h3>
          <ul className="space-y-3">
            {recentPosts.map((post) => (
              <li key={post.id} className="flex gap-3">
                <img 
                  src={post.image} 
                  alt="" 
                  className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                />
                <Link 
                  to={`/${currentLang}/blog/${post.slug}`} 
                  className="text-sm hover:text-primary transition-colors line-clamp-2"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Популярные статьи */}
      {popularPosts && popularPosts.length > 0 && (
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <h3 className="text-lg font-semibold mb-4">{t('blog.popularPosts')}</h3>
          <ul className="space-y-3">
            {popularPosts.map((post) => (
              <li key={post.id}>
                <Link 
                  to={`/${currentLang}/blog/${post.slug}`} 
                  className="text-sm hover:text-primary transition-colors line-clamp-2"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Теги */}
      <div className="bg-card rounded-2xl p-6 border border-border/50">
        <h3 className="text-lg font-semibold mb-4">{t('blog.tags')}</h3>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 12).map((tag) => (
            <Link 
              key={tag.id} 
              to={`/${currentLang}/blog/tag/${tag.slug}`} 
              className="px-3 py-1 text-sm bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}