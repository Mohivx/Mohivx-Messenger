import React, { useState } from 'react';
import { Thread, ViewFilter, NetworkId } from '../types';
import { NetworkIcon } from './NetworkIcon';
import { useLanguage } from '../i18n/LanguageContext';

interface ThreadListProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  currentFilter: ViewFilter;
  onSelectFilter?: (filter: ViewFilter) => void;
  filterUnreadOnly: boolean;
  onToggleFilterUnread: () => void;
  onOpenSearch: () => void;
  onOpenNewChat: () => void;
  activeNetwork?: NetworkId | null;
}

export const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  selectedThreadId,
  onSelectThread,
  currentFilter,
  onSelectFilter,
  filterUnreadOnly,
  onToggleFilterUnread,
  onOpenSearch,
  onOpenNewChat,
  activeNetwork,
}) => {
  const { t, isRtl } = useLanguage();
  const [inboxDropdownOpen, setInboxDropdownOpen] = useState(false);

  const getFilterTitle = (filter: ViewFilter): string => {
    switch (filter) {
      case 'inbox': return t('inbox');
      case 'archive': return t('archive');
      case 'reminders': return t('reminders');
      case 'sendlater': return t('sendLater');
      case 'requests': return t('requests');
      case 'lowpriority': return t('lowPriority');
      default: return t('inbox');
    }
  };

  const displayedThreads = threads.filter((tItem) => {
    if (activeNetwork && tItem.networkId !== activeNetwork) return false;
    if (filterUnreadOnly && tItem.unreadCount === 0) return false;
    if (currentFilter === 'archive') return tItem.isArchived;
    return !tItem.isArchived;
  });

  return (
    <div
      className={`w-[252px] h-screen bg-[#252830] flex flex-col shrink-0 ${
        isRtl ? 'border-l' : 'border-r'
      } border-white/5 select-none relative z-10`}
    >
      {/* Top Header Bar (52px) */}
      <div className="h-[52px] flex items-center justify-between px-[12px] pt-[8px] border-b border-white/5 titlebar-drag-region">
        {/* Inbox Dropdown Button */}
        <div className="relative titlebar-no-drag">
          <button
            onClick={() => setInboxDropdownOpen(!inboxDropdownOpen)}
            className="flex items-center gap-[4px] text-[13px] font-semibold text-[#f6f6f6] hover:text-white transition-colors"
          >
            <span>{getFilterTitle(currentFilter)}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[12px] h-[12px] opacity-70">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {/* Inbox Filter Dropdown Menu */}
          {inboxDropdownOpen && (
            <div
              className={`absolute top-[28px] ${
                isRtl ? 'right-0' : 'left-0'
              } w-[195px] bg-[#1c1c1e] border border-white/10 rounded-[12px] shadow-2xl py-[6px] z-50 text-[13px]`}
            >
              <div className="px-[12px] py-[6px] text-white/50 text-[11px] font-medium tracking-wide text-start">
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
                    className={`w-[14px] h-[14px] ${currentFilter === 'inbox' ? 'opacity-100' : 'opacity-0'}`}
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
                    className={`w-[14px] h-[14px] ${currentFilter === 'archive' ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{t('archive')}</span>
                </div>
                <span className="text-[11px] text-white/40">Ctrl 2</span>
              </button>
              <div className="h-[1px] bg-white/10 my-[4px]" />
              <button
                onClick={() => setInboxDropdownOpen(false)}
                className="w-full text-start px-[12px] py-[6px] text-[#f6f6f6] hover:bg-white/10"
              >
                {t('selectChats')}
              </button>
              <button
                onClick={() => setInboxDropdownOpen(false)}
                className="w-full text-start px-[12px] py-[6px] text-[#f6f6f6] hover:bg-white/10"
              >
                {t('mergeChats')}
              </button>
            </div>
          )}
        </div>

        {/* Header Action Icons */}
        <div className="flex items-center gap-[4px] titlebar-no-drag">
          {/* Filter Unread Toggle */}
          <button
            onClick={onToggleFilterUnread}
            title={t('filterUnread')}
            className={`w-[32px] h-[22px] rounded-[12px] flex items-center justify-center transition-all ${
              filterUnreadOnly
                ? 'bg-[#2561fb] text-white'
                : 'text-[#f6f6f6]/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px]">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>

          {/* Search Chats */}
          <button
            onClick={onOpenSearch}
            title={t('searchChats')}
            className="w-[30px] h-[22px] rounded-[6px] flex items-center justify-center text-[#f6f6f6]/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* New Chat */}
          <button
            onClick={onOpenNewChat}
            title={t('newChat')}
            className="w-[30px] h-[22px] rounded-[6px] flex items-center justify-center text-[#f6f6f6]/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable Thread List */}
      <div className="flex-1 overflow-y-auto px-[6px] py-[4px] space-y-[2px]">
        {displayedThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center px-[16px]">
            <p className="text-[13px] text-white/50">{t('noConversationsIn', { filter: getFilterTitle(currentFilter) })}</p>
          </div>
        ) : (
          displayedThreads.map((thread) => {
            const isSelected = thread.id === selectedThreadId;
            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`group relative flex items-center gap-[10px] p-[8px] rounded-[10px] cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white/15 text-white'
                    : 'text-[#ededed] hover:bg-white/5'
                }`}
              >
                {/* Avatar with Network Badge */}
                <div className="relative shrink-0">
                  <img
                    src={thread.avatarUrl}
                    alt={thread.title}
                    className="w-[46px] h-[46px] rounded-full object-cover bg-white/10"
                  />
                  {/* Network Icon Badge */}
                  <div className={`absolute -bottom-[2px] ${isRtl ? '-left-[2px]' : '-right-[2px]'}`}>
                    <NetworkIcon network={thread.networkId} size={16} badge />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pe-[4px] text-start">
                  {/* Title & Time */}
                  <div className="flex items-center justify-between mb-[2px]">
                    <span className="text-[14px] font-semibold text-white/90 truncate leading-tight">
                      {thread.title}
                    </span>
                    <span className="text-[11px] text-[#f6f6f6]/70 shrink-0 font-normal">
                      {thread.lastMessageTime}
                    </span>
                  </div>

                  {/* Message Snippet & Unread Badge */}
                  <div className="flex items-center justify-between gap-[4px]">
                    <p className="text-[13px] text-white/70 truncate leading-normal">
                      {thread.lastMessageSender && (
                        <span className="font-medium text-white/80 me-1">
                          {thread.lastMessageSender}:
                        </span>
                      )}
                      <span>{thread.lastMessageSnippet}</span>
                    </p>

                    {/* Unread Counter Badge */}
                    {thread.unreadCount > 0 && (
                      <div
                        className={`text-[10px] leading-[14px] font-semibold px-[5px] py-[1px] rounded-[20px] shrink-0 min-w-[20px] text-center ${
                          thread.isMuted
                            ? 'bg-white/20 text-white/70'
                            : 'bg-[#2561fb] text-white shadow-sm'
                        }`}
                      >
                        {thread.unreadCount > 999 ? '999+' : thread.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
