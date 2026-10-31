import React, { useState } from 'react';
import { Account } from '../types';
import { NetworkIcon } from './NetworkIcon';
import { useLanguage } from '../i18n/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onOpenAddAccount: () => void;
  onDisconnectAccount?: (account: Account) => void;
}

type SettingsTab =
  | 'accounts'
  | 'language'
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
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingsTab>('accounts');
  const [showNetworkIcons, setShowNetworkIcons] = useState(true);
  const [colorizeIcons, setColorizeIcons] = useState(true);
  const [incognito, setIncognito] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(true);

  if (!isOpen) return null;

  const tabs: { id: SettingsTab; label: string; badge?: string }[] = [
    { id: 'accounts', label: t('tabAccounts'), badge: `${accounts.length}` },
    { id: 'language', label: t('tabLanguage') },
    { id: 'general', label: t('tabGeneral') },
    { id: 'appearance', label: t('tabAppearance') },
    { id: 'notifications', label: t('tabNotifications') },
    { id: 'hotkeys', label: t('tabHotkeys') },
    { id: 'devices', label: t('tabDevices') },
    { id: 'about', label: t('tabAbout') },
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
              <h2 className="text-[16px] font-semibold text-white">{t('settingsTitle')}</h2>
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
                  <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-[5px] py-[1px] rounded-full">{t('active')}</span>
                </div>
                <div className="text-[11px] text-white/50 truncate">mohivx@gmail.com</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="space-y-[2px]">
              {tabs.map((tItem) => {
                const isActive = activeTab === tItem.id;
                return (
                  <button
                    key={tItem.id}
                    onClick={() => setActiveTab(tItem.id)}
                    className={`w-full flex items-center justify-between px-[12px] py-[8px] rounded-[8px] text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{tItem.label}</span>
                    {tItem.badge && (
                      <span className="text-[11px] bg-white/10 px-[6px] py-[1px] rounded-full text-white/80">
                        {tItem.badge}
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
                  <h3 className="text-[16px] font-semibold text-white">{t('tabAccounts')}</h3>
                  <p className="text-[12px] text-white/50">{t('connectedAccountsDesc')}</p>
                </div>
                <button
                  onClick={onOpenAddAccount}
                  className="px-[12px] py-[6px] bg-[#2561fb] hover:bg-[#1a50db] text-white text-[12px] font-semibold rounded-[8px] transition-colors flex items-center gap-[6px]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[14px] h-[14px]">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>{t('addAccount')}</span>
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
                        {t('connected')}
                      </span>
                      {onDisconnectAccount && acc.networkId === 'telegram' && (
                        <button
                          data-testid="disconnect-telegram-btn"
                          onClick={() => onDisconnectAccount(acc)}
                          className="text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10 px-[8px] py-[3px] rounded-[6px] border border-red-500/20 transition-all font-medium"
                        >
                          {t('disconnect')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="space-y-[20px]">
              <div>
                <h3 className="text-[16px] font-semibold text-white mb-[4px]">{t('tabLanguage')}</h3>
                <p className="text-[12px] text-white/50">{t('languageDesc')}</p>
              </div>

              <div className="p-[16px] bg-white/5 border border-white/5 rounded-[12px] space-y-[14px]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-white">العربية (Arabic)</div>
                    <div className="text-[11px] text-white/50">تفعيل الواجهة العربية بالكامل ودعم RTL</div>
                  </div>
                  <button
                    onClick={() => setLanguage('ar')}
                    className={`px-[16px] py-[6px] rounded-full text-[12px] font-semibold transition-all ${
                      language === 'ar'
                        ? 'bg-[#2561fb] text-white shadow-md ring-2 ring-[#2561fb]/40'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {language === 'ar' ? 'مفعّل ✓' : 'اختيار'}
                  </button>
                </div>

                <div className="h-[1px] bg-white/5" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-white">English</div>
                    <div className="text-[11px] text-white/50">Standard English interface with LTR alignment</div>
                  </div>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-[16px] py-[6px] rounded-full text-[12px] font-semibold transition-all ${
                      language === 'en'
                        ? 'bg-[#2561fb] text-white shadow-md ring-2 ring-[#2561fb]/40'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {language === 'en' ? 'Active ✓' : 'Select'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-[20px]">
              <div>
                <h3 className="text-[16px] font-semibold text-white mb-[4px]">{t('tabGeneral')}</h3>
                <p className="text-[12px] text-white/50">Configure core messaging behavior.</p>
              </div>

              <div className="p-[16px] bg-white/5 border border-white/5 rounded-[12px] space-y-[14px]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-white">{t('incognitoMode')}</div>
                    <div className="text-[11px] text-white/50">{t('incognitoDesc')}</div>
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
                    <div className="text-[13px] font-semibold text-white">{t('typingIndicator')}</div>
                    <div className="text-[11px] text-white/50">{t('typingIndicatorDesc')}</div>
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
                <h3 className="text-[16px] font-semibold text-white mb-[4px]">{t('tabAppearance')}</h3>
                <p className="text-[12px] text-white/50">Customize the visual styling of Mohivx Messenger.</p>
              </div>

              <div className="p-[16px] bg-white/5 border border-white/5 rounded-[12px] space-y-[14px]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-white">{t('showNetworkIcons')}</div>
                    <div className="text-[11px] text-white/50">{t('showNetworkIconsDesc')}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showNetworkIcons}
                    onChange={(e) => setShowNetworkIcons(e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#2561fb] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hotkeys' && (
            <div className="space-y-[16px]">
              <div>
                <h3 className="text-[16px] font-semibold text-white mb-[4px]">{t('tabHotkeys')}</h3>
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
                <p className="text-[12px] text-[#2561fb] font-semibold mt-[2px]">Version 1.1.0 (Bilingual AR / EN)</p>
                <p className="text-[12px] text-white/60 mt-[8px] max-w-[440px] leading-relaxed">
                  {language === 'ar'
                    ? 'تطبيق المراسلة الموحد لنظام Windows 11 — تجربة مستوحاة بدقة بصرية متطابقة من Beeper، مع الحفاظ الكامل على استقلالية الكود والأمان المحلي المشفر ودعم ثنائي اللغة.'
                    : 'The unified messaging desktop application for Windows 11 — 1:1 Beeper visual parity with independent architecture, local encryption, and bilingual Arabic/English support.'}
                </p>
              </div>

              <div className="p-[14px] bg-white/5 border border-white/5 rounded-[12px] w-full max-w-[420px] text-left text-[12px] space-y-[6px]">
                <div className="flex justify-between">
                  <span className="text-white/50">{t('developer')}:</span>
                  <span className="text-white font-medium">Mohivx</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">{t('repository')}:</span>
                  <span className="text-[#2561fb] font-medium">github.com/Mohivx/Mohivx-Messenger</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">{t('environment')}:</span>
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
