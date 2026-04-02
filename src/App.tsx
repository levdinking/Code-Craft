import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ThemeProvider } from '@/hooks/useTheme';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { PortfolioPage } from '@/pages/PortfolioPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { ContactPage } from '@/pages/ContactPage';
import { ImprintPage } from '@/pages/ImprintPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { CookiePreloader } from '@/components/CookiePreloader';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

// Определяем язык браузера
function detectBrowserLanguage(): string {
  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || 'de';
  const lang = browserLang.slice(0, 2).toLowerCase();
  const supportedLangs = ['ru', 'de', 'en'];
  return supportedLangs.includes(lang) ? lang : 'de';
}

function LangLayout() {
  const { lang } = useParams();
  
  const seoData = {
    en: { lang: 'en', title: 'Pavel Levdin - Full-Stack Developer' },
    ru: { lang: 'ru', title: 'Павел Левдин - Full-Stack Разработчик' },
    de: { lang: 'de', title: 'Pavel Levdin - Full-Stack Entwickler' },
  };
  
  const currentSeo = seoData[lang as keyof typeof seoData] || seoData.de;
  
  return (
    <>
      <Helmet>
        <html lang={currentSeo.lang} />
        <title>{currentSeo.title}</title>
      </Helmet>
      <Layout>
        <Outlet />
      </Layout>
    </>
  );
}

import { BlogList } from '@/pages/blog/BlogList';
import { BlogPost } from '@/pages/blog/BlogPost';
import { CategoryPage } from './pages/blog/CategoryPage';
import { TagPage } from './pages/blog/TagPage';

function AppContent() {
  const { consent, isLoaded, accept, decline } = useCookieConsent();

  if (!isLoaded || consent === null) {
    return <CookiePreloader onAccept={accept} onDecline={decline} />;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to={`/${detectBrowserLanguage()}`} replace />} />
        <Route path="/:lang" element={<LangLayout />}>
          <Route index element={<Home />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="blog" element={<BlogList />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="blog/category/:category" element={<CategoryPage />} />
          <Route path="blog/tag/:tag" element={<TagPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="imprint" element={<ImprintPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;