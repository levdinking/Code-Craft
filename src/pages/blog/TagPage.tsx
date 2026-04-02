import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { BlogGrid } from '@/components/blog/BlogGrid';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { Breadcrumb } from '@/components/blog/Breadcrumb';
import { useBlog } from '@/hooks/useBlog';
import { ArrowLeft, Tag } from 'lucide-react';

export function TagPage() {
  const { t } = useTranslation();
  const { tag: tagSlug, lang } = useParams<{ tag: string; lang: string }>();
  const { getPostsByTag, getTagBySlug, categories, tags, recentPosts } = useBlog();

  const tag = getTagBySlug(tagSlug || '');
  const posts = getPostsByTag(tagSlug || '');
  const tagName = tag?.name || tagSlug;

  // Функция склонения для "статья с тегом"
  const getArticlesWithTagText = (count: number) => {
    if (lang === 'ru') {
      if (count === 1) return '1 статья с этим тегом';
      if (count < 5) return `${count} статьи с этим тегом`;
      return `${count} статей с этим тегом`;
    }
    if (lang === 'de') {
      return `${count} Artikel mit diesem Tag`;
    }
    return `${count} ${count === 1 ? 'article' : 'articles'} with this tag`;
  };

  return (
    <Layout>
      <Helmet>
        <title>#{tagName} | {t('blog.title')}</title>
        <meta name="description" content={t('blog.tagDescription', { tag: tagName })} />
        <link rel="canonical" href={`https://my.delimes.ru/${lang}/blog/tag/${tagSlug}`} />
      </Helmet>

      <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: `${t('blog.tagLabel')}: ${tagName}` }]} />

          <Link 
            to={`/${lang}/blog`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('blog.backToList')}
          </Link>

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Tag className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">#{tagName}</h1>
            </div>
            <p className="text-muted-foreground">
              {getArticlesWithTagText(posts.length)}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {posts.length > 0 ? (
                <BlogGrid posts={posts} columns={2} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  {t('blog.noArticlesWithTag')}
                </div>
              )}
            </div>
            <aside className="lg:col-span-1">
              <BlogSidebar 
                categories={categories} 
                tags={tags}
                recentPosts={recentPosts}
              />
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}