import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Globe, 
  AppWindow, 
  TrendingUp, 
  Settings, 
  Rocket, 
  HeadphonesIcon,
  Briefcase
} from 'lucide-react';

const services = [
  {
    key: 'webdev',
    icon: Globe,
    color: 'from-blue-500/20 to-blue-500/5'
  },
  {
    key: 'webapp',
    icon: AppWindow,
    color: 'from-purple-500/20 to-purple-500/5'
  },
  {
    key: 'seo',
    icon: TrendingUp,
    color: 'from-green-500/20 to-green-500/5'
  },
  {
    key: 'automation',
    icon: Settings,
    color: 'from-orange-500/20 to-orange-500/5'
  },
  {
    key: 'mvp',
    icon: Rocket,
    color: 'from-red-500/20 to-red-500/5'
  },
  {
    key: 'support',
    icon: HeadphonesIcon,
    color: 'from-cyan-500/20 to-cyan-500/5'
  }
];

export function Services() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Briefcase className="w-4 h-4" />
              {t('services.title')}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {t('services.subtitle')}
            </h2>
          </motion.div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`relative p-6 md:p-8 rounded-2xl bg-gradient-to-br ${service.color} border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 h-full`}>
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-background/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3">
                    {t(`services.${service.key}.title`)}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(`services.${service.key}.description`)}
                  </p>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
