import React, { useState } from 'react';
import { Account } from '../types';
import { NetworkIcon } from './NetworkIcon';
import { useLanguage } from '../i18n/LanguageContext';
import { DirectionMode } from '../i18n/translations';
import mohivxIcon64 from '../assets/icon-64.png';
import mohivxLogo128 from '../assets/icon-128.png';
import braveLogo from '../assets/browser-logos/brave.svg';

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
  | 'about';

const DirectionSelectorCard: React.FC = () => {
  const { directionMode, setDirectionMode, dir, t } = useLanguage();

  const options: { id: DirectionMode; label: string; badge: string }[] = [
    { id: 'auto', label: t('dirAuto'), badge: dir.toUpperCase() },
    { id: 'rtl', label: t('dirRtl'), badge: 'RTL ←' },
    { id: 'ltr', label: t('dirLtr'), badge: 'LTR →' },
  ];

  return (
    <div className="p-[16px] bg-white/5 border border-white/5 rounded-[12px] space-y-[12px]">
      <div>
        <div className="text-[13px] font-semibold text-white">{t('layoutDirection')}</div>
        <div className="text-[11px] text-white/50 mt-[2px]">{t('layoutDirectionDesc')}</div>
      </div>

      <div className="grid grid-cols-3 gap-[8px]">
        {options.map((opt) => {
          const active = directionMode === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setDirectionMode(opt.id)}
              className={`p-[10px] rounded-[10px] border text-start transition-all flex flex-col justify-between gap-[6px] ${
                active
                  ? 'bg-[#2561fb]/20 border-[#2561fb] text-white shadow-sm'
                  : 'bg-white/[0.03] border-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono px-[6px] py-[1px] rounded bg-white/10 text-[#0a84ff] font-bold">
                  {opt.badge}
                </span>
                {active && (
                  <span className="w-[8px] h-[8px] rounded-full bg-[#2561fb]" />
                )}
              </div>
              <span className="text-[12px] font-semibold leading-tight">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const AboutTabContent: React.FC = () => {
  const { language, t } = useLanguage();
  const [checking, setChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [availableUpdate, setAvailableUpdate] = useState<any | null>(null);

  const handleCheckUpdates = async () => {
    setChecking(true);
    setUpdateStatus(t('checkingForUpdates'));
    try {
      const api = (window as any).mohivxApi;
      if (api?.updater?.checkForUpdates) {
        const info = await api.updater.checkForUpdates();
        if (info.updateAvailable) {
          setAvailableUpdate(info);
          setUpdateStatus(null);
        } else {
          setAvailableUpdate(null);
          setUpdateStatus(t('upToDate'));
        }
      } else {
        setUpdateStatus(t('upToDate'));
      }
    } catch {
      setUpdateStatus(t('upToDate'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center pt-[10px] space-y-[14px]">
      <img src={mohivxLogo128} alt="Mohivx Logo" className="w-[80px] h-[80px] object-contain drop-shadow-xl" />
      <div>
        <h3 className="text-[20px] font-bold text-white tracking-wide">Mohivx Messenger</h3>
        <p className="text-[12px] text-[#0a84ff] font-semibold mt-[2px]">Version 1.1.0 (Stable Release)</p>
        <p className="text-[12px] text-white/60 mt-[6px] max-w-[440px] leading-relaxed">
          {language === 'ar'
            ? 'تطبيق المراسلة الموحد الشامل لنظام Windows 11 — يجمع كل محادثاتك ورسائلك من مختلف المنصات في مكان واحد مع تجربة متطابقة 1:1 مع Beeper.'
            : 'The unified messaging desktop application for Windows 11 — 1:1 Beeper visual parity with independent architecture, local encryption, and bilingual Arabic/English support.'}
        </p>
      </div>

      {/* Software Updates Box */}
      <div className="p-[14px] bg-white/[0.04] border border-white/10 rounded-[12px] w-full max-w-[420px] text-start space-y-[10px]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-semibold text-white">{t('checkForUpdates')}</div>
            <div className="text-[11px] text-white/50">{t('updateChannel')}</div>
          </div>
          <button
            onClick={handleCheckUpdates}
            disabled={checking}
            className="px-[12px] py-[5px] bg-[#0a84ff] hover:bg-[#0071e3] text-white text-[12px] font-semibold rounded-[8px] transition-all disabled:opacity-50 flex items-center gap-[6px]"
          >
            {checking && <div className="w-[12px] h-[12px] border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>{t('checkForUpdates')}</span>
          </button>
        </div>

        {updateStatus && (
          <div className="text-[12px] text-[#0a84ff] bg-[#0a84ff]/10 px-[10px] py-[6px] rounded-[8px] flex items-center gap-[6px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px]">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{updateStatus}</span>
          </div>
        )}

        {availableUpdate && (
          <div className="text-[12px] text-white bg-green-500/10 border border-green-500/20 px-[10px] py-[8px] rounded-[8px] flex items-center justify-between">
            <span>{t('updateAvailableDesc', { version: availableUpdate.latestVersion })}</span>
            <button
              onClick={() => {
                const api = (window as any).mohivxApi;
                if (api?.updater?.startUpdate && availableUpdate.downloadUrl) {
                  api.updater.startUpdate(availableUpdate.downloadUrl);
                } else {
                  api?.updater?.openReleasePage(availableUpdate.releaseUrl);
                }
              }}
              className="px-[10px] py-[3px] bg-green-500 hover:bg-green-600 text-white rounded text-[11px] font-semibold ms-[8px]"
            >
              {t('updateNow')}
            </button>
          </div>
        )}
      </div>

      <div className="p-[14px] bg-white/5 border border-white/5 rounded-[12px] w-full max-w-[420px] text-start text-[12px] space-y-[6px]">
        <div className="flex justify-between">
          <span className="text-white/50">{t('developer')}:</span>
          <span className="text-white font-medium">Mohivx</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">{t('repository')}:</span>
          <span className="text-[#0a84ff] font-medium">github.com/Mohivx/Mohivx-Messenger</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">{t('environment')}:</span>
          <span className="text-white font-medium">Windows 11 x64</span>
        </div>
      </div>
    </div>
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onOpenAddAccount,
  onDisconnectAccount,
}) => {
  const { language, setLanguage, isRtl, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingsTab>('accounts');
  const [showNetworkIcons, setShowNetworkIcons] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [incognito, setIncognito] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(true);
  const [startupLaunch, setStartupLaunch] = useState(true);
  const [minimizeToTray, setMinimizeToTray] = useState(true);
  const [desktopNotifs, setDesktopNotifs] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [messagePreview, setMessagePreview] = useState(true);

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
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-[820px] h-[640px] bg-[#141415] border border-white/10 rounded-[16px] shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div
          className={`w-[245px] bg-[#1a1a1c] ${
            isRtl ? 'border-l' : 'border-r'
          } border-white/5 p-[14px] flex flex-col justify-between shrink-0`}
        >
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
              <img src={mohivxIcon64} alt="Mohivx" className="w-[36px] h-[36px] rounded-full object-contain bg-white/5 p-[2px]" />
              <div className="min-w-0 flex-1 text-start">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-white">Mohivx</span>
                  <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-[5px] py-[1px] rounded-full">{t('active')}</span>
                </div>
                <div className="text-[11px] text-white/50 truncate">Mohivx Messenger Client</div>
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

          <div className="text-[11px] text-white/40 px-[8px] flex items-center justify-between">
            <span>Mohivx Messenger v1.1.0</span>
            <span className="uppercase font-mono text-[10px] bg-white/5 px-[5px] py-[1px] rounded text-white/60">
              {isRtl ? 'RTL' : 'LTR'}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-[24px] overflow-y-auto text-start">
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
                {accounts.length === 0 ? (
                  <div className="p-[36px] text-center bg-white/[0.02] border border-white/5 rounded-[14px]">
                    <div className="w-[48px] h-[48px] mx-auto mb-[12px] rounded-full bg-white/5 flex items-center justify-center text-white/40">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[24px] h-[24px]">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <p className="text-[13px] text-white/60 mb-[16px] max-w-[320px] mx-auto">
                      {t('noAccountsConnected')}
                    </p>
                    <button
                      onClick={onOpenAddAccount}
                      className="px-[18px] py-[8px] bg-[#2561fb] hover:bg-[#1a50db] text-white text-[12px] font-semibold rounded-full shadow-md transition-all"
                    >
                      {t('addAccount')}
                    </button>
                  </div>
                ) : (
                  accounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-[12px] rounded-[12px] bg-white/5 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-[12px]">
                        <NetworkIcon network={acc.networkId} size={36} />
                        <div>
                          <div className="text-[14px] font-semibold text-white">{acc.displayName}</div>
                          <div className="text-[12px] text-white/50 flex items-center gap-[6px]">
                            <span>{acc.username}</span>
                            {acc.username.includes('Brave') && (
                              <img src={braveLogo} alt="Brave" className="w-[12px] h-[12px] inline-block" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <span className="text-[11px] text-green-400 bg-green-500/10 px-[8px] py-[2px] rounded-full font-medium">
                          {t('connected')}
                        </span>
                        {onDisconnectAccount && (
                          <button
                            data-testid={`disconnect-${acc.networkId}-btn`}
                            onClick={() => onDisconnectAccount(acc)}
                            className="text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10 px-[8px] py-[3px] rounded-[6px] border border-red-500/20 transition-all font-medium"
                          >
                            {t('disconnect')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
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
                    <div className="text-[11px] text-white/50">تفعيل الواجهة العربية بالكامل مع محاذاة تلقائية من اليمين لليسار (RTL)</div>
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
                    <div className="text-[11px] text-white/50">Standard English interface with Left-to-Right (LTR) alignment</div>
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

              {/* Manual or Auto RTL/LTR Direction Selector */}
              <DirectionSelectorCard />
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-[20px]">
              <div>
                <h3 className="text-[16px] font-semibold text-white mb-[4px]">{t('tabGeneral')}</h3>
                <p className="text-[12px] text-white/50">
                  {language === 'ar' ? 'إعدادات سلوك المراسلة والنظام الأساسية.' : 'Configure core messaging and system behavior.'}
                </p>
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

                <div className="h-[1px] bg-white/5" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-white">{t('startupLaunch')}</div>
                    <div className="text-[11px] text-white/50">{t('startupLaunchDesc')}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={startupLaunch}
                    onChange={(e) => setStartupLaunch(e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#2561fb] cursor-pointer"
                  />
                </div>

                <div className="h-[1px] bg-white/5" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-white">{t('minimizeToTray')}</div>
                    <div className="text-[11px] text-white/50">{t('minimizeToTrayDesc')}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={minimizeToTray}
                    onChange={(e) => setMinimizeToTray(e.target.checked)}
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
                <p className="text-[12px] text-white/50">
                  {language === 'ar'
                    ? 'تخصيص المظهر والألوان واتجاه العناصر (يمين لليسار / يسار لليمين).'
                    : 'Customize the visual styling and layout direction of Mohivx Messenger.'}
                </p>
              </div>

              <DirectionSelectorCard />

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

                <div className="h-[1px] bg-white/5" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-white">{t('compactMode')}</div>
                    <div className="text-[11px] text-white/50">{t('compactModeDesc')}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={compactMode}
                    onChange={(e) => setCompactMode(e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#2561fb] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-[20px]">
              <div>
                <h3 className="text-[16px] font-semibold text-white mb-[4px]">{t('tabNotifications')}</h3>
                <p className="text-[12px] text-white/50">
                  {language === 'ar'
                    ? 'إدارة تنبيهات سطح المكتب وأصوات الرسائل الواردة والصادرة.'
                    : 'Manage desktop alerts and authentic Beeper message sound effects.'}
                </p>
              </div>

              <div className="p-[16px] bg-white/5 border border-white/5 rounded-[12px] space-y-[14px]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-white">{t('desktopNotifications')}</div>
                    <div className="text-[11px] text-white/50">{t('desktopNotificationsDesc')}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={desktopNotifs}
                    onChange={(e) => setDesktopNotifs(e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#2561fb] cursor-pointer"
                  />
                </div>

                <div className="h-[1px] bg-white/5" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-white">{t('soundEffects')}</div>
                    <div className="text-[11px] text-white/50">{t('soundEffectsDesc')}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEffects}
                    onChange={(e) => setSoundEffects(e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#2561fb] cursor-pointer"
                  />
                </div>

                <div className="h-[1px] bg-white/5" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-white">{t('messagePreview')}</div>
                    <div className="text-[11px] text-white/50">{t('messagePreviewDesc')}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={messagePreview}
                    onChange={(e) => setMessagePreview(e.target.checked)}
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
                <p className="text-[12px] text-white/50">
                  {language === 'ar' ? 'تنقل بسرعة فائقة عبر لوحة المفاتيح.' : 'Navigate fast like a pro.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-[10px]">
                {[
                  { name: t('searchChats'), keys: 'Ctrl + K' },
                  { name: t('newChat'), keys: 'Ctrl + N' },
                  { name: t('settings'), keys: 'Ctrl + ,' },
                  { name: t('inbox'), keys: 'Ctrl + Alt + 1' },
                  { name: t('archive'), keys: 'Ctrl + Alt + 2' },
                  { name: 'Telegram Space', keys: 'Ctrl + Alt + 9' },
                  { name: 'WhatsApp Space', keys: 'Ctrl + Alt + 8' },
                  { name: t('send'), keys: 'Enter' },
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

          {activeTab === 'devices' && (
            <div className="space-y-[16px]">
              <div>
                <h3 className="text-[16px] font-semibold text-white mb-[4px]">{t('tabDevices')}</h3>
                <p className="text-[12px] text-white/50">
                  {language === 'ar'
                    ? 'الأجهزة النشطة ومفاتيح التشفير المحلية.'
                    : 'Active devices and local encryption vaults.'}
                </p>
              </div>

              <div className="p-[16px] bg-white/5 border border-white/5 rounded-[12px] space-y-[12px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[40px] h-[40px] rounded-[10px] bg-[#2561fb]/20 text-[#0a84ff] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[20px] h-[20px]">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-white">{t('currentDevice')}</div>
                      <div className="text-[11px] text-white/50">Windows 11 Desktop • {t('encryptedSession')}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-green-400 bg-green-500/10 px-[8px] py-[2px] rounded-full font-medium">
                    {t('active')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && <AboutTabContent />}
        </div>
      </div>
    </div>
  );
};
