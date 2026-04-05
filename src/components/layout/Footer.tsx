import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Send,
  Instagram, 
  Facebook, 
  Mail,
} from 'lucide-react';

function VKIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.673 4 8.231c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
    </svg>
  );
}

export function Footer() {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();
  const lang = i18n.language as 'de' | 'en' | 'ru';

  const socialLinks = [
    { 
      icon: Send, 
      href: 'https://t.me/PavelLevdin',
      label: 'Telegram',
      color: 'hover:text-[#0088cc] hover:bg-[#0088cc]/10'
    },
    { 
      icon: Instagram, 
      href: 'https://instagram.com/твой_ник',
      label: 'Instagram',
      color: 'hover:text-[#E4405F] hover:bg-[#E4405F]/10'
    },
    { 
      icon: Facebook, 
      href: 'https://facebook.com/твой_профиль',
      label: 'Facebook',
      color: 'hover:text-[#1877F2] hover:bg-[#1877F2]/10'
    },
    { 
      icon: VKIcon, 
      href: 'https://vk.com/твой_ник',
      label: 'VKontakte',
      color: 'hover:text-[#4C75A3] hover:bg-[#4C75A3]/10'
    },
    { 
      icon: Mail, 
      href: 'mailto:levdin.pavel@yandex.ru', 
      label: 'Email',
      color: 'hover:text-primary hover:bg-primary/10'
    },
  ];

  const navLinks = [
    { path: `/${lang}`, label: t('nav.home') },
    { path: `/${lang}/portfolio`, label: t('nav.portfolio') },
    { path: `/${lang}/services`, label: t('nav.services') },
    { path: `/${lang}/blog`, label: t('nav.blog', 'Блог') },
    { path: `/${lang}/contact`, label: t('nav.contact') },
  ];

  const legalLinks = [
    { path: `/${lang}/imprint`, label: t('footer.imprint') },
    { path: `/${lang}/privacy`, label: t('footer.privacy') },
  ];

  const madeWithText = t('footer.madeWith');

  return (
    <footer className="bg-muted/50 border-t">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand — ИСПРАВЛЕНО: убран hidden sm:inline, добавлен адаптивный размер шрифта */}
          <div className="space-y-4 md:col-span-1">
            <Link to={`/${lang}`} className="flex items-center space-x-3 min-w-0">
              <img 
                src="/og-image.png"
                alt="PL" 
                className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0"
              />
              <span className="text-foreground/80 truncate text-lg md:text-[22px]" style={{ fontWeight: 700 }}>
                Code & Craft
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t('hero.subtitle')}
            </p>
            <div className="flex items-center space-x-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 rounded-full bg-background transition-all duration-300 ${link.color}`}
                  aria-label={link.label}
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
              {t('footer.navigation', 'Navigation')}
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
              {t('contact.title')}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://t.me/PavelLevdin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0088cc] transition-colors"
                >
                  Telegram: @PavelLevdin
                </a>
              </li>
              <li>
                <a
                  href="mailto:levdin.pavel@yandex.ru"
                  className="hover:text-foreground transition-colors"
                >
                  Email: levdin.pavel@yandex.ru
                </a>
              </li>
              <li>
                <span className="text-foreground/60">WhatsApp: +49 176 43141306</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
              {t('footer.legal', 'Legal')}
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Code & Craft {t('footer.rights', 'All rights reserved')}
            <Link to={`/${lang}/admin`} className="text-muted-foreground hover:text-muted-foreground" aria-hidden="true">.</Link>
          </p>
          <p className="text-sm text-muted-foreground">
            {madeWithText}
          </p>
        </div>
      </div>
    </footer>
  );
}