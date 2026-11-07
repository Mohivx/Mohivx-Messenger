import React, { useState } from 'react';
import { Thread, ViewFilter, NetworkId, AppSettings, DEFAULT_APP_SETTINGS } from '../types';
import { NetworkIcon } from './NetworkIcon';
import { useLanguage } from '../i18n/LanguageContext';

interface ThreadListProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onToggleArchiveThread?: (threadId: string) => void;
  onTogglePinThread?: (threadId: string) => void;
  onToggleReadThread?: (threadId: string) => void;
  currentFilter: ViewFilter;
  onSelectFilter?: (filter: ViewFilter) => void;
  filterUnreadOnly: boolean;
  onToggleFilterUnread: () => void;
  onOpenSearch: () => void;
  onOpenNewChat: () => void;
  activeNetwork?: NetworkId | null;
  settings?: AppSettings;
}

export const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  selectedThreadId,
  onSelectThread,
  onToggleArchiveThread,
  onTogglePinThread,
  onToggleReadThread,
  currentFilter,
  onSelectFilter,
  filterUnreadOnly,
  onToggleFilterUnread,
  onOpenSearch,
  onOpenNewChat,
  activeNetwork,
  settings = DEFAULT_APP_SETTINGS,
}) => {
  const { t, isRtl } = useLanguage();
  const [inboxDropdownOpen, setInboxDropdownOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ thread: Thread; x: number; y: number } | null>(
    null
  );

  const getFilterTitle = (filter: ViewFilter): string => {
    switch (filter) {
      case 'inbox':
        return t('inbox');
      case 'archive':
        return t('archive');
      case 'reminders':
        return t('reminders');
      case 'sendlater':
        return t('sendLater');
      case 'requests':
        return t('requests');
      case 'lowpriority':
        return t('lowPriority');
      default:
        return t('inbox');
    }
  };

  const displayedThreads = threads.filter((tItem) => {
    if (activeNetwork && tItem.networkId !== activeNetwork) return false;
    if (filterUnreadOnly && tItem.unreadCount === 0) return false;
    if (currentFilter === 'archive') return tItem.isArchived;
    return !tItem.isArchived;
  });

  const pinnedCircles =
    !settings.compactPinnedThreads && currentFilter === 'inbox'
      ? displayedThreads.filter((th) => th.isPinned)
      : [];

  const listThreads =
    !settings.compactPinnedThreads && currentFilter === 'inbox'
      ? displayedThreads.filter((th) => !th.isPinned)
      : displayedThreads;

  const isCompact = settings.compactChatList || settings.density === 'compact';

  return (
    <div
      onClick={() => {
        if (contextMenu) setContextMenu(null);
        if (inboxDropdownOpen) setInboxDropdownOpen(false);
      }}
      className={`w-[260px] h-full bg-[#202228] flex flex-col shrink-0 ${
        isRtl ? 'border-l' : 'border-r'
      } border-white/[0.05] select-none relative z-10`}
    >
      {/* Top Header Bar (Matches Original Beeper: Inbox ⌄ + Unread subtitle + Blue Filter Pill + Search + Compose) */}
      <div className="h-[50px] flex items-center justify-between px-[14px] shrink-0">
        {/* Inbox Dropdown Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setInboxDropdownOpen(!inboxDropdownOpen);
            }}
            className="flex flex-col items-start text-left group"
          >
            <div className="flex items-center gap-[5px] text-[14px] font-bold text-[#f5f5f7] group-hover:text-white leading-tight">
              <span>{getFilterTitle(currentFilter)}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="w-[11px] h-[11px] opacity-60"
              >
                <path d="M7 10l5 5 5-5" />
              </svg>
            </div>
            {filterUnreadOnly && (
              <span className="text-[11px] text-white/45 font-medium leading-none mt-[2px]">
                Unread
              </span>
            )}
          </button>

          {/* Inbox Filter Dropdown Menu */}
          {inboxDropdownOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute top-[38px] ${
                isRtl ? 'right-0' : 'left-0'
              } w-[195px] bg-[#1c1d22] border border-white/10 rounded-[10px] shadow-2xl py-[6px] z-50 text-[13px]`}
            >
              <div className="px-[12px] py-[5px] text-white/45 text-[11px] font-medium tracking-wide text-start">
                {t('spacesAndFilters')}
              </div>
              <button
                onClick={() => {
                  onSelectFilter?.('inbox');
                  setInboxDropdownOpen(false);
                }}
                className="w-full text-start px-[12px] py-[6px] flex items-center justify-between text-[#f6f6f6] hover:bg-white/10"
              >
                <div className="flex items-center gap-[8px]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`w-[14px] h-[14px] ${
                      currentFilter === 'inbox' ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{t('inbox')}</span>
                </div>
                <span className="text-[11px] text-white/40">Ctrl 1</span>
              </button>
              <button
                onClick={() => {
                  onSelectFilter?.('archive');
                  setInboxDropdownOpen(false);
                }}
                className="w-full text-start px-[12px] py-[6px] flex items-center justify-between text-[#f6f6f6] hover:bg-white/10"
              >
                <div className="flex items-center gap-[8px]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`w-[14px] h-[14px] ${
                      currentFilter === 'archive' ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{t('archive')}</span>
                </div>
                <span className="text-[11px] text-white/40">Ctrl 2</span>
              </button>
            </div>
          )}
        </div>

        {/* Header Action Icons (Matches Original Beeper: Blue Filter Pill + Search + Compose) */}
        <div className="flex items-center gap-[6px]">
          {/* Filter Unread Toggle Pill */}
          <button
            onClick={onToggleFilterUnread}
            title={t('filterUnread')}
            className={`h-[22px] px-[8px] rounded-full flex items-center gap-[4px] transition-all ${
              filterUnreadOnly
                ? 'bg-[#2561fb] text-white shadow-xs'
                : 'text-[#f6f6f6]/75 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-[12px] h-[12px]">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="10" y1="18" x2="14" y2="18" />
            </svg>
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-[9px] h-[9px] opacity-80">
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          </button>

          {/* Search Chats */}
          <button
            onClick={onOpenSearch}
            title={t('searchChats')}
            className="w-[26px] h-[24px] rounded-[6px] flex items-center justify-center text-[#f6f6f6]/75 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" className="w-[15px] h-[15px]">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* New Chat */}
          <button
            onClick={onOpenNewChat}
            title={t('newChat')}
            className="w-[26px] h-[24px] rounded-[6px] flex items-center justify-center text-[#f6f6f6]/75 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal Circular Pinned Chats Bar (when compactPinnedThreads is false) */}
      {pinnedCircles.length > 0 && (
        <div className="px-[12px] pt-[2px] pb-[8px] flex items-center gap-[12px] overflow-x-auto no-scrollbar shrink-0">
          {pinnedCircles.map((pinned) => {
            const isSelected = pinned.id === selectedThreadId;
            return (
              <div
                key={pinned.id}
                onClick={() => onSelectThread(pinned.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ thread: pinned, x: e.clientX, y: e.clientY });
                }}
                className="flex flex-col items-center gap-[4px] cursor-pointer group shrink-0 w-[58px]"
              >
                <div
                  className={`relative p-[2px] rounded-full transition-all ${
                    isSelected ? 'ring-2 ring-[#0a84ff]' : 'group-hover:ring-1 group-hover:ring-white/30'
                  }`}
                >
                  <img
                    src={pinned.avatarUrl}
                    alt={pinned.title}
                    className="w-[46px] h-[46px] rounded-full object-cover bg-white/10"
                  />
                  {settings.showNetworkIcons && (
                    <div
                      className={`absolute -bottom-[1px] ${isRtl ? '-left-[1px]' : '-right-[1px]'} ${
                        !settings.colorizeNetworkIcons ? 'grayscale' : ''
                      }`}
                    >
                      <NetworkIcon network={pinned.networkId} size={15} badge />
                    </div>
                  )}
                  {pinned.unreadCount > 0 && (
                    <div className="absolute -top-[2px] -right-[2px] bg-[#2561fb] text-white text-[9.5px] font-bold px-[4px] rounded-full min-w-[16px] text-center shadow">
                      {settings.showUnreads
                        ? pinned.unreadCount > 99
                          ? '99+'
                          : pinned.unreadCount
                        : '•'}
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-white/80 truncate w-full text-center">
                  {pinned.title}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Scrollable Thread List */}
      <div className="flex-1 overflow-y-auto px-[6px] py-[2px] space-y-[1px]">
        {listThreads.length === 0 && pinnedCircles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center px-[16px]">
            <p className="text-[13px] text-white/45">
              {t('noConversationsIn', { filter: getFilterTitle(currentFilter) })}
            </p>
          </div>
        ) : (
          listThreads.map((thread) => {
            const isSelected = thread.id === selectedThreadId;
            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ thread, x: e.clientX, y: e.clientY });
                }}
                className={`group relative flex items-center gap-[10px] ${
                  isCompact ? 'px-[8px] py-[5px]' : 'px-[8px] py-[8px]'
                } rounded-[9px] cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-white/[0.13] text-white'
                    : 'text-[#ededed] hover:bg-white/[0.05]'
                }`}
              >
                {/* Avatar with Network Badge */}
                <div className="relative shrink-0">
                  <img
                    src={thread.avatarUrl}
                    alt={thread.title}
                    className={`${
                      isCompact ? 'w-[36px] h-[36px]' : 'w-[44px] h-[44px]'
                    } rounded-full object-cover bg-white/10`}
                  />
                  {/* Network Icon Badge */}
                  {settings.showNetworkIcons && (
                    <div
                      className={`absolute -bottom-[2px] ${isRtl ? '-left-[2px]' : '-right-[2px]'} ${
                        !settings.colorizeNetworkIcons ? 'grayscale' : ''
                      }`}
                    >
                      <NetworkIcon network={thread.networkId} size={isCompact ? 13 : 15} badge />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pe-[2px] text-start">
                  {/* Title, Mute Icon & Time */}
                  <div className="flex items-center justify-between gap-[4px]">
                    <div className="flex items-center gap-[4px] min-w-0">
                      <span className="text-[13.5px] font-semibold text-white/95 truncate leading-tight">
                        {thread.title}
                      </span>
                      {thread.isMuted && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="w-[12px] h-[12px] text-white/35 shrink-0"
                        >
                          <path d="M11 5L6 9H2v6h4l5 4V5z" />
                          <line x1="23" y1="9" x2="17" y2="15" />
                          <line x1="17" y1="9" x2="23" y2="15" />
                        </svg>
                      )}
                      {thread.isPinned && settings.compactPinnedThreads && (
                        <span className="text-[10px] text-white/45 shrink-0">📌</span>
                      )}
                    </div>
                    <span className="text-[11px] text-white/50 shrink-0 font-normal">
                      {thread.lastMessageTime}
                    </span>
                  </div>

                  {/* Message Snippet & Unread Badge */}
                  <div className="flex items-center justify-between gap-[6px] mt-[2px]">
                    {settings.messagePreviews ? (
                      <p className="text-[12.5px] text-white/60 truncate leading-snug">
                        {thread.lastMessageSender && (
                          <span className="font-medium text-white/75 me-1">
                            {thread.lastMessageSender}:
                          </span>
                        )}
                        <span>{thread.lastMessageSnippet}</span>
                      </p>
                    ) : (
                      <p className="text-[12px] text-white/35 italic truncate">
                        {thread.unreadCount > 0 ? 'New message' : 'Message preview hidden'}
                      </p>
                    )}

                    {/* Unread Counter Badge */}
                    {thread.unreadCount > 0 && (
                      <div
                        className={`text-[10.5px] leading-[15px] font-bold px-[6px] py-[1px] rounded-[20px] shrink-0 min-w-[20px] text-center ${
                          thread.isMuted
                            ? 'bg-white/[0.18] text-white/75'
                            : 'bg-[#2561fb] text-white shadow-xs'
                        }`}
                      >
                        {settings.showUnreads
                          ? thread.unreadCount > 999
                            ? '999+'
                            : thread.unreadCount
                          : '•'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Right-Click Context Menu on Thread */}
      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed w-[185px] bg-[#1e1f24] border border-white/10 rounded-[9px] shadow-2xl py-[5px] z-50 text-[12.5px] text-white"
        >
          <button
            onClick={() => {
              onToggleReadThread?.(contextMenu.thread.id);
              setContextMenu(null);
            }}
            className="w-full px-[12px] py-[6px] text-left hover:bg-white/10 flex items-center justify-between"
          >
            <span>{contextMenu.thread.unreadCount > 0 ? 'Mark as Read' : 'Mark as Unread'}</span>
            <span className="text-[10.5px] text-white/40">Ctrl+Shift+U</span>
          </button>
          <button
            onClick={() => {
              onTogglePinThread?.(contextMenu.thread.id);
              setContextMenu(null);
            }}
            className="w-full px-[12px] py-[6px] text-left hover:bg-white/10 flex items-center justify-between"
          >
            <span>{contextMenu.thread.isPinned ? 'Unpin Chat' : 'Pin Chat'}</span>
          </button>
          <button
            onClick={() => {
              onToggleArchiveThread?.(contextMenu.thread.id);
              setContextMenu(null);
            }}
            className="w-full px-[12px] py-[6px] text-left hover:bg-white/10 flex items-center justify-between"
          >
            <span>{contextMenu.thread.isArchived ? 'Unarchive' : 'Archive'}</span>
            <span className="text-[10.5px] text-white/40">Ctrl+E</span>
          </button>
        </div>
      )}
    </div>
  );
};
