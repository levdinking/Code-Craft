import { useTranslation } from 'react-i18next';
import { Send, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NewsletterCTA() {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-8 border border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-primary/10 text-primary">
          <Send className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">{t('blog.telegram.title')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('blog.telegram.description')}
          </p>
          
          <Button asChild className="gap-2">
            <a 
              href="https://t.me/your_channel" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {t('blog.telegram.button')}
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}