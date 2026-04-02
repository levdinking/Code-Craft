import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { BlogGrid } from '@/components/blog/BlogGrid';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { Breadcrumb } from '@/components/blog/Breadcrumb';
import { useBlog } from '@/hooks/useBlog';
import { ArrowLeft, FolderOpen } from 'lucide-react';

export function CategoryPage() {
  const { t } = useTranslation();
  const { category: categorySlug, lang } = useParams<{ category: string; lang: string }>();
  const { getPostsByCategory, getCategoryBySlug, categories, tags, recentPosts } = useBlog();

  const category = getCategoryBySlug(categorySlug || '');
  const posts = getPostsByCategory(categorySlug || '');

  // Функция склонения слова "статья"
  const getArticlesCountText = (count: number) => {
    if (lang === 'ru') {
      if (count === 1) return '1 статья';
      if (count < 5) return `${count} статьи`;
      return `${count} статей`;
    }
    if (lang === 'de') {
      return `${count} Artikel`;
    }
    return `${count} ${count === 1 ? 'article' : 'articles'}`;
  };

  if (!category) {
    return (
      <Layout>
        <div className="py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('blog.categoryNotFound')}</h1>
          <Link to={`/${lang}/blog`} className="text-primary hover:underline">
            {t('blog.backToList')}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{category.name} | {t('blog.title')}</title>
        <meta name="description" content={category.description || t('blog.categoryDescription', { name: category.name })} />
        <link rel="canonical" href={`https://my.delimes.ru/${lang}/blog/category/${category.slug}`} />
      </Helmet>

      <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: category.name }]} />

          <Link 
            to={`/${lang}/blog`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('blog.backToList')}
          </Link>

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <FolderOpen className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">{category.name}</h1>
            </div>
            {category.description && (
              <p className="text-xl text-muted-foreground max-w-2xl">
                {category.description}
              </p>
            )}
            <p className="text-muted-foreground mt-2">
              {getArticlesCountText(posts.length)}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {posts.length > 0 ? (
                <BlogGrid posts={posts} columns={2} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  {t('blog.noArticlesInCategory')}
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