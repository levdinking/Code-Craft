import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { languages } from '@/i18n';

interface LanguageSwitcherProps {
  isMobile?: boolean;
}

export function LanguageSwitcher({ isMobile = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentLang = i18n.language;

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    
    const currentPath = location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/(de|en|ru)(\/|$)/, '/');
    const finalPath = `/${langCode}${pathWithoutLang}`;
    
    navigate(finalPath);
  };

  if (isMobile) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground/70 px-4">
          {t('language.title')}
        </p>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`w-full flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg transition-colors ${
              currentLang === lang.code
                ? 'bg-primary/10 text-primary'
                : 'text-foreground/70 hover:text-foreground hover:bg-accent'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
            {currentLang === lang.code && <Check className="h-4 w-4" />}
          </button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
            {currentLang === lang.code && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}