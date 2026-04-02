import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { BlogGrid } from '@/components/blog/BlogGrid';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { NewsletterCTA } from '@/components/blog/NewsletterCTA';
import { useBlog } from '@/hooks/useBlog';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export function BlogList() {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || 'ru';

  const { 
    posts, 
    categories, 
    tags, 
    featuredPosts, 
    recentPosts, 
    popularPosts,
    searchPosts,
    loading 
  } = useBlog(currentLang);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'featured'>('all');

  const filteredPosts = searchQuery 
    ? searchPosts(searchQuery)
    : activeFilter === 'featured' 
      ? featuredPosts 
      : posts;

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('blog.seo.title')}</title>
        <meta name="description" content={t('blog.seo.description')} />
        <link rel="canonical" href={`https://my.delimes.ru/${currentLang}/blog`} />
      </Helmet>

      <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('blog.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('blog.subtitle')}
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('blog.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          {!searchQuery && (
            <div className="flex justify-center gap-2 mb-8">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full transition-colors ${
                  activeFilter === 'all' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {t('blog.allArticles')} ({posts.length})
              </button>
              <button
                onClick={() => setActiveFilter('featured')}
                className={`px-4 py-2 rounded-full transition-colors ${
                  activeFilter === 'featured' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {t('blog.featured')} ({featuredPosts.length})
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {filteredPosts.length > 0 ? (
                <BlogGrid 
                  posts={filteredPosts} 
                  columns={2}
                  featured={activeFilter === 'all' && !searchQuery}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery 
                    ? `${t('blog.search')} "${searchQuery}"` 
                    : t('blog.notFound')}
                </div>
              )}

              <NewsletterCTA />
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <BlogSidebar 
                categories={categories} 
                tags={tags}
                recentPosts={recentPosts}
                popularPosts={popularPosts}
              />
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}