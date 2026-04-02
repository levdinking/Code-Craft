import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { User, Target, Lightbulb, Rocket } from 'lucide-react';

export function About() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
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
              <User className="w-4 h-4" />
              {t('about.title')}
            </span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square max-w-md mx-auto lg:mx-0 relative">
                {/* Decorative Elements */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-2xl" />
                
                {/* Main Image Container */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border/50">
                  <img 
                    src="/public/about/photo.jpg" 
                    alt={t('about.photoAlt')} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="absolute -bottom-4 -right-4 bg-background rounded-xl p-4 shadow-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Rocket className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">10+ {t('about.experience')}</p>
                      <p className="text-xs text-muted-foreground">{t('about.experienceShort')}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold">
                {t('about.heading')}{' '}
                <span className="text-primary">{t('about.highlight')}</span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('about.description')}
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                {/* Feature 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Target className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{t('about.features.goal.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('about.features.goal.description')}</p>
                </motion.div>

                {/* Feature 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Lightbulb className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{t('about.features.innovative.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('about.features.innovative.description')}</p>
                </motion.div>

                {/* Feature 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Rocket className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{t('about.features.results.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('about.features.results.description')}</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}