import type { SocialNetwork } from '@/types/admin';
import { Check, X, Loader2 } from 'lucide-react';
import { SOCIAL_NETWORK_META } from '@/constants/social-networks';

interface PublishResult {
  success: boolean;
  error?: string;
}

interface PublishProgressProps {
  networks: SocialNetwork[];
  results: Record<string, PublishResult>;
  publishing: boolean;
}

export function PublishProgress({ networks, results, publishing }: PublishProgressProps) {
  const successCount = Object.values(results).filter(r => r.success).length;
  const failCount = Object.values(results).filter(r => !r.success && r.error).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Публикация</label>
        {Object.keys(results).length > 0 && (
          <span className="text-xs text-muted-foreground">
            {successCount} успешно {failCount > 0 && `/ ${failCount} ошибок`}
          </span>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {networks.map((network) => {
          const meta = SOCIAL_NETWORK_META[network];
          const Icon = meta.icon;
          const result = results[network];
          const isPublishing = publishing && !result;

          return (
            <div key={network} className="flex items-center gap-3 px-4 py-3">
              <Icon className={`w-5 h-5 ${meta.textColor}`} />
              <span className="text-sm flex-1">{meta.name}</span>

              {isPublishing && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
              {result?.success && (
                <div className="flex items-center gap-1.5 text-green-500">
                  <Check className="w-4 h-4" />
                  <span className="text-xs">Отправлено</span>
                </div>
              )}
              {result && !result.success && (
                <div className="flex items-center gap-1.5 text-red-500">
                  <X className="w-4 h-4" />
                  <span className="text-xs truncate max-w-48" title={result.error}>
                    {result.error || 'Ошибка'}
                  </span>
                </div>
              )}
              {!isPublishing && !result && (
                <span className="text-xs text-muted-foreground">Ожидание</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
