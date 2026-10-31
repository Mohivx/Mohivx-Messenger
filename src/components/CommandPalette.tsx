import React, { useState, useEffect } from 'react';
import { Thread } from '../types';
import { NetworkIcon } from './NetworkIcon';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  threads: Thread[];
  onSelectThread: (threadId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  threads,
  onSelectThread,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredThreads = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.lastMessageSnippet.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center pt-[100px] z-50 select-none animate-in fade-in duration-150">
      <div
        className="w-[620px] bg-[#141415] border border-white/10 rounded-[16px] shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="h-[54px] px-[16px] flex items-center gap-[12px] border-b border-white/10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] text-white/50">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats..."
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-white placeholder-white/40"
          />
          <div className="flex items-center gap-[4px] text-[11px] text-white/40 font-mono">
            <span>Commands</span>
            <kbd className="px-[5px] py-[2px] bg-white/10 rounded-[4px] text-white/80">Ctrl</kbd>
            <kbd className="px-[5px] py-[2px] bg-white/10 rounded-[4px] text-white/80">J</kbd>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="px-[16px] py-[10px] flex items-center gap-[8px] border-b border-white/5 overflow-x-auto text-[12px]">
          {['Accounts', 'Message type', 'Time period', 'Media'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(activeFilter === f ? null : f)}
              className={`px-[10px] py-[4px] rounded-full flex items-center gap-[4px] transition-colors ${
                activeFilter === f
                  ? 'bg-[#2561fb] text-white'
                  : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              <span>{f}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[10px] h-[10px] opacity-70">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-[8px] space-y-[2px]">
          <div className="px-[8px] py-[4px] text-[11px] font-medium text-white/40">
            {query ? 'SEARCH RESULTS' : 'RECENT CHATS'}
          </div>

          {filteredThreads.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                onSelectThread(t.id);
                onClose();
              }}
              className="flex items-center gap-[10px] px-[10px] py-[8px] rounded-[10px] hover:bg-white/10 cursor-pointer transition-colors"
            >
              <img src={t.avatarUrl} alt={t.title} className="w-[34px] h-[34px] rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-white">{t.title}</span>
                  <span className="text-[11px] text-white/40 capitalize">{t.networkId}</span>
                </div>
                <p className="text-[12px] text-white/60 truncate">{t.lastMessageSnippet}</p>
              </div>
              <NetworkIcon network={t.networkId} size={18} badge />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
