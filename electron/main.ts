import { app, BrowserWindow, ipcMain, Tray, Menu, Notification, nativeImage, session, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { LocalDatabase } from './database';
import { ConnectorManager } from './connectors/manager';
import { AppUpdater } from './updater';

// Ensure proper Windows 11 taskbar grouping and icon display
const APP_USER_MODEL_ID = 'com.mohivx.messenger';
if (process.platform === 'win32') {
  app.setAppUserModelId(APP_USER_MODEL_ID);
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
      mainWindow.setAlwaysOnTop(true);
      mainWindow.focus();
      mainWindow.setAlwaysOnTop(false);
    }
  });
}

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isAppQuitting = false;
const db = new LocalDatabase();
const connectorManager = new ConnectorManager(db);
const updater = new AppUpdater();

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function getAppIcon(): Electron.NativeImage | undefined {
  const possiblePaths = [
    path.join(__dirname, '../assets/icon.ico'),
    path.join(__dirname, '../assets/icon.png'),
    path.join(__dirname, '../public/assets/icon.ico'),
    path.join(__dirname, '../public/assets/icon.png'),
    path.join(process.cwd(), 'assets/icon.ico'),
    path.join(process.cwd(), 'assets/icon.png'),
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

// App Settings Persistence in userData
function getSettingsFilePath(): string {
  return path.join(app.getPath('userData'), 'mohivx_settings.json');
}

function readAppSettings(): Record<string, any> {
  const defaults = {
    incognitoMode: false,
    showTypingIndicator: true,
    language: 'en',
    directionMode: 'ltr',
    defaultRemindLater: 'if_no_reply',
    archiveOnReminder: true,
    syncArchiveState: true,
    markReadOnArchive: true,
    afterArchive: 'next',
    afterMarkReadUnread: 'next',
    doubleClickMessageAction: 'reply',
    undoSendDelay: 5,
    includeTimestampsOnCopy: false,
    emojiAutocomplete: true,
    autoCopyOtp: true,
    launchOnStartup: false,
    closeToTray: true,
    minimizeToTray: true,
    hardwareAcceleration: true,

    showSidebar: true,
    compactPinnedThreads: false,
    showUnreads: true,
    messagePreviews: true,
    compactChatList: false,
    showNetworkIcons: true,
    colorizeNetworkIcons: true,
    theme: 'dark',
    density: 'comfortable',
    fontSize: 13,
    zoomLevel: 100,

    soundEnabled: true,
    soundVolume: 80,
    notifications: true,
    notifyGroupMessages: true,
    notifyInFocus: false,
    notifyReactions: true,
    notifyTyping: false,
    delayNotifications: 'off',
    unreadBadge: true,
    dnd: false,

    aiModel: 'gemini-2.0-flash',
    geminiApiKey: '',
    openaiApiKey: '',
    autoSummarize: true,
    smartReplies: true,
    autoTranslate: true,
    voiceTranscription: true,
    aiMentions: true,

    desktopApiEnabled: true,
    remoteAccessEnabled: false,

    displayName: 'mohivx',
    username: '@mohivx2',
    email: 'm0559520809@gmail.com',
    bio: 'Software Engineer & AI Architect',
    planTier: 'Free',
  };

  try {
    const file = getSettingsFilePath();
    if (fs.existsSync(file)) {
      const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!saved._beeperV2Migrated) {
        saved.language = 'en';
        saved.directionMode = 'ltr';
        saved._beeperV2Migrated = true;
        writeAppSettings({ ...defaults, ...saved });
      }
      return { ...defaults, ...saved };
    }
  } catch {}
  return defaults;
}

function writeAppSettings(data: Record<string, any>) {
  try {
    fs.writeFileSync(getSettingsFilePath(), JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Settings] Failed to write settings:', err);
  }
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
    backgroundColor: '#252830',
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webviewTag: true,
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

  mainWindow.once('ready-to-show', () => {
    if (!isOffscreen && mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.setAlwaysOnTop(true);
      mainWindow.focus();
      mainWindow.setAlwaysOnTop(false);
    }
  });

  // Also ensure window shows and focuses immediately
  if (!isOffscreen && mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(true);
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(false);
  }

  mainWindow.webContents.on('console-message', (_, level, message, line, sourceId) => {
    console.log(`[Renderer ${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.on('close', (e) => {
    const settings = readAppSettings();
    if (settings.closeToTray && !isAppQuitting) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function openSettingsWindow(initialTab = 'general') {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    settingsWindow.focus();
    settingsWindow.webContents.send('set-settings-tab', initialTab);
    return;
  }

  const appIcon = getAppIcon();
  settingsWindow = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 840,
    minHeight: 580,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#18191c',
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webviewTag: true,
    },
  });

  if (appIcon) {
    settingsWindow.setIcon(appIcon);
  }

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    settingsWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#settings?tab=${initialTab}`);
  } else {
    settingsWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: `settings?tab=${initialTab}`,
    });
  }

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function createTray() {
  try {
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
      {
        label: 'Settings',
        click: () => {
          openSettingsWindow('general');
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          isAppQuitting = true;
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
  } catch (err) {
    console.warn('[Tray] Failed to initialize tray:', err);
  }
}

// Universal Window Controls (targets whichever window sent the event)
ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.minimize();
});

ipcMain.on('window-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win?.isMaximized()) {
    win.unmaximize();
  } else {
    win?.maximize();
  }
});

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win === mainWindow) {
    const settings = readAppSettings();
    if (settings.closeToTray && !isAppQuitting) {
      mainWindow?.hide();
      return;
    }
  }
  win?.close();
});

