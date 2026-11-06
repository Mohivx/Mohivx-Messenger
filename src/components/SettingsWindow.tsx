import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DirectionMode } from '../i18n/translations';
import { NetworkIcon } from './NetworkIcon';
import { Account, NetworkId } from '../types';
import mohivxIcon64 from '../assets/icon-64.png';
import mohivxLogo128 from '../assets/icon-128.png';
import braveLogo from '../assets/browser-logos/brave.svg';

type SettingsTab =
  | 'profile'
  | 'accounts'
  | 'general'
  | 'appearance'
  | 'notifications'
  | 'hotkeys'
  | 'devices'
  | 'ai'
  | 'storage'
  | 'about';

interface AppSettings {
  launchOnStartup: boolean;
  closeToTray: boolean;
  minimizeToTray: boolean;
  hardwareAcceleration: boolean;
  theme: string;
  density: string;
  directionMode: DirectionMode;
  language: string;
  notifications: boolean;
  soundEnabled: boolean;
  unreadBadge: boolean;
  dnd: boolean;
  aiModel: string;
  geminiApiKey: string;
  autoSummarize: boolean;
  smartReplies: boolean;
  displayName?: string;
  username?: string;
  bio?: string;
}

export const SettingsWindow: React.FC = () => {
  const { language, setLanguage, directionMode, setDirectionMode, dir, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [settings, setSettings] = useState<AppSettings>({
    launchOnStartup: false,
    closeToTray: true,
    minimizeToTray: true,
    hardwareAcceleration: true,
    theme: 'dark',
    density: 'comfortable',
    directionMode: 'auto',
    language: 'ar',
    notifications: true,
    soundEnabled: true,
    unreadBadge: true,
    dnd: false,
    aiModel: 'gemini-2.0-flash',
    geminiApiKey: '',
    autoSummarize: true,
    smartReplies: true,
    displayName: 'Mohivx',
    username: '@mohivx2',
    bio: 'Software Engineer & AI Architect',
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem('mohivx_accounts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'acc-tg-1',
        networkId: 'telegram',
        username: 'mohivx',
        displayName: 'Mohivx',
        avatarUrl: mohivxLogo128,
        connectedAt: '2026-10-31',
        status: 'active',
      },
    ];
  });

  const [cacheStatus, setCacheStatus] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [availableUpdate, setAvailableUpdate] = useState<any | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Initialize from electron settings
  useEffect(() => {
    const api = (window as any).mohivxApi;
    if (api?.getAppSettings) {
      api.getAppSettings().then((s: any) => {
        if (s) {
          setSettings((prev) => ({ ...prev, ...s }));
          if (s.directionMode) setDirectionMode(s.directionMode);
          if (s.language && s.language !== language) setLanguage(s.language);
        }
      });
    }

    if (api?.onSetSettingsTab) {
      api.onSetSettingsTab((tab: string) => {
        if (tab) setActiveTab(tab as SettingsTab);
      });
    }

    if (api?.onNetworkAuthSuccess) {
      api.onNetworkAuthSuccess((acc: Account) => {
        setAccounts((prev) => {
          const filtered = prev.filter((a) => a.networkId !== acc.networkId);
          const next = [...filtered, acc];
          localStorage.setItem('mohivx_accounts', JSON.stringify(next));
          return next;
        });
      });
    }

    // Parse URL hash for initial tab
    try {
      const hash = window.location.hash;
      const tabMatch = hash.match(/tab=([a-z]+)/);
      if (tabMatch && tabMatch[1]) {
        setActiveTab(tabMatch[1] as SettingsTab);
      }
    } catch {}
  }, []);

  const handleUpdateSetting = async (key: keyof AppSettings, value: any) => {
    const next = { ...settings, [key]: value };
    setSettings(next);

    if (key === 'directionMode') {
      setDirectionMode(value);
    } else if (key === 'language') {
      setLanguage(value);
    }

    const api = (window as any).mohivxApi;
    if (api?.saveAppSettings) {
      await api.saveAppSettings({ [key]: value });
    }

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 1500);
  };

  const handleClearCache = async () => {
    setCacheStatus('Clearing cache...');
    const api = (window as any).mohivxApi;
    if (api?.clearAppCache) {
      const res = await api.clearAppCache();
      if (res.success) {
        setCacheStatus('Cache cleared (0 MB)');
      } else {
        setCacheStatus('Failed to clear cache');
      }
    } else {
      setCacheStatus('Cache cleared');
    }
    setTimeout(() => setCacheStatus(null), 3000);
  };

  const handleOpenFolder = async () => {
    const api = (window as any).mohivxApi;
    if (api?.openAppDataFolder) {
      await api.openAppDataFolder();
    }
  };

  const handleCheckUpdates = async () => {
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
    }
  };

  const handleStartUpdate = async () => {
    if (!availableUpdate?.downloadUrl) return;
    const api = (window as any).mohivxApi;
    api?.updater?.onUpdateProgress?.((p: any) => {
      setDownloadProgress(p.percent);
    });
    api?.updater?.onUpdateDownloaded?.(() => {
      setUpdateDownloaded(true);
      setDownloadProgress(null);
    });
    await api?.updater?.startUpdate?.(availableUpdate.downloadUrl);
  };

  const handleOpenBraveInstagramSaved = async () => {
    const api = (window as any).mohivxApi;
    const url = 'https://www.instagram.com/mohivx2/saved/';
    if (api?.openBraveUrl) {
      await api.openBraveUrl(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const handleConnectNetwork = async (networkId: NetworkId) => {
    const api = (window as any).mohivxApi;
    if (api?.openNetworkLogin) {
      await api.openNetworkLogin(networkId);
    }
  };

  const handleDisconnect = (acc: Account) => {
    setAccounts((prev) => {
      const next = prev.filter((a) => a.id !== acc.id);
      localStorage.setItem('mohivx_accounts', JSON.stringify(next));
      return next;
    });
  };

  const navItems: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'profile', label: language === 'ar' ? 'الملف الشخصي' : 'Profile', icon: '👤' },
    { id: 'accounts', label: language === 'ar' ? 'الحسابات والربط' : 'Accounts & Bridges', icon: '⚡' },
    { id: 'general', label: language === 'ar' ? 'عام' : 'General', icon: '⚙️' },
    { id: 'appearance', label: language === 'ar' ? 'المظهر والواجهة' : 'Appearance', icon: '🎨' },
    { id: 'notifications', label: language === 'ar' ? 'الإشعارات والأصوات' : 'Notifications', icon: '🔔' },
    { id: 'hotkeys', label: language === 'ar' ? 'اختصارات المفاتيح' : 'Hotkeys', icon: '⌨️' },
    { id: 'devices', label: language === 'ar' ? 'الأجهزة والأمان' : 'Devices & Security', icon: '🛡️' },
    { id: 'ai', label: language === 'ar' ? 'الذكاء الاصطناعي والمساعد' : 'AI Models', icon: '✨' },
    { id: 'storage', label: language === 'ar' ? 'التخزين والبيانات' : 'Storage & Cache', icon: '💾' },
    { id: 'about', label: language === 'ar' ? 'حول والتحديثات' : 'About & Updates', icon: 'ℹ️' },
  ];

  return (
    <div
      dir={dir}
      className="flex flex-col w-screen h-screen bg-[#18191c] text-[#f2f3f5] font-sans select-none overflow-hidden"
    >
      {/* Sleek Custom Titlebar */}
      <div className="flex items-center justify-between h-[42px] px-[14px] bg-[#141517] border-b border-white/5 select-none window-drag">
        <div className="flex items-center gap-[10px] no-drag">
          <img src={mohivxIcon64} alt="Mohivx" className="w-[20px] h-[20px] object-contain rounded" />
          <span className="text-[13px] font-semibold text-white/90">
            {language === 'ar' ? 'إعدادات Mohivx Messenger' : 'Mohivx Messenger — Preferences'}
          </span>
          <span className="text-[10px] text-white/40 font-mono px-[6px] py-[1px] bg-white/5 rounded">v1.1.0</span>
        </div>

        {/* Window controls */}
        <div className="flex items-center no-drag">
          <button
            onClick={() => (window as any).mohivxApi?.minimizeWindow?.()}
            className="w-[36px] h-[32px] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors text-[14px]"
            title="Minimize"
          >
            ─
          </button>
          <button
            onClick={() => (window as any).mohivxApi?.maximizeWindow?.()}
            className="w-[36px] h-[32px] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors text-[13px]"
            title="Maximize"
          >
            ▢
          </button>
          <button
            onClick={() => (window as any).mohivxApi?.closeWindow?.()}
            className="w-[42px] h-[32px] flex items-center justify-center text-white/60 hover:text-white hover:bg-red-600 transition-colors text-[15px]"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[240px] flex-shrink-0 bg-[#141517]/80 border-r border-white/5 flex flex-col p-[10px] gap-[3px] overflow-y-auto">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-[10px] px-[12px] py-[9px] rounded-[9px] text-[13px] font-medium transition-all text-start ${
                  active
                    ? 'bg-[#2561fb] text-white shadow-sm shadow-[#2561fb]/30 font-semibold'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-[15px]">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          <div className="mt-auto pt-[12px] border-t border-white/5">
            <button
              onClick={handleOpenBraveInstagramSaved}
              className="w-full flex items-center gap-[8px] p-[10px] bg-gradient-to-r from-[#fa7e1e]/20 via-[#d62976]/20 to-[#4f5bd5]/20 border border-white/10 rounded-[10px] text-start hover:border-white/30 transition-all group"
            >
              <img src={braveLogo} alt="Brave" className="w-[18px] h-[18px]" />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-white leading-tight">
                  {language === 'ar' ? 'محفوظات إنستغرام (بريف)' : 'Instagram Saved (Brave)'}
                </div>
                <div className="text-[9px] text-white/50 truncate">0 Tokens · Fast & Direct</div>
              </div>
            </button>
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 bg-[#18191c] p-[28px] overflow-y-auto">
          {saveToast && (
            <div className="fixed top-[52px] end-[24px] z-50 bg-[#2561fb] text-white text-[12px] font-medium px-[14px] py-[7px] rounded-[8px] shadow-lg animate-fade-in flex items-center gap-[6px]">
              <span>✓</span> {language === 'ar' ? 'تم حفظ التغييرات' : 'Settings saved'}
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-[24px] max-w-[620px]">
              <div>
                <h2 className="text-[18px] font-bold text-white">{language === 'ar' ? 'الملف الشخصي' : 'Profile'}</h2>
                <p className="text-[12px] text-white/50 mt-[3px]">
                  {language === 'ar'
                    ? 'بياناتك وهويتك الشخصية عبر جميع تطبيقات وشبكات المحادثة'
                    : 'Your personal identity across all linked messaging networks'}
                </p>
              </div>

              <div className="flex items-center gap-[18px] p-[18px] bg-white/[0.03] border border-white/5 rounded-[14px]">
                <img
                  src={mohivxLogo128}
                  alt="Avatar"
                  className="w-[72px] h-[72px] rounded-full object-cover border-2 border-[#2561fb]"
                />
                <div className="flex-1 space-y-[4px]">
                  <div className="flex items-center gap-[8px]">
                    <span className="text-[16px] font-bold text-white">{settings.displayName}</span>
                    <span className="text-[11px] font-mono bg-white/10 text-white/70 px-[8px] py-[2px] rounded-full">
                      {settings.username}
                    </span>
                  </div>
                  <div className="text-[12px] text-white/60">{settings.bio}</div>
                  <div className="text-[11px] text-[#2561fb] font-medium">● Mohivx Messenger Pro · Active</div>
                </div>
              </div>

              <div className="space-y-[14px]">
                <div>
                  <label className="text-[12px] font-medium text-white/70 mb-[6px] block">
                    {language === 'ar' ? 'الاسم المعروض' : 'Display Name'}
                  </label>
                  <input
                    type="text"
                    value={settings.displayName || ''}
                    onChange={(e) => handleUpdateSetting('displayName', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[10px] px-[14px] py-[9px] text-[13px] text-white focus:outline-none focus:border-[#2561fb]"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-medium text-white/70 mb-[6px] block">
                    {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                  </label>
                  <input
                    type="text"
                    value={settings.username || ''}
                    onChange={(e) => handleUpdateSetting('username', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[10px] px-[14px] py-[9px] text-[13px] text-white focus:outline-none focus:border-[#2561fb]"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-medium text-white/70 mb-[6px] block">
                    {language === 'ar' ? 'النبذة التعريفية' : 'Bio'}
                  </label>
                  <textarea
                    rows={2}
                    value={settings.bio || ''}
                    onChange={(e) => handleUpdateSetting('bio', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[10px] px-[14px] py-[9px] text-[13px] text-white focus:outline-none focus:border-[#2561fb] resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: ACCOUNTS & BRIDGES */}
          {activeTab === 'accounts' && (
            <div className="space-y-[24px] max-w-[660px]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-bold text-white">
                    {language === 'ar' ? 'الحسابات والشبكات المتصلة' : 'Connected Accounts & Bridges'}
                  </h2>
                  <p className="text-[12px] text-white/50 mt-[3px]">
                    {language === 'ar'
                      ? 'ربط مباشر عبر جلسات معزولة أو ماسح المتصفحات التلقائي'
                      : 'Direct authenticated bridges with persistent isolated sessions'}
                  </p>
                </div>
              </div>

              {/* Connected list */}
              <div className="space-y-[10px]">
                <div className="text-[12px] font-semibold text-white/70">
                  {language === 'ar' ? 'الحسابات النشطة' : 'Active Accounts'} ({accounts.length})
                </div>
                {accounts.length === 0 ? (
                  <div className="p-[20px] bg-white/[0.02] border border-white/5 rounded-[12px] text-center text-white/40 text-[13px]">
                    {language === 'ar' ? 'لا توجد حسابات متصلة حالياً' : 'No accounts connected yet'}
                  </div>
                ) : (
                  accounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-[14px] bg-white/[0.03] border border-white/5 rounded-[12px] hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-[12px]">
                        <div className="w-[36px] h-[36px] rounded-[10px] bg-white/5 flex items-center justify-center p-[6px]">
                          <NetworkIcon network={acc.networkId} size={24} />
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-white flex items-center gap-[6px]">
                            <span>{acc.displayName || acc.username}</span>
                            <span className="w-[7px] h-[7px] rounded-full bg-emerald-500" />
                          </div>
                          <div className="text-[11px] text-white/40 font-mono">
                            {acc.networkId} · {acc.connectedAt || 'Active'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-[8px]">
                        <button
                          onClick={() => handleConnectNetwork(acc.networkId)}
                          className="px-[12px] py-[6px] rounded-[8px] bg-white/5 hover:bg-white/10 text-white/80 text-[11px] font-medium border border-white/10"
                        >
                          {language === 'ar' ? 'إعادة الفحص' : 'Reconnect'}
                        </button>
                        <button
                          onClick={() => handleDisconnect(acc)}
                          className="px-[12px] py-[6px] rounded-[8px] bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-medium border border-red-500/20"
                        >
                          {language === 'ar' ? 'فصل' : 'Disconnect'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Network */}
              <div className="space-y-[12px] pt-[12px] border-t border-white/5">
                <div className="text-[12px] font-semibold text-white/70">
                  {language === 'ar' ? 'إضافة شبكة جديدة (ربط فوري)' : 'Connect New Network'}
                </div>
                <div className="grid grid-cols-2 gap-[10px]">
                  {[
                    { id: 'whatsapp' as NetworkId, name: 'WhatsApp Web' },
                    { id: 'instagram' as NetworkId, name: 'Instagram Direct' },
                    { id: 'telegram' as NetworkId, name: 'Telegram' },
                    { id: 'discord' as NetworkId, name: 'Discord' },
                    { id: 'slack' as NetworkId, name: 'Slack' },
                    { id: 'facebook' as NetworkId, name: 'Messenger' },
                    { id: 'x' as NetworkId, name: 'X (Twitter)' },
                    { id: 'googlemessages' as NetworkId, name: 'Google Messages' },
                    { id: 'signal' as NetworkId, name: 'Signal' },
                    { id: 'linkedin' as NetworkId, name: 'LinkedIn' },
                  ].map((net) => (
                    <button
                      key={net.id}
                      onClick={() => handleConnectNetwork(net.id)}
                      className="flex items-center gap-[10px] p-[12px] bg-white/[0.02] border border-white/5 rounded-[12px] hover:bg-white/5 hover:border-[#2561fb]/40 transition-all text-start group"
                    >
                      <div className="w-[32px] h-[32px] rounded-[8px] bg-white/5 flex items-center justify-center p-[6px] group-hover:scale-105 transition-transform">
                        <NetworkIcon network={net.id} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-white">{net.name}</div>
                        <div className="text-[10px] text-white/40">{language === 'ar' ? 'انقر للربط' : 'Click to link'}</div>
                      </div>
                      <span className="text-[14px] text-white/30 group-hover:text-white transition-colors">+</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-[24px] max-w-[620px]">
              <div>
                <h2 className="text-[18px] font-bold text-white">{language === 'ar' ? 'عام' : 'General'}</h2>
                <p className="text-[12px] text-white/50 mt-[3px]">
                  {language === 'ar' ? 'إعدادات التشغيل وسلوك التطبيق ونظام التشغيل' : 'App startup and system behavior'}
                </p>
              </div>

              <div className="space-y-[14px]">
                <div className="flex items-center justify-between p-[14px] bg-white/[0.03] border border-white/5 rounded-[12px]">
                  <div>
                    <div className="text-[13px] font-semibold text-white">
                      {language === 'ar' ? 'التشغيل التلقائي عند بدء Windows' : 'Start on System Boot'}
                    </div>
                    <div className="text-[11px] text-white/50 mt-[2px]">
                      {language === 'ar'
                        ? 'تشغيل Mohivx Messenger في الخلفية تلقائياً عند تسجيل الدخول'
                        : 'Launch Mohivx Messenger in background on login'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.launchOnStartup}
                    onChange={(e) => handleUpdateSetting('launchOnStartup', e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#2561fb] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-[14px] bg-white/[0.03] border border-white/5 rounded-[12px]">
                  <div>
                    <div className="text-[13px] font-semibold text-white">
                      {language === 'ar' ? 'الإغلاق إلى شريط المهام (Tray)' : 'Close to System Tray'}
                    </div>
                    <div className="text-[11px] text-white/50 mt-[2px]">
                      {language === 'ar'
                        ? 'عند الضغط على إغلاق يتم إخفاء التطبيق إلى صينية النظام دون إيقافه'
                        : 'Keep running in system tray when window is closed'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.closeToTray}
                    onChange={(e) => handleUpdateSetting('closeToTray', e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#2561fb] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-[14px] bg-white/[0.03] border border-white/5 rounded-[12px]">
                  <div>
                    <div className="text-[13px] font-semibold text-white">
                      {language === 'ar' ? 'تسريع العتاد الرسومي (Hardware Acceleration)' : 'Hardware Acceleration'}
                    </div>
                    <div className="text-[11px] text-white/50 mt-[2px]">
                      {language === 'ar' ? 'استخدام كرت الشاشة لتحسين أداء الرسوميات والرسائل' : 'Use GPU rendering'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.hardwareAcceleration}
                    onChange={(e) => handleUpdateSetting('hardwareAcceleration', e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#2561fb] cursor-pointer"
                  />
                </div>

                {/* Language Picker */}
                <div className="p-[14px] bg-white/[0.03] border border-white/5 rounded-[12px] space-y-[10px]">
                  <div>
                    <div className="text-[13px] font-semibold text-white">
                      {language === 'ar' ? 'لغة الواجهة' : 'Interface Language'}
                    </div>
                    <div className="text-[11px] text-white/50 mt-[2px]">
                      {language === 'ar' ? 'تغيير لغة النصوص والرموز' : 'Select app display language'}
                    </div>
                  </div>
                  <div className="flex gap-[10px]">
                    <button
                      onClick={() => handleUpdateSetting('language', 'ar')}
                      className={`flex-1 py-[8px] rounded-[8px] text-[12px] font-semibold border ${
                        language === 'ar'
                          ? 'bg-[#2561fb] border-[#2561fb] text-white'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      العربية (Arabic)
                    </button>
                    <button
                      onClick={() => handleUpdateSetting('language', 'en')}
                      className={`flex-1 py-[8px] rounded-[8px] text-[12px] font-semibold border ${
                        language === 'en'
                          ? 'bg-[#2561fb] border-[#2561fb] text-white'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: APPEARANCE & UI */}
          {activeTab === 'appearance' && (
            <div className="space-y-[24px] max-w-[620px]">
              <div>
                <h2 className="text-[18px] font-bold text-white">{language === 'ar' ? 'المظهر والواجهة' : 'Appearance'}</h2>
                <p className="text-[12px] text-white/50 mt-[3px]">
                  {language === 'ar' ? 'تخصيص السمة، اتجاه العناصر، وكثافة العرض' : 'Theme, layout direction, and density'}
                </p>
              </div>

              {/* Layout Direction Selector */}
              <div className="p-[16px] bg-white/[0.03] border border-white/5 rounded-[12px] space-y-[12px]">
                <div>
                  <div className="text-[13px] font-semibold text-white">
                    {language === 'ar' ? 'اتجاه العناصر والواجهة' : 'Layout Direction'}
                  </div>
                  <div className="text-[11px] text-white/50 mt-[2px]">
                    {language === 'ar'
                      ? 'يمكنك تحديد الاتجاه يدوياً من اليمين إلى اليسار أو العكس أو تلقائياً'
                      : 'Choose between RTL, LTR, or Automatic based on language'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-[10px]">
                  {[
                    { id: 'auto' as DirectionMode, label: language === 'ar' ? 'تلقائي' : 'Auto', badge: dir.toUpperCase() },
                    { id: 'rtl' as DirectionMode, label: language === 'ar' ? 'يمين لليسار' : 'RTL', badge: 'RTL ←' },
                    { id: 'ltr' as DirectionMode, label: language === 'ar' ? 'يسار لليمين' : 'LTR', badge: 'LTR →' },
                  ].map((opt) => {
                    const active = directionMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleUpdateSetting('directionMode', opt.id)}
                        className={`p-[12px] rounded-[10px] border text-start transition-all flex flex-col justify-between gap-[8px] ${
                          active
                            ? 'bg-[#2561fb]/20 border-[#2561fb] text-white'
                            : 'bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-mono px-[6px] py-[1px] rounded bg-white/10 text-[#0a84ff] font-bold">
                            {opt.badge}
                          </span>
                          {active && <span className="w-[8px] h-[8px] rounded-full bg-[#2561fb]" />}
                        </div>
                        <span className="text-[12px] font-semibold">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* UI Density */}
              <div className="p-[16px] bg-white/[0.03] border border-white/5 rounded-[12px] space-y-[12px]">
                <div>
                  <div className="text-[13px] font-semibold text-white">
                    {language === 'ar' ? 'كثافة الرسائل والقوائم' : 'Message Density'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-[10px]">
                  {[
                    { id: 'comfortable', label: language === 'ar' ? 'مريح (افتراضي)' : 'Comfortable (Default)' },
                    { id: 'compact', label: language === 'ar' ? 'مدمج (مكثف)' : 'Compact' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => handleUpdateSetting('density', d.id)}
                      className={`p-[12px] rounded-[10px] border text-center text-[12px] font-semibold transition-all ${
                        settings.density === d.id
                          ? 'bg-[#2561fb] border-[#2561fb] text-white'
                          : 'bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/5'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-[24px] max-w-[620px]">
              <div>
                <h2 className="text-[18px] font-bold text-white">
                  {language === 'ar' ? 'الإشعارات والأصوات' : 'Notifications & Sounds'}
                </h2>
                <p className="text-[12px] text-white/50 mt-[3px]">
                  {language === 'ar' ? 'التحكم في تنبيهات سطح المكتب ونغمات الرسائل' : 'Manage desktop alerts and sound effects'}
                </p>
              </div>

              <div className="space-y-[14px]">
                <div className="flex items-center justify-between p-[14px] bg-white/[0.03] border border-white/5 rounded-[12px]">
                  <div>
                    <div className="text-[13px] font-semibold text-white">
                      {language === 'ar' ? 'إشعارات سطح المكتب (Windows 11)' : 'Desktop Notifications'}
                    </div>
                    <div className="text-[11px] text-white/50 mt-[2px]">
                      {language === 'ar' ? 'إظهار لافتة تنبيه عند استلام رسالة جديدة' : 'Show banners for incoming messages'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => handleUpdateSetting('notifications', e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#2561fb] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-[14px] bg-white/[0.03] border border-white/5 rounded-[12px]">
                  <div>
                    <div className="text-[13px] font-semibold text-white">
                      {language === 'ar' ? 'المؤثرات الصوتية للرسائل' : 'Message Sound Effects'}
                    </div>
                    <div className="text-[11px] text-white/50 mt-[2px]">
                      {language === 'ar' ? 'تشغيل نغمة لطيفة عند وصول أو إرسال محادثة' : 'Play audio chime on send & receive'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => handleUpdateSetting('soundEnabled', e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#2561fb] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-[14px] bg-white/[0.03] border border-white/5 rounded-[12px]">
                  <div>
                    <div className="text-[13px] font-semibold text-white">
                      {language === 'ar' ? 'شارة عدد الرسائل غير المقروءة' : 'Unread Count Badge'}
                    </div>
                    <div className="text-[11px] text-white/50 mt-[2px]">
                      {language === 'ar' ? 'إظهار عدد الرسائل على أيقونة شريط المهام' : 'Badge icon in taskbar'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.unreadBadge}
                    onChange={(e) => handleUpdateSetting('unreadBadge', e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#2561fb] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: HOTKEYS */}
          {activeTab === 'hotkeys' && (
            <div className="space-y-[24px] max-w-[620px]">
              <div>
                <h2 className="text-[18px] font-bold text-white">
                  {language === 'ar' ? 'اختصارات لوحة المفاتيح' : 'Keyboard Shortcuts'}
                </h2>
                <p className="text-[12px] text-white/50 mt-[3px]">
                  {language === 'ar' ? 'تحكم سريع واحترافي في كل وظائف التطبيق' : 'Quick navigation shortcuts'}
                </p>
              </div>

              <div className="space-y-[8px]">
                {[
                  { name: language === 'ar' ? 'البحث السريع (Command Palette)' : 'Quick Switcher', key: 'Ctrl + K' },
                  { name: language === 'ar' ? 'محادثة جديدة' : 'New Chat', key: 'Ctrl + N' },
                  { name: language === 'ar' ? 'فتح نافذة الإعدادات' : 'Open Settings', key: 'Ctrl + ,' },
                  { name: language === 'ar' ? 'تبديل اتجاه الواجهة (RTL/LTR)' : 'Toggle Direction', key: 'Ctrl + Shift + L' },
                  { name: language === 'ar' ? 'إغلاق النافذة المنبثقة' : 'Close Popup / Modal', key: 'Esc' },
                  { name: language === 'ar' ? 'التركيز على حقل الكتابة' : 'Focus Message Input', key: '/' },
                ].map((hk, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-[12px] bg-white/[0.02] border border-white/5 rounded-[10px]"
                  >
                    <span className="text-[13px] text-white/80">{hk.name}</span>
                    <span className="px-[10px] py-[3px] bg-white/10 rounded font-mono text-[11px] text-white font-semibold">
                      {hk.key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DEVICES & SECURITY */}
          {activeTab === 'devices' && (
            <div className="space-y-[24px] max-w-[620px]">
              <div>
                <h2 className="text-[18px] font-bold text-white">
                  {language === 'ar' ? 'الأجهزة والأمان' : 'Devices & Security'}
                </h2>
                <p className="text-[12px] text-white/50 mt-[3px]">
                  {language === 'ar' ? 'إدارة الجلسات الحالية وتشفير البيانات الطرفي' : 'Active sessions and encryption'}
                </p>
              </div>

              <div className="p-[16px] bg-white/[0.03] border border-white/5 rounded-[12px] space-y-[10px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[10px]">
                    <span className="text-[20px]">💻</span>
                    <div>
                      <div className="text-[13px] font-semibold text-white">Mohivx Desktop (Windows 11)</div>
                      <div className="text-[11px] text-emerald-400 font-medium">● Current Active Device · E2EE Active</div>
                    </div>
                  </div>
                  <span className="px-[8px] py-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-mono">
                    Online
                  </span>
                </div>
              </div>

              <div className="p-[16px] bg-white/[0.03] border border-white/5 rounded-[12px] space-y-[6px]">
                <div className="text-[13px] font-semibold text-white">
                  {language === 'ar' ? 'التشفير وحماية الخصوصية' : 'End-to-End Encryption'}
                </div>
                <div className="text-[11px] text-white/50 leading-relaxed">
                  {language === 'ar'
                    ? 'جميع الجلسات والرموز مخزنة محلياً على جهازك في مسار مشفر ولا يتم رفع أي سجلات غير مشفرة لأي خادم وسيط.'
                    : 'All credentials and tokens are stored locally with hardware-bound encryption keys.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB: AI MODELS */}
          {activeTab === 'ai' && (
            <div className="space-y-[24px] max-w-[620px]">
              <div>
                <h2 className="text-[18px] font-bold text-white">
                  {language === 'ar' ? 'مساعد الذكاء الاصطناعي (Mohivx AI)' : 'AI Models & Assistant'}
                </h2>
                <p className="text-[12px] text-white/50 mt-[3px]">
                  {language === 'ar'
                    ? 'ربط نماذج Google Gemini لتلخيص المحادثات الطويلة واقتراح الردود الذكية'
                    : 'Integrate Google Gemini models for smart summaries and suggestions'}
                </p>
              </div>

              <div className="space-y-[14px]">
                <div>
                  <label className="text-[12px] font-medium text-white/70 mb-[6px] block">
                    {language === 'ar' ? 'مفتاح Gemini API Key (اختياري)' : 'Gemini API Key'}
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.geminiApiKey || ''}
                      placeholder="AIzaSy..."
                      onChange={(e) => handleUpdateSetting('geminiApiKey', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[10px] px-[14px] py-[9px] text-[13px] text-white font-mono focus:outline-none focus:border-[#2561fb]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute end-[12px] top-[10px] text-[11px] text-white/50 hover:text-white"
                    >
                      {showApiKey ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-medium text-white/70 mb-[6px] block">
                    {language === 'ar' ? 'النموذج النشط' : 'Active Model'}
                  </label>
                  <select
                    value={settings.aiModel || 'gemini-2.0-flash'}
                    onChange={(e) => handleUpdateSetting('aiModel', e.target.value)}
                    className="w-full bg-[#1c1d22] border border-white/10 rounded-[10px] px-[14px] py-[9px] text-[13px] text-white focus:outline-none focus:border-[#2561fb]"
                  >
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fastest · Recommended)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Lightweight)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-[14px] bg-white/[0.03] border border-white/5 rounded-[12px]">
                  <div>
                    <div className="text-[13px] font-semibold text-white">
                      {language === 'ar' ? 'التلخيص التلقائي للمحادثات الطويلة' : 'Auto-Summarize Long Threads'}
                    </div>
                    <div className="text-[11px] text-white/50 mt-[2px]">
                      {language === 'ar' ? 'إنشاء ملخص ذكي لأهم النقاط في المحادثة بضغطة زر' : 'Generate instant bullet summaries'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoSummarize}
                    onChange={(e) => handleUpdateSetting('autoSummarize', e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#2561fb] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: STORAGE & CACHE */}
          {activeTab === 'storage' && (
            <div className="space-y-[24px] max-w-[620px]">
              <div>
                <h2 className="text-[18px] font-bold text-white">
                  {language === 'ar' ? 'التخزين والبيانات' : 'Storage & Cache'}
                </h2>
                <p className="text-[12px] text-white/50 mt-[3px]">
                  {language === 'ar' ? 'التحكم في ذاكرة التخزين المؤقتة وقاعدة البيانات المحلية' : 'Manage local cache and database'}
                </p>
              </div>

              <div className="space-y-[14px]">
                <div className="flex items-center justify-between p-[16px] bg-white/[0.03] border border-white/5 rounded-[12px]">
                  <div>
                    <div className="text-[13px] font-semibold text-white">
                      {language === 'ar' ? 'ذاكرة التخزين المؤقت للصور والملفات' : 'Media & Network Cache'}
                    </div>
                    <div className="text-[11px] text-white/50 mt-[2px]">
                      {cacheStatus || (language === 'ar' ? 'المساحة المستهلكة تقريباً: ~12 MB' : 'Approx ~12 MB used')}
                    </div>
                  </div>
                  <button
                    onClick={handleClearCache}
                    className="px-[14px] py-[8px] bg-white/5 hover:bg-white/10 text-white text-[12px] font-semibold rounded-[8px] border border-white/10 transition-colors"
                  >
                    {language === 'ar' ? 'مسح الذاكرة المؤقتة' : 'Clear Cache'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-[16px] bg-white/[0.03] border border-white/5 rounded-[12px]">
                  <div>
                    <div className="text-[13px] font-semibold text-white">
                      {language === 'ar' ? 'مجلد بيانات التطبيق المحلي' : 'Local App Data Folder'}
                    </div>
                    <div className="text-[11px] text-white/50 mt-[2px]">
                      {language === 'ar' ? 'فتح مجلد قاعدة البيانات والسجلات في مستكشف Windows' : 'Open data and logs directory'}
                    </div>
                  </div>
                  <button
                    onClick={handleOpenFolder}
                    className="px-[14px] py-[8px] bg-[#2561fb]/10 hover:bg-[#2561fb]/20 text-[#2561fb] text-[12px] font-semibold rounded-[8px] border border-[#2561fb]/30 transition-colors"
                  >
                    {language === 'ar' ? 'فتح المجلد' : 'Open in Explorer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ABOUT & UPDATES */}
          {activeTab === 'about' && (
            <div className="space-y-[24px] max-w-[620px]">
              <div>
                <h2 className="text-[18px] font-bold text-white">{language === 'ar' ? 'حول والتحديثات' : 'About & Updates'}</h2>
                <p className="text-[12px] text-white/50 mt-[3px]">
                  {language === 'ar' ? 'معلومات الإصدار والترقية التلقائية' : 'Version info and automated updater'}
                </p>
              </div>

              <div className="flex items-center gap-[18px] p-[20px] bg-white/[0.03] border border-white/5 rounded-[16px]">
                <img src={mohivxIcon64} alt="Mohivx" className="w-[56px] h-[56px] object-contain rounded-[12px]" />
                <div className="flex-1 space-y-[4px]">
                  <div className="text-[16px] font-bold text-white">Mohivx Messenger Desktop</div>
                  <div className="text-[12px] text-white/50 font-mono">
                    Version 1.1.0 · Build 2026.11 · Windows 11 x64
                  </div>
                  <div className="text-[11px] text-white/40">The Unified Messenger Inspired by Beeper</div>
                </div>
              </div>

              {/* Updater Card */}
              <div className="p-[18px] bg-white/[0.03] border border-white/5 rounded-[14px] space-y-[12px]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-white">
                      {language === 'ar' ? 'الترقية والتحديثات التلقائية' : 'In-App Auto Updater'}
                    </div>
                    <div className="text-[11px] text-white/50 mt-[2px]">
                      {updateStatus ||
                        (availableUpdate
                          ? `${t('updateAvailable')}: ${availableUpdate.latestVersion}`
                          : language === 'ar'
                          ? 'أنت على أحدث إصدار متوفر'
                          : 'Up to date')}
                    </div>
                  </div>
                  {!availableUpdate && (
                    <button
                      onClick={handleCheckUpdates}
                      className="px-[14px] py-[8px] bg-[#2561fb] hover:bg-[#1f51db] text-white text-[12px] font-semibold rounded-[8px] transition-colors"
                    >
                      {language === 'ar' ? 'فحص التحديثات' : 'Check for Updates'}
                    </button>
                  )}
                </div>

                {availableUpdate && (
                  <div className="pt-[10px] border-t border-white/5 space-y-[10px]">
                    <div className="text-[12px] text-white/80 font-medium">{availableUpdate.releaseName}</div>
                    {downloadProgress !== null ? (
                      <div className="space-y-[6px]">
                        <div className="w-full bg-white/10 h-[6px] rounded-full overflow-hidden">
                          <div
                            className="bg-[#2561fb] h-full transition-all duration-300"
                            style={{ width: `${downloadProgress}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-white/50 text-end">{downloadProgress}%</div>
                      </div>
                    ) : updateDownloaded ? (
                      <button
                        onClick={() => (window as any).mohivxApi?.updater?.installAndRestart?.()}
                        className="w-full py-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-[8px] text-[12px]"
                      >
                        {t('restartAndInstall')}
                      </button>
                    ) : (
                      <button
                        onClick={handleStartUpdate}
                        className="w-full py-[10px] bg-[#2561fb] hover:bg-[#1f51db] text-white font-semibold rounded-[8px] text-[12px]"
                      >
                        {t('downloadUpdate')}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="flex gap-[12px] text-[12px] text-white/60">
                <button
                  onClick={() => (window as any).mohivxApi?.updater?.openReleasePage?.()}
                  className="hover:text-white underline underline-offset-4"
                >
                  GitHub Repository
                </button>
                <span>·</span>
                <button
                  onClick={handleOpenBraveInstagramSaved}
                  className="hover:text-white underline underline-offset-4 flex items-center gap-[4px]"
                >
                  <img src={braveLogo} alt="Brave" className="w-[12px] h-[12px]" />
                  <span>Instagram Saved Hub</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
