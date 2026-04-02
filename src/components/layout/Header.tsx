import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../ui-custom/ThemeToggle';
import { LanguageSwitcher } from '../ui-custom/LanguageSwitcher';
import { Button } from '@/components/ui/button';

export function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Получаем текущий язык
  const lang = i18n.language as 'de' | 'en' | 'ru';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Пути с языком
  const navItems = [
    { path: `/${lang}`, label: t('nav.home') },
    { path: `/${lang}/portfolio`, label: t('nav.portfolio') },
    { path: `/${lang}/services`, label: t('nav.services') },
    { path: `/${lang}/blog`, label: t('nav.blog', 'Блог') },
    { path: `/${lang}/contact`, label: t('nav.contact') },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo — ИСПРАВЛЕНО: адаптивный размер шрифта */}
          <Link to={`/${lang}`} className="flex items-center space-x-3 min-w-0">
            <img src="/og-image.png" alt="PL" className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0" />
            <span className="text-foreground/80 truncate text-lg md:text-[22px]" style={{ fontWeight: 700 }}>
              Code & Craft
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  isActive(item.path) ? 'text-primary' : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button — ИСПРАВЛЕНО: добавили LanguageSwitcher */}
          <div className="flex md:hidden items-center space-x-2">
            <LanguageSwitcher />  {/* ← ДОБАВЛЕНО */}
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu — ИСПРАВЛЕНО: добавили LanguageSwitcher в меню */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-lg border-t"
          >
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 text-base font-medium rounded-lg ${
                    isActive(item.path) ? 'bg-primary/10 text-primary' : 'text-foreground/70'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {/* ← ДОБАВЛЕНО: LanguageSwitcher в мобильном меню */}
              <div className="pt-4 border-t border-border/50">
                <p className="px-4 text-xs text-muted-foreground mb-2">{t('nav.language', 'Language')}</p>
                <div className="px-4">
                  <LanguageSwitcher />
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}