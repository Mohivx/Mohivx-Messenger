import React, { useState, useRef, useEffect } from 'react';
import { Thread, Message, AppSettings, DEFAULT_APP_SETTINGS } from '../types';
import { NetworkIcon } from './NetworkIcon';
import { useLanguage } from '../i18n/LanguageContext';
import mohivxLogo from '../assets/icon-128.png';

interface ConversationViewProps {
  thread: Thread | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onToggleArchive?: (threadId: string) => void;
  onTogglePin?: (threadId: string) => void;
  activeNetwork?: string | null;
  settings?: AppSettings;
}

const NETWORK_WEB_URLS: Record<string, { name: string; url: string }> = {
  whatsapp: { name: 'WhatsApp Web', url: 'https://web.whatsapp.com/' },
  instagram: { name: 'Instagram Direct', url: 'https://www.instagram.com/direct/inbox/' },
  discord: { name: 'Discord', url: 'https://discord.com/app' },
  slack: { name: 'Slack', url: 'https://app.slack.com/client' },
  facebook: { name: 'Messenger', url: 'https://www.messenger.com/' },
  x: { name: 'X Messages', url: 'https://x.com/messages' },
  googlemessages: { name: 'Google Messages', url: 'https://messages.google.com/web/conversations' },
  googlechat: { name: 'Google Chat', url: 'https://chat.google.com/' },
  signal: { name: 'Signal', url: 'https://signal.org/' },
  linkedin: { name: 'LinkedIn Messaging', url: 'https://www.linkedin.com/messaging/' },
  line: { name: 'LINE', url: 'https://line.me/' },
  matrix: { name: 'Element (Matrix)', url: 'https://app.element.io/' },
  viber: { name: 'Viber', url: 'https://www.viber.com/' },
  wechat: { name: 'WeChat Web', url: 'https://web.wechat.com/' },
};

