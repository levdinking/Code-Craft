import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { PromptEditor } from '@/components/admin/PromptEditor';
import { ApiKeyManager } from '@/components/admin/ApiKeyManager';
import type { SocialNetwork, SocialNetworkConfig } from '@/types/admin';

const PROMPT_LABELS: Record<string, string> = {
  'article-topics': 'Генерация тем для статей',
  'article-write': 'Написание статьи',
  'article-image': 'Обложка статьи',
  'social-post-text': 'Текст поста для соцсетей',
  'social-post-image': 'Изображение поста',
  'video-script': 'Сценарий видео',
  'story-content': 'Контент для сторис',
  'viral-telegram': 'Вирусный текст — Telegram',
  'viral-vk': 'Вирусный текст — ВКонтакте',
  'viral-facebook': 'Вирусный текст — Facebook',
  'viral-instagram': 'Вирусный текст — Instagram',
  'viral-youtube': 'Вирусный текст — YouTube',
};

interface SocialConfig {
  networks: Record<SocialNetwork, SocialNetworkConfig>;
}

export function AdminSettings() {
  const [tab, setTab] = useState<'social' | 'prompts' | 'api-keys'>('social');
  const [socialConfig, setSocialConfig] = useState<SocialConfig | null>(null);
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { get, put } = useAdminApi();

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [social, promptsData] = await Promise.all([
        get<SocialConfig>('/api/settings/social'),
        get<Record<string, string>>('/api/settings/prompts'),
      ]);
      setSocialConfig(social);
      setPrompts(promptsData);
    } catch (err) {
      console.error('Ошибка загрузки настроек:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSettings(); }, []);

  const toggleNetwork = async (network: SocialNetwork) => {
    if (!socialConfig) return;
    const current = socialConfig.networks[network];
    setSaving(true);
    try {
      const updated = await put<SocialConfig>(`/api/settings/social/${network}`, {
        enabled: !current.enabled,
      });
      setSocialConfig(updated);
    } catch (err) {
      console.error('Ошибка обновления:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrompt = async (key: string, value: string) => {
    try {
      const updated = await put<Record<string, string>>(`/api/settings/prompts/${key}`, {
        template: value,
      });
      setPrompts(updated);
    } catch (err) {
      console.error('Ошибка сохранения промпта:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Настройки</h1>
          <p className="text-muted-foreground text-sm mt-1">Конфигурация соцсетей, AI промптов и API ключей</p>
        </div>
        <button
          onClick={loadSettings}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {/* Табы */}
      <div className="flex gap-1 border-b border-border">
        {[
          { key: 'social' as const, label: 'Соцсети' },
          { key: 'prompts' as const, label: 'Промпты ИИ' },
          { key: 'api-keys' as const, label: 'API ключи' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              tab === key
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Вкладка: Соцсети */}
      {tab === 'social' && socialConfig && (
        <div className="space-y-4">
          {(Object.entries(socialConfig.networks) as [SocialNetwork, SocialNetworkConfig][]).map(
            ([network, config]) => (
              <div
                key={network}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
              >
                <div>
                  <p className="font-medium text-sm">{config.name}</p>
                  {config.note && (
                    <p className="text-xs text-muted-foreground mt-0.5">{config.note}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {config.configured ? (
                      <span className="text-xs text-green-500">Настроен</span>
                    ) : (
                      <span className="text-xs text-amber-500">Не настроен</span>
                    )}
                    {config.via && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        config.via === 'buffer'
                          ? 'bg-indigo-500/10 text-indigo-500'
                          : 'bg-sky-500/10 text-sky-500'
                      }`}>
                        {config.via === 'buffer' ? 'Buffer' : 'Direct API'}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleNetwork(network)}
                  disabled={saving || !config.configured}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    config.enabled ? 'bg-primary' : 'bg-muted'
                  } ${!config.configured ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      config.enabled ? 'translate-x-5.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            )
          )}
        </div>
      )}

      {/* Вкладка: Промпты */}
      {tab === 'prompts' && (
        <div className="space-y-4">
          {Object.entries(prompts).map(([key, value]) => (
            <PromptEditor
              key={key}
              promptKey={key}
              label={PROMPT_LABELS[key] || key}
              value={value}
              onSave={handleSavePrompt}
            />
          ))}
        </div>
      )}

      {/* Вкладка: API ключи */}
      {tab === 'api-keys' && <ApiKeyManager />}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
