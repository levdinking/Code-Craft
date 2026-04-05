import type { SocialNetwork } from '@/types/admin';
import { useState, useEffect } from 'react';
import { SOCIAL_NETWORK_META } from '@/constants/social-networks';

interface OptimizedContent {
  text?: string;
  hashtags?: string[];
  callToAction?: string;
  title?: string;
  description?: string;
  tags?: string[];
}

interface PlatformPreviewProps {
  texts: Record<string, OptimizedContent>;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export function PlatformPreview({ texts, mediaUrl, mediaType }: PlatformPreviewProps) {
  const platforms = Object.keys(texts) as SocialNetwork[];
  const [activeTab, setActiveTab] = useState<SocialNetwork>(platforms[0]);

  // Синхронизация activeTab при изменении набора платформ
  useEffect(() => {
    if (!texts[activeTab] && platforms.length > 0) {
      setActiveTab(platforms[0]);
    }
  }, [texts]);

  if (platforms.length === 0) return null;

  const content = texts[activeTab];
  const meta = SOCIAL_NETWORK_META[activeTab];

  // YouTube имеет особый формат
  const isYoutube = activeTab === 'youtube';
  const displayText = isYoutube ? (content?.description || content?.text || '') : (content?.text || '');
  const charCount = displayText.length;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Превью по платформам</label>

      {/* Табы */}
      <div className="flex gap-1 overflow-x-auto">
        {platforms.map((platform) => {
          const pm = SOCIAL_NETWORK_META[platform];
          const Icon = pm.icon;
          return (
            <button
              key={platform}
              onClick={() => setActiveTab(platform)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                activeTab === platform
                  ? 'bg-card border border-border shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${pm.textColor}`} />
              {pm.name}
            </button>
          );
        })}
      </div>

      {/* Контент */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {isYoutube && content?.title && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Заголовок:</p>
            <p className="font-medium">{content.title}</p>
          </div>
        )}

        <div className="text-sm whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
          {displayText}
        </div>

        {/* Хештеги */}
        {content?.hashtags && content.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {content.hashtags.map((tag, i) => (
              <span key={i} className={`text-xs ${meta.textColor}`}>{tag}</span>
            ))}
          </div>
        )}

        {/* Теги YouTube */}
        {isYoutube && content?.tags && content.tags.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Теги:</p>
            <div className="flex flex-wrap gap-1">
              {content.tags.map((tag, i) => (
                <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Медиа превью */}
        {mediaUrl && (
          <div className="rounded-lg overflow-hidden border border-border">
            {mediaType === 'video' ? (
              <video src={mediaUrl} className="max-h-32 w-full object-contain" />
            ) : (
              <img src={mediaUrl} alt="" className="max-h-32 w-full object-contain" />
            )}
          </div>
        )}

        {/* Счётчик символов */}
        <div className={`text-xs text-right ${charCount > meta.maxChars ? 'text-red-500' : 'text-muted-foreground'}`}>
          {charCount} / {meta.maxChars} символов
          {charCount > meta.maxChars && ' (превышен лимит!)'}
        </div>
      </div>
    </div>
  );
}
