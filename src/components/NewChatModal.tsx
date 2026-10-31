import React, { useState } from 'react';
import { NetworkId } from '../types';
import { NetworkIcon } from './NetworkIcon';
import { useLanguage } from '../i18n/LanguageContext';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (name: string, network: NetworkId) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onCreateChat,
}) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkId>('telegram');

  if (!isOpen) return null;

  const contacts = [
    { id: 'c1', name: 'Abeer ❤️', handle: '@abeer_m', network: 'telegram' as NetworkId },
    { id: 'c2', name: 'Lionel Messi', handle: '@leomessi', network: 'telegram' as NetworkId },
    { id: 'c3', name: 'Ahmed Khalid', handle: '+966 50 123 4567', network: 'whatsapp' as NetworkId },
    { id: 'c4', name: 'Sara Dev', handle: '@saradev', network: 'discord' as NetworkId },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center pt-[100px] z-50 select-none">
      <div
        className="w-[540px] bg-[#141415] border border-white/10 rounded-[16px] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Search */}
        <div className="h-[54px] px-[16px] flex items-center gap-[10px] border-b border-white/10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] text-white/50">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchContactsPlaceholder')}
            className="flex-1 bg-transparent border-none outline-none text-[14px] text-white placeholder-white/40"
          />
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-[4px] rounded-full"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[16px] h-[16px]">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="p-[12px] flex flex-col gap-[4px] border-b border-white/5">
          <button className="flex items-center gap-[10px] p-[8px] rounded-[10px] hover:bg-white/10 text-left transition-colors">
            <div className="w-[32px] h-[32px] rounded-full bg-white/10 flex items-center justify-center text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[16px] h-[16px]">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white">{t('newGroup')}</div>
              <div className="text-[11px] text-white/50">{t('newGroupDesc')}</div>
            </div>
          </button>

          <button className="flex items-center gap-[10px] p-[8px] rounded-[10px] hover:bg-white/10 text-left transition-colors">
            <div className="w-[32px] h-[32px] rounded-full bg-white/10 flex items-center justify-center text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[16px] h-[16px]">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white">{t('newBroadcast')}</div>
              <div className="text-[11px] text-white/50">{t('newBroadcastDesc')}</div>
            </div>
          </button>
        </div>

        {/* Contacts list */}
        <div className="max-h-[300px] overflow-y-auto p-[8px] space-y-[2px]">
          <div className="px-[8px] py-[4px] text-[11px] font-medium text-white/40">
            {t('contactsHeading')}
          </div>

          {contacts.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                onCreateChat(c.name, c.network);
                onClose();
              }}
              className="flex items-center justify-between px-[10px] py-[8px] rounded-[10px] hover:bg-white/10 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-[10px]">
                <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-[14px]">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-white">{c.name}</div>
                  <div className="text-[11px] text-white/50">{c.handle}</div>
                </div>
              </div>
              <NetworkIcon network={c.network} size={18} badge />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
