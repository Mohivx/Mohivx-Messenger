import React, { useState } from 'react';
import { Account } from '../types';
import { NetworkIcon } from './NetworkIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onOpenAddAccount: () => void;
  onDisconnectAccount?: (account: Account) => void;
}

type SettingsTab =
  | 'accounts'
  | 'general'
  | 'appearance'
  | 'notifications'
  | 'hotkeys'
  | 'devices'
  | 'ai'
  | 'plus'
  | 'integrations'
  | 'storage'
  | 'about';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onOpenAddAccount,
  onDisconnectAccount,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('accounts');
  const [showNetworkIcons, setShowNetworkIcons] = useState(true);
  const [colorizeIcons, setColorizeIcons] = useState(true);
  const [incognito, setIncognito] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(true);

  if (!isOpen) return null;

  const tabs: { id: SettingsTab; label: string; badge?: string }[] = [
    { id: 'accounts', label: 'Accounts', badge: `${accounts.length}` },
    { id: 'general', label: 'General' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'hotkeys', label: 'Hotkeys' },
    { id: 'devices', label: 'Devices' },
    { id: 'ai', label: 'AI' },
    { id: 'plus', label: 'Mohivx Plus' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'storage', label: 'Storage' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 select-none animate-in fade-in duration-150">
      <div
        className="w-[820px] h-[640px] bg-[#141415] border border-white/10 rounded-[16px] shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Settings Sidebar */}
        <div className="w-[240px] bg-[#1a1a1c] border-r border-white/5 p-[14px] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-[16px]">
              <h2 className="text-[16px] font-semibold text-white">Settings</h2>
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

            {/* User Profile Card */}
            <div className="flex items-center gap-[10px] p-[8px] rounded-[10px] bg-white/5 mb-[16px]">
              <img src="./assets/icon-64.png" alt="Mohivx" className="w-[36px] h-[36px] rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-white">Mohivx</span>
                  <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-[5px] py-[1px] rounded-full">Active</span>
                </div>
                <div className="text-[11px] text-white/50 truncate">mohivx@gmail.com</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="space-y-[2px]">
              {tabs.map((t) => {
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full flex items-center justify-between px-[12px] py-[8px] rounded-[8px] text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{t.label}</span>
                    {t.badge && (
                      <span className="text-[11px] bg-white/10 px-[6px] py-[1px] rounded-full text-white/80">
                        {t.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-white/40 px-[8px]">
            Mohivx Messenger v1.1.0
          </div>
        </div>

        {/* Right Settings Content Area */}
        <div className="flex-1 p-[24px] overflow-y-auto">
          {activeTab === 'accounts' && (
            <div>
              <div className="flex items-center justify-between mb-[16px]">
                <div>
                  <h3 className="text-[16px] font-semibold text-white">Connected Accounts</h3>
                  <p className="text-[12px] text-white/50">Manage your connected messaging networks.</p>
                </div>
                <button
                  onClick={onOpenAddAccount}
                  className="px-[12px] py-[6px] bg-[#2561fb] hover:bg-[#1a50db] text-white text-[12px] font-semibold rounded-[8px] transition-colors flex items-center gap-[6px]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[14px] h-[14px]">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Add Account</span>
                </button>
              </div>

              <div className="space-y-[10px]">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-[12px] rounded-[12px] bg-white/5 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-[12px]">
                      <NetworkIcon network={acc.networkId} size={36} />
                      <div>
                        <div className="text-[14px] font-semibold text-white">{acc.displayName}</div>
                        <div className="text-[12px] text-white/50">{acc.username}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <span className="text-[11px] text-green-400 bg-green-500/10 px-[8px] py-[2px] rounded-full font-medium">
                        Connected
                      </span>
                      {onDisconnectAccount && acc.networkId === 'telegram' && (
                        <button
                          data-testid="disconnect-telegram-btn"
                          onClick={() => onDisconnectAccount(acc)}
                          className="text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10 px-[8px] py-[3px] rounded-[6px] border border-red-500/20 transition-all font-medium"
                        >
                          Disconnect
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-[20px]">
              <div>
                <h3 className="text-[16px] font-semibold text-white mb-[4px]">General Settings</h3>
                <p className="text-[12px] text-white/50">Configure core messaging behavior.</p>
              </div>

              <div className="p-[16px] bg-white/5 border border-white/5 rounded-[12px] space-y-[14px]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-white">Incognito Mode</div>
                    <div className="text-[11px] text-white/50">Keep chats unread and suppress read receipts.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={incognito}
                    onChange={(e) => setIncognito(e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#2561fb] cursor-pointer"
                  />
                </div>

                <div className="h-[1px] bg-white/5" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-white">Typing Indicators</div>
                    <div className="text-[11px] text-white/50">Broadcast when you are typing a response.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={typingIndicator}
                    onChange={(e) => setTypingIndicator(e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#2561fb] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-[20px]">
              <div>
                <h3 className="text-[16px] font-semibold text-white mb-[4px]">Appearance</h3>
                <p className="text-[12px] text-white/50">Customize the visual styling of Mohivx Messenger.</p>
              </div>

              <div className="p-[16px] bg-white/5 border border-white/5 rounded-[12px] space-y-[14px]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-white">Show Network Icons</div>
                    <div className="text-[11px] text-white/50">Display small badges on contact avatars.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showNetworkIcons}
                    onChange={(e) => setShowNetworkIcons(e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#2561fb] cursor-pointer"
                  />
                </div>

                <div className="h-[1px] bg-white/5" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-white">Colorize Network Icons</div>
                    <div className="text-[11px] text-white/50">Use original brand colors for service icons.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={colorizeIcons}
                    onChange={(e) => setColorizeIcons(e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#2561fb] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hotkeys' && (
            <div className="space-y-[16px]">
              <div>
                <h3 className="text-[16px] font-semibold text-white mb-[4px]">Keyboard Shortcuts</h3>
                <p className="text-[12px] text-white/50">Navigate fast like a pro.</p>
              </div>

              <div className="grid grid-cols-2 gap-[10px]">
                {[
                  { name: 'Search Chats / Command Palette', keys: 'Ctrl + K' },
                  { name: 'New Chat / Group', keys: 'Ctrl + N' },
                  { name: 'Open Settings', keys: 'Ctrl + ,' },
                  { name: 'Inbox View', keys: 'Ctrl + Alt + 1' },
                  { name: 'Archive View', keys: 'Ctrl + Alt + 2' },
                  { name: 'Telegram Space', keys: 'Ctrl + Alt + 9' },
                  { name: 'WhatsApp Space', keys: 'Ctrl + Alt + 8' },
                  { name: 'Send Message', keys: 'Enter' },
                ].map((hk, i) => (
                  <div key={i} className="p-[10px] rounded-[10px] bg-white/5 flex items-center justify-between">
                    <span className="text-[12px] text-white/80">{hk.name}</span>
                    <span className="text-[11px] font-mono bg-white/10 px-[6px] py-[2px] rounded text-white font-semibold">
                      {hk.keys}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="flex flex-col items-center justify-center text-center pt-[20px] space-y-[16px]">
              <img src="./assets/icon-128.png" alt="Mohivx Logo" className="w-[84px] h-[84px] object-contain drop-shadow-xl" />
              <div>
                <h3 className="text-[20px] font-bold text-white tracking-wide">Mohivx Messenger</h3>
                <p className="text-[12px] text-[#2561fb] font-semibold mt-[2px]">Version 1.1.0 (Telegram MTProto Enabled)</p>
                <p className="text-[12px] text-white/60 mt-[8px] max-w-[420px] leading-relaxed">
                  تطبيق المراسلة الموحد لنظام Windows 11 — تجربة مستوحاة بدقة بصرية متطابقة من Beeper، مع الحفاظ الكامل على استقلالية الكود والأمان المحلي المشفر.
                </p>
              </div>

              <div className="p-[14px] bg-white/5 border border-white/5 rounded-[12px] w-full max-w-[400px] text-left text-[12px] space-y-[6px]">
                <div className="flex justify-between">
                  <span className="text-white/50">المطور:</span>
                  <span className="text-white font-medium">Mohivx</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">المستودع:</span>
                  <span className="text-[#2561fb] font-medium">github.com/Mohivx/Mohivx-Messenger</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">البيئة:</span>
                  <span className="text-white font-medium">Windows 11 x64</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
