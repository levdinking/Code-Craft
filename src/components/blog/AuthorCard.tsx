import { useTranslation } from 'react-i18next';
import { Calendar, Clock } from 'lucide-react';

interface AuthorCardProps {
  author: string;
  date: string;
  readTime: string;
}

export function AuthorCard({ author, date, readTime }: AuthorCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
          {author.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{author}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {t('blog.authorBio')}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'de' ? 'de-DE' : 'en-US')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {readTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}