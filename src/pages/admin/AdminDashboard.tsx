import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileText,
  Eye,
  FilePenLine,
  Share2,
  RefreshCw,
  Layers,
  Plus,
  Settings,
  Send,
} from 'lucide-react';
import { useAdminApi } from '@/hooks/useAdminApi';
import type { AdminStats } from '@/types/admin';

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number | string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { get } = useAdminApi();
  const navigate = useNavigate();
  const { lang } = useParams();

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await get<AdminStats>('/api/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Панель управления</h1>
          <p className="text-muted-foreground text-sm mt-1">Обзор контента и активности</p>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Всего статей" value={stats.totalArticles} color="bg-blue-500/10 text-blue-500" />
          <StatCard icon={Eye} label="Опубликовано" value={stats.publishedCount} color="bg-green-500/10 text-green-500" />
          <StatCard icon={FilePenLine} label="Черновики" value={stats.draftCount} color="bg-amber-500/10 text-amber-500" />
          <StatCard icon={Share2} label="В соцсетях" value={stats.postedToSocialCount} color="bg-purple-500/10 text-purple-500" />
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate(`/${lang}/admin/publications/create`)}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Создать публикацию</p>
              <p className="text-xs text-muted-foreground">Статья, пост, сторис</p>
            </div>
          </button>

          <button
            onClick={() => navigate(`/${lang}/admin/publish`)}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Ручная публикация</p>
              <p className="text-xs text-muted-foreground">Опубликовать в соцсети</p>
            </div>
          </button>

          <button
            onClick={() => navigate(`/${lang}/admin/articles`)}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Статьи</p>
              <p className="text-xs text-muted-foreground">Генерация с ИИ</p>
            </div>
          </button>

          <button
            onClick={() => navigate(`/${lang}/admin/publications`)}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Все публикации</p>
              <p className="text-xs text-muted-foreground">Статьи, посты, сторис</p>
            </div>
          </button>

          <button
            onClick={() => navigate(`/${lang}/admin/settings`)}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Настройки</p>
              <p className="text-xs text-muted-foreground">Соцсети и промпты</p>
            </div>
          </button>
        </div>
      </div>

      {/* Last Published */}
      {stats?.lastPublishedDate && (
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Последняя публикация</p>
          <p className="text-lg font-medium mt-1">{new Date(stats.lastPublishedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      )}
    </div>
  );
}
