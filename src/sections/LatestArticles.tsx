import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getBlogList } from '@/data/blog-loader';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlogListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  date: string;
  image: string;  // ← ДОБАВЛЕНО
}

export function LatestArticles() {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const allPosts = await getBlogList(i18n.language);
        const sorted = allPosts
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);
        setPosts(sorted);
      } catch (error) {
        console.error('Failed to load blog posts:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [i18n.language]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'de' ? 'de-DE' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, Record<string, string>> = {
      webdev: { ru: 'Веб-разработка', en: 'Web Development', de: 'Webentwicklung' },
      performance: { ru: 'Производительность', en: 'Performance', de: 'Performance' },
      seo: { ru: 'SEO', en: 'SEO', de: 'SEO' }
    };
    return labels[category]?.[i18n.language] || category;
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) return null;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('latestArticles.title', 'Последние статьи')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('latestArticles.subtitle', 'Полезные материалы о веб-разработке, SEO и оптимизации')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group bg-background rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* КАРТИНКА СТАТЬИ */}
              <div className="aspect-video bg-muted overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {getCategoryLabel(post.category)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.date)}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  <Link to={`/${i18n.language}/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>

                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                  {post.excerpt}
                </p>

                <Link
                  to={`/${i18n.language}/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all"
                >
                  {t('latestArticles.readMore', 'Читать далее')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link to={`/${i18n.language}/blog`}>
              {t('latestArticles.viewAll', 'Все статьи')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}