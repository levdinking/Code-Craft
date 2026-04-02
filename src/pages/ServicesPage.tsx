import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Globe, 
  AppWindow, 
  TrendingUp, 
  Settings, 
  Rocket, 
  HeadphonesIcon,
  Briefcase,
  Check,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const services = [
  {
    key: 'webdev',
    icon: Globe,
    color: 'from-blue-500/20 to-blue-500/5',
    features: ['responsive', 'clean', 'seo', 'fast']
  },
  {
    key: 'webapp',
    icon: AppWindow,
    color: 'from-purple-500/20 to-purple-500/5',
    features: ['functionality', 'ui', 'scalable', 'api']
  },
  {
    key: 'seo',
    icon: TrendingUp,
    color: 'from-green-500/20 to-green-500/5',
    features: ['technical', 'performance', 'vitals', 'analytics']
  },
  {
    key: 'automation',
    icon: Settings,
    color: 'from-orange-500/20 to-orange-500/5',
    features: ['workflow', 'data', 'integration', 'scripts']
  },
  {
    key: 'mvp',
    icon: Rocket,
    color: 'from-red-500/20 to-red-500/5',
    features: ['prototyping', 'lean', 'validation', 'scalable']
  },
  {
    key: 'support',
    icon: HeadphonesIcon,
    color: 'from-cyan-500/20 to-cyan-500/5',
    features: ['updates', 'bugs', 'monitoring', 'security']
  }
];

export function ServicesPage() {
  const { t, i18n } = useTranslation();

  const titles = {
    en: 'Services | Pavel Levdin',
    ru: 'Услуги | Павел Левдин',
    de: 'Leistungen | Pavel Levdin'
  };

  const descriptions = {
    en: 'Web development, web applications, SEO optimization and process automation services.',
    ru: 'Разработка сайтов, веб-приложения, SEO-оптимизация и автоматизация процессов.',
    de: 'Webentwicklung, Webanwendungen, SEO-Optimierung und Prozessautomatisierung.'
  };

  return (
    <>
      <Helmet>
        <title>{titles[i18n.language as keyof typeof titles] || titles.en}</title>
        <meta name="description" content={descriptions[i18n.language as keyof typeof descriptions] || descriptions.en} />
        <link rel="canonical" href="https://pavellevdin.dev/services" />
      </Helmet>
      
      <div className="pt-24 md:pt-32 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Briefcase className="w-4 h-4" />
                {t('services.title')}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {t('services.subtitle')}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('services.description')}
              </p>
            </motion.div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {services.map((service, index) => (
                <motion.div
                  key={service.key}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <div className={`relative p-6 md:p-8 rounded-2xl bg-gradient-to-br ${service.color} border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full flex flex-col`}>
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-background/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <service.icon className="w-7 h-7 text-primary" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-3">
                      {t(`services.${service.key}.title`)}
                    </h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      {t(`services.${service.key}.description`)}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          {t(`services.${service.key}.features.${feature}`)}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link to="/contact">
                      <Button variant="outline" className="w-full group/btn">
                        {t('services.discuss')}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Process Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="relative p-8 md:p-12 rounded-3xl bg-muted/50 border border-border/50"
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('services.process.title')}</h2>
                <p className="text-muted-foreground">{t('services.process.subtitle')}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { step: '01', key: 'discovery' },
                  { step: '02', key: 'planning' },
                  { step: '03', key: 'development' },
                  { step: '04', key: 'delivery' }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">{item.step}</span>
                    </div>
                    <h3 className="font-semibold mb-1">{t(`services.process.steps.${item.key}.title`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`services.process.steps.${item.key}.description`)}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-12 text-center"
            >
              <p className="text-muted-foreground mb-4">
                {t('services.bottomCta')}
              </p>
              <Link to="/contact">
                <Button size="lg">
                  {t('services.getInTouch')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}