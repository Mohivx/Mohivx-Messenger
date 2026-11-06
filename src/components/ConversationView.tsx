import React, { useState, useRef, useEffect } from 'react';
import { Thread, Message } from '../types';
import { NetworkIcon } from './NetworkIcon';
import { useLanguage } from '../i18n/LanguageContext';
import mohivxLogo from '../assets/icon-128.png';

interface ConversationViewProps {
  thread: Thread | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  thread,
  messages,
  onSendMessage,
  onAddReaction,
}) => {
  const { t, isRtl, language, setLanguage, dir, setDirectionMode } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !thread) return;
    try {
      const audio = new Audio('./sounds/send.wav');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderWindowControls = () => (
    <div className="flex items-center ms-1 border-s border-white/10 ps-1">
      <button
        onClick={() => (window as any).mohivxApi?.minimizeWindow?.()}
        className="w-[34px] h-[28px] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors text-[13px]"
        title="Minimize"
      >
        ─
      </button>
      <button
        onClick={() => (window as any).mohivxApi?.maximizeWindow?.()}
        className="w-[34px] h-[28px] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors text-[12px]"
        title="Maximize"
      >
        ▢
      </button>
      <button
        onClick={() => (window as any).mohivxApi?.closeWindow?.()}
        className="w-[38px] h-[28px] flex items-center justify-center text-white/60 hover:text-white hover:bg-[#e81123] transition-colors text-[14px]"
        title="Close"
      >
        ✕
      </button>
    </div>
  );

  if (!thread) {
    return (
      <div className="flex-1 h-[calc(100vh-16px)] bg-[#000000] rounded-[10px] m-[8px] flex flex-col overflow-hidden relative select-none">
        {/* Top Header Bar for empty state */}
        <div className="h-[52px] px-[16px] flex items-center justify-between border-b border-white/5 z-20 titlebar-drag-region">
          <div className="titlebar-no-drag flex items-center gap-[6px]">
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="text-[11px] font-medium text-white/80 bg-white/5 hover:bg-white/10 px-[8px] py-[4px] rounded-[6px] border border-white/10 transition-colors"
              title={t('languageLabel')}
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>
            <button
              onClick={() => setDirectionMode(isRtl ? 'ltr' : 'rtl')}
              className="text-[11px] font-mono font-semibold text-[#0a84ff] bg-[#0a84ff]/10 hover:bg-[#0a84ff]/20 px-[8px] py-[4px] rounded-[6px] border border-[#0a84ff]/20 transition-colors"
              title={t('layoutDirection')}
            >
              {dir.toUpperCase()} {isRtl ? '←' : '→'}
            </button>
          </div>

          <div className="titlebar-no-drag flex items-center gap-[6px]">
            <button className="text-[11px] font-medium text-white/90 bg-black/60 hover:bg-white/10 px-[10px] py-[4px] rounded-[4px] border border-white/10 transition-colors">
              {t('feedback')}
            </button>
            {renderWindowControls()}
          </div>
        </div>

        {/* Empty state content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center p-[20px]">
          <div className="w-[64px] h-[64px] rounded-full bg-white/5 flex items-center justify-center mb-[16px]">
            <img src={mohivxLogo} alt="Mohivx" className="w-[42px] h-[42px] object-contain opacity-80" />
          </div>
          <h2 className="text-[18px] font-semibold text-white/90 mb-[4px]">{t('emptyTitle')}</h2>
          <p className="text-[13px] text-white/50 max-w-[320px]">
            {t('emptyDesc')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-[calc(100vh-16px)] bg-[#000000] rounded-[10px] m-[8px] flex flex-col overflow-hidden relative select-none">
      {/* Top Header Bar */}
      <div className="h-[52px] px-[16px] flex items-center justify-between border-b border-white/5 z-20 titlebar-drag-region">
        {/* Quick Language & Direction Switcher Pill */}
        <div className="titlebar-no-drag flex items-center gap-[6px]">
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="text-[11px] font-medium text-white/80 bg-white/5 hover:bg-white/10 px-[8px] py-[4px] rounded-[6px] border border-white/10 transition-colors"
            title={t('languageLabel')}
          >
            {language === 'ar' ? 'EN' : 'عربي'}
          </button>
          <button
            onClick={() => setDirectionMode(isRtl ? 'ltr' : 'rtl')}
            className="text-[11px] font-mono font-semibold text-[#0a84ff] bg-[#0a84ff]/10 hover:bg-[#0a84ff]/20 px-[8px] py-[4px] rounded-[6px] border border-[#0a84ff]/20 transition-colors"
            title={t('layoutDirection')}
          >
            {dir.toUpperCase()} {isRtl ? '←' : '→'}
          </button>
        </div>

        {/* Center Recipient Pill */}
        <div className="titlebar-no-drag flex items-center gap-[8px] cursor-pointer group">
          <div className="relative">
            <img
              src={thread.avatarUrl}
              alt={thread.title}
              className="w-[32px] h-[32px] rounded-full object-cover bg-white/10"
            />
            <div className={`absolute -bottom-[2px] ${isRtl ? '-left-[2px]' : '-right-[2px]'}`}>
              <NetworkIcon network={thread.networkId} size={14} badge />
            </div>
          </div>
          <div className="bg-[#252830] hover:bg-[#2c303a] px-[12px] py-[5px] rounded-[14px] flex items-center gap-[6px] shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-colors">
            <span className="text-[13px] font-semibold text-white">{thread.title}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[12px] h-[12px] text-white/40">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Right Feedback Pill & Window Controls */}
        <div className="titlebar-no-drag flex items-center gap-[6px]">
          <button className="text-[11px] font-medium text-white/90 bg-black/60 hover:bg-white/10 px-[10px] py-[4px] rounded-[4px] border border-white/10 transition-colors">
            {t('feedback')}
          </button>
          {renderWindowControls()}
        </div>
      </div>

      {/* Messages Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-[16px] py-[12px] space-y-[10px]">
        {/* Sticky Date Separator */}
        <div className="flex items-center justify-center my-[8px]">
          <div className="bg-[#000000] border border-[#232326] text-[#9b9ba2] text-[11px] font-semibold px-[12px] py-[3px] rounded-full shadow-sm">
            {t('todayPill')}
          </div>
        </div>

        {/* Messages List */}
        {messages.map((msg) => {
          const isMe = msg.isOutgoing;
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-[8px] group relative ${isMe ? 'justify-end' : 'justify-start'}`}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              {/* Other party avatar */}
              {!isMe && (
                <div className="w-[34px] h-[34px] shrink-0 mb-[2px]">
                  <img
                    src={msg.senderAvatar || thread.avatarUrl}
                    alt={msg.senderName}
                    className="w-[34px] h-[34px] rounded-full object-cover bg-white/10"
                  />
                </div>
              )}

              {/* Message Bubble Column */}
              <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Reply snippet if any */}
                {msg.replyTo && (
                  <div
                    className={`mb-[4px] px-[10px] py-[4px] rounded-[10px] bg-black/40 ${
                      isRtl ? 'border-r-2' : 'border-l-2'
                    } border-[#2561fb] text-[11px] text-white/60 max-w-full truncate`}
                  >
                    <span className="font-semibold text-white/80 me-1">{msg.replyTo.senderName}:</span>
                    {msg.replyTo.snippet}
                  </div>
                )}

                {/* Bubble Container */}
                <div
                  className={`relative px-[12px] py-[8px] rounded-[17px] text-[13px] leading-relaxed break-words shadow-sm ${
                    isMe
                      ? `bg-[#0a84ff] text-white ${isRtl ? 'rounded-bl-[4px]' : 'rounded-br-[4px]'}`
                      : `bg-[#252830] text-[#ededed] border border-white/5 ${isRtl ? 'rounded-br-[4px]' : 'rounded-bl-[4px]'}`
                  }`}
                >
                  {/* Sender Name if in group and incoming */}
                  {!isMe && (
                    <div
                      className="text-[12px] font-semibold mb-[2px]"
                      style={{ color: msg.senderColor || '#06CF9C' }}
                    >
                      {msg.senderName}
                    </div>
                  )}

                  {/* Content text */}
                  <div dir="auto" className="leading-relaxed">{msg.content}</div>

                  {/* Timestamp */}
                  <div className="flex items-center justify-end gap-[4px] mt-[2px]">
                    <span className="text-[11px] text-white/60 font-normal leading-none">
                      {msg.timestamp}
                    </span>
                    {isMe && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[12px] h-[12px] text-white/80">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Reactions list */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-[4px] mt-[4px]">
                    {msg.reactions.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => onAddReaction(msg.id, r.emoji)}
                        className={`text-[11px] px-[6px] py-[2px] rounded-full flex items-center gap-[4px] transition-colors ${
                          r.meReacted
                            ? 'bg-[#2561fb]/30 border border-[#2561fb] text-white'
                            : 'bg-[#232326] hover:bg-white/10 text-white/80 border border-white/5'
                        }`}
                      >
                        <span>{r.emoji}</span>
                        <span>{r.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Hover Toolbar (Emoji reactions / reply) */}
              {hoveredMessageId === msg.id && (
                <div
                  className={`absolute top-0 flex items-center gap-[4px] bg-[#1c1c1d] border border-white/10 rounded-full px-[6px] py-[2px] shadow-lg z-30 transition-all ${
                    isMe ? 'end-full me-[8px]' : 'start-full ms-[8px]'
                  }`}
                >
                  {['👍', '❤️', '🔥', '😂'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => onAddReaction(msg.id, emoji)}
                      className="text-[13px] hover:scale-125 p-[2px] transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                  <div className="w-[1px] h-[14px] bg-white/20 mx-[2px]" />
                  <button className="text-white/60 hover:text-white p-[2px]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]">
                      <polyline points="9 17 4 12 9 7" />
                      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Composer Bar (52px) */}
      <div className="h-[52px] px-[12px] pb-[8px] pt-[4px] bg-[#000000] flex items-center gap-[8px] z-20">
        {/* Attachment '+' Button */}
        <button
          title={t('addAttachment')}
          className="w-[36px] h-[36px] rounded-full bg-[#1c1c1d] hover:bg-white/10 flex items-center justify-center text-[#9b9ba2] hover:text-white transition-colors shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[18px] h-[18px]">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* Center Input Capsule */}
        <div className="flex-1 h-[36px] bg-[#1c1c1d] rounded-full px-[12px] flex items-center gap-[8px] border border-white/5 focus-within:border-white/20 transition-all">
          {/* Active Network Icon Indicator */}
          <NetworkIcon network={thread.networkId} size={16} badge />

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('messagePlaceholder', { name: thread.title, network: thread.networkId })}
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder-white/40 font-normal"
          />

          {/* Action Icons in Capsule */}
          <div className="flex items-center gap-[6px]">
            {/* Emoji Button */}
            <button className="text-[#9b9ba2] hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </button>

            {/* Record Audio Button */}
            <button title={t('recordAudio')} className="text-[#9b9ba2] hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          title={t('send')}
          className={`w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all shrink-0 ${
            inputText.trim()
              ? 'bg-[#2561fb] hover:bg-[#1a50db] text-white shadow-md'
              : 'bg-[#4c4c4c] text-white/50 cursor-not-allowed'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[18px] h-[18px]">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
