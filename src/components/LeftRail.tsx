import React, { useState } from 'react';
import { ViewFilter, NetworkId } from '../types';
import { NetworkIcon } from './NetworkIcon';
import { useLanguage } from '../i18n/LanguageContext';
import mohivxIcon64 from '../assets/icon-64.png';

interface LeftRailProps {
  currentFilter: ViewFilter;
  onSelectFilter: (filter: ViewFilter) => void;
  unreadCount?: number;
  showUnreads?: boolean;
  colorizeNetworkIcons?: boolean;
  onOpenSettings: () => void;
  onOpenAddAccount: () => void;
  activeNetwork?: NetworkId | null;
  onSelectNetwork: (net: NetworkId | null) => void;
  connectedNetworks?: NetworkId[];
}

export const LeftRail: React.FC<LeftRailProps> = ({
  currentFilter,
  onSelectFilter,
  unreadCount = 0,
  showUnreads = true,
  colorizeNetworkIcons = true,
  onOpenSettings,
  onOpenAddAccount,
  activeNetwork,
  onSelectNetwork,
  connectedNetworks = ['telegram', 'whatsapp'],
}) => {
  const { t, isRtl } = useLanguage();
  const [tooltip, setTooltip] = useState<{ text: string; shortcut?: string; y: number } | null>(null);

  const navItems: { id: ViewFilter; label: string; shortcut: string; icon: React.ReactNode }[] = [
    {
      id: 'inbox',
      label: t('inbox'),
      shortcut: 'Ctrl | Alt | 1',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[19px] h-[19px]">
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      ),
    },
    {
      id: 'archive',
      label: t('archive'),
      shortcut: 'Ctrl | Alt | 2',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[19px] h-[19px]">
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect x="1" y="3" width="22" height="5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      ),
    },
    {
      id: 'reminders',
      label: t('reminders'),
      shortcut: 'Ctrl | Alt | 3',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[19px] h-[19px]">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: 'sendlater',
      label: t('sendLater'),
      shortcut: 'Ctrl | Alt | 4',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[19px] h-[19px]">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      id: 'requests',
      label: t('requests'),
      shortcut: 'Ctrl | Alt | 5',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[19px] h-[19px]">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      id: 'lowpriority',
      label: t('lowPriority'),
      shortcut: 'Ctrl | Alt | 6',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[19px] h-[19px]">
          <line x1="4" y1="8" x2="20" y2="8" />
          <line x1="4" y1="14" x2="14" y2="14" />
          <line x1="4" y1="20" x2="9" y2="20" />
        </svg>
      ),
    },
  ];

  const railNetworks = Array.from(new Set<NetworkId>(['matrix', 'telegram', 'whatsapp', ...connectedNetworks]));

  return (
    <aside className="w-[56px] h-full bg-[#202228] flex flex-col items-center pt-[8px] pb-[12px] select-none relative z-20 shrink-0 border-r border-white/[0.04]">
      {/* Top Filter Buttons */}
      <div className="flex flex-col gap-[6px] items-center w-full overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = currentFilter === item.id && activeNetwork === null;
          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({ text: item.label, shortcut: item.shortcut, y: rect.top });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              <button
                onClick={() => {
                  onSelectFilter(item.id);
                  onSelectNetwork(null);
                }}
                className={`w-[36px] h-[36px] rounded-[12px] p-[4px] flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-white/[0.15] text-white shadow-xs'
                    : 'text-[#ededed]/75 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {item.icon}
              </button>

              {/* Inbox unread badge */}
              {item.id === 'inbox' && unreadCount > 0 && (
                <div
                  className={`absolute -top-[3px] ${
                    isRtl ? '-left-[6px]' : '-right-[6px]'
                  } bg-[#2561fb] text-white text-[10px] leading-[13px] font-bold px-[5px] py-[1px] rounded-[8px] min-w-[18px] text-center shadow`}
                >
                  {showUnreads ? (unreadCount > 999 ? '999+' : unreadCount) : ''}
                </div>
              )}
            </div>
          );
        })}

        {/* Connected Networks shortcuts */}
        <div className="w-[22px] h-[1px] bg-white/[0.08] my-[2px]" />

        {railNetworks.map((netId, index) => {
          const isSelected = activeNetwork === netId;
          const label =
            netId === 'matrix'
              ? 'Beeper (Matrix)'
              : netId === 'x'
              ? 'X'
              : netId === 'googlemessages'
              ? 'Google Messages'
              : netId === 'googlechat'
              ? 'Google Chat'
              : netId.charAt(0).toUpperCase() + netId.slice(1);
          return (
            <div
              key={netId}
              className="relative"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({
                  text: label,
                  shortcut: index < 2 ? `Ctrl | Alt | ${9 - index}` : undefined,
                  y: rect.top,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              <button
                data-testid={`rail-network-${netId}`}
                onClick={() => onSelectNetwork(isSelected ? null : netId)}
                className={`w-[36px] h-[36px] rounded-[12px] p-[4px] flex items-center justify-center transition-all ${
                  isSelected ? 'bg-white/20 ring-2 ring-[#2561fb]' : 'hover:bg-white/10'
                } ${!colorizeNetworkIcons ? 'grayscale opacity-80 hover:grayscale-0 hover:opacity-100' : ''}`}
              >
                <NetworkIcon network={netId} size={26} />
              </button>
            </div>
          );
        })}

        {/* Dashed Add Custom Space / Chat Network bubble button */}
        <div
          className="relative"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({ text: t('customSpace'), y: rect.top });
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          <button
            onClick={onOpenAddAccount}
            className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <div className="w-[28px] h-[28px] rounded-full border border-dashed border-white/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-[13px] h-[13px]">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </button>
        </div>

        {/* More dots button */}
        <button
          onClick={onOpenAddAccount}
          className="w-[32px] h-[24px] rounded-[8px] flex items-center justify-center text-white/45 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="More Networks"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-[14px] h-[14px]">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      {/* Bottom Rail Actions (Matches Original Beeper: Media, Add Account [+], Profile Avatar) */}
      <div className="mt-auto flex flex-col gap-[8px] items-center w-full pt-[8px]">
        {/* Media Viewer Button */}
        <div
          className="relative"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({ text: t('mediaViewer'), y: rect.top });
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          <button
            onClick={() => onSelectFilter('inbox')}
            className="w-[36px] h-[36px] rounded-[12px] p-[4px] flex items-center justify-center text-[#ededed]/75 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>
        </div>

        {/* Add Account Button */}
        <div
          className="relative"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({ text: t('addAccount'), shortcut: 'Ctrl | ,', y: rect.top });
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          <button
            onClick={onOpenAddAccount}
            className="w-[36px] h-[36px] rounded-[12px] p-[4px] flex items-center justify-center text-[#ededed]/75 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </button>
        </div>

        {/* Mohivx Profile & Settings Button */}
        <div
          className="relative"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({ text: t('settings'), shortcut: 'Ctrl | ,', y: rect.top });
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          <button
            onClick={onOpenSettings}
            className="w-[32px] h-[32px] rounded-full flex items-center justify-center ring-1 ring-white/15 hover:ring-white/40 transition-all overflow-hidden bg-[#7c5cff]"
          >
            <img src={mohivxIcon64} alt="Mohivx" className="w-full h-full object-cover rounded-full" />
          </button>
        </div>
      </div>

      {/* Hover Floating Tooltip */}
      {tooltip && (
        <div
          className={`fixed ${
            isRtl ? 'right-[62px]' : 'left-[62px]'
          } z-50 flex items-center gap-[8px] bg-[#141416] text-white text-[12px] font-medium px-[10px] py-[6px] rounded-[8px] shadow-xl border border-white/10 pointer-events-none whitespace-nowrap`}
          style={{ top: `${tooltip.y + 2}px` }}
        >
          <span>{tooltip.text}</span>
          {tooltip.shortcut && (
            <span className="text-[10px] text-white/60 bg-white/10 px-[5px] py-[1px] rounded font-mono">
              {tooltip.shortcut}
            </span>
          )}
        </div>
      )}
    </aside>
  );
};
