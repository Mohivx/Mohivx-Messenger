import { app, BrowserWindow, ipcMain, Tray, Menu, Notification } from 'electron';
import path from 'path';
import { ConnectorManager } from './connectors/manager';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const connectorManager = new ConnectorManager();

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#232323',
    icon: path.join(__dirname, '../assets/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.webContents.on('console-message', (_, level, message, line, sourceId) => {
    console.log(`[Renderer ${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('render-process-gone', (_, details) => {
    console.log('[Render process gone]', details);
  });

  mainWindow.on('closed', () => {
    console.log('[Window closed]');
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../assets/icon-32.png');
  tray = new Tray(iconPath);
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

app.whenReady().then(() => {
  console.log('App ready triggered');
  try {
    createMainWindow();
    console.log('Window created');
    createTray();
    console.log('Tray created');
  } catch (err) {
    console.error('Startup error:', err);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
