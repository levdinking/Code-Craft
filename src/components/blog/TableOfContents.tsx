import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { List } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string>('');

  const items = useMemo<TOCItem[]>(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');
    
    return Array.from(headings).map((heading) => ({
      id: heading.id || heading.textContent?.toLowerCase().replace(/\s+/g, '-') || '',
      text: heading.textContent || '',
      level: parseInt(heading.tagName[1])
    }));
  }, [content]);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -80% 0%' }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50 sticky top-24">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <List className="w-5 h-5" />
        {t('blog.tableOfContents')}
      </h3>
      <nav className="space-y-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`block text-sm transition-colors hover:text-primary ${
              item.level === 3 ? 'pl-4' : ''
            } ${
              activeId === item.id 
                ? 'text-primary font-medium' 
                : 'text-muted-foreground'
            }`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
}