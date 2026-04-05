import { useState } from 'react';
import { Send, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { SocialNetworkSelector } from '@/components/admin/SocialNetworkSelector';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { PlatformPreview } from '@/components/admin/PlatformPreview';
import { PublishProgress } from '@/components/admin/PublishProgress';
import type { SocialNetwork } from '@/types/admin';

type PublishStage = 'compose' | 'preview' | 'publishing' | 'done';

export function AdminManualPublish() {
  const { lang } = useParams();
  const navigate = useNavigate();
  const { post } = useAdminApi();

  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [networks, setNetworks] = useState<SocialNetwork[]>(['telegram', 'vk', 'facebook', 'instagram', 'youtube']);
  const [viralOptimize, setViralOptimize] = useState(true);
  const [optimizedTexts, setOptimizedTexts] = useState<Record<string, unknown> | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<Record<string, { success: boolean; error?: string }>>({});
  const [stage, setStage] = useState<PublishStage>('compose');
  const [error, setError] = useState<string | null>(null);

  const handleMediaUpload = (url: string, type: 'image' | 'video') => {
    setMediaUrl(url);
    setMediaType(type);
  };

  const handleOptimize = async () => {
    if (!text.trim() || networks.length === 0) return;
    setOptimizing(true);
    setError(null);
    try {
      const result = await post<Record<string, unknown>>('/api/publications/optimize', {
        text: text.trim(),
        platforms: networks,
        contentType: 'social-post',
        mediaType: mediaType || 'none',
      });
      setOptimizedTexts(result);
      setStage('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка оптимизации');
    } finally {
      setOptimizing(false);
    }
  };

  const handlePublish = async () => {
    if (!text.trim() || networks.length === 0) return;
    setStage('publishing');
    setPublishing(true);
    setPublishResults({});
    setError(null);

    try {
      const result = await post<{
        publication: unknown;
        report: { steps: Array<{ step: string; success: boolean; data?: Record<string, { success: boolean; error?: string }> }> };
      }>('/api/publications/manual-publish', {
        text: text.trim(),
        mediaUrl,
        mediaType,
        networks,
        optimize: viralOptimize,
        contentType: 'social-post',
      });

      // Извлекаем результаты по сетям
      const socialStep = result.report?.steps?.find(s => s.step === 'social-publish');
      if (socialStep?.data) {
        setPublishResults(socialStep.data);
      }
      setStage('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка публикации');
      setStage('compose');
    } finally {
      setPublishing(false);
    }
  };

  const resetForm = () => {
    setText('');
    setMediaUrl(null);
    setMediaType(null);
    setOptimizedTexts(null);
    setPublishResults({});
    setStage('compose');
    setError(null);
  };

  const canPublish = text.trim().length > 0 && networks.length > 0;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/${lang}/admin/dashboard`)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Ручная публикация</h1>
          <p className="text-sm text-muted-foreground">Опубликуйте контент в соцсети напрямую</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Левая колонка: Контент */}
        <div className="space-y-4">
          {/* Текст */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Текст публикации</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Введите текст поста..."
              rows={8}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
              disabled={stage === 'publishing'}
            />
            <div className="text-xs text-muted-foreground text-right">{text.length} символов</div>
          </div>

          {/* Медиа */}
          <MediaUploader onUpload={handleMediaUpload} />

          {/* Соцсети */}
          <SocialNetworkSelector
            selected={networks}
            onChange={setNetworks}
          />

          {/* Вирусная оптимизация */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={viralOptimize}
                onChange={(e) => setViralOptimize(e.target.checked)}
                className="sr-only peer"
                disabled={stage === 'publishing'}
              />
              <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
            <div>
              <span className="text-sm font-medium">Вирусная оптимизация</span>
              <p className="text-xs text-muted-foreground">ИИ адаптирует текст под каждую платформу</p>
            </div>
          </div>
        </div>

        {/* Правая колонка: Превью и действия */}
        <div className="space-y-4">
          {/* Кнопки действий */}
          <div className="flex gap-2">
            {viralOptimize && stage === 'compose' && (
              <button
                onClick={handleOptimize}
                disabled={!canPublish || optimizing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                {optimizing ? 'Оптимизация...' : 'Предпросмотр'}
              </button>
            )}
            <button
              onClick={handlePublish}
              disabled={!canPublish || publishing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              {publishing ? 'Публикация...' : 'Опубликовать'}
            </button>
            {stage === 'done' && (
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
              >
                Новая публикация
              </button>
            )}
          </div>

          {/* Ошибка */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Превью */}
          {optimizedTexts && Object.keys(optimizedTexts).length > 0 && (
            <PlatformPreview
              texts={optimizedTexts as Record<string, { text?: string; hashtags?: string[] }>}
              mediaUrl={mediaUrl || undefined}
              mediaType={mediaType || undefined}
            />
          )}

          {/* Прогресс публикации */}
          {(stage === 'publishing' || stage === 'done') && (
            <PublishProgress
              networks={networks}
              results={publishResults}
              publishing={publishing}
            />
          )}
        </div>
      </div>
    </div>
  );
}
