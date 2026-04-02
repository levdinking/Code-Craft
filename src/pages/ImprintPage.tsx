import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Shield, 
  FileText, 
  Scale, 
  Copyright,
  Gavel 
} from 'lucide-react';

export function ImprintPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'de' | 'en' | 'ru';

  return (
    <Layout 
      pageTitle={t('imprint.seo.title')} 
      pageDescription={t('imprint.seo.description')}
    >
      <Helmet>
        <title>{t('imprint.seo.title')}</title>
        <meta name="description" content={t('imprint.seo.description')} />
        <link rel="canonical" href={`https://pavellevdin.dev/${lang}/imprint`} />
        
        <link rel="alternate" hrefLang="de" href="https://pavellevdin.dev/de/imprint" />
        <link rel="alternate" hrefLang="en" href="https://pavellevdin.dev/en/imprint" />
        <link rel="alternate" hrefLang="ru" href="https://pavellevdin.dev/ru/imprint" />
        <link rel="alternate" hrefLang="x-default" href="https://pavellevdin.dev/en/imprint" />
        
        <html lang={lang} />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-24 md:py-32"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-4">
            {t('imprint.legalNotice')}
          </p>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            {t('imprint.title')}
          </h1>
          
          <div className="bg-card/80 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-lg border border-border/50 space-y-8">
            {/* Owner */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {t('imprint.owner')}
                </h2>
                <p className="text-lg font-semibold">{t('imprint.ownerName')}</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {t('imprint.address')}
                </h2>
                <p className="text-lg">{t('imprint.addressLine1')}</p>
                <p className="text-lg">{t('imprint.addressLine2')}</p>
                <p className="text-lg">{t('imprint.country')}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {t('imprint.email')}
                </h2>
                <a 
                  href={`mailto:${t('imprint.emailValue')}`} 
                  className="text-lg font-medium text-primary hover:underline transition-colors"
                >
                  {t('imprint.emailValue')}
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {t('imprint.phone')}
                </h2>
                <p className="text-lg font-medium">{t('imprint.phoneValue')}</p>
              </div>
            </div>

            {/* VAT ID */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {t('imprint.vatId')}
                </h2>
                <p className="text-lg">{t('imprint.vatValue')}</p>
              </div>
            </div>

            {/* Responsible Person */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {t('imprint.responsible')}
                </h2>
                <p className="text-lg">{t('imprint.responsiblePerson')}</p>
              </div>
            </div>

            {/* Legal Sections - только для немецкого */}
            {lang === 'de' && (
              <>
                <div className="mt-8 pt-6 border-t border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Scale className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        {t('imprint.liabilityTitle')}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('imprint.liabilityText')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Copyright className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        {t('imprint.copyrightTitle')}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('imprint.copyrightText')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Gavel className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        {t('imprint.disputeTitle')}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('imprint.disputeText')}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            {t('imprint.lastUpdated')}: {new Date().toLocaleDateString(
              lang === 'de' ? 'de-DE' : lang === 'ru' ? 'ru-RU' : 'en-US', 
              { year: 'numeric', month: 'long', day: 'numeric' }
            )}
          </p>
        </div>
      </motion.div>
    </Layout>
  );
}