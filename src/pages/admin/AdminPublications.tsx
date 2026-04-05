import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus,
  RefreshCw,
  Trash2,
  Send,
  FileText,
  MessageSquare,
  Film,
  Filter,
} from 'lucide-react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { SocialNetworkBadges } from '@/components/admin/SocialNetworkSelector';
import type { Publication, PublicationType, PublicationsResponse } from '@/types/admin';

const TYPE_LABELS: Record<PublicationType, { label: string; icon: React.ElementType; color: string }> = {
  article: { label: 'Статья', icon: FileText, color: 'bg-blue-500/10 text-blue-500' },
  'social-post': { label: 'Соцпост', icon: MessageSquare, color: 'bg-purple-500/10 text-purple-500' },
  story: { label: 'Сторис', icon: Film, color: 'bg-pink-500/10 text-pink-500' },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Черновик', color: 'bg-gray-500/10 text-gray-500' },
  ready: { label: 'Готово', color: 'bg-amber-500/10 text-amber-500' },
  publishing: { label: 'Публикуется...', color: 'bg-blue-500/10 text-blue-500' },
  published: { label: 'Опубликовано', color: 'bg-green-500/10 text-green-500' },
  error: { label: 'Ошибка', color: 'bg-red-500/10 text-red-500' },
};

export function AdminPublications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PublicationType | 'all'>('all');
  const { get, post, del } = useAdminApi();
  const navigate = useNavigate();
  const { lang } = useParams();

  const loadPublications = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?type=${filter}` : '';
      const data = await get<PublicationsResponse>(`/api/publications${params}`);
      setPublications(data.publications);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPublications(); }, [filter]);

  const handlePublish = async (pub: Publication) => {
    try {
      await post(`/api/publications/${pub.id}/publish`, {
        networks: pub.targetNetworks,
      });
      loadPublications();
    } catch (err) {
      console.error('Ошибка публикации:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить публикацию?')) return;
    try {
      await del(`/api/publications/${id}`);
      loadPublications();
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Публикации</h1>
          <p className="text-muted-foreground text-sm mt-1">Все типы контента в одном месте</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadPublications}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
          <button
            onClick={() => navigate(`/${lang}/admin/publications/create`)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Создать
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {(['all', 'article', 'social-post', 'story'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'border border-border hover:bg-muted'
            }`}
          >
            {f === 'all' ? 'Все' : TYPE_LABELS[f].label}
          </button>
        ))}
      </div>

      {/* Таблица */}
      {publications.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <p className="text-muted-foreground">Публикаций пока нет. Создайте первую!</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase p-4">Тип</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase p-4">Тема</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase p-4">Соцсети</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase p-4">Статус</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase p-4">Дата</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase p-4">Действия</th>
              </tr>
            </thead>
            <tbody>
              {publications.map((pub) => {
                const typeInfo = TYPE_LABELS[pub.type] || TYPE_LABELS.article;
                const TypeIcon = typeInfo.icon;
                const statusInfo = STATUS_LABELS[pub.status] || STATUS_LABELS.draft;

                return (
                  <tr key={pub.id} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${typeInfo.color}`}>
                        <TypeIcon className="w-3 h-3" />
                        {typeInfo.label}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium truncate max-w-[300px]">{pub.topic}</p>
                    </td>
                    <td className="p-4">
                      <SocialNetworkBadges networks={pub.publishedNetworks.length > 0 ? pub.publishedNetworks : pub.targetNetworks} />
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(pub.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {pub.status === 'ready' && (
                          <button
                            onClick={() => handlePublish(pub)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            title="Опубликовать"
                          >
                            <Send className="w-4 h-4 text-green-500" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(pub.id)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
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
  );
}
