import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Shield, Lock, Eye, Server, Cookie, UserCheck, FileText } from 'lucide-react';

export function PrivacyPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'de' | 'en' | 'ru';

  return (
    <Layout pageTitle={t('privacy.seo.title')} pageDescription={t('privacy.seo.description')}>
      <Helmet>
        <title>{t('privacy.seo.title')}</title>
        <meta name="description" content={t('privacy.seo.description')} />
        <link rel="canonical" href={`https://pavellevdin.dev/${lang}/privacy`} />
        
        <link rel="alternate" hrefLang="de" href="https://pavellevdin.dev/de/privacy" />
        <link rel="alternate" hrefLang="en" href="https://pavellevdin.dev/en/privacy" />
        <link rel="alternate" hrefLang="ru" href="https://pavellevdin.dev/ru/privacy" />
        <link rel="alternate" hrefLang="x-default" href="https://pavellevdin.dev/en/privacy" />
        
        <html lang={lang} />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-24 md:py-32"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            {t('privacy.title')}
          </h1>
          
          <div className="bg-card/80 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-lg border border-border/50 space-y-8">
            {/* Section 1 - Оператор данных */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">{t('privacy.section1.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">{t('privacy.section1.text')}</p>
              </div>
            </div>

            {/* Section 2 - Сбор данных */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">{t('privacy.section2.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">{t('privacy.section2.text')}</p>
              </div>
            </div>

            {/* Section 3 - Использование данных */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">{t('privacy.section3.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">{t('privacy.section3.text')}</p>
              </div>
            </div>

            {/* Section 4 - Безопасность данных */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Server className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">{t('privacy.section4.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">{t('privacy.section4.text')}</p>
              </div>
            </div>

            {/* Section 5 - Cookies */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">{t('privacy.section5.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">{t('privacy.section5.text')}</p>
              </div>
            </div>

            {/* Section 6 - Ваши права */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">{t('privacy.section6.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">{t('privacy.section6.text')}</p>
              </div>
            </div>

            {/* Section 7 - Изменения политики */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">{t('privacy.section7.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">{t('privacy.section7.text')}</p>
              </div>
            </div>

            {/* Contact */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                {t('privacy.contact')}: <a href="mailto:levdin.pavel@yandex.ru" className="text-primary hover:underline">levdin.pavel@yandex.ru</a>
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            {t('privacy.lastUpdated')}: {new Date().toLocaleDateString(
              lang === 'de' ? 'de-DE' : lang === 'ru' ? 'ru-RU' : 'en-US', 
              { year: 'numeric', month: 'long', day: 'numeric' }
            )}
          </p>
        </div>
      </motion.div>
    </Layout>
  );
}