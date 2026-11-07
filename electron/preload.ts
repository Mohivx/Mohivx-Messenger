import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('mohivxApi', {
  platform: process.platform,
  version: '1.1.0',

  // Window Controls for any active window
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  // Desktop Notifications
  sendNotification: (title: string, body: string) => ipcRenderer.send('notify', { title, body }),

  // Browser Profile Detector
  detectBrowsers: () => ipcRenderer.invoke('detect-browsers'),

  // Standalone Settings Window
  openSettingsWindow: (tab?: string) => ipcRenderer.invoke('open-settings-window', tab),
  onSetSettingsTab: (callback: (tab: string) => void) => {
    const handler = (_: any, tab: string) => callback(tab);
    ipcRenderer.on('set-settings-tab', handler);
    return () => ipcRenderer.removeListener('set-settings-tab', handler);
  },

  // App Settings persistence & system effects
  getAppSettings: () => ipcRenderer.invoke('get-app-settings'),
  saveAppSettings: (settings: any) => ipcRenderer.invoke('save-app-settings', settings),
  onAppSettingsUpdated: (callback: (settings: any) => void) => {
    const handler = (_: any, settings: any) => callback(settings);
    ipcRenderer.on('app-settings-updated', handler);
    return () => ipcRenderer.removeListener('app-settings-updated', handler);
  },
  archiveBulkChats: (payload: { filter: 'all' | 'unread'; days: number }) =>
    ipcRenderer.invoke('archive-bulk-chats', payload),
  onArchiveBulkChats: (callback: (payload: { filter: 'all' | 'unread'; days: number }) => void) => {
    const handler = (_: any, payload: any) => callback(payload);
    ipcRenderer.on('archive-bulk-chats', handler);
    return () => ipcRenderer.removeListener('archive-bulk-chats', handler);
  },
  clearAppCache: () => ipcRenderer.invoke('clear-app-cache'),
  openAppDataFolder: () => ipcRenderer.invoke('open-app-folder'),

  // Universal Network Web Login (WhatsApp, Instagram, Discord, Slack, etc.)
  openNetworkLogin: (networkId: string, options?: { accountLabel?: string; openInBrowser?: boolean }) =>
    ipcRenderer.invoke('open-network-login', typeof options === 'object' ? { networkId, ...options } : networkId),
  openNetworkInBrowser: (networkId: string) => ipcRenderer.invoke('open-network-in-browser', networkId),
  openExternalUrl: (url: string) => ipcRenderer.invoke('open-external-url', url),
  onNetworkAuthSuccess: (callback: (accountData: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('network-auth-success', handler);
    return () => ipcRenderer.removeListener('network-auth-success', handler);
  },

  // Brave background / zero-token launcher
  openBraveUrl: (url: string) => ipcRenderer.invoke('open-brave-url', url),

  // Telegram MTProto methods
  telegram: {
    sendCode: (phoneNumber: string, apiId?: number, apiHash?: string) =>
      ipcRenderer.invoke('tg-send-code', { phoneNumber, apiId, apiHash }),
    signInWithCode: (code: string) =>
      ipcRenderer.invoke('tg-signin-code', { code }),
    signInWith2FA: (password: string) =>
      ipcRenderer.invoke('tg-signin-2fa', { password }),
    getStatus: () => ipcRenderer.invoke('tg-status'),
    syncThreads: (limit?: number) => ipcRenderer.invoke('tg-sync-threads', { limit }),
    getMessages: (threadId: string, limit?: number) =>
      ipcRenderer.invoke('tg-get-messages', { threadId, limit }),
    sendMessage: (threadId: string, text: string) =>
      ipcRenderer.invoke('tg-send-message', { threadId, text }),
    disconnect: () => ipcRenderer.invoke('tg-disconnect'),
  },

  // Real-time message events from connectors
  onIncomingMessage: (callback: (msg: any) => void) => {
    const handler = (_: any, msg: any) => callback(msg);
    ipcRenderer.on('incoming-message', handler);
    return () => ipcRenderer.removeListener('incoming-message', handler);
  },

  // In-app Updates API
  updater: {
    getVersion: () => ipcRenderer.invoke('app-get-version'),
    checkForUpdates: () => ipcRenderer.invoke('app-check-update'),
    startUpdate: (downloadUrl: string) => ipcRenderer.invoke('app-start-update', { downloadUrl }),
    installAndRestart: () => ipcRenderer.invoke('app-install-restart'),
    openReleasePage: (url?: string) => ipcRenderer.invoke('app-open-release-page', { url }),
    onUpdateAvailable: (callback: (info: any) => void) => {
      const handler = (_: any, info: any) => callback(info);
      ipcRenderer.on('update-available', handler);
      return () => ipcRenderer.removeListener('update-available', handler);
    },
    onUpdateProgress: (callback: (prog: { percent: number; received: number; total: number }) => void) => {
      const handler = (_: any, prog: any) => callback(prog);
      ipcRenderer.on('update-progress', handler);
      return () => ipcRenderer.removeListener('update-progress', handler);
    },
    onUpdateDownloaded: (callback: (data: { path: string }) => void) => {
      const handler = (_: any, data: any) => callback(data);
      ipcRenderer.on('update-downloaded', handler);
      return () => ipcRenderer.removeListener('update-downloaded', handler);
    },
  },
});
