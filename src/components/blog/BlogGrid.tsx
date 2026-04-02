import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface GridPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
}

interface BlogGridProps {
  posts: GridPost[];
  columns?: 2 | 3 | 4;
  featured?: boolean;
}

export function BlogGrid({ posts, columns = 2, featured = false }: BlogGridProps) {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || 'ru';

   // ✅ ЛОГ 5: Проверяем язык в BlogGrid
  console.log('🟣 BlogGrid render - URL lang:', lang, 'currentLang:', currentLang);
  console.log('🟣 Posts received:', posts.map(p => ({ id: p.id, slug: p.slug })));


  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t('blog.notFound')}
      </div>
    );
  }

  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6`}>
      {posts.map((post, index) => (
        <article 
          key={post.id} 
          className={`group bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-lg transition-all duration-300 ${
            featured && index === 0 ? 'md:col-span-2' : ''
          }`}
        >
          <Link to={`/${currentLang}/blog/${post.slug}`} className="block">
            <div className="aspect-video overflow-hidden relative">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading={index < 2 ? 'eager' : 'lazy'}
              />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 text-xs font-medium bg-primary/90 text-primary-foreground rounded-full backdrop-blur-sm">
                  {post.category}
                </span>
              </div>
            </div>
          </Link>

          <div className="p-5">
            <Link to={`/${currentLang}/blog/${post.slug}`}>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
            </Link>

            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{new Date(post.date).toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : currentLang === 'de' ? 'de-DE' : 'en-US')}</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}