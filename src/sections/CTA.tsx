import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function CTA() {
  const { t, i18n } = useTranslation();  // ← добавили i18n
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative p-8 md:p-12 lg:p-16 rounded-3xl bg-background/80 backdrop-blur-xl border border-primary/20 text-center overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px]" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px]" />

            {/* Content */}
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
              >
                <MessageSquare className="w-8 h-8 text-primary" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              >
                {t('cta.title')}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-lg text-muted-foreground max-w-xl mx-auto mb-8"
              >
                {t('cta.subtitle')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {/* ← ИСПРАВЛЕНО: добавили язык в путь */}
                <Link to={`/${i18n.language}/contact`}>
                  <Button size="lg" className="px-8 group">
                    {t('cta.button')}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-10 pt-8 border-t border-border/50"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  {t('cta.responseTime')}
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    {t('cta.availability')}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}