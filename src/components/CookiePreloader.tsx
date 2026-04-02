import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function CookiePreloader({ onAccept, onDecline }: CookieConsentProps) {
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    setIsVisible(false);
    setTimeout(onAccept, 300);
  };

  const handleDecline = () => {
    setIsVisible(false);
    setTimeout(onDecline, 300);
  };

  const lang = i18n.language as 'de' | 'en' | 'ru';

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
        >
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <Cookie className="w-20 h-20 text-primary" strokeWidth={1.5} />
            
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary/60 rounded-full"
                initial={{ scale: 0, x: 40, y: 40 }}
                animate={{
                  scale: [0, 1, 0],
                  x: [40, 40 + Math.cos(i * 60 * Math.PI / 180) * 60],
                  y: [40, 40 + Math.sin(i * 60 * Math.PI / 180) * 60],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeOut"
                }}
                style={{ left: 0, top: 0 }}
              />
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-1/3 text-muted-foreground text-sm"
          >
            {t('cookie.loading')}
          </motion.p>
        </motion.div>
      )}

      {isVisible && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-card border border-border/50 rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />

            <button
              onClick={handleDecline}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
            >
              <Cookie className="w-10 h-10 text-primary" />
            </motion.div>

            <h2 className="text-2xl font-bold text-center mb-3">
              {t('cookie.title')}
            </h2>

            <p className="text-muted-foreground text-center mb-6 leading-relaxed">
              {t('cookie.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAccept}
                className="flex-1 gap-2"
                size="lg"
              >
                <Check className="w-4 h-4" />
                {t('cookie.accept')}
              </Button>
              <Button
                onClick={handleDecline}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                {t('cookie.decline')}
              </Button>
            </div>

            <p className="text-center mt-4 text-xs text-muted-foreground">
              {t('cookie.moreInfo')}{' '}
              <a href={`/${lang}/privacy`} className="text-primary hover:underline">
                {t('cookie.privacyLink')}
              </a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}