import { app, BrowserWindow, ipcMain, Tray, Menu, Notification, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import { LocalDatabase } from './database';
import { ConnectorManager } from './connectors/manager';

// Ensure proper Windows 11 taskbar grouping and icon display
if (process.platform === 'win32') {
  app.setAppUserModelId('com.mohivx.messenger');
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const db = new LocalDatabase();
const connectorManager = new ConnectorManager(db);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function getAppIcon(): Electron.NativeImage | undefined {
  const possiblePaths = [
    path.join(__dirname, '../assets/icon.ico'),
    path.join(__dirname, '../assets/icon.png'),
    path.join(process.resourcesPath, 'assets/icon.ico'),
    path.join(process.resourcesPath, 'assets/icon.png'),
    path.join(process.resourcesPath, 'app.asar/assets/icon.ico'),
    path.join(process.resourcesPath, 'app.asar/assets/icon.png'),
    path.join(__dirname, '../../assets/icon.ico'),
    path.join(__dirname, '../../assets/icon.png'),
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        const img = nativeImage.createFromPath(p);
        if (!img.isEmpty()) {
          return img;
        }
      }
    } catch {}
  }
  return undefined;
}

function createMainWindow() {
  const isOffscreen = process.argv.includes('--offscreen');
  const appIcon = getAppIcon();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    show: true,
    focusable: !isOffscreen,
    x: isOffscreen ? -30000 : undefined,
    y: isOffscreen ? -30000 : undefined,
    titleBarStyle: 'hidden',
    backgroundColor: '#232323',
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  if (appIcon && mainWindow) {
    mainWindow.setIcon(appIcon);
  }

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.webContents.on('console-message', (_, level, message, line, sourceId) => {
    console.log(`[Renderer ${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const appIcon = getAppIcon() || path.join(__dirname, '../assets/icon-32.png');
  tray = new Tray(appIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Mohivx Messenger',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip('Mohivx Messenger');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

// IPC Window Controls
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window-close', () => mainWindow?.close());

ipcMain.on('notify', (_, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({
      title,
      body,
      icon: path.join(__dirname, '../assets/icon.ico'),
    }).show();
  }
});

// Telegram IPC Handlers
ipcMain.handle('tg-send-code', async (_, { phoneNumber, apiId, apiHash }) => {
  return await connectorManager.telegram.sendCode(phoneNumber, apiId, apiHash);
});

ipcMain.handle('tg-signin-code', async (_, { code }) => {
  return await connectorManager.telegram.signInWithCode(code);
});

ipcMain.handle('tg-signin-2fa', async (_, { password }) => {
  return await connectorManager.telegram.signInWith2FA(password);
});

ipcMain.handle('tg-status', async () => {
  return { connected: connectorManager.telegram.isConnected() };
});

ipcMain.handle('tg-sync-threads', async (_, { limit }) => {
  return await connectorManager.telegram.syncThreads(limit);
});

ipcMain.handle('tg-get-messages', async (_, { threadId, limit }) => {
  return await connectorManager.telegram.getMessages(threadId, limit);
});

ipcMain.handle('tg-send-message', async (_, { threadId, text }) => {
  return await connectorManager.telegram.sendMessage(threadId, text);
});

ipcMain.handle('tg-disconnect', async () => {
  await connectorManager.telegram.disconnect();
  return { success: true };
});

app.whenReady().then(async () => {
  console.log('[App] Initializing database and connectors...');
  try {
    await db.initialize();
    await connectorManager.autoConnectAll();
  } catch (e) {
    console.warn('[App] Auto-connect warning:', e);
  }

  createMainWindow();
  createTray();

  // Forward incoming real-time messages to renderer
  connectorManager.onMessage((msg) => {
    mainWindow?.webContents.send('incoming-message', msg);
    if (Notification.isSupported() && !mainWindow?.isFocused()) {
      new Notification({
        title: msg.senderName || 'Telegram',
        body: msg.content,
        icon: path.join(__dirname, '../assets/icon.ico'),
      }).show();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
