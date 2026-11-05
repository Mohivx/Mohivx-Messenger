import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('mohivxApi', {
  platform: process.platform,
  version: '1.0.0',
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  sendNotification: (title: string, body: string) => ipcRenderer.send('notify', { title, body }),
  detectBrowsers: () => ipcRenderer.invoke('detect-browsers'),

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
