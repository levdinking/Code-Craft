import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { BlogTag } from '@/types/blog';

interface TagCloudProps {
  tags: BlogTag[];
  activeTag?: string;
}

export function TagCloud({ tags, activeTag }: TagCloudProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  // Сортируем по популярности для размера
  const sortedTags = [...tags].sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...tags.map(t => t.count));
  const minCount = Math.min(...tags.map(t => t.count));

  const getSize = (count: number) => {
    const normalized = (count - minCount) / (maxCount - minCount || 1);
    if (normalized > 0.8) return 'text-lg px-4 py-2';
    if (normalized > 0.5) return 'text-base px-3 py-1.5';
    if (normalized > 0.2) return 'text-sm px-3 py-1';
    return 'text-xs px-2 py-1';
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <h3 className="text-lg font-semibold mb-4">{t('blog.tagCloud')}</h3>
      <div className="flex flex-wrap gap-2">
        {sortedTags.map((tag) => (
          <Link
            key={tag.id}
            to={`/${lang}/blog/tag/${tag.slug}`}
            className={`rounded-full transition-all duration-200 ${
              activeTag === tag.slug
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-primary/10 hover:text-primary'
            } ${getSize(tag.count)}`}
          >
            {tag.name}
            <span className="ml-1 opacity-60">({tag.count})</span>
          </Link>
        ))}
      </div>
    </div>
  );
}