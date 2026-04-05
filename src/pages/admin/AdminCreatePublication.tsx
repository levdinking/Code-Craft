import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Film,
  Loader2,
} from 'lucide-react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { usePipelinePolling } from '@/hooks/usePipelinePolling';
import { PipelineView } from '@/components/admin/PipelineView';
import { SocialNetworkSelector } from '@/components/admin/SocialNetworkSelector';
import type { PublicationType, SocialPostSubType, SocialNetwork, PipelineJob } from '@/types/admin';

const TYPES: { value: PublicationType; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'article', label: 'Статья', icon: FileText, desc: 'Блог-пост на 3 языках с обложкой' },
  { value: 'social-post', label: 'Пост в соцсети', icon: MessageSquare, desc: 'Текст + изображение или видео' },
  { value: 'story', label: 'Сторис', icon: Film, desc: 'Визуальный контент для сторис' },
];

const SUB_TYPES: { value: SocialPostSubType; label: string; desc: string }[] = [
  { value: 'text-image', label: 'Текст + Изображение', desc: 'Пост с картинкой' },
  { value: 'video', label: 'Видео', desc: 'Пост с видеороликом' },
];

export function AdminCreatePublication() {
  const [step, setStep] = useState<'type' | 'config' | 'pipeline'>('type');
  const [pubType, setPubType] = useState<PublicationType | null>(null);
  const [subType, setSubType] = useState<SocialPostSubType>('text-image');
  const [topic, setTopic] = useState('');
  const [networks, setNetworks] = useState<SocialNetwork[]>(['telegram', 'vk', 'facebook', 'instagram', 'youtube']);
  const [jobId, setJobId] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [promptModal, setPromptModal] = useState<{ stepIndex: number; prompt: string } | null>(null);

  const { post } = useAdminApi();
  const { job } = usePipelinePolling(jobId);
  const navigate = useNavigate();
  const { lang } = useParams();

  const handleStartPipeline = async () => {
    if (!pubType || !topic.trim()) return;
    try {
      const result = await post<PipelineJob>('/api/pipeline/start', {
        type: pubType,
        subType: pubType === 'social-post' ? subType : undefined,
        topic: topic.trim(),
        targetNetworks: networks,
      });
      setJobId(result.id);
      setStep('pipeline');
    } catch (err) {
      console.error('Ошибка запуска:', err);
    }
  };

  const handleExecuteStep = async () => {
    if (!jobId) return;
    setExecuting(true);
    try {
      const customPrompt = promptModal?.prompt || undefined;
      await post(`/api/pipeline/jobs/${jobId}/execute`, { customPrompt });
      setPromptModal(null);
    } catch (err) {
      console.error('Ошибка выполнения:', err);
    } finally {
      setExecuting(false);
    }
  };

  const handleSkipStep = async () => {
    if (!jobId) return;
    try {
      await post(`/api/pipeline/jobs/${jobId}/skip`);
    } catch (err) {
      console.error('Ошибка пропуска:', err);
    }
  };

  const handleEditPrompt = (stepIndex: number) => {
    const pipelineStep = (job || { steps: [] }).steps[stepIndex];
    setPromptModal({
      stepIndex,
      prompt: pipelineStep?.customPrompt || '',
    });
  };

  const currentJob = job;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/${lang}/admin/publications`)}
          className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Создать публикацию</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {step === 'type' && 'Выберите тип контента'}
            {step === 'config' && 'Настройте параметры'}
            {step === 'pipeline' && 'Конвейер создания'}
          </p>
        </div>
      </div>

      {/* Шаг 1: Выбор типа */}
      {step === 'type' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TYPES.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              onClick={() => {
                setPubType(value);
                setStep('config');
              }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Шаг 2: Конфигурация */}
      {step === 'config' && pubType && (
        <div className="max-w-xl space-y-6">
          {/* Подтип для соцпостов */}
          {pubType === 'social-post' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Формат поста</label>
              <div className="grid grid-cols-2 gap-3">
                {SUB_TYPES.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => setSubType(value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      subType === value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Тема */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Тема / описание</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              className="w-full bg-background border border-border rounded-lg p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="О чём будет публикация?"
            />
          </div>

          {/* Соцсети */}
          <SocialNetworkSelector
            selected={networks}
            onChange={setNetworks}
          />

          {/* Кнопки */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('type')}
              className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
            >
              Назад
            </button>
            <button
              onClick={handleStartPipeline}
              disabled={!topic.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Запустить конвейер
            </button>
          </div>
        </div>
      )}

      {/* Шаг 3: Конвейер */}
      {step === 'pipeline' && currentJob && (
        <div className="max-w-2xl space-y-6">
          {/* Информация о задаче */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{currentJob.topic}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {TYPES.find(t => t.value === currentJob.publicationType)?.label}
                  {currentJob.subType && ` / ${SUB_TYPES.find(s => s.value === currentJob.subType)?.label}`}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                currentJob.status === 'running' ? 'bg-blue-500/10 text-blue-500' :
                currentJob.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                currentJob.status === 'error' ? 'bg-red-500/10 text-red-500' :
                'bg-gray-500/10 text-gray-500'
              }`}>
                {currentJob.status === 'running' ? 'Выполняется' :
                 currentJob.status === 'completed' ? 'Завершено' :
                 currentJob.status === 'error' ? 'Ошибка' :
                 currentJob.status === 'cancelled' ? 'Отменено' : currentJob.status}
              </span>
            </div>
          </div>

          {/* Визуальный конвейер */}
          <PipelineView
            steps={currentJob.steps}
            currentStep={currentJob.currentStep}
            onExecute={handleExecuteStep}
            onSkip={handleSkipStep}
            onEditPrompt={handleEditPrompt}
            executing={executing}
          />

          {/* Модальное окно редактирования промпта */}
          {promptModal && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-medium">Изменить промпт для шага</h4>
              <textarea
                value={promptModal.prompt}
                onChange={(e) => setPromptModal({ ...promptModal, prompt: e.target.value })}
                rows={5}
                className="w-full bg-background border border-border rounded-lg p-3 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Введите свой промпт (оставьте пустым для дефолтного)"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPromptModal(null)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleExecuteStep}
                  disabled={executing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {executing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Выполнить с этим промптом
                </button>
              </div>
            </div>
          )}

          {/* Кнопка «К публикациям» после завершения */}
          {(currentJob.status === 'completed' || currentJob.status === 'error') && (
            <button
              onClick={() => navigate(`/${lang}/admin/publications`)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
            >
              К списку публикаций
            </button>
          )}
        </div>
      )}

      {/* Загрузка при запуске конвейера */}
      {step === 'pipeline' && !currentJob && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
