import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('mohivxApi', {
  platform: process.platform,
  version: '1.0.0',
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  sendNotification: (title: string, body: string) => ipcRenderer.send('notify', { title, body }),
  onConnectorMessage: (callback: (msg: any) => void) => {
    ipcRenderer.on('connector-message', (_, msg) => callback(msg));
  },
});
