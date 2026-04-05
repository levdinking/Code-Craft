import type { SocialNetwork } from '@/types/admin';
import { SOCIAL_NETWORK_META } from '@/constants/social-networks';

interface SocialNetworkSelectorProps {
  selected: SocialNetwork[];
  onChange: (networks: SocialNetwork[]) => void;
  disabledNetworks?: SocialNetwork[];
}

export function SocialNetworkSelector({ selected, onChange, disabledNetworks = [] }: SocialNetworkSelectorProps) {
  const toggle = (network: SocialNetwork) => {
    if (disabledNetworks.includes(network)) return;
    if (selected.includes(network)) {
      onChange(selected.filter(n => n !== network));
    } else {
      onChange([...selected, network]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Целевые соцсети</label>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(SOCIAL_NETWORK_META) as SocialNetwork[]).map((network) => {
          const info = SOCIAL_NETWORK_META[network];
          const Icon = info.icon;
          const isSelected = selected.includes(network);
          const isDisabled = disabledNetworks.includes(network);

          return (
            <button
              key={network}
              onClick={() => toggle(network)}
              disabled={isDisabled}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                isSelected
                  ? `${info.badgeColor} border-current`
                  : 'border-border text-muted-foreground hover:border-primary/30'
              } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Icon className="w-4 h-4" />
              {info.name}
              {isDisabled && <span className="text-xs">(не настроен)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Компактные бейджи для отображения в таблицах/списках
interface SocialNetworkBadgesProps {
  networks: SocialNetwork[];
}

export function SocialNetworkBadges({ networks }: SocialNetworkBadgesProps) {
  if (!networks.length) return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <div className="flex gap-1">
      {networks.map((network) => {
        const info = SOCIAL_NETWORK_META[network];
        return (
          <span
            key={network}
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${info.badgeColor}`}
          >
            {info.name}
          </span>
        );
      })}
    </div>
  );
}
