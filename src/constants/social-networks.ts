import { Send, MessageCircle, Film } from 'lucide-react';
import type { SocialNetwork } from '@/types/admin';

export interface SocialNetworkMeta {
  name: string;
  icon: React.ElementType;
  textColor: string;
  badgeColor: string;
  maxChars: number;
}

/**
 * Единый источник метаданных соцсетей для всех компонентов.
 * textColor — цвет иконки/текста (например, 'text-blue-500')
 * badgeColor — полный набор классов для бейджей/кнопок (bg + text + border)
 * maxChars — лимит символов на платформе
 */
export const SOCIAL_NETWORK_META: Record<SocialNetwork, SocialNetworkMeta> = {
  telegram: { name: 'Telegram', icon: Send, textColor: 'text-blue-500', badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/30', maxChars: 4096 },
  vk: { name: 'ВКонтакте', icon: MessageCircle, textColor: 'text-sky-500', badgeColor: 'bg-sky-500/10 text-sky-500 border-sky-500/30', maxChars: 16384 },
  facebook: { name: 'Facebook', icon: MessageCircle, textColor: 'text-blue-600', badgeColor: 'bg-blue-600/10 text-blue-600 border-blue-600/30', maxChars: 63206 },
  instagram: { name: 'Instagram', icon: MessageCircle, textColor: 'text-pink-500', badgeColor: 'bg-pink-500/10 text-pink-500 border-pink-500/30', maxChars: 2200 },
  youtube: { name: 'YouTube', icon: Film, textColor: 'text-red-500', badgeColor: 'bg-red-500/10 text-red-500 border-red-500/30', maxChars: 5000 },
};
