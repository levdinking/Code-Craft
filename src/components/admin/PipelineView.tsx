import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  SkipForward,
  Play,
  Edit3,
} from 'lucide-react';
import type { PipelineStep } from '@/types/admin';

const STATUS_ICONS = {
  pending: Circle,
  running: Loader2,
  completed: CheckCircle2,
  error: XCircle,
  skipped: SkipForward,
};

const STATUS_COLORS = {
  pending: 'text-muted-foreground',
  running: 'text-blue-500',
  completed: 'text-green-500',
  error: 'text-red-500',
  skipped: 'text-amber-500',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидание',
  running: 'Выполняется...',
  completed: 'Готово',
  error: 'Ошибка',
  skipped: 'Пропущен',
};

interface PipelineViewProps {
  steps: PipelineStep[];
  currentStep: number;
  onExecute?: (stepIndex: number) => void;
  onSkip?: (stepIndex: number) => void;
  onEditPrompt?: (stepIndex: number) => void;
  executing?: boolean;
}

export function PipelineView({ steps, currentStep, onExecute, onSkip, onEditPrompt, executing }: PipelineViewProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Конвейер</h3>
      <div className="relative">
        {steps.map((step, idx) => {
          const Icon = STATUS_ICONS[step.status] || Circle;
          const color = STATUS_COLORS[step.status] || 'text-muted-foreground';
          const isCurrent = idx === currentStep;
          const isActive = step.status === 'pending' && isCurrent;

          return (
            <div key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Линия соединения */}
              {idx < steps.length - 1 && (
                <div className={`absolute left-[17px] top-9 w-0.5 h-[calc(100%-24px)] ${
                  step.status === 'completed' ? 'bg-green-500/30' : 'bg-border'
                }`} />
              )}

              {/* Иконка статуса */}
              <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                isCurrent ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-muted'
              }`}>
                <Icon className={`w-4 h-4 ${color} ${step.status === 'running' ? 'animate-spin' : ''}`} />
              </div>

              {/* Контент шага */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className={`text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  </div>
                  <span className={`text-xs ${color}`}>
                    {STATUS_LABELS[step.status]}
                  </span>
                </div>

                {/* Кнопки действий для текущего шага */}
                {isActive && (
                  <div className="flex items-center gap-2 mt-2">
                    {step.promptKey && onEditPrompt && (
                      <button
                        onClick={() => onEditPrompt(idx)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-border hover:bg-muted transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        Изменить промпт
                      </button>
                    )}
                    {onExecute && (
                      <button
                        onClick={() => onExecute(idx)}
                        disabled={executing}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {executing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        {executing ? 'Выполняется...' : 'Выполнить'}
                      </button>
                    )}
                    {onSkip && (
                      <button
                        onClick={() => onSkip(idx)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-border hover:bg-muted transition-colors"
                      >
                        <SkipForward className="w-3 h-3" />
                        Пропустить
                      </button>
                    )}
                  </div>
                )}

                {/* Ошибка */}
                {step.error && (
                  <div className="mt-2 p-2 rounded-md bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-500">{step.error}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
