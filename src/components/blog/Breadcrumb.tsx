import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground">
        <li>
          <Link 
            to={`/${lang}`} 
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">{t('nav.home')}</span>
          </Link>
        </li>
        
        <li>
          <ChevronRight className="w-4 h-4" />
        </li>
        
        <li>
          <Link 
            to={`/${lang}/blog`} 
            className="hover:text-foreground transition-colors"
          >
            {t('nav.blog')}
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index} className="contents">
            <ChevronRight className="w-4 h-4" />
            {item.href ? (
              <Link 
                to={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}