import { useState, useEffect } from 'react';
import { Send, CheckCircle, Clock, Loader2, RefreshCw } from 'lucide-react';
import { useAdminApi } from '@/hooks/useAdminApi';
import type { SocialStatus } from '@/types/admin';

export function AdminSocial() {
  const [articles, setArticles] = useState<SocialStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { get, post } = useAdminApi();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await get<{ articles: SocialStatus[] }>('/api/social/status');
      setArticles(data.articles);
    } catch (err) {
      console.error('Failed to load social status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handlePost = async (articleId: string) => {
    setActionLoading(articleId);
    try {
      await post(`/api/social/post/${articleId}`);
      await loadData();
    } catch (err) {
      alert(`Ошибка: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const posted = articles.filter(a => a.posted);
  const notPosted = articles.filter(a => !a.posted);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Социальные сети</h1>
          <p className="text-muted-foreground text-sm mt-1">Управление публикациями в соцсетях</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Опубликовано</span>
          </div>
          <p className="text-2xl font-bold">{posted.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">Не опубликовано</span>
          </div>
          <p className="text-2xl font-bold">{notPosted.length}</p>
        </div>
      </div>

      {/* Not posted */}
      {notPosted.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Готово к публикации</h2>
          <div className="grid gap-3">
            {notPosted.map(article => (
              <div key={article.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{article.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">/{article.slug}</p>
                </div>
                <button
                  onClick={() => handlePost(article.id)}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === article.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Опубликовать
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Already posted */}
      {posted.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Уже опубликовано</h2>
          <div className="grid gap-3">
            {posted.map(article => (
              <div key={article.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between opacity-70">
                <div>
                  <p className="font-medium text-sm">{article.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Опубликовано: {article.sentDate ? new Date(article.sentDate).toLocaleDateString('ru-RU') : 'Неизвестно'}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
