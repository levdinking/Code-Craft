import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, ArrowLeft, User, Eye, Globe } from 'lucide-react';
import { useState, useEffect, Suspense, lazy } from 'react';
import { loadBlogPostBySlug } from '@/data/blog-loader';
import { getSlugByIdAndLang } from '@/data/blog-index';
import { useBlog } from '@/hooks/useBlog';
import { AuthorCard } from '@/components/blog/AuthorCard';
import { NewsletterCTA } from '@/components/blog';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { BlogSidebar } from '@/components/blog/BlogSidebar';

const TableOfContents = lazy(() => import('./components/TableOfContents'));

interface LoadedPost {
  id: string;
  slug: string;
  lang: string;
  title: string;
  excerpt: string;
  content: string;
  meta: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
    ogType: string;
    twitterCard: string;
  };
  author: {
    name: string;
    role: string;
    bio: string;
    avatar: string;
  };
  date: string;
  updatedAt: string;
  readTime: string;
  category: string;
  tags: string[];
  related: string[];
  featured: boolean;
  views: number;
  availableLanguages: string[];
}

function LanguageSwitcher({ currentLang, availableLanguages, postId }: { currentLang: string; availableLanguages: string[]; postId: string }) {
  const langNames: Record<string, string> = { ru: 'RU', de: 'DE', en: 'EN' };

  return (
    <div className="flex items-center gap-2 mb-6">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <div className="flex gap-1">
        {availableLanguages.map(lang => {
          const slug = getSlugByIdAndLang(postId, lang);
          if (!slug) return null;
          const isActive = lang === currentLang;
          return (
            <Link
              key={lang}
              to={`/${lang}/blog/${slug}`}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {langNames[lang]}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Breadcrumb({ items, lang, t }: { items: Array<{ label: string; href?: string }>; lang: string; t: (key: string) => string }) {
  return (
    <nav className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link to={`/${lang}`} className="hover:text-foreground transition-colors">{t('nav.home')}</Link>
        <span>/</span>
        <Link to={`/${lang}/blog`} className="hover:text-foreground transition-colors">{t('nav.blog')}</Link>
        {items.map((item, i) => (
          <span key={i} className="contents">
            <span>/</span>
            {item.href ? (
              <Link to={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </span>
        ))}
      </ol>
    </nav>
  );
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
      <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
    </div>
  );
}

function BlogPostSkeleton() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-6"></div>
          <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
          <div className="aspect-video bg-muted rounded-2xl mb-10"></div>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlogPost() {
  const { t, i18n } = useTranslation();
  const { slug, lang } = useParams<{ slug: string; lang: string }>();
  const [post, setPost] = useState<LoadedPost | null>(null);
  const [loading, setLoading] = useState(true);
  
  const currentLang = lang || 'ru';

  useEffect(() => {
    if (i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang);
    }
  }, [currentLang, i18n]);

  const { categories, tags, recentPosts, getCategoryBySlug } = useBlog(currentLang);

  const blogPath = `/${currentLang}/blog`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    async function loadPost() {
      if (!slug || !currentLang) return;
      setLoading(true);
      const loaded = await loadBlogPostBySlug(slug, currentLang);
      setPost(loaded as LoadedPost | null);
      setLoading(false);
    }
    loadPost();
  }, [slug, currentLang]);

  if (loading) {
    return <BlogPostSkeleton />;
  }

  if (!post) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('blog.notFound')}</h1>
        <p className="text-muted-foreground mb-6">{t('blog.notFoundDesc')}</p>
        <Link to={blogPath} className="text-primary hover:underline">{t('blog.backToList')}</Link>
      </div>
    );
  }

  const category = getCategoryBySlug(post.category);
  const breadcrumbItems = [
    ...(category ? [{ label: category.name, href: `${blogPath}/category/${category.slug}` }] : []),
    { label: post.title }
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.meta.title,
    description: post.meta.description,
    image: post.meta.ogImage,
    author: { 
      '@type': 'Person', 
      name: post.author.name,
      jobTitle: post.author.role,
      description: post.author.bio
    },
    datePublished: post.date,
    dateModified: post.updatedAt,
    inLanguage: currentLang,
    mainEntityOfPage: { '@type': 'WebPage', '@id': currentUrl }
  };

  return (
    <>
      <Helmet>
        <title>{post.meta.title}</title>
        <meta name="description" content={post.meta.description} />
        <meta name="keywords" content={post.meta.keywords.join(', ')} />
        <meta property="og:title" content={post.meta.title} />
        <meta property="og:description" content={post.meta.description} />
        <meta property="og:image" content={post.meta.ogImage} />
        <meta property="og:type" content={post.meta.ogType} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:locale" content={currentLang === 'ru' ? 'ru_RU' : currentLang === 'de' ? 'de_DE' : 'en_US'} />
        <meta name="twitter:card" content={post.meta.twitterCard} />
        <meta name="twitter:title" content={post.meta.title} />
        <meta name="twitter:description" content={post.meta.description} />
        <meta name="twitter:image" content={post.meta.ogImage} />
        <link rel="canonical" href={currentUrl} />
        {post.availableLanguages.map(availLang => {
          const availSlug = getSlugByIdAndLang(post.id, availLang);
          if (!availSlug || availLang === currentLang) return null;
          return (
            <link key={availLang} rel="alternate" hrefLang={availLang} href={`https://my.delimes.ru/${availLang}/blog/${availSlug}`} />
          );
        })}
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <ReadingProgress />

      <article className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Breadcrumb items={breadcrumbItems} lang={currentLang} t={t} />

              {post.availableLanguages.length > 1 && (
                <LanguageSwitcher 
                  currentLang={currentLang} 
                  availableLanguages={post.availableLanguages} 
                  postId={post.id}
                />
              )}

              <Link to={blogPath} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />{t('blog.backToList')}
              </Link>

              <header className="mb-10">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Link to={`${blogPath}/category/${post.category}`} className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors">
                    {category?.name || post.category}
                  </Link>
                  {post.featured && <span className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-600 rounded-full">★ {t('blog.featured')}</span>}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>
                <div className="flex flex-wrap gap-6 text-muted-foreground">
                  <span className="flex items-center gap-2"><User className="w-4 h-4" />{post.author.name}</span>
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(post.date).toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : currentLang === 'de' ? 'de-DE' : 'en-US')}</span>
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{post.readTime}</span>
                  {post.views > 0 && <span className="flex items-center gap-2"><Eye className="w-4 h-4" />{post.views.toLocaleString()} {t('blog.views')}</span>}
                </div>
              </header>

              <div className="aspect-video rounded-2xl overflow-hidden mb-10 shadow-lg">
                <img src={post.meta.ogImage} alt={post.title} className="w-full h-full object-cover" loading="eager" />
              </div>

              <div 
                className="prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-24" 
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />

              <div className="mt-10 pt-6 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('blog.tags')}:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Link 
                      key={tag} 
                      to={`${blogPath}/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`} 
                      className="px-3 py-1 text-sm bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-8"><ShareButtons title={post.title} url={currentUrl} /></div>
              <div className="mt-10"><AuthorCard author={post.author.name} date={post.date} readTime={post.readTime} /></div>
              <div className="mt-10"><NewsletterCTA /></div>

              <div className="mt-10">
                <RelatedPosts posts={recentPosts || []} currentSlug={post.slug} />
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Suspense fallback={<div className="h-40 bg-muted rounded-2xl animate-pulse" />}>
                  <TableOfContents content={post.content} />
                </Suspense>
                <BlogSidebar categories={categories} tags={tags} recentPosts={recentPosts?.slice(0, 3)} />
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}