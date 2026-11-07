import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { NetworkIcon } from './NetworkIcon';
import { Account, NetworkId, AppSettings, DEFAULT_APP_SETTINGS } from '../types';
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
  | 'plus'
  | 'integrations'
  | 'storage'
  | 'help'
  | 'about';

// Beeper-style iOS Toggle Switch (36x20px pill)
const BeeperToggle: React.FC<{
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation();
      if (!disabled) onChange(!checked);
    }}
    className={`relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
      checked ? 'bg-[#0a84ff]' : 'bg-white/[0.14] hover:bg-white/[0.22]'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
  >
    <span
      className={`pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow transition duration-200 ease-in-out mt-[2px] ${
        checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
      }`}
    />
  </button>
);

// Beeper-style Pill Select Dropdown (24px height, 12px radius)
const BeeperSelect: React.FC<{
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (val: string) => void;
}> = ({ value, options, onChange }) => (
  <div className="relative inline-flex items-center">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none h-[24px] pl-[10px] pr-[24px] rounded-[12px] bg-white/[0.09] hover:bg-white/[0.14] border border-white/[0.06] text-[12px] font-medium text-[#f5f5f7] focus:outline-none focus:ring-1 focus:ring-[#0a84ff] cursor-pointer transition-colors"
    >
      {options.map((opt) => (
        <option key={String(opt.value)} value={opt.value} className="bg-[#25272c] text-white">
          {opt.label}
        </option>
      ))}
    </select>
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-[11px] h-[11px] text-white/60 pointer-events-none absolute right-[8px]"
    >
      <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

// Beeper "+ Plus" Pill Badge
const PlusBadge: React.FC = () => (
  <span className="inline-flex items-center gap-[2px] px-[6px] py-[1px] rounded-[5px] bg-white/[0.08] text-white/85 text-[10px] font-semibold tracking-tight ml-[6px] select-none">
    <span>+</span>
    <span>Plus</span>
  </span>
);

// Exact Beeper 20x20 Rounded Square Nav Icons
const NavPrefIcon: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span
    className="w-[20px] h-[20px] rounded-[6px] flex items-center justify-center shrink-0 text-white shadow-xs"
    style={{ backgroundColor: color }}
  >
    {children}
  </span>
);

export const SettingsWindow: React.FC = () => {
  const { setLanguage, setDirectionMode } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Bulk archive controls on General tab
  const [bulkArchiveFilter, setBulkArchiveFilter] = useState<'all' | 'unread'>('all');
  const [bulkArchiveDays, setBulkArchiveDays] = useState<number>(3);
  const [bulkArchiveCount, setBulkArchiveCount] = useState<number>(8);
  const [bulkArchiveDone, setBulkArchiveDone] = useState(false);

  // Hotkeys search
  const [hotkeySearch, setHotkeySearch] = useState('');

  // Storage checkboxes
  const [selectedStorageTypes, setSelectedStorageTypes] = useState<string[]>([
    'images',
    'videos',
    'audio',
    'files',
  ]);
  const [storageAgeIndex, setStorageAgeIndex] = useState(1);

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem('mohivx_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'acc-tg-1',
        networkId: 'telegram',
        username: '@mohivx',
        displayName: 'Telegram',
        avatarUrl: mohivxLogo128,
        connectedAt: '2026-10-31',
        status: 'active',
      },
      {
        id: 'acc-wa-1',
        networkId: 'whatsapp',
        username: '+966 55 952 0809',
        displayName: 'WhatsApp',
        avatarUrl: mohivxLogo128,
        connectedAt: '2026-11-01',
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
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [mcpCopied, setMcpCopied] = useState(false);

  // Initialize from Electron settings & URL hash
  useEffect(() => {
    const api = (window as any).mohivxApi;
    if (api?.getAppSettings) {
      api.getAppSettings().then((s: any) => {
        if (s) {
          setSettings((prev) => ({ ...prev, ...s }));
          if (s.directionMode) setDirectionMode(s.directionMode);
          if (s.language && (s.language === 'ar' || s.language === 'en')) {
            setLanguage(s.language);
          }
        }
      });
    }

    if (api?.onAppSettingsUpdated) {
      const cleanup = api.onAppSettingsUpdated((s: any) => {
        if (s) {
          setSettings((prev) => ({ ...prev, ...s }));
        }
      });
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    }
  }, [setDirectionMode, setLanguage]);

  useEffect(() => {
    const api = (window as any).mohivxApi;
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

    try {
      const hash = window.location.hash;
      const tabMatch = hash.match(/tab=([a-z]+)/);
      if (tabMatch && tabMatch[1]) {
        setActiveTab(tabMatch[1] as SettingsTab);
      }
    } catch {}
  }, []);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 1800);
  };

  const handleUpdateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);

    if (key === 'directionMode') {
      setDirectionMode(value as any);
    } else if (key === 'language') {
      const langVal = value === 'ar' ? 'ar' : 'en';
      setLanguage(langVal);
    }

    const api = (window as any).mohivxApi;
    if (api?.saveAppSettings) {
      await api.saveAppSettings({ [key]: value });
    }
  };

  const handleBulkArchive = async () => {
    const api = (window as any).mohivxApi;
    if (api?.archiveBulkChats) {
      await api.archiveBulkChats({ filter: bulkArchiveFilter, days: bulkArchiveDays });
    }
    setBulkArchiveDone(true);
    setBulkArchiveCount(0);
    showToast('Archived chats successfully');
    setTimeout(() => setBulkArchiveDone(false), 2500);
  };

  const handleClearCache = async () => {
    setCacheStatus('Clearing...');
    const api = (window as any).mohivxApi;
    if (api?.clearAppCache) {
      const res = await api.clearAppCache();
      setCacheStatus(res.success ? 'Cache cleared (0 MB)' : 'Failed to clear cache');
    } else {
      setCacheStatus('Cache cleared (0 MB)');
    }
    showToast('Local cache cleared');
    setTimeout(() => setCacheStatus(null), 3000);
  };

  const handleOpenFolder = async () => {
    const api = (window as any).mohivxApi;
    if (api?.openAppDataFolder) {
      await api.openAppDataFolder();
    }
  };

  const handleCheckUpdates = async () => {
    setUpdateStatus('Checking for updates...');
    try {
      const api = (window as any).mohivxApi;
      if (api?.updater?.checkForUpdates) {
        const info = await api.updater.checkForUpdates();
        if (info.updateAvailable) {
          setAvailableUpdate(info);
          setUpdateStatus(null);
        } else {
          setAvailableUpdate(null);
          setUpdateStatus('Mohivx Messenger is up to date (v1.1.0)');
        }
      } else {
        setUpdateStatus('Mohivx Messenger is up to date (v1.1.0)');
      }
    } catch {
      setUpdateStatus('Mohivx Messenger is up to date (v1.1.0)');
    }
  };

  const handleStartUpdate = async () => {
    if (!availableUpdate?.downloadUrl) return;
    const api = (window as any).mohivxApi;
    if (!api?.updater) return;
    setDownloadProgress(1);
    api.updater.onUpdateProgress((prog: any) => setDownloadProgress(prog.percent));
    api.updater.onUpdateDownloaded(() => {
      setDownloadProgress(100);
      setUpdateDownloaded(true);
    });
    await api.updater.startUpdate(availableUpdate.downloadUrl);
  };

  const handleConnectNewNetwork = async (netId: NetworkId) => {
    const api = (window as any).mohivxApi;
    if (api?.openNetworkLogin) {
      await api.openNetworkLogin(netId);
    }
  };

  const handleDisconnectAccount = (id: string) => {
    setAccounts((prev) => {
      const next = prev.filter((a) => a.id !== id);
      localStorage.setItem('mohivx_accounts', JSON.stringify(next));
      return next;
    });
    showToast('Account disconnected');
  };

  // All 12 Beeper Navigation Items with exact colors & SVGs
  const navItems: {
    id: SettingsTab;
    label: string;
    color: string;
    badge?: string | number;
    icon: React.ReactNode;
    keywords: string[];
  }[] = [
    {
      id: 'accounts',
      label: 'Accounts',
      color: '#8b5cf6',
      badge: accounts.length,
      keywords: ['add an account', 'chat networks', 'whatsapp', 'telegram', 'instagram', 'discord', 'slack', 'signal'],
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
        </svg>
      ),
    },
    {
      id: 'general',
      label: 'General',
      color: '#00a8e8',
      keywords: [
        'incognito mode',
        "show recipients i'm typing",
        'app language',
        'default for remind later',
        'archive after setting reminder',
        'mark unread chats as read on archive',
        'after archive',
        'double-clicking a message',
        'undo send',
        'startup',
        'system tray',
      ],
      icon: (
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path
            d="M5.90837 12.6666L5.58584 10.9953C5.36104 10.9074 5.14358 10.8047 4.93344 10.6874C4.72331 10.5702 4.52539 10.4333 4.33968 10.2769L2.72701 10.8194L1.59814 8.86952L2.87362 7.75532C2.85407 7.63803 2.83941 7.52075 2.82964 7.40346C2.81986 7.28618 2.81498 7.164 2.81498 7.03694C2.81498 6.90989 2.81986 6.78771 2.82964 6.67043C2.83941 6.55314 2.85407 6.43586 2.87362 6.31857L1.59814 5.20436L2.72701 3.2545L4.33968 3.79694C4.52539 3.64056 4.72331 3.50373 4.93344 3.38644C5.14358 3.26916 5.36104 3.16653 5.58584 3.07857L5.90837 1.40726H8.16611L8.48865 3.07857C8.71344 3.16653 8.93091 3.26916 9.14105 3.38644C9.35118 3.50373 9.5491 3.64056 9.7348 3.79694L11.3475 3.2545L12.4763 5.20436L11.2009 6.31857C11.2204 6.43586 11.2351 6.55314 11.2448 6.67043C11.2546 6.78771 11.2595 6.90989 11.2595 7.03694C11.2595 7.164 11.2546 7.28618 11.2448 7.40346C11.2351 7.52075 11.2204 7.63803 11.2009 7.75532L12.4763 8.86952L11.3475 10.8194L9.7348 10.2769C9.5491 10.4333 9.35118 10.5702 9.14105 10.6874C8.93091 10.8047 8.71344 10.9074 8.48865 10.9953L8.16611 12.6666H5.90837ZM7.03724 9.14808C7.62367 9.14808 8.12213 8.94283 8.53263 8.53233C8.94313 8.12183 9.14838 7.62337 9.14838 7.03694C9.14838 6.45052 8.94313 5.95206 8.53263 5.54156C8.12213 5.13106 7.62367 4.92581 7.03724 4.92581C6.45082 4.92581 5.95236 5.13106 5.54186 5.54156C5.13136 5.95206 4.92611 6.45052 4.92611 7.03694C4.92611 7.62337 5.13136 8.12183 5.54186 8.53233C5.95236 8.94283 6.45082 9.14808 7.03724 9.14808Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      id: 'appearance',
      label: 'Appearance',
      color: '#e83e8c',
      keywords: [
        'show sidebar',
        'pinned chats',
        'unread messages',
        'message previews',
        'compact chat list',
        'network icons',
        'colorize network icons',
        'theme',
        'dark mode',
        'font size',
        'zoom',
      ],
      icon: (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M3.12126 10.9239C2.73112 10.9239 2.34532 10.8286 1.96385 10.6378C1.58238 10.4471 1.27461 10.1957 1.04053 9.88357C1.26594 9.88357 1.49569 9.79471 1.72977 9.61698C1.96385 9.43925 2.08089 9.18132 2.08089 8.8432C2.08089 8.40972 2.23261 8.04126 2.53605 7.73782C2.83949 7.43438 3.20795 7.28266 3.64144 7.28266C4.07492 7.28266 4.44339 7.43438 4.74683 7.73782C5.05027 8.04126 5.20199 8.40972 5.20199 8.8432C5.20199 9.41541 4.99825 9.90524 4.59077 10.3127C4.1833 10.7202 3.69346 10.9239 3.12126 10.9239ZM6.1123 7.80284L4.6818 6.37234L9.33743 1.71671C9.4328 1.62134 9.55201 1.57149 9.69506 1.56715C9.83811 1.56282 9.96165 1.61267 10.0657 1.71671L10.7679 2.41895C10.872 2.52299 10.924 2.64437 10.924 2.78308C10.924 2.9218 10.872 3.04317 10.7679 3.14721L6.1123 7.80284Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      color: '#28a745',
      keywords: ['sound effects', 'volume', 'message notifications', 'group message notifications', 'badge', 'do not disturb'],
      icon: (
        <svg width="10" height="11" viewBox="0 0 10 11" fill="none">
          <path
            d="M0.859375 8.43848C0.595703 8.43848 0.385742 8.37012 0.229492 8.2334C0.0764974 8.09668 0 7.91602 0 7.69141C0 7.51237 0.0439453 7.3431 0.131836 7.18359C0.222982 7.02409 0.336914 6.87272 0.473633 6.72949C0.613607 6.58301 0.756836 6.43978 0.90332 6.2998C1.02376 6.18913 1.11491 6.04264 1.17676 5.86035C1.24186 5.67806 1.29069 5.47624 1.32324 5.25488C1.35905 5.03027 1.38997 4.80241 1.41602 4.57129C1.44531 3.99186 1.52832 3.47103 1.66504 3.00879C1.80501 2.54655 2.00846 2.15592 2.27539 1.83691C2.54232 1.5179 2.88411 1.28353 3.30078 1.13379C3.40495 0.811523 3.58724 0.542969 3.84766 0.328125C4.10807 0.110026 4.41732 0.000976562 4.77539 0.000976562C5.13997 0.000976562 5.45247 0.110026 5.71289 0.328125C5.97331 0.542969 6.1556 0.811523 6.25977 1.13379C6.67643 1.28353 7.0166 1.5179 7.28027 1.83691C7.5472 2.15592 7.74902 2.54655 7.88574 3.00879C8.02572 3.47103 8.11198 3.99186 8.14453 4.57129C8.17057 4.80241 8.19987 5.03027 8.23242 5.25488C8.26823 5.47624 8.31706 5.67806 8.37891 5.86035C8.44401 6.04264 8.53678 6.18913 8.65723 6.2998C8.80371 6.43978 8.94531 6.58301 9.08203 6.72949C9.22201 6.87272 9.33594 7.02409 9.42383 7.18359C9.51497 7.3431 9.56055 7.51237 9.56055 7.69141C9.56055 7.91602 9.48242 8.09668 9.32617 8.2334C9.17318 8.37012 8.96484 8.43848 8.70117 8.43848H0.859375ZM4.77539 10.4893C4.48242 10.4893 4.21875 10.4258 3.98438 10.2988C3.75326 10.1751 3.56608 10.0091 3.42285 9.80078H6.12793C5.9847 10.0091 5.79753 10.1751 5.56641 10.2988C5.33529 10.4258 5.07161 10.4893 4.77539 10.4893Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      id: 'hotkeys',
      label: 'Hotkeys',
      color: '#eab308',
      keywords: ['keyboard shortcuts', 'keybindings', 'search', 'archive', 'mark read'],
      icon: (
        <svg width="13" height="9" viewBox="0 0 13 9" fill="none">
          <path
            d="M1.65527 8.03125C1.11491 8.03125 0.703125 7.89128 0.419922 7.61133C0.139974 7.33464 0 6.92773 0 6.39062V1.63477C0 1.10091 0.139974 0.695638 0.419922 0.418945C0.703125 0.138997 1.11491 -0.000976562 1.65527 -0.000976562H10.8936C11.4307 -0.000976562 11.8408 0.138997 12.124 0.418945C12.4072 0.695638 12.5488 1.10091 12.5488 1.63477V6.39062C12.5488 6.92448 12.4072 7.33138 12.124 7.61133C11.8408 7.89128 11.4307 8.03125 10.8936 8.03125H1.65527ZM3.5 5.8H9V6.7H3.5V5.8Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      id: 'devices',
      label: 'Devices',
      color: '#f97316',
      keywords: ['verified devices', 'sessions', 'encryption', 'security'],
      icon: (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M3.5 11.5C3.225 11.5 2.98958 11.4021 2.79375 11.2063C2.59792 11.0104 2.5 10.775 2.5 10.5V1.5C2.5 1.225 2.59792 0.989583 2.79375 0.79375C2.98958 0.597917 3.225 0.5 3.5 0.5H8.5C8.775 0.5 9.01042 0.597917 9.20625 0.79375C9.40208 0.989583 9.5 1.225 9.5 1.5V10.5C9.5 10.775 9.40208 11.0104 9.20625 11.2063C9.01042 11.4021 8.775 11.5 8.5 11.5H3.5ZM3.5 9H8.5V3H3.5V9Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      id: 'ai',
      label: 'AI',
      color: '#14b8a6',
      keywords: ['gemini', 'openai', 'summarize', 'translate', 'transcription', 'whisper'],
      icon: (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M4.95605 9.91113C4.83887 9.91113 4.73796 9.87207 4.65332 9.79395C4.56868 9.71582 4.51497 9.61491 4.49219 9.49121C4.41081 8.94759 4.32617 8.47884 4.23828 8.08496C4.15365 7.69108 4.04948 7.35742 3.92578 7.08398C3.80534 6.81055 3.65234 6.58268 3.4668 6.40039C3.28451 6.21484 3.05664 6.06348 2.7832 5.94629C2.51302 5.8291 2.18587 5.72982 1.80176 5.64844C1.41764 5.56706 0.961914 5.49056 0.43457 5.41895C0.307617 5.40592 0.203451 5.35547 0.12207 5.26758C0.0406901 5.17969 0 5.07552 0 4.95508C0 4.83464 0.0406901 4.73047 0.12207 4.64258C0.203451 4.55469 0.309245 4.5026 0.439453 4.48633C1.07096 4.41797 1.60156 4.33659 2.03125 4.24219C2.46419 4.14453 2.82064 4.01107 3.10059 3.8418C3.38379 3.67253 3.61165 3.44629 3.78418 3.16309C3.95671 2.87663 4.09505 2.51042 4.19922 2.06445C4.30664 1.61849 4.4043 1.06999 4.49219 0.418945C4.51172 0.295247 4.5638 0.194336 4.64844 0.116211C4.73633 0.0380859 4.83887 -0.000976562 4.95605 -0.000976562C5.07324 -0.000976562 5.17415 0.0380859 5.25879 0.116211C5.34342 0.191081 5.39714 0.291992 5.41992 0.418945C5.51432 1.06999 5.61523 1.61686 5.72266 2.05957C5.83008 2.50228 5.96842 2.86686 6.1377 3.15332C6.31022 3.43652 6.53646 3.66276 6.81641 3.83203C7.09635 3.99805 7.4528 4.12988 7.88574 4.22754C8.31868 4.3252 8.84928 4.41146 9.47754 4.48633C9.60124 4.5026 9.70378 4.55469 9.78516 4.64258C9.86979 4.73047 9.91211 4.83464 9.91211 4.95508C9.91211 5.07552 9.86979 5.17969 9.78516 5.26758C9.70378 5.35547 9.60124 5.40592 9.47754 5.41895C8.94928 5.49056 8.49355 5.56706 8.10944 5.64844C7.72533 5.72982 7.39818 5.8291 7.128 5.94629C6.85456 6.06348 6.62669 6.21484 6.4444 6.40039C6.25885 6.58268 6.10586 6.81055 5.98542 7.08398C5.86172 7.35742 5.75755 7.69108 5.67292 8.08496C5.58503 8.47884 5.50039 8.94759 5.41992 9.49121C5.39714 9.61491 5.34342 9.71582 5.25879 9.79395C5.17415 9.87207 5.07324 9.91113 4.95605 9.91113Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      id: 'plus',
      label: 'Beeper Plus',
      color: '#0a84ff',
      keywords: ['subscription', 'plus', 'incognito', 'scheduled messages', 'multiple accounts'],
      icon: (
        <svg width="9" height="9" viewBox="0 0 8 8" fill="none">
          <path
            d="M4.51369 7.85022L3.33518 7.85022L3.32339 4.51504L0 4.51504L0 3.33653L3.33518 3.32474L3.33518 0.00133921L4.51369 0.00133912L4.51369 3.32474L7.84888 3.33653L7.84888 4.51504L4.52547 4.51504L4.51369 7.85022Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      id: 'integrations',
      label: 'Integrations',
      color: '#7559ff',
      keywords: ['desktop api', 'mcp', 'claude', 'cursor', 'vscode', 'raycast', 'brave'],
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
        </svg>
      ),
    },
    {
      id: 'storage',
      label: 'Storage',
      color: 'rgb(50, 84, 106)',
      keywords: ['cache', 'clear storage', 'disk usage', 'database'],
      icon: (
        <svg width="11" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      ),
    },
    {
      id: 'help',
      label: 'Help',
      color: '#6b7280',
      keywords: ['support', 'documentation', 'report a problem', 'faq'],
      icon: (
        <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
          <path
            d="M2.56348 6.55078C2.34863 6.55078 2.17936 6.4873 2.05566 6.36035C1.93522 6.2334 1.875 6.06738 1.875 5.8623V5.6377C1.875 5.37077 1.92546 5.13151 2.02637 4.91992C2.13053 4.70833 2.27539 4.51465 2.46094 4.33887C2.64648 4.16309 2.8597 3.99544 3.10059 3.83594C3.33496 3.68294 3.53027 3.53809 3.68652 3.40137C3.84603 3.26139 3.96647 3.11165 4.04785 2.95215C4.12923 2.79264 4.16992 2.60547 4.16992 2.39062C4.16992 2.14974 4.10645 1.94141 3.97949 1.76562C3.85254 1.58659 3.68001 1.44824 3.46191 1.35059C3.24707 1.25293 3.00456 1.2041 2.73438 1.2041C2.30957 1.2041 1.93848 1.38314 1.64062 1.65332C1.50391 1.80632 1.39648 2.01139 1.31836 2.26855C1.205 2.55 0.94 2.72754 0.649414 2.72754C0.284831 2.72754 0 2.45 0 2.08789C0 1.4 0.5 0.86 0.761719 0.652344C1.32 0.2 2.01 -0.00195312 2.79785 -0.00195312C3.82812 -0.00195312 4.69 0.35 5.27832 1.09668C5.52572 1.4515 5.64941 1.87793 5.64941 2.37598C5.64941 3.1 5.2 3.7 4.4 4.25C3.6 4.8 3.25 5.2 3.25 5.8623C3.25 6.25 2.95 6.55078 2.56348 6.55078ZM2.56 9.8C2.1 9.8 1.75 9.45 1.75 9.0C1.75 8.55 2.1 8.2 2.56 8.2C3.02 8.2 3.37 8.55 3.37 9.0C3.37 9.45 3.02 9.8 2.56 9.8Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      id: 'about',
      label: 'About',
      color: '#06b6d4',
      keywords: ['version', 'update', 'changelog', 'privacy', 'legal'],
      icon: (
        <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
          <path
            d="M0 9.26074C0 8.9 0.3 8.62598 0.693359 8.62598H2.08008V4.74414H0.864258C0.45 4.74414 0.166016 4.45 0.166016 4.11426C0.166016 3.75 0.45 3.48438 0.864258 3.48438H2.77832C3.15 3.48438 3.4375 3.78 3.4375 4.13867V8.62598H4.52637C4.9 8.62598 5.21484 8.9 5.21484 9.26074C5.21484 9.6 4.9 9.88574 4.52637 9.88574H0.693359C0.3 9.88574 0 9.6 0 9.26074ZM2.53418 1.93652C1.98 1.93652 1.56738 1.5 1.56738 0.964844C1.56738 0.42 1.98 -0.00195312 2.53418 -0.00195312C3.08 -0.00195312 3.5 0.42 3.5 0.964844C3.5 1.5 3.08 1.93652 2.53418 1.93652Z"
            fill="white"
          />
        </svg>
      ),
    },
  ];

  const searchSuggestions: { label: string; tab: SettingsTab; color: string; icon: React.ReactNode }[] = [
    {
      label: 'Add an Account',
      tab: 'accounts',
      color: '#8b5cf6',
      icon: navItems[0].icon,
    },
    {
      label: 'Incognito Mode',
      tab: 'general',
      color: '#00a8e8',
      icon: navItems[1].icon,
    },
    {
      label: "Show Recipients I'm Typing",
      tab: 'general',
      color: '#00a8e8',
      icon: navItems[1].icon,
    },
    {
      label: 'Group Message Notifications',
      tab: 'notifications',
      color: '#28a745',
      icon: navItems[3].icon,
    },
    {
      label: 'Subscribe to Beeper Plus',
      tab: 'plus',
      color: '#0a84ff',
      icon: navItems[7].icon,
    },
  ];

  const filteredNavItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return navItems;
    return navItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  }, [searchQuery, accounts.length]);

  const availableNetworks: { id: NetworkId; name: string }[] = [
    { id: 'whatsapp', name: 'WhatsApp' },
    { id: 'telegram', name: 'Telegram' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'discord', name: 'Discord' },
    { id: 'slack', name: 'Slack' },
    { id: 'signal', name: 'Signal' },
    { id: 'facebook', name: 'Messenger' },
    { id: 'x', name: 'X (Twitter)' },
    { id: 'googlemessages', name: 'Google Messages' },
    { id: 'googlechat', name: 'Google Chat' },
    { id: 'linkedin', name: 'LinkedIn' },
    { id: 'matrix', name: 'Matrix' },
  ];

  const hotkeyGroups: { group: string; items: { name: string; keys: string[]; global?: boolean }[] }[] = [
    {
      group: 'Navigation',
      items: [
        { name: 'Search Chats / Command Palette', keys: ['Ctrl', 'K'] },
        { name: 'New Chat', keys: ['Ctrl', 'N'] },
        { name: 'Open Settings', keys: ['Ctrl', ','] },
        { name: 'Next Chat', keys: ['Ctrl', 'Tab'] },
        { name: 'Previous Chat', keys: ['Ctrl', 'Shift', 'Tab'] },
        { name: 'Go to Inbox', keys: ['Ctrl', 'Alt', '1'] },
        { name: 'Go to Archive', keys: ['Ctrl', 'Alt', '2'] },
        { name: 'Toggle Beeper Window', keys: ['Ctrl', 'Shift', 'Space'], global: true },
      ],
    },
    {
      group: 'Chat Actions',
      items: [
        { name: 'Archive / Unarchive Chat', keys: ['Ctrl', 'E'] },
        { name: 'Mark as Read / Unread', keys: ['Ctrl', 'Shift', 'U'] },
        { name: 'Pin / Unpin Chat', keys: ['Ctrl', 'Shift', 'P'] },
        { name: 'Set Reminder on Chat', keys: ['Ctrl', 'H'] },
        { name: 'Mute / Unmute Chat', keys: ['Ctrl', 'Shift', 'M'] },
      ],
    },
    {
      group: 'Messages',
      items: [
        { name: 'Edit Last Message', keys: ['↑'] },
        { name: 'Reply to Last Message', keys: ['Ctrl', 'R'] },
        { name: 'React to Last Message', keys: ['Ctrl', 'Shift', 'E'] },
        { name: 'Copy Last OTP / 2FA Code', keys: ['Ctrl', 'Shift', 'C'] },
        { name: 'Undo Send Message', keys: ['Ctrl', 'Z'] },
      ],
    },
  ];

  return (
    <div
      dir="ltr"
      className="w-screen h-screen bg-[#202228] text-[#f5f5f7] flex flex-col overflow-hidden select-none font-sans"
    >
      {/* Top Native-Style Beeper Settings Titlebar (32px, always LTR) */}
      <header className="h-[32px] bg-[#202228] flex items-center justify-between pl-[12px] pr-[2px] shrink-0 titlebar-drag-region">
        <div className="flex items-center gap-[8px]">
          <img src={mohivxIcon64} alt="Settings" className="w-[15px] h-[15px] rounded-[4px]" />
          <span className="text-[12px] font-medium text-white/85">Settings</span>
        </div>

        <div className="flex items-center titlebar-no-drag">
          <button
            onClick={() => (window as any).mohivxApi?.minimizeWindow?.()}
            className="w-[40px] h-[30px] flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.08] transition-colors text-[12px]"
            title="Minimize"
          >
            ─
          </button>
          <button
            onClick={() => (window as any).mohivxApi?.maximizeWindow?.()}
            className="w-[40px] h-[30px] flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.08] transition-colors text-[11px]"
            title="Maximize"
          >
            ▢
          </button>
          <button
            onClick={() => (window as any).mohivxApi?.closeWindow?.()}
            className="w-[44px] h-[30px] flex items-center justify-center text-white/65 hover:text-white hover:bg-[#e81123] transition-colors text-[13px]"
            title="Close"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Main Split Body: Left Pane (270px) + Right Pane */}
      <div className="flex-1 flex overflow-hidden px-[8px] pb-[8px] gap-[8px]">
        {/* Beeper PrefsLeftPane (270px) */}
        <aside className="w-[262px] h-full flex flex-col shrink-0 px-[6px] pt-[6px] relative">
          {/* Heading */}
          <div className="px-[10px] mb-[10px]">
            <h2 className="text-[15px] font-semibold text-white tracking-tight">Settings</h2>
          </div>

          {/* Pill Search Settings Input */}
          <div className="px-[4px] mb-[10px] relative">
            <div className="h-[30px] rounded-[38px] bg-white/[0.06] hover:bg-white/[0.09] focus-within:bg-white/[0.1] border border-white/[0.05] flex items-center px-[11px] gap-[8px] transition-colors">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                className="w-[13px] h-[13px] text-white/45 shrink-0"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search Settings"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 160)}
                className="w-full bg-transparent text-[12.5px] text-white placeholder-white/40 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearchQuery('');
                  }}
                  className="text-white/40 hover:text-white text-[11px]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Suggestions Dropdown when focused and empty */}
            {searchFocused && !searchQuery.trim() && (
              <div className="absolute left-[4px] right-[4px] top-[36px] bg-[#282a30] border border-white/[0.1] rounded-[10px] shadow-2xl py-[6px] z-50">
                <div className="px-[12px] py-[4px] text-[10.5px] font-semibold uppercase tracking-wider text-white/40">
                  Suggestions
                </div>
                {searchSuggestions.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setActiveTab(s.tab);
                      setSearchFocused(false);
                    }}
                    className="w-full px-[10px] py-[6px] flex items-center gap-[9px] hover:bg-white/[0.08] text-left transition-colors"
                  >
                    <NavPrefIcon color={s.color}>{s.icon}</NavPrefIcon>
                    <span className="text-[12.5px] text-white/90">{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scrollable Navigation List */}
          <div className="flex-1 overflow-y-auto pr-[2px] space-y-[1px]">
            {/* Profile Option Row */}
            <div
              onClick={() => setActiveTab('profile')}
              className={`group relative flex items-center gap-[10px] px-[10px] py-[8px] rounded-[8px] cursor-pointer transition-colors mb-[4px] ${
                activeTab === 'profile' ? 'bg-white/[0.09]' : 'hover:bg-white/[0.05]'
              }`}
            >
              <div className="w-[34px] h-[34px] rounded-full bg-[#7c5cff] flex items-center justify-center overflow-hidden shrink-0">
                <img src={mohivxIcon64} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate leading-tight">
                  {settings.displayName || 'mohivx'}
                </p>
                <p className="text-[11px] text-white/50 truncate leading-tight mt-[2px]">
                  {settings.email || 'm0559520809@gmail.com'}
                </p>
              </div>
              <span className="px-[8px] py-[2px] rounded-full bg-white/[0.08] text-white/80 text-[10.5px] font-medium">
                {settings.planTier || 'Free'}
              </span>
            </div>

            {/* 12 Beeper Categories */}
            {filteredNavItems.map((item) => {
              const isSelected = activeTab === item.id;
              return (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-[10px] py-[8px] rounded-[7px] text-[13px] transition-colors ${
                      isSelected
                        ? 'bg-white/[0.09] text-white font-medium'
                        : 'text-white/85 hover:bg-white/[0.05] font-normal'
                    }`}
                  >
                    <div className="flex items-center gap-[10px]">
                      <NavPrefIcon color={item.color}>{item.icon}</NavPrefIcon>
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="text-[12px] text-white/45 font-normal pr-[2px]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                  {/* Subtle Beeper row divider */}
                  {!isSelected && (
                    <div className="h-[1px] bg-white/[0.04] ml-[40px] mr-[8px]" />
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Beeper PrefsRightPane (Rounded Dark Container #18191d) */}
        <main className="flex-1 h-full bg-[#18191d] rounded-[10px] border border-white/[0.05] overflow-y-auto px-[36px] py-[24px]">
          <div className="max-w-[580px] mx-auto">
            {/* ==================== TAB: GENERAL ==================== */}
            {activeTab === 'general' && (
              <div className="space-y-[20px]">
                <p className="text-[12.5px] text-white/60 leading-relaxed">
                  These settings are for Mohivx Messenger and aren't synced to the messaging platforms.
                </p>

                {/* Group 1: Incognito & Typing */}
                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                  <div className="p-[14px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-[13px] font-medium text-white">Incognito mode</span>
                        <PlusBadge />
                      </div>
                      <BeeperToggle
                        checked={settings.incognitoMode}
                        onChange={(v) => handleUpdateSetting('incognitoMode', v)}
                      />
                    </div>
                    <p className="text-[12px] text-white/50 mt-[8px] leading-relaxed">
                      Incognito mode keeps chats unread even when you click on them and doesn't notify recipients you've read them. Respond or hit Ctrl Shift U to mark a chat as read.
                    </p>
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-[13px] font-medium text-white">Show recipients I'm typing</span>
                      <PlusBadge />
                    </div>
                    <BeeperToggle
                      checked={settings.showTypingIndicator}
                      onChange={(v) => handleUpdateSetting('showTypingIndicator', v)}
                    />
                  </div>
                </div>

                {/* Group 2: App Language & Direction */}
                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">App language</span>
                    <BeeperSelect
                      value={settings.language}
                      options={[
                        { value: 'en', label: 'System (English)' },
                        { value: 'ar', label: 'العربية (Arabic)' },
                      ]}
                      onChange={(val) => handleUpdateSetting('language', val)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Layout direction</span>
                    <BeeperSelect
                      value={settings.directionMode}
                      options={[
                        { value: 'ltr', label: 'Left to Right (LTR)' },
                        { value: 'rtl', label: 'Right to Left (RTL)' },
                        { value: 'auto', label: 'Auto (Follow Language)' },
                      ]}
                      onChange={(val) => handleUpdateSetting('directionMode', val as any)}
                    />
                  </div>
                </div>

                {/* Group 3: Remind Later */}
                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                  <div className="p-[14px] flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-[13px] font-medium text-white">Default for remind later</span>
                      <PlusBadge />
                    </div>
                    <BeeperSelect
                      value={settings.defaultRemindLater}
                      options={[
                        { value: 'if_no_reply', label: 'If no reply' },
                        { value: 'always', label: 'Always' },
                      ]}
                      onChange={(val) => handleUpdateSetting('defaultRemindLater', val as any)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-[13px] font-medium text-white">Archive after setting reminder on chat</span>
                      <PlusBadge />
                    </div>
                    <BeeperToggle
                      checked={settings.archiveOnReminder}
                      onChange={(v) => handleUpdateSetting('archiveOnReminder', v)}
                    />
                  </div>
                </div>

                {/* Group 4: Archive Behavior & Bulk Archive */}
                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Mark unread chats as read on archive</span>
                    <BeeperToggle
                      checked={settings.markReadOnArchive}
                      onChange={(v) => handleUpdateSetting('markReadOnArchive', v)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">After archive</span>
                    <BeeperSelect
                      value={settings.afterArchive}
                      options={[
                        { value: 'next', label: 'Select next chat' },
                        { value: 'previous', label: 'Select previous chat' },
                        { value: 'close', label: 'Close chat' },
                      ]}
                      onChange={(val) => handleUpdateSetting('afterArchive', val as any)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between gap-[12px]">
                    <div className="flex flex-wrap items-center gap-[6px] text-[13px] text-white">
                      <span>Archive</span>
                      <BeeperSelect
                        value={bulkArchiveFilter}
                        options={[
                          { value: 'all', label: 'all' },
                          { value: 'unread', label: 'unread' },
                        ]}
                        onChange={(v) => setBulkArchiveFilter(v as any)}
                      />
                      <span>chats older than</span>
                      <BeeperSelect
                        value={bulkArchiveDays}
                        options={[
                          { value: 1, label: '1 day' },
                          { value: 3, label: '3 days' },
                          { value: 7, label: '1 week' },
                          { value: 30, label: '1 month' },
                        ]}
                        onChange={(v) => setBulkArchiveDays(Number(v))}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleBulkArchive}
                      className="px-[12px] py-[6px] rounded-[7px] bg-white/[0.1] hover:bg-white/[0.16] text-[12px] font-medium text-white shrink-0 transition-colors cursor-pointer"
                    >
                      {bulkArchiveDone ? 'Archived ✓' : `Archive ${bulkArchiveCount} chats`}
                    </button>
                  </div>
                </div>

                {/* Group 5: Mark Read & Double-Click Action */}
                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">After mark as read/unread</span>
                    <BeeperSelect
                      value={settings.afterMarkReadUnread}
                      options={[
                        { value: 'next', label: 'Select next chat' },
                        { value: 'stay', label: 'Stay in chat' },
                      ]}
                      onChange={(val) => handleUpdateSetting('afterMarkReadUnread', val as any)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">On double-clicking a message</span>
                    <BeeperSelect
                      value={settings.doubleClickMessageAction}
                      options={[
                        { value: 'reply', label: 'Reply' },
                        { value: 'react', label: 'React with 👍' },
                        { value: 'copy', label: 'Copy text' },
                      ]}
                      onChange={(val) => handleUpdateSetting('doubleClickMessageAction', val as any)}
                    />
                  </div>
                </div>

                {/* Group 6: Undo Send, Copy, Emoji, Startup, Tray */}
                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Allow undo send (Ctrl Z) for</span>
                    <BeeperSelect
                      value={settings.undoSendDelay}
                      options={[
                        { value: 0, label: 'Off' },
                        { value: 5, label: '5 seconds' },
                        { value: 10, label: '10 seconds' },
                        { value: 15, label: '15 seconds' },
                      ]}
                      onChange={(val) => handleUpdateSetting('undoSendDelay', Number(val))}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Include timestamps when copying messages</span>
                    <BeeperToggle
                      checked={settings.includeTimestampsOnCopy}
                      onChange={(v) => handleUpdateSetting('includeTimestampsOnCopy', v)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Enable emoji autocomplete</span>
                    <BeeperToggle
                      checked={settings.emojiAutocomplete}
                      onChange={(v) => handleUpdateSetting('emojiAutocomplete', v)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Auto-copy two-factor authentication codes</span>
                    <BeeperToggle
                      checked={settings.autoCopyOtp}
                      onChange={(v) => handleUpdateSetting('autoCopyOtp', v)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Start Mohivx Messenger on system startup</span>
                    <BeeperToggle
                      checked={settings.launchOnStartup}
                      onChange={(v) => handleUpdateSetting('launchOnStartup', v)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Close window to system tray</span>
                    <BeeperToggle
                      checked={settings.closeToTray}
                      onChange={(v) => handleUpdateSetting('closeToTray', v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB: APPEARANCE ==================== */}
            {activeTab === 'appearance' && (
              <div className="space-y-[22px]">
                <div>
                  <h4 className="text-[12px] font-semibold uppercase tracking-wider text-white/45 mb-[8px]">
                    Chat List
                  </h4>
                  <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                    <div className="p-[14px] flex items-center justify-between">
                      <span className="text-[13px] font-medium text-white">Show sidebar</span>
                      <BeeperToggle
                        checked={settings.showSidebar}
                        onChange={(v) => handleUpdateSetting('showSidebar', v)}
                      />
                    </div>

                    <div className="p-[14px] flex items-center justify-between">
                      <span className="text-[13px] font-medium text-white">Use regular style for pinned chats</span>
                      <BeeperToggle
                        checked={settings.compactPinnedThreads}
                        onChange={(v) => handleUpdateSetting('compactPinnedThreads', v)}
                      />
                    </div>

                    <div className="p-[14px] flex items-center justify-between">
                      <span className="text-[13px] font-medium text-white">Show number of unread messages</span>
                      <BeeperToggle
                        checked={settings.showUnreads}
                        onChange={(v) => handleUpdateSetting('showUnreads', v)}
                      />
                    </div>

                    <div className="p-[14px] flex items-center justify-between">
                      <span className="text-[13px] font-medium text-white">Show message previews</span>
                      <BeeperToggle
                        checked={settings.messagePreviews}
                        onChange={(v) => handleUpdateSetting('messagePreviews', v)}
                      />
                    </div>

                    <div className="p-[14px] flex items-center justify-between">
                      <span className="text-[13px] font-medium text-white">Compact chat list</span>
                      <BeeperToggle
                        checked={settings.compactChatList}
                        onChange={(v) => {
                          handleUpdateSetting('compactChatList', v);
                          handleUpdateSetting('density', v ? 'compact' : 'comfortable');
                        }}
                      />
                    </div>

                    <div className="p-[14px] flex items-center justify-between">
                      <span className="text-[13px] font-medium text-white">Show network icons</span>
                      <BeeperToggle
                        checked={settings.showNetworkIcons}
                        onChange={(v) => handleUpdateSetting('showNetworkIcons', v)}
                      />
                    </div>

                    <div className="p-[14px] flex items-center justify-between">
                      <span className="text-[13px] font-medium text-white">Colorize network icons</span>
                      <BeeperToggle
                        checked={settings.colorizeNetworkIcons}
                        onChange={(v) => handleUpdateSetting('colorizeNetworkIcons', v)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[12px] font-semibold uppercase tracking-wider text-white/45 mb-[8px]">
                    Theme
                  </h4>
                  <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] p-[14px] grid grid-cols-3 gap-[10px]">
                    {(['dark', 'light', 'system'] as const).map((tMode) => (
                      <button
                        key={tMode}
                        type="button"
                        onClick={() => handleUpdateSetting('theme', tMode)}
                        className={`p-[12px] rounded-[8px] border text-left transition-all cursor-pointer ${
                          settings.theme === tMode
                            ? 'bg-[#0a84ff]/15 border-[#0a84ff] text-white'
                            : 'bg-black/20 border-white/[0.06] text-white/70 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div
                          className={`w-full h-[38px] rounded-[5px] mb-[8px] border border-white/10 ${
                            tMode === 'light'
                              ? 'bg-[#f2f2f7]'
                              : tMode === 'dark'
                              ? 'bg-[#141416]'
                              : 'bg-gradient-to-r from-[#141416] to-[#f2f2f7]'
                          }`}
                        />
                        <span className="text-[12.5px] font-medium capitalize">{tMode}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[12px] font-semibold uppercase tracking-wider text-white/45 mb-[8px]">
                    Font Size & Zoom
                  </h4>
                  <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                    <div className="p-[14px] flex items-center justify-between">
                      <span className="text-[13px] font-medium text-white">Message font size</span>
                      <BeeperSelect
                        value={settings.fontSize}
                        options={[
                          { value: 12, label: 'Small (12px)' },
                          { value: 13, label: 'Default (13px)' },
                          { value: 15, label: 'Large (15px)' },
                          { value: 16, label: 'Extra Large (16px)' },
                        ]}
                        onChange={(val) => handleUpdateSetting('fontSize', Number(val))}
                      />
                    </div>

                    <div className="p-[14px] flex items-center justify-between">
                      <span className="text-[13px] font-medium text-white">Interface zoom level</span>
                      <div className="flex items-center gap-[8px]">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSetting('zoomLevel', Math.max(80, (settings.zoomLevel || 100) - 10))
                          }
                          className="w-[26px] h-[24px] rounded-[6px] bg-white/[0.09] hover:bg-white/[0.15] text-white text-[13px]"
                        >
                          -
                        </button>
                        <span className="text-[12px] font-mono w-[44px] text-center">
                          {settings.zoomLevel || 100}%
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSetting('zoomLevel', Math.min(130, (settings.zoomLevel || 100) + 10))
                          }
                          className="w-[26px] h-[24px] rounded-[6px] bg-white/[0.09] hover:bg-white/[0.15] text-white text-[13px]"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateSetting('zoomLevel', 100)}
                          className="px-[8px] h-[24px] rounded-[6px] bg-white/[0.06] hover:bg-white/[0.12] text-[11px] text-white/70"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB: ACCOUNTS ==================== */}
            {activeTab === 'accounts' && (
              <div className="space-y-[22px]">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-semibold text-white">Connected Accounts ({accounts.length})</h4>
                  <span className="text-[11.5px] text-white/50">15 Chat Networks Supported</span>
                </div>

                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                  {accounts.length === 0 ? (
                    <div className="p-[24px] text-center text-[13px] text-white/45">
                      No chat accounts connected yet. Select a network below to connect.
                    </div>
                  ) : (
                    accounts.map((acc) => (
                      <div key={acc.id} className="p-[14px] flex items-center justify-between">
                        <div className="flex items-center gap-[12px]">
                          <NetworkIcon network={acc.networkId} size={32} />
                          <div>
                            <div className="flex items-center gap-[8px]">
                              <span className="text-[13px] font-semibold text-white capitalize">
                                {acc.displayName || acc.networkId}
                              </span>
                              <span className="px-[6px] py-[1px] rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-medium">
                                Connected
                              </span>
                            </div>
                            <p className="text-[11.5px] text-white/50 mt-[1px]">{acc.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-[8px]">
                          <button
                            type="button"
                            onClick={() => handleConnectNewNetwork(acc.networkId)}
                            className="px-[10px] py-[5px] rounded-[6px] bg-white/[0.07] hover:bg-white/[0.12] text-[11.5px] text-white/85 transition-colors cursor-pointer"
                          >
                            Open Session
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDisconnectAccount(acc.id)}
                            className="px-[10px] py-[5px] rounded-[6px] bg-red-500/10 hover:bg-red-500/20 text-[11.5px] text-red-400 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div>
                  <h4 className="text-[12px] font-semibold uppercase tracking-wider text-white/45 mb-[8px]">
                    Add Chat Network
                  </h4>
                  <div className="grid grid-cols-2 gap-[8px]">
                    {availableNetworks.map((net) => {
                      const isConnected = accounts.some((a) => a.networkId === net.id);
                      return (
                        <button
                          key={net.id}
                          type="button"
                          onClick={() => handleConnectNewNetwork(net.id)}
                          className="p-[11px] rounded-[8px] bg-[#22242a] hover:bg-[#2a2d35] border border-white/[0.06] flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-[10px]">
                            <NetworkIcon network={net.id} size={24} />
                            <span className="text-[12.5px] font-medium text-white">{net.name}</span>
                          </div>
                          <span className="text-[11px] text-[#0a84ff] font-medium">
                            {isConnected ? 'Reconnect' : '+ Connect'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB: NOTIFICATIONS ==================== */}
            {activeTab === 'notifications' && (
              <div className="space-y-[22px]">
                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Sound effects</span>
                    <BeeperToggle
                      checked={settings.soundEnabled}
                      onChange={(v) => handleUpdateSetting('soundEnabled', v)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Sound effects volume</span>
                    <div className="flex items-center gap-[10px]">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={settings.soundVolume ?? 80}
                        onChange={(e) => handleUpdateSetting('soundVolume', Number(e.target.value))}
                        className="w-[120px] accent-[#0a84ff] cursor-pointer"
                      />
                      <span className="text-[12px] text-white/60 w-[34px] text-right">
                        {settings.soundVolume ?? 80}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Message notifications</span>
                    <BeeperToggle
                      checked={settings.notifications}
                      onChange={(v) => handleUpdateSetting('notifications', v)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Group message notifications</span>
                    <BeeperToggle
                      checked={settings.notifyGroupMessages}
                      onChange={(v) => handleUpdateSetting('notifyGroupMessages', v)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Notify even when chat is in focus</span>
                    <BeeperToggle
                      checked={settings.notifyInFocus}
                      onChange={(v) => handleUpdateSetting('notifyInFocus', v)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Reaction notifications</span>
                    <BeeperToggle
                      checked={settings.notifyReactions}
                      onChange={(v) => handleUpdateSetting('notifyReactions', v)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Typing notifications</span>
                    <BeeperToggle
                      checked={settings.notifyTyping}
                      onChange={(v) => handleUpdateSetting('notifyTyping', v)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Show unread count badge on taskbar icon</span>
                    <BeeperToggle
                      checked={settings.unreadBadge}
                      onChange={(v) => handleUpdateSetting('unreadBadge', v)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Delay notifications by</span>
                    <BeeperSelect
                      value={settings.delayNotifications}
                      options={[
                        { value: 'off', label: 'Off' },
                        { value: '15s', label: '15 seconds' },
                        { value: '30s', label: '30 seconds' },
                        { value: '1m', label: '1 minute' },
                      ]}
                      onChange={(val) => handleUpdateSetting('delayNotifications', val as any)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB: HOTKEYS ==================== */}
            {activeTab === 'hotkeys' && (
              <div className="space-y-[18px]">
                <div className="flex items-center gap-[10px]">
                  <input
                    type="text"
                    placeholder="Search hotkeys..."
                    value={hotkeySearch}
                    onChange={(e) => setHotkeySearch(e.target.value)}
                    className="flex-1 h-[32px] px-[12px] rounded-[7px] bg-[#22242a] border border-white/[0.08] text-[12.5px] text-white placeholder-white/40 focus:outline-none focus:border-[#0a84ff]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setHotkeySearch('');
                      showToast('Keybindings reverted to default');
                    }}
                    className="h-[32px] px-[12px] rounded-[7px] bg-white/[0.08] hover:bg-white/[0.14] text-[12px] font-medium text-white cursor-pointer"
                  >
                    Revert all
                  </button>
                </div>

                {hotkeyGroups.map((grp) => {
                  const items = grp.items.filter((i) =>
                    i.name.toLowerCase().includes(hotkeySearch.toLowerCase())
                  );
                  if (items.length === 0) return null;
                  return (
                    <div key={grp.group}>
                      <h4 className="text-[11.5px] font-semibold uppercase tracking-wider text-white/45 mb-[6px]">
                        {grp.group}
                      </h4>
                      <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                        {items.map((hk) => (
                          <div key={hk.name} className="p-[12px] flex items-center justify-between">
                            <div className="flex items-center gap-[8px]">
                              <span className="text-[13px] text-white/90">{hk.name}</span>
                              {hk.global && (
                                <span className="px-[6px] py-[1px] rounded-[4px] bg-white/[0.08] text-[10px] text-white/60">
                                  Global
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-[4px]">
                              {hk.keys.map((k) => (
                                <kbd
                                  key={k}
                                  className="px-[7px] py-[2px] rounded-[5px] bg-black/40 border border-white/[0.12] text-[11px] font-mono text-white/85"
                                >
                                  {k}
                                </kbd>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ==================== TAB: DEVICES ==================== */}
            {activeTab === 'devices' && (
              <div className="space-y-[20px]">
                <div>
                  <h4 className="text-[11.5px] font-semibold uppercase tracking-wider text-white/45 mb-[8px]">
                    Current Device
                  </h4>
                  <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] p-[14px] flex items-center justify-between">
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[36px] h-[36px] rounded-[8px] bg-[#0a84ff]/15 text-[#0a84ff] flex items-center justify-center">
                        💻
                      </div>
                      <div>
                        <div className="flex items-center gap-[6px]">
                          <span className="text-[13px] font-semibold text-white">
                            Mohivx Desktop (Windows 11 x64)
                          </span>
                          <span className="px-[6px] py-[1px] rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-medium">
                            Verified
                          </span>
                        </div>
                        <p className="text-[11.5px] text-white/50 mt-[2px]">
                          Active now · Session E2EE Verified
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11.5px] font-semibold uppercase tracking-wider text-white/45 mb-[8px]">
                    Verified Sessions
                  </h4>
                  <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                    <div className="p-[14px] flex items-center justify-between">
                      <div>
                        <span className="text-[13px] font-medium text-white">Telegram MTProto Bridge</span>
                        <p className="text-[11.5px] text-white/50">Direct GramJS Native Session</p>
                      </div>
                      <span className="text-[11.5px] text-emerald-400">Encrypted</span>
                    </div>
                    <div className="p-[14px] flex items-center justify-between">
                      <div>
                        <span className="text-[13px] font-medium text-white">Isolated Web Partitions</span>
                        <p className="text-[11.5px] text-white/50">Persistent Chromium Sandboxes</p>
                      </div>
                      <span className="text-[11.5px] text-emerald-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB: AI ==================== */}
            {activeTab === 'ai' && (
              <div className="space-y-[20px]">
                <p className="text-[12.5px] text-white/60">
                  Configure AI chat summarization, instant translation, and voice note transcription.
                </p>

                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">AI Model Engine</span>
                    <BeeperSelect
                      value={settings.aiModel}
                      options={[
                        { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
                        { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
                        { value: 'gpt-4o-mini', label: 'OpenAI GPT-4o Mini' },
                      ]}
                      onChange={(val) => handleUpdateSetting('aiModel', val)}
                    />
                  </div>

                  <div className="p-[14px] space-y-[8px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-white">Gemini / OpenAI API Key</span>
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-[11.5px] text-[#0a84ff] hover:underline"
                      >
                        {showApiKey ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="AIzaSy... or sk-..."
                      value={settings.geminiApiKey}
                      onChange={(e) => handleUpdateSetting('geminiApiKey', e.target.value)}
                      className="w-full h-[32px] px-[10px] rounded-[6px] bg-black/30 border border-white/[0.08] text-[12.5px] text-white font-mono focus:outline-none focus:border-[#0a84ff]"
                    />
                  </div>
                </div>

                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Summarize unread messages</span>
                    <BeeperToggle
                      checked={settings.autoSummarize}
                      onChange={(v) => handleUpdateSetting('autoSummarize', v)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Smart reply suggestions</span>
                    <BeeperToggle
                      checked={settings.smartReplies}
                      onChange={(v) => handleUpdateSetting('smartReplies', v)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Instant message translation</span>
                    <BeeperToggle
                      checked={settings.autoTranslate}
                      onChange={(v) => handleUpdateSetting('autoTranslate', v)}
                    />
                  </div>

                  <div className="p-[14px] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Voice message transcription</span>
                    <BeeperToggle
                      checked={settings.voiceTranscription}
                      onChange={(v) => handleUpdateSetting('voiceTranscription', v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB: BEEPER PLUS ==================== */}
            {activeTab === 'plus' && (
              <div className="space-y-[20px]">
                <div className="bg-gradient-to-br from-[#0a84ff]/25 via-[#22242a] to-[#8b5cf6]/20 border border-[#0a84ff]/30 rounded-[10px] p-[20px]">
                  <div className="flex items-center justify-between mb-[10px]">
                    <div className="flex items-center gap-[10px]">
                      <span className="px-[8px] py-[2px] rounded-[6px] bg-[#0a84ff] text-white text-[11px] font-bold">
                        + PLUS
                      </span>
                      <h3 className="text-[16px] font-bold text-white">Mohivx / Beeper Plus</h3>
                    </div>
                    <span className="text-[12px] text-emerald-400 font-semibold">
                      Unlocked Free in Mohivx Edition
                    </span>
                  </div>
                  <p className="text-[12.5px] text-white/75 leading-relaxed mb-[16px]">
                    All Plus features—including Incognito Mode, Unlimited Connected Accounts, Send Later, Custom Reminders, and Voice Transcription—are unlocked for you at no cost.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateSetting('planTier', settings.planTier === 'Plus' ? 'Free' : 'Plus');
                      showToast(
                        `Badge switched to ${settings.planTier === 'Plus' ? 'Free' : 'Plus'}`
                      );
                    }}
                    className="px-[14px] py-[7px] rounded-[7px] bg-[#0a84ff] hover:bg-[#0070e0] text-white text-[12.5px] font-semibold transition-colors cursor-pointer"
                  >
                    {settings.planTier === 'Plus'
                      ? 'Plus Badge Active (Click to show Free)'
                      : 'Activate Plus Badge on Profile'}
                  </button>
                </div>
              </div>
            )}

            {/* ==================== TAB: INTEGRATIONS ==================== */}
            {activeTab === 'integrations' && (
              <div className="space-y-[20px]">
                <div>
                  <h4 className="text-[12px] font-semibold uppercase tracking-wider text-white/45 mb-[8px]">
                    Beeper Desktop API & MCP
                  </h4>
                  <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                    <div className="p-[14px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-white">Allow connections</span>
                        <BeeperToggle
                          checked={settings.desktopApiEnabled}
                          onChange={(v) => handleUpdateSetting('desktopApiEnabled', v)}
                        />
                      </div>
                      <p className="text-[12px] text-white/50 mt-[6px]">
                        Allow approved local tools like Claude Desktop, Cursor, or Raycast to integrate via Model Context Protocol (MCP).
                      </p>
                    </div>

                    <div className="p-[14px] flex items-center justify-between">
                      <div>
                        <span className="text-[13px] font-medium text-white">Local MCP Endpoint</span>
                        <p className="text-[11.5px] font-mono text-white/50 mt-[2px]">
                          http://127.0.0.1:23373/v0/mcp
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText('http://127.0.0.1:23373/v0/mcp');
                          setMcpCopied(true);
                          setTimeout(() => setMcpCopied(false), 1800);
                        }}
                        className="px-[10px] py-[5px] rounded-[6px] bg-white/[0.08] hover:bg-white/[0.14] text-[12px] text-white cursor-pointer"
                      >
                        {mcpCopied ? 'Copied ✓' : 'Copy URL'}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[12px] font-semibold uppercase tracking-wider text-white/45 mb-[8px]">
                    Brave Direct Zero-Token Bridge
                  </h4>
                  <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] p-[14px] flex items-center justify-between">
                    <div className="flex items-center gap-[10px]">
                      <img src={braveLogo} alt="Brave" className="w-[24px] h-[24px]" />
                      <div>
                        <span className="text-[13px] font-medium text-white">Instagram Saved & Direct in Brave</span>
                        <p className="text-[11.5px] text-white/50">Zero-token native browser integration</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        (window as any).mohivxApi?.openBraveUrl?.('https://www.instagram.com/saved/')
                      }
                      className="px-[12px] py-[6px] rounded-[6px] bg-white/[0.08] hover:bg-white/[0.14] text-[12px] text-white cursor-pointer"
                    >
                      Open in Brave
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB: STORAGE ==================== */}
            {activeTab === 'storage' && (
              <div className="space-y-[20px]">
                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] p-[16px]">
                  <div className="flex items-center justify-between mb-[10px]">
                    <span className="text-[13px] font-semibold text-white">Local Storage Usage</span>
                    <span className="text-[12px] text-white/60">142.4 MB Total</span>
                  </div>
                  <div className="w-full h-[10px] rounded-full bg-black/40 overflow-hidden flex">
                    <div className="bg-[#0a84ff] h-full w-[45%]" title="Media" />
                    <div className="bg-[#8b5cf6] h-full w-[25%]" title="Messages Database" />
                    <div className="bg-[#14b8a6] h-full w-[15%]" title="Cache" />
                  </div>
                  <div className="flex items-center gap-[16px] mt-[10px] text-[11.5px] text-white/60">
                    <span className="flex items-center gap-[5px]">
                      <span className="w-[8px] h-[8px] rounded-full bg-[#0a84ff]" /> Media (64 MB)
                    </span>
                    <span className="flex items-center gap-[5px]">
                      <span className="w-[8px] h-[8px] rounded-full bg-[#8b5cf6]" /> Messages (38 MB)
                    </span>
                    <span className="flex items-center gap-[5px]">
                      <span className="w-[8px] h-[8px] rounded-full bg-[#14b8a6]" /> Cache (40.4 MB)
                    </span>
                  </div>
                </div>

                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] p-[16px] space-y-[14px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">Clear storage older than</span>
                    <div className="flex rounded-[7px] bg-black/30 p-[2px] border border-white/[0.06]">
                      {['All time', '7 days', '30 days', '90 days'].map((lbl, idx) => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setStorageAgeIndex(idx)}
                          className={`px-[10px] py-[3px] rounded-[5px] text-[11.5px] transition-colors ${
                            storageAgeIndex === idx
                              ? 'bg-white/[0.14] text-white font-medium'
                              : 'text-white/55 hover:text-white'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-[14px] flex-wrap">
                    {['images', 'videos', 'audio', 'files'].map((tKey) => {
                      const checked = selectedStorageTypes.includes(tKey);
                      return (
                        <label
                          key={tKey}
                          className="flex items-center gap-[6px] text-[12.5px] text-white/85 capitalize cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setSelectedStorageTypes((prev) =>
                                checked ? prev.filter((x) => x !== tKey) : [...prev, tKey]
                              )
                            }
                            className="accent-[#0a84ff]"
                          />
                          {tKey}
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-[6px] border-t border-white/[0.06]">
                    <span className="text-[12px] text-white/50">
                      {cacheStatus || 'Deletes cached media & temporary link previews'}
                    </span>
                    <div className="flex items-center gap-[8px]">
                      <button
                        type="button"
                        onClick={handleOpenFolder}
                        className="px-[12px] py-[6px] rounded-[7px] bg-white/[0.07] hover:bg-white/[0.12] text-[12px] text-white cursor-pointer"
                      >
                        Open Data Folder
                      </button>
                      <button
                        type="button"
                        onClick={handleClearCache}
                        className="px-[12px] py-[6px] rounded-[7px] bg-[#0a84ff] hover:bg-[#0070e0] text-[12px] font-medium text-white cursor-pointer"
                      >
                        Clear All Cache
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB: PROFILE ==================== */}
            {activeTab === 'profile' && (
              <div className="space-y-[20px]">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-semibold text-white">Beeper / Mohivx Profile</h4>
                  <span className="px-[8px] py-[2px] rounded-full bg-white/[0.08] text-[11px] text-white/80">
                    {settings.planTier || 'Free'}
                  </span>
                </div>

                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] p-[18px] space-y-[14px]">
                  <div className="flex items-center gap-[14px]">
                    <img
                      src={mohivxIcon64}
                      alt="Avatar"
                      className="w-[52px] h-[52px] rounded-full object-cover ring-2 ring-white/10"
                    />
                    <div>
                      <p className="text-[14px] font-semibold text-white">{settings.displayName}</p>
                      <p className="text-[12px] text-white/50">{settings.email}</p>
                    </div>
                  </div>

                  <div className="space-y-[10px] pt-[8px]">
                    <div>
                      <label className="block text-[11.5px] text-white/50 mb-[4px]">Full Name</label>
                      <input
                        type="text"
                        value={settings.displayName}
                        onChange={(e) => handleUpdateSetting('displayName', e.target.value)}
                        className="w-full h-[34px] px-[10px] rounded-[6px] bg-black/30 border border-white/[0.08] text-[13px] text-white focus:outline-none focus:border-[#0a84ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] text-white/50 mb-[4px]">Email Address</label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleUpdateSetting('email', e.target.value)}
                        className="w-full h-[34px] px-[10px] rounded-[6px] bg-black/30 border border-white/[0.08] text-[13px] text-white focus:outline-none focus:border-[#0a84ff]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB: HELP ==================== */}
            {activeTab === 'help' && (
              <div className="space-y-[18px]">
                <h4 className="text-[14px] font-semibold text-white">Help & Troubleshooting</h4>
                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                  <button
                    type="button"
                    onClick={() =>
                      (window as any).mohivxApi?.updater?.openReleasePage?.(
                        'https://github.com/Mohivx/Mohivx-Messenger/issues'
                      )
                    }
                    className="w-full p-[14px] text-left text-[13px] text-white hover:bg-white/[0.04] flex items-center justify-between cursor-pointer"
                  >
                    <span>Report a Problem</span>
                    <span className="text-white/40">↗</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenFolder}
                    className="w-full p-[14px] text-left text-[13px] text-white hover:bg-white/[0.04] flex items-center justify-between cursor-pointer"
                  >
                    <span>Open Application Logs & Diagnostics Folder</span>
                    <span className="text-white/40">↗</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="w-full p-[14px] text-left text-[13px] text-white hover:bg-white/[0.04] flex items-center justify-between cursor-pointer"
                  >
                    <span>Reset Cache & Reload Bridges</span>
                    <span className="text-white/40">↻</span>
                  </button>
                </div>
              </div>
            )}

            {/* ==================== TAB: ABOUT ==================== */}
            {activeTab === 'about' && (
              <div className="space-y-[20px]">
                <div className="flex items-center gap-[18px] py-[8px]">
                  <img
                    src={mohivxLogo128}
                    alt="Mohivx Messenger"
                    className="w-[72px] h-[72px] rounded-[16px] shadow-lg"
                  />
                  <div>
                    <h2 className="text-[18px] font-bold text-white">Mohivx Messenger</h2>
                    <p className="text-[13px] text-white/55 mt-[2px]">v1.1.0 — Desktop Unified Edition</p>
                  </div>
                </div>

                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] p-[14px] flex items-center justify-between">
                  <div>
                    <span className="text-[13px] font-medium text-white">Software Updates</span>
                    <p className="text-[12px] text-white/50 mt-[2px]">
                      {updateStatus || 'Automatic GitHub release updates enabled'}
                    </p>
                  </div>
                  {availableUpdate ? (
                    updateDownloaded ? (
                      <button
                        type="button"
                        onClick={() => (window as any).mohivxApi?.updater?.installAndRestart?.()}
                        className="px-[12px] py-[6px] rounded-[7px] bg-emerald-600 text-white text-[12px] font-semibold cursor-pointer"
                      >
                        Restart to Update
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartUpdate}
                        className="px-[12px] py-[6px] rounded-[7px] bg-[#0a84ff] text-white text-[12px] font-semibold cursor-pointer"
                      >
                        {downloadProgress ? `Downloading ${downloadProgress}%` : `Update to v${availableUpdate.latestVersion}`}
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={handleCheckUpdates}
                      className="px-[12px] py-[6px] rounded-[7px] bg-white/[0.09] hover:bg-white/[0.15] text-[12px] font-medium text-white cursor-pointer"
                    >
                      Check for Updates
                    </button>
                  )}
                </div>

                <div className="bg-[#22242a] border border-white/[0.06] rounded-[8px] divide-y divide-white/[0.06]">
                  {[
                    {
                      label: 'View changelog',
                      url: 'https://github.com/Mohivx/Mohivx-Messenger/releases',
                    },
                    {
                      label: 'Report a problem',
                      url: 'https://github.com/Mohivx/Mohivx-Messenger/issues',
                    },
                    {
                      label: 'Privacy Policy',
                      url: 'https://github.com/Mohivx/Mohivx-Messenger',
                    },
                    {
                      label: 'Legal Notices',
                      url: 'https://github.com/Mohivx/Mohivx-Messenger',
                    },
                  ].map((row) => (
                    <button
                      key={row.label}
                      type="button"
                      onClick={() => (window as any).mohivxApi?.updater?.openReleasePage?.(row.url)}
                      className="w-full p-[14px] text-left text-[13px] font-medium text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      {row.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Subtle Bottom Save Toast */}
      {saveToast && (
        <div className="fixed bottom-[16px] right-[20px] px-[12px] py-[6px] rounded-[8px] bg-[#0a84ff] text-white text-[12px] font-medium shadow-lg z-50">
          {saveToast}
        </div>
      )}
    </div>
  );
};
