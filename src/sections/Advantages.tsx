import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Zap, Award, UserCheck, Cpu, Star } from 'lucide-react';

const advantages = [
  {
    key: 'speed',
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10'
  },
  {
    key: 'quality',
    icon: Award,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    key: 'individual',
    icon: UserCheck,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    key: 'tech',
    icon: Cpu,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  }
];

export function Advantages() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="advantages" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
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
              <Star className="w-4 h-4" />
              {t('advantages.title')}
            </span>
          </motion.div>

          {/* Advantages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((advantage, index) => (
              <motion.div
                key={advantage.key}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative p-6 md:p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center h-full">
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto rounded-2xl ${advantage.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <advantage.icon className={`w-8 h-8 ${advantage.color}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold mb-3">
                    {t(`advantages.${advantage.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`advantages.${advantage.key}.description`)}
                  </p>

                  {/* Number Badge */}
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-muted">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center"
                  >
                    <Star className="w-3 h-3 text-primary" />
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
               {t('advantages.trusted')}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
