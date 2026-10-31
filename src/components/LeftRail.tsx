import React, { useState } from 'react';
import { ViewFilter, NetworkId } from '../types';
import { NetworkIcon } from './NetworkIcon';

interface LeftRailProps {
  currentFilter: ViewFilter;
  onSelectFilter: (filter: ViewFilter) => void;
  unreadCount?: number;
  onOpenSettings: () => void;
  onOpenAddAccount: () => void;
  activeNetwork?: NetworkId | null;
  onSelectNetwork: (net: NetworkId | null) => void;
}

export const LeftRail: React.FC<LeftRailProps> = ({
  currentFilter,
  onSelectFilter,
  unreadCount = 48,
  onOpenSettings,
  onOpenAddAccount,
  activeNetwork,
  onSelectNetwork,
}) => {
  const [tooltip, setTooltip] = useState<{ text: string; shortcut?: string; y: number } | null>(null);

  const navItems: { id: ViewFilter; label: string; shortcut: string; icon: React.ReactNode }[] = [
    {
      id: 'inbox',
      label: 'Inbox',
      shortcut: 'Ctrl | Alt | 1',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px]">
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      ),
    },
    {
      id: 'archive',
      label: 'Archive',
      shortcut: 'Ctrl | Alt | 2',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px]">
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect x="1" y="3" width="22" height="5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      ),
    },
    {
      id: 'reminders',
      label: 'Reminders',
      shortcut: 'Ctrl | Alt | 4',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px]">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: 'sendlater',
      label: 'Send Later',
      shortcut: 'Ctrl | Alt | 5',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px]">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      ),
    },
    {
      id: 'requests',
      label: 'Requests',
      shortcut: 'Ctrl | Alt | 6',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px]">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      id: 'lowpriority',
      label: 'Low Priority',
      shortcut: 'Ctrl | Alt | 7',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px]">
          <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2" />
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="12" cy="10" r="2" />
          <line x1="8" y1="2" x2="8" y2="4" />
          <line x1="16" y1="2" x2="16" y2="4" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-[68px] h-screen bg-[#f6f6f6]/10 flex flex-col items-center pt-[14px] pb-[16px] select-none relative z-20 shrink-0">
      {/* Top Filter Buttons */}
      <div className="flex flex-col gap-[8px] items-center w-full">
        {navItems.map((item, idx) => {
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
                className={`w-[36px] h-[36px] rounded-[14px] p-[4px] flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-[#ededed]/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
              </button>

              {/* Inbox unread badge */}
              {item.id === 'inbox' && unreadCount > 0 && (
                <div className="absolute -top-[2px] -right-[5px] bg-[#2561fb] text-white text-[10px] leading-[12px] font-semibold px-[4px] py-[1px] rounded-[8px] min-w-[18px] text-center shadow">
                  {unreadCount}
                </div>
              )}
            </div>
          );
        })}

        {/* Separator / Dashed favorite button */}
        <div
          className="relative"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({ text: 'Custom Space', shortcut: 'Ctrl | Alt | 3', y: rect.top });
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          <button className="w-[36px] h-[36px] rounded-[14px] p-[4px] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <div className="w-[28px] h-[28px] rounded-[8px] border-2 border-dashed border-white/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[14px] h-[14px]">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </button>
        </div>

        {/* Connected Networks shortcuts */}
        <div className="w-[24px] h-[1px] bg-white/10 my-[4px]" />

        {/* Telegram Shortcut */}
        <div
          className="relative"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({ text: 'Telegram', shortcut: 'Ctrl | Alt | 9', y: rect.top });
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          <button
            data-testid="rail-network-telegram"
            onClick={() => onSelectNetwork(activeNetwork === 'telegram' ? null : 'telegram')}
            className={`w-[36px] h-[36px] rounded-[14px] p-[4px] flex items-center justify-center transition-all ${
              activeNetwork === 'telegram' ? 'bg-white/20 ring-2 ring-[#2EA4DB]' : 'hover:bg-white/10'
            }`}
          >
            <NetworkIcon network="telegram" size={28} />
          </button>
        </div>

        {/* WhatsApp Shortcut */}
        <div
          className="relative"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({ text: 'WhatsApp', shortcut: 'Ctrl | Alt | 8', y: rect.top });
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          <button
            onClick={() => onSelectNetwork(activeNetwork === 'whatsapp' ? null : 'whatsapp')}
            className={`w-[36px] h-[36px] rounded-[14px] p-[4px] flex items-center justify-center transition-all ${
              activeNetwork === 'whatsapp' ? 'bg-white/20 ring-2 ring-[#48C95F]' : 'hover:bg-white/10'
            }`}
          >
            <NetworkIcon network="whatsapp" size={28} />
          </button>
        </div>
      </div>

      {/* Bottom Rail Actions */}
      <div className="mt-auto flex flex-col gap-[8px] items-center w-full">
        {/* Media Viewer Button */}
        <div
          className="relative"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({ text: 'Open media viewer', y: rect.top });
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          <button className="w-[36px] h-[36px] rounded-[14px] p-[4px] flex items-center justify-center text-[#ededed]/80 hover:text-white hover:bg-white/10 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px]">
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
            setTooltip({ text: 'Add an account', shortcut: 'Ctrl | ,', y: rect.top });
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          <button
            onClick={onOpenAddAccount}
            className="w-[36px] h-[36px] rounded-[14px] p-[4px] flex items-center justify-center text-[#ededed]/80 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px]">
              <rect x="3" y="3" width="18" height="18" rx="2" />
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
            setTooltip({ text: 'Settings', shortcut: 'Ctrl | ,', y: rect.top });
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          <button
            onClick={onOpenSettings}
            className="w-[36px] h-[36px] rounded-full flex items-center justify-center p-[1px] ring-2 ring-white/10 hover:ring-white/30 transition-all overflow-hidden bg-gradient-to-tr from-[#9B51E0] to-[#2D9CDB]"
          >
            <img src="./assets/icon-64.png" alt="Mohivx" className="w-[32px] h-[32px] object-cover rounded-full" />
          </button>
        </div>
      </div>

      {/* Hover Floating Tooltip */}
      {tooltip && (
        <div
          className="fixed left-[72px] z-50 bg-[#000000] border border-white/10 text-white rounded-[17px] px-[12px] py-[6px] shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-[8px] pointer-events-none whitespace-nowrap"
          style={{ top: tooltip.y }}
        >
          <span className="text-[13px] font-medium">{tooltip.text}</span>
          {tooltip.shortcut && (
            <span className="text-[11px] text-[#2561fb] bg-white/5 px-[6px] py-[1px] rounded-[6px] font-mono">
              {tooltip.shortcut}
            </span>
          )}
        </div>
      )}
    </aside>
  );
};