ipcMain.on('notify', (_, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({
      title,
      body,
      icon: path.join(__dirname, '../assets/icon.ico'),
    }).show();
  }
});

// Standalone Settings Window IPC
ipcMain.handle('open-settings-window', (_, tab?: string) => {
  openSettingsWindow(tab || 'general');
  return { success: true };
});

ipcMain.handle('archive-bulk-chats', (_, payload: { filter: 'all' | 'unread'; days: number }) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('archive-bulk-chats', payload);
  }
  return { success: true };
});

ipcMain.handle('get-app-settings', () => {
  return readAppSettings();
});

ipcMain.handle('save-app-settings', (_, newSettings) => {
  const current = readAppSettings();
  const merged = { ...current, ...newSettings };
  writeAppSettings(merged);

  if (typeof newSettings.launchOnStartup === 'boolean') {
    app.setLoginItemSettings({
      openAtLogin: newSettings.launchOnStartup,
      path: process.execPath,
    });
  }

  // Notify all open windows of update
  BrowserWindow.getAllWindows().forEach((win) => {
    if (!win.isDestroyed()) {
      win.webContents.send('app-settings-updated', merged);
    }
  });

  return { success: true, settings: merged };
});

ipcMain.handle('clear-app-cache', async () => {
  try {
    const ses = session.defaultSession;
    await ses.clearCache();
    await ses.clearStorageData({ storages: ['cachestorage', 'shadercache'] });
    return { success: true, message: 'Cache cleared successfully' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('open-app-folder', async () => {
  const userData = app.getPath('userData');
  await shell.openPath(userData);
  return { success: true };
});

// Universal Network Login Configurations
const CHROME_DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

const NETWORK_CONFIGS: Record<string, { name: string; url: string; userAgent?: string }> = {
  telegram: {
    name: 'Telegram Web',
    url: 'https://web.telegram.org/k/',
    userAgent: CHROME_DESKTOP_UA,
  },
  whatsapp: {
    name: 'WhatsApp Web',
    url: 'https://web.whatsapp.com/',
    userAgent: CHROME_DESKTOP_UA,
  },
  x: {
    name: 'X (Twitter)',
    url: 'https://x.com/i/flow/login',
    userAgent: CHROME_DESKTOP_UA,
  },
  instagram: {
    name: 'Instagram',
    url: 'https://www.instagram.com/accounts/login/',
    userAgent: CHROME_DESKTOP_UA,
  },
  discord: {
    name: 'Discord',
    url: 'https://discord.com/login',
    userAgent: CHROME_DESKTOP_UA,
  },
  slack: {
    name: 'Slack',
    url: 'https://slack.com/signin',
    userAgent: CHROME_DESKTOP_UA,
  },
  facebook: {
    name: 'Messenger',
    url: 'https://www.messenger.com/login/',
    userAgent: CHROME_DESKTOP_UA,
  },
  googlemessages: {
    name: 'Google Messages',
    url: 'https://messages.google.com/web/authentication',
    userAgent: CHROME_DESKTOP_UA,
  },
  googlechat: {
    name: 'Google Chat',
    url: 'https://chat.google.com/',
    userAgent: CHROME_DESKTOP_UA,
  },
  signal: {
    name: 'Signal',
    url: 'https://signal.org/',
    userAgent: CHROME_DESKTOP_UA,
  },
  linkedin: {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/messaging/',
    userAgent: CHROME_DESKTOP_UA,
  },
  line: {
    name: 'LINE',
    url: 'https://line.me/',
    userAgent: CHROME_DESKTOP_UA,
  },
  matrix: {
    name: 'Matrix (Element)',
    url: 'https://app.element.io/',
    userAgent: CHROME_DESKTOP_UA,
  },
  viber: {
    name: 'Viber',
    url: 'https://www.viber.com/',
    userAgent: CHROME_DESKTOP_UA,
  },
  wechat: {
    name: 'WeChat',
    url: 'https://web.wechat.com/',
    userAgent: CHROME_DESKTOP_UA,
  },
};

// Universal Network Web Login Window (Isolated persistent partition)
ipcMain.handle(
  'open-network-login',
  async (
    _,
    payload: string | { networkId: string; accountLabel?: string; openInBrowser?: boolean }
  ) => {
    const networkId = typeof payload === 'string' ? payload : payload.networkId;
    const accountLabel = typeof payload === 'object' ? payload.accountLabel : undefined;
    const openInBrowser = typeof payload === 'object' ? payload.openInBrowser : false;

    const config = NETWORK_CONFIGS[networkId] || {
      name: networkId,
      url: `https://www.google.com/search?q=${encodeURIComponent(networkId)}`,
      userAgent: CHROME_DESKTOP_UA,
    };

    // If user requested to open directly in their default browser (Brave / Chrome)
    if (openInBrowser) {
      await shell.openExternal(config.url);
      return { success: true, method: 'browser' };
    }

    const appIcon = getAppIcon();
    const sanitizedLabel = accountLabel ? accountLabel.replace(/[^a-zA-Z0-9_-]/g, '_') : 'default';
    const partitionName = `persist:mohivx_${networkId}_${sanitizedLabel}`;
    const customSession = session.fromPartition(partitionName);

    const ua = config.userAgent || CHROME_DESKTOP_UA;
    customSession.setUserAgent(ua);

    // Strip Electron headers so Google OAuth (Continue with Google) never blocks sign in:
    customSession.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['User-Agent'] = ua;
      delete details.requestHeaders['X-Requested-With'];
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });

    const displayTitle = accountLabel
      ? `Connect ${config.name} (${accountLabel}) — Mohivx Messenger`
      : `Connect ${config.name} — Mohivx Messenger`;

    const loginWin = new BrowserWindow({
      width: 1060,
      height: 780,
      title: displayTitle,
      icon: appIcon,
      autoHideMenuBar: false,
      backgroundColor: '#18191c',
      webPreferences: {
        partition: partitionName,
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    });

    if (appIcon) {
      loginWin.setIcon(appIcon);
    }

    // Top Action Bar with 1-click open in default browser button
    const loginMenu = Menu.buildFromTemplate([
      {
        label: '🌐 Open in Default Browser (Brave / Chrome)',
        click: () => {
          const curUrl = loginWin.webContents.getURL() || config.url;
          shell.openExternal(curUrl);
        },
      },
      {
        label: '🔄 Reload',
        click: () => loginWin.webContents.reload(),
      },
      {
        label: '⬅ Back',
        click: () => {
          if (loginWin.webContents.canGoBack()) loginWin.webContents.goBack();
        },
      },
      {
        label: '✅ Save & Connect Account',
        click: () => {
          loginWin.close();
        },
      },
    ]);
    loginWin.setMenu(loginMenu);

    // Allow OAuth popups (Google, Apple, Microsoft) so sign-in flows succeed
    loginWin.webContents.setWindowOpenHandler(({ url }) => {
      return { action: 'allow' };
    });

    loginWin.loadURL(config.url);

    loginWin.webContents.on('did-finish-load', () => {
      const currentUrl = loginWin.webContents.getURL();
      console.log(`[NetworkLogin] ${networkId} (${sanitizedLabel}) navigated to: ${currentUrl}`);
    });

    loginWin.on('close', async () => {
      try {
        const cookies = await customSession.cookies.get({});
        const accountData = {
          id: `acc-${networkId}-${sanitizedLabel}-${Date.now().toString(36)}`,
          networkId: networkId,
          username: accountLabel
            ? `${config.name} (${accountLabel})`
            : `${config.name} Account`,
          displayName: accountLabel
            ? `${config.name} (${accountLabel})`
            : config.name,
          avatarUrl: '',
          connectedAt: new Date().toISOString().split('T')[0],
          status: 'active',
          partition: partitionName,
        };
        mainWindow?.webContents.send('network-auth-success', accountData);
        if (settingsWindow && !settingsWindow.isDestroyed()) {
          settingsWindow.webContents.send('network-auth-success', accountData);
        }
      } catch (e) {
        console.warn('[NetworkLogin] Cookie check warning:', e);
      }
    });

    return { success: true };
  }
);

// Open Network in Default Browser (Brave / Chrome) directly
ipcMain.handle('open-network-in-browser', async (_, networkId: string) => {
  const config = NETWORK_CONFIGS[networkId];
  const url = config?.url || `https://x.com/login`;
  await shell.openExternal(url);
  return { success: true };
});

ipcMain.handle('open-external-url', async (_, targetUrl: string) => {
  if (targetUrl && (targetUrl.startsWith('https://') || targetUrl.startsWith('http://'))) {
    await shell.openExternal(targetUrl);
    return { success: true };
  }
  return { success: false, error: 'Invalid URL' };
});

// Launch Brave with specific URL (Zero-Token direct browsing)
ipcMain.handle('open-brave-url', async (_, targetUrl: string) => {
  const bravePaths = [
    'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    path.join(process.env.LOCALAPPDATA || '', 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
  ];

  const braveExe = bravePaths.find((p) => fs.existsSync(p));
  if (braveExe) {
    spawn(braveExe, [targetUrl], { detached: true, stdio: 'ignore' }).unref();
    return { success: true, method: 'brave' };
  } else {
    shell.openExternal(targetUrl);
    return { success: true, method: 'default' };
  }
});

// Safe Installed Browser Detector
ipcMain.handle('detect-browsers', async () => {
  const localAppData = process.env.LOCALAPPDATA || '';
  const appData = process.env.APPDATA || '';
  const programFiles = process.env['PROGRAMFILES'] || 'C:\\Program Files';
  const programFilesX86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';

  const candidates = [
    {
      id: 'brave',
      name: 'Brave Browser',
      profileName: 'Default Profile',
      paths: [
        path.join(localAppData, 'BraveSoftware', 'Brave-Browser', 'User Data'),
        path.join(programFiles, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
        path.join(programFilesX86, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
      ],
    },
    {
      id: 'chrome',
      name: 'Google Chrome',
      profileName: 'Default Profile',
      paths: [
        path.join(localAppData, 'Google', 'Chrome', 'User Data'),
        path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      ],
    },
    {
      id: 'edge',
      name: 'Microsoft Edge',
      profileName: 'Personal Profile',
      paths: [
        path.join(localAppData, 'Microsoft', 'Edge', 'User Data'),
        path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      ],
    },
    {
      id: 'firefox',
      name: 'Mozilla Firefox',
      profileName: 'Default-Release',
      paths: [
        path.join(appData, 'Mozilla', 'Firefox', 'Profiles'),
        path.join(programFiles, 'Mozilla Firefox', 'firefox.exe'),
      ],
    },
  ];

  return candidates.map((b) => ({
    id: b.id,
    name: b.name,
    profileName: b.profileName,
    installed: b.paths.some((p) => {
      try {
        return fs.existsSync(p);
      } catch {
        return false;
      }
    }),
  }));
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

// In-app Update IPC Handlers
ipcMain.handle('app-get-version', () => {
  return updater.getCurrentVersion();
});

ipcMain.handle('app-check-update', async () => {
  return await updater.checkForUpdates();
});

ipcMain.handle('app-start-update', async (_, { downloadUrl }) => {
  if (!downloadUrl) throw new Error('Missing download URL');
  try {
    const downloadedPath = await updater.downloadUpdate(downloadUrl, (percent, received, total) => {
      mainWindow?.webContents.send('update-progress', { percent, received, total });
      if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.webContents.send('update-progress', { percent, received, total });
      }
    });
    mainWindow?.webContents.send('update-downloaded', { path: downloadedPath });
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.webContents.send('update-downloaded', { path: downloadedPath });
    }
    return { success: true, path: downloadedPath };
  } catch (err: any) {
    console.error('[Updater] Download error:', err);
    throw err;
  }
});

ipcMain.handle('app-install-restart', () => {
  updater.installAndRestart();
});

ipcMain.handle('app-open-release-page', (_, { url }) => {
  updater.openReleasePage(url);
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

  // Background In-App Update Check after launch
  setTimeout(async () => {
    try {
      const updateInfo = await updater.checkForUpdates();
      if (updateInfo.updateAvailable && mainWindow && !mainWindow.isDestroyed()) {
        console.log(`[Updater] New version detected: ${updateInfo.latestVersion}`);
        mainWindow.webContents.send('update-available', updateInfo);
      }
    } catch (err) {
      console.warn('[Updater] Background check failed:', err);
    }
  }, 3500);

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
