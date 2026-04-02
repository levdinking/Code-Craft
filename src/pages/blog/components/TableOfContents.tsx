import { useMemo } from 'react';
import { List } from 'lucide-react';

export default function TableOfContents({ content }: { content: string }) {
  const items = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    const seen = new Set<string>(); // отслеживаем дубликаты
    
    return Array.from(doc.querySelectorAll('h2, h3')).map((h, index) => {
      // Генерируем базовый id
      let baseId = h.id || h.textContent
        ?.toLowerCase()
        .trim()
        .replace(/[^\w\s-]+/g, '')  // убрали дефис из исключений!
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '')     // обрезаем крайние дефисы
        .replace(/-+/g, '-') || '';  // сжимаем множественные дефисы
      
      // Если пустой — используем индекс
      if (!baseId) {
        baseId = `heading-${index}`;
      }
      
      // Добавляем суффикс для дубликатов
      let id = baseId;
      let counter = 1;
      while (seen.has(id)) {
        id = `${baseId}-${counter}`;
        counter++;
      }
      seen.add(id);
      
      return {
        id,
        text: h.textContent || '',
        level: parseInt(h.tagName[1])
      };
    }).filter(item => item.text); // фильтруем только по тексту, не по id
  }, [content]);
  
  if (items.length === 0) return null;
  
  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <List className="w-5 h-5 text-primary" />
        Содержание
      </h3>
      <nav className="space-y-1">
        {items.map((item, index) => (
          <a 
            key={`${item.id}-${index}`}  // гарантированно уникальный ключ
            href={`#${item.id}`} 
            className={`block text-sm py-1.5 px-2 rounded hover:bg-muted transition-colors ${
              item.level === 3 ? 'pl-6 text-muted-foreground' : 'text-foreground font-medium'
            }`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
}