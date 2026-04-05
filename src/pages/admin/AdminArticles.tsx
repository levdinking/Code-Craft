import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Sparkles,
  Loader2,
  CheckCircle,
  Clock,
  PenTool,
  Image,
  Upload,
  Share2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAdminApi } from '@/hooks/useAdminApi';
import type { AdminArticle, ArticleTopic, ArticlesResponse } from '@/types/admin';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Ожидание', color: 'bg-gray-500/10 text-gray-500', icon: Clock },
  writing: { label: 'Написание...', color: 'bg-amber-500/10 text-amber-500', icon: PenTool },
  written: { label: 'Написано', color: 'bg-blue-500/10 text-blue-500', icon: FileText },
  published: { label: 'Опубликовано', color: 'bg-green-500/10 text-green-500', icon: CheckCircle },
  posted: { label: 'В соцсетях', color: 'bg-purple-500/10 text-purple-500', icon: Share2 },
};

const PIPELINE_STEPS = [
  { key: 'pending', label: 'Темы' },
  { key: 'writing', label: 'Написание' },
  { key: 'written', label: 'Готово' },
  { key: 'published', label: 'На сайте' },
  { key: 'posted', label: 'Соцсети' },
];

export function AdminArticles() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [topics, setTopics] = useState<ArticleTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { get, post } = useAdminApi();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get<ArticlesResponse>('/api/articles');
      setArticles(data.articles);
      setTopics(data.topics);
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => { loadData(); }, []);

  // Pipeline counts
  const pipelineCounts: Record<string, number> = {
    pending: topics.filter(t => t.status === 'pending').length,
    writing: topics.filter(t => t.status === 'writing').length,
    written: articles.filter(a => a.status === 'written').length + topics.filter(t => t.status === 'written').length,
    published: articles.filter(a => a.status === 'published' && !a.postedToSocial).length,
    posted: articles.filter(a => a.postedToSocial).length,
  };

  const handleGenerateTopics = async () => {
    setActionLoading('generate-topics');
    try {
      await post('/api/articles/generate-topics', { count: 5 });
      await loadData();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleWriteArticle = async (topicId: string) => {
    setActionLoading(`write-${topicId}`);
    try {
      await post(`/api/articles/write/${topicId}`);
      await loadData();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateImage = async (articleId: string) => {
    setActionLoading(`image-${articleId}`);
    try {
      await post(`/api/articles/generate-image/${articleId}`);
      await loadData();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (articleId: string) => {
    setActionLoading(`publish-${articleId}`);
    try {
      await post(`/api/articles/publish/${articleId}`);
      await loadData();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePostSocial = async (articleId: string) => {
    setActionLoading(`social-${articleId}`);
    try {
      await post(`/api/social/post/${articleId}`);
      await loadData();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Статьи</h1>
          <p className="text-muted-foreground text-sm mt-1">Управление конвейером контента</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleGenerateTopics}
            disabled={!!actionLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {actionLoading === 'generate-topics' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Сгенерировать темы
          </button>
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Конвейер</h2>
        <div className="flex items-center gap-2">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.key} className="flex items-center gap-2 flex-1">
              <div className={`flex-1 rounded-lg p-3 text-center ${pipelineCounts[step.key] > 0 ? 'bg-primary/10' : 'bg-muted'}`}>
                <p className="text-2xl font-bold">{pipelineCounts[step.key]}</p>
                <p className="text-xs text-muted-foreground mt-1">{step.label}</p>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div className="text-muted-foreground/30 text-lg">&rarr;</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Topics */}
      {topics.filter(t => t.status === 'pending' || t.status === 'writing').length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Ожидающие темы</h2>
          <div className="grid gap-3">
            {topics.filter(t => t.status === 'pending' || t.status === 'writing').map(topic => {
              const cfg = STATUS_CONFIG[topic.status] || STATUS_CONFIG.pending;
              return (
                <div key={topic.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.color}`}>
                      <cfg.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{topic.topic}</p>
                      <p className="text-xs text-muted-foreground">{topic.category} &middot; {topic.suggestedTags.slice(0, 3).join(', ')}</p>
                    </div>
                  </div>
                  {topic.status === 'pending' && (
                    <button
                      onClick={() => handleWriteArticle(topic.id)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === `write-${topic.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <PenTool className="w-3 h-3" />}
                      Написать
                    </button>
                  )}
                  {topic.status === 'writing' && (
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <Loader2 className="w-3 h-3 animate-spin" /> Написание...
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Articles Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Все статьи</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Статей пока нет. Сначала сгенерируйте темы!</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase p-3">Заголовок</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase p-3 hidden md:table-cell">Дата</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase p-3 hidden lg:table-cell">Категория</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase p-3">Статус</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase p-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                {articles.map(article => {
                  const statusKey = article.postedToSocial ? 'posted' : article.status;
                  const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.written;
                  return (
                    <tr key={article.id} className="border-b border-border/50 last:border-0">
                      <td className="p-3">
                        <p className="font-medium text-sm">{article.title.ru || article.title.en || article.id}</p>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{article.date}</span>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className="text-xs px-2 py-1 rounded-full bg-muted">{article.category}</span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${cfg.color}`}>
                          <cfg.icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleGenerateImage(article.id)}
                            disabled={!!actionLoading}
                            className="p-1.5 rounded-md hover:bg-muted transition-colors"
                            title="Сгенерировать изображение"
                          >
                            {actionLoading === `image-${article.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Image className="w-3.5 h-3.5" />}
                          </button>
                          {article.status !== 'published' && !article.postedToSocial && (
                            <button
                              onClick={() => handlePublish(article.id)}
                              disabled={!!actionLoading}
                              className="p-1.5 rounded-md hover:bg-muted transition-colors"
                              title="Собрать и опубликовать"
                            >
                              {actionLoading === `publish-${article.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          {!article.postedToSocial && article.status === 'published' && (
                            <button
                              onClick={() => handlePostSocial(article.id)}
                              disabled={!!actionLoading}
                              className="p-1.5 rounded-md hover:bg-muted transition-colors"
                              title="Отправить в соцсети"
                            >
                              {actionLoading === `social-${article.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
