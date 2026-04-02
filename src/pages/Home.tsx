import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Hero } from '@/sections/Hero';
import { About } from '@/sections/About';
import { Services } from '@/sections/Services';
import { Portfolio } from '@/sections/Portfolio';
import { Advantages } from '@/sections/Advantages';
import { Testimonials } from '@/sections/Testimonials'; // ← ДОБАВЛЕНО
import { LatestArticles } from '@/sections/LatestArticles';
import { CTA } from '@/sections/CTA';

export function Home() {
  const { i18n } = useTranslation();
  
  const titles = {
    en: 'Pavel Levdin - Full-Stack Developer | Portfolio',
    ru: 'Павел Левдин - Full-Stack Разработчик | Портфолио',
    de: 'Pavel Levdin - Full-Stack Entwickler | Portfolio'
  };
  
  const descriptions = {
    en: 'Professional web developer creating modern websites, web applications and automation solutions.',
    ru: 'Профессиональный веб-разработчик. Создаю современные сайты, веб-приложения и решения для автоматизации.',
    de: 'Professioneller Webentwickler. Erstelle moderne Websites, Webanwendungen und Automatisierungslösungen.'
  };

  return (
    <>
      <Helmet>
        <title>{titles[i18n.language as keyof typeof titles] || titles.en}</title>
        <meta name="description" content={descriptions[i18n.language as keyof typeof descriptions] || descriptions.en} />
        <link rel="canonical" href="https://pavellevdin.dev/" />
      </Helmet>
      
      <Hero />
      <About />
      <Services />
      <Portfolio />
      <Advantages />
      <Testimonials /> {/* ← ДОБАВЛЕНО */}
      <LatestArticles />
      <CTA />
    </>
  );
}