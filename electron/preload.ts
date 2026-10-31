import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('mohivxApi', {
  platform: process.platform,
  version: '1.0.0',
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  sendNotification: (title: string, body: string) => ipcRenderer.send('notify', { title, body }),

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
});
