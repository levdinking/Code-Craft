import { Link, useLocation, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Share2,
  LogOut,
  ExternalLink,
  Layers,
  Settings,
  Send,
} from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { ThemeToggle } from '@/components/ui-custom/ThemeToggle';

const navItems = [
  { key: 'dashboard', icon: LayoutDashboard, label: 'Панель' },
  { key: 'publish', icon: Send, label: 'Публикация' },
  { key: 'publications', icon: Layers, label: 'Публикации' },
  { key: 'articles', icon: FileText, label: 'Статьи' },
  { key: 'social', icon: Share2, label: 'Соцсети' },
  { key: 'analytics', icon: BarChart3, label: 'Аналитика' },
  { key: 'settings', icon: Settings, label: 'Настройки' },
];

export function AdminSidebar() {
  const { lang } = useParams();
  const location = useLocation();
  const { logout } = useAdmin();

  const currentPath = location.pathname;

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link to={`/${lang}`} className="flex items-center gap-2">
          <img src="/og-image.png" alt="PL" className="w-8 h-8" />
          <div>
            <span className="font-bold text-sm">Админ-панель</span>
            <p className="text-xs text-muted-foreground">Code & Craft</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const path = `/${lang}/admin/${item.key}`;
          const isActive = currentPath === path || currentPath.startsWith(path + '/');
          return (
            <Link
              key={item.key}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border space-y-1">
        <Link
          to={`/${lang}`}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          На сайт
        </Link>
        <div className="flex items-center justify-between px-3 py-2">
          <ThemeToggle />
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Выход
          </button>
        </div>
      </div>
    </aside>
  );
}