export const ConversationView: React.FC<ConversationViewProps> = ({
  thread,
  messages,
  onSendMessage,
  onAddReaction,
  onToggleArchive,
  onTogglePin,
  activeNetwork,
  settings = DEFAULT_APP_SETTINGS,
}) => {
  const { t, isRtl, language } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [webViewMode, setWebViewMode] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeNetwork && activeNetwork !== 'telegram' && NETWORK_WEB_URLS[activeNetwork]) {
      setWebViewMode(true);
    } else {
      setWebViewMode(false);
    }
  }, [activeNetwork, thread?.id]);

  const handleSend = () => {
    if (!inputText.trim() || !thread) return;
    if (settings.soundEnabled) {
      try {
        const audio = new Audio('./sounds/send.wav');
        audio.volume = Math.min(1, Math.max(0, (settings.soundVolume ?? 80) / 100));
        audio.play().catch(() => {});
      } catch {}
    }
    onSendMessage(inputText.trim());
    setInputText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && thread) {
      onSendMessage(`📎 ${file.name}`);
      e.target.value = '';
    }
  };

  const handleDoubleClickMessage = (msg: Message) => {
    const action = settings.doubleClickMessageAction || 'reply';
    if (action === 'reply') {
      setReplyingTo(msg);
    } else if (action === 'react') {
      onAddReaction(msg.id, '👍');
    } else if (action === 'copy') {
      const textToCopy = settings.includeTimestampsOnCopy
        ? `[${msg.timestamp}] ${msg.senderName}: ${msg.content}`
        : msg.content;
      navigator.clipboard?.writeText(textToCopy);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeWebConfig =
    activeNetwork && activeNetwork !== 'telegram' ? NETWORK_WEB_URLS[activeNetwork] : null;

  if (webViewMode && activeWebConfig && activeNetwork) {
    return (
      <div className="flex-1 h-[calc(100%-8px)] bg-[#000000] rounded-[10px] mr-[6px] mb-[6px] flex flex-col overflow-hidden relative select-none border border-white/[0.05]">
        <div className="h-[46px] px-[16px] flex items-center justify-between border-b border-white/[0.06] z-20">
          <div className="flex items-center gap-[8px]">
            <NetworkIcon network={activeNetwork as any} size={20} />
            <span className="text-[13px] font-semibold text-white">{activeWebConfig.name}</span>
            <span className="text-[10px] px-[7px] py-[2px] rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
              Live Web Session
            </span>
          </div>

          <div className="flex items-center gap-[6px]">
            <button
              onClick={() => setWebViewMode(false)}
              className="text-[11px] font-medium text-white/80 bg-white/5 hover:bg-white/10 px-[10px] py-[4px] rounded-[6px] border border-white/10 transition-colors"
            >
              {language === 'ar' ? 'عرض كرسائل موحدة' : 'Unified View'}
            </button>
            <button
              onClick={() => (window as any).mohivxApi?.openBraveUrl?.(activeWebConfig.url)}
              className="text-[11px] font-medium text-[#0a84ff] bg-[#0a84ff]/10 hover:bg-[#0a84ff]/20 px-[10px] py-[4px] rounded-[6px] border border-[#0a84ff]/20 transition-colors"
            >
              {language === 'ar' ? 'فتح في Brave' : 'Open in Brave'}
            </button>
          </div>
        </div>

        <div className="flex-1 w-full h-full bg-[#141415] relative">
          {React.createElement('webview' as any, {
            src: activeWebConfig.url,
            partition: `persist:mohivx_${activeNetwork}`,
            useragent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            allowpopups: 'true',
            style: { width: '100%', height: '100%', border: 'none' },
          })}
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex-1 h-[calc(100%-8px)] bg-[#000000] rounded-[10px] mr-[6px] mb-[6px] flex flex-col overflow-hidden relative select-none border border-white/[0.05]">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-[20px]">
          <div className="w-[64px] h-[64px] rounded-full bg-white/5 flex items-center justify-center mb-[16px]">
            <img src={mohivxLogo} alt="Mohivx" className="w-[42px] h-[42px] object-contain opacity-80" />
          </div>
          <h2 className="text-[17px] font-semibold text-white/90 mb-[4px]">{t('emptyTitle')}</h2>
          <p className="text-[13px] text-white/45 max-w-[320px]">{t('emptyDesc')}</p>
        </div>
      </div>
    );
  }

  const fontSizePx = settings.fontSize || 13;

  return (
    <div className="flex-1 h-[calc(100%-8px)] bg-[#000000] rounded-[10px] mr-[6px] mb-[6px] flex flex-col overflow-hidden relative select-none border border-white/[0.05]">
      {/* Top Conversation Header Bar (Matches Original Beeper: Centered Recipient Pill + Right Action Icons) */}
      <div className="h-[48px] px-[16px] flex items-center justify-between border-b border-white/[0.06] z-20 shrink-0">
        {/* Left Status Indicator (Incognito Badge if enabled) */}
        <div className="flex items-center gap-[8px] min-w-[90px]">
          {settings.incognitoMode && (
            <span className="px-[8px] py-[2px] rounded-full bg-white/[0.08] text-white/75 text-[11px] font-medium flex items-center gap-[4px]">
              <span>🕶️</span>
              <span>Incognito</span>
            </span>
          )}
        </div>

        {/* Center Recipient Pill */}
        <div className="flex items-center gap-[8px] cursor-pointer group">
          <div className="relative">
            <img
              src={thread.avatarUrl}
              alt={thread.title}
              className="w-[28px] h-[28px] rounded-full object-cover bg-white/10"
            />
            {settings.showNetworkIcons && (
              <div
                className={`absolute -bottom-[2px] ${isRtl ? '-left-[2px]' : '-right-[2px]'} ${
                  !settings.colorizeNetworkIcons ? 'grayscale' : ''
                }`}
              >
                <NetworkIcon network={thread.networkId} size={13} badge />
              </div>
            )}
          </div>
          <div className="bg-[#1e2026] hover:bg-[#272a32] px-[12px] py-[4px] rounded-[14px] flex items-center gap-[6px] transition-colors">
            <span className="text-[13px] font-semibold text-white">{thread.title}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-[11px] h-[11px] text-white/40"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Right Chat Actions (Pin, Archive, WebView) */}
        <div className="flex items-center justify-end gap-[6px] min-w-[90px]">
          {thread.networkId !== 'telegram' && NETWORK_WEB_URLS[thread.networkId] && (
            <button
              onClick={() => setWebViewMode(true)}
              className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-[8px] py-[3px] rounded-[6px] border border-emerald-500/20 transition-colors"
            >
              Live Web
            </button>
          )}
          <button
            onClick={() => onTogglePin?.(thread.id)}
            title={thread.isPinned ? 'Unpin Chat' : 'Pin Chat'}
            className={`w-[28px] h-[28px] rounded-[7px] flex items-center justify-center transition-colors ${
              thread.isPinned
                ? 'bg-[#0a84ff]/20 text-[#0a84ff]'
                : 'text-white/55 hover:text-white hover:bg-white/10'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px]">
              <line x1="12" y1="17" x2="12" y2="22" />
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
            </svg>
          </button>
          <button
            onClick={() => onToggleArchive?.(thread.id)}
            title="Archive Chat (Ctrl+E)"
            className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center text-white/55 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px]">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-[16px] py-[12px] space-y-[10px]">
        {/* Sticky Date Separator */}
        <div className="flex items-center justify-center my-[8px]">
          <div className="bg-[#0d0d0f] border border-[#232326] text-[#9b9ba2] text-[11px] font-semibold px-[12px] py-[3px] rounded-full shadow-xs">
            {t('todayPill')}
          </div>
        </div>

        {/* Messages List */}
        {messages.map((msg) => {
          const isMe = msg.isOutgoing;
          return (
            <div
              key={msg.id}
              onDoubleClick={() => handleDoubleClickMessage(msg)}
              className={`flex items-end gap-[8px] group relative ${
                isMe ? 'justify-end' : 'justify-start'
              }`}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              {/* Other party avatar */}
              {!isMe && (
                <div className="w-[32px] h-[32px] shrink-0 mb-[2px]">
                  <img
                    src={msg.senderAvatar || thread.avatarUrl}
                    alt={msg.senderName}
                    className="w-[32px] h-[32px] rounded-full object-cover bg-white/10"
                  />
                </div>
              )}

              {/* Message Bubble Column */}
              <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Reply snippet if any */}
                {msg.replyTo && (
                  <div
                    className={`mb-[4px] px-[10px] py-[4px] rounded-[10px] bg-white/[0.06] ${
                      isRtl ? 'border-r-2' : 'border-l-2'
                    } border-[#2561fb] text-[11px] text-white/60 max-w-full truncate`}
                  >
                    <span className="font-semibold text-white/80 me-1">
                      {msg.replyTo.senderName}:
                    </span>
                    {msg.replyTo.snippet}
                  </div>
                )}

                {/* Bubble Container */}
                <div
                  style={{ fontSize: `${fontSizePx}px` }}
                  className={`relative px-[12px] py-[8px] rounded-[17px] leading-relaxed break-words shadow-xs ${
                    isMe
                      ? `bg-[#0a84ff] text-white ${isRtl ? 'rounded-bl-[4px]' : 'rounded-br-[4px]'}`
                      : `bg-[#22242a] text-[#ededed] border border-white/[0.05] ${
                          isRtl ? 'rounded-br-[4px]' : 'rounded-bl-[4px]'
                        }`
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
                  <div dir="auto" className="leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center justify-end gap-[4px] mt-[2px]">
                    {copiedId === msg.id && (
                      <span className="text-[10px] text-emerald-300 mr-1">Copied!</span>
                    )}
                    <span className="text-[10.5px] text-white/60 font-normal leading-none">
                      {msg.timestamp}
                    </span>
                    {isMe && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="w-[12px] h-[12px] text-white/80"
                      >
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
                  <button
                    onClick={() => setReplyingTo(msg)}
                    title={t('reply')}
                    className="text-white/60 hover:text-white p-[2px]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-[13px] h-[13px]"
                    >
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

      {/* Reply Banner */}
      {replyingTo && (
        <div className="px-[16px] py-[6px] bg-[#141415] border-t border-white/10 flex items-center justify-between text-[12px] z-20">
          <div className="flex items-center gap-[8px] truncate">
            <span className="text-[#0a84ff] font-semibold">
              {t('reply')} {replyingTo.senderName}:
            </span>
            <span className="text-white/60 truncate">{replyingTo.content}</span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-white/40 hover:text-white px-[4px]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-[58px] end-[58px] z-30 bg-[#1c1c1e] border border-white/10 rounded-[14px] p-[10px] shadow-2xl grid grid-cols-6 gap-[6px]">
          {['😀', '😂', '❤️', '🔥', '👍', '🙏', '🎉', '✨', '😎', '🤔', '💯', '🚀'].map((em) => (
            <button
              key={em}
              onClick={() => {
                setInputText((prev) => prev + em);
                setShowEmojiPicker(false);
              }}
              className="w-[32px] h-[32px] rounded-[8px] hover:bg-white/10 flex items-center justify-center text-[18px] transition-transform hover:scale-110"
            >
              {em}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Composer Bar (52px) */}
      <div className="h-[52px] px-[12px] pb-[8px] pt-[4px] bg-[#000000] flex items-center gap-[8px] z-20">
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
        <button
          onClick={() => fileInputRef.current?.click()}
          title={t('addAttachment')}
          className="w-[34px] h-[34px] rounded-full bg-[#1c1c1d] hover:bg-white/10 flex items-center justify-center text-[#9b9ba2] hover:text-white transition-colors shrink-0"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-[17px] h-[17px]"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <div className="flex-1 h-[36px] bg-[#1c1c1d] rounded-full px-[12px] flex items-center gap-[8px] border border-white/5 focus-within:border-white/20 transition-all">
          {settings.showNetworkIcons && <NetworkIcon network={thread.networkId} size={16} badge />}

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('messagePlaceholder', { name: thread.title, network: thread.networkId })}
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder-white/40 font-normal"
          />

          <div className="flex items-center gap-[6px]">
            <button
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="text-[#9b9ba2] hover:text-white transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-[17px] h-[17px]"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </button>

            <button
              onClick={() => onSendMessage('🎤 Voice Message (0:05)')}
              title={t('recordAudio')}
              className="text-[#9b9ba2] hover:text-white transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-[17px] h-[17px]"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          title={t('send')}
          className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all shrink-0 ${
            inputText.trim()
              ? 'bg-[#2561fb] hover:bg-[#1a50db] text-white shadow-md'
              : 'bg-[#38383d] text-white/40 cursor-not-allowed'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-[16px] h-[16px]"
          >
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
