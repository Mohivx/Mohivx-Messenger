const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function findRcedit() {
  const localAppData = process.env.LOCALAPPDATA || '';
  const winCodeSignDir = path.join(localAppData, 'electron-builder', 'Cache', 'winCodeSign');
  
  if (fs.existsSync(winCodeSignDir)) {
    const entries = fs.readdirSync(winCodeSignDir);
    for (const entry of entries) {
      const candidate = path.join(winCodeSignDir, entry, 'rcedit-x64.exe');
      if (fs.existsSync(candidate)) {
        return candidate;
      }
      const candidate2 = path.join(winCodeSignDir, entry, 'windows-10', 'x64', 'rcedit-x64.exe');
      if (fs.existsSync(candidate2)) {
        return candidate2;
      }
    }
  }
  return null;
}

const rceditPath = findRcedit();
if (!rceditPath) {
  console.warn('[PatchIcon] rcedit-x64.exe not found in electron-builder cache; skipping icon patch.');
  process.exit(0);
}

const iconPath = path.resolve(__dirname, '../assets/icon.ico');
if (!fs.existsSync(iconPath)) {
  console.error('[PatchIcon] Icon file missing at:', iconPath);
  process.exit(1);
}

const targets = [
  path.resolve(__dirname, '../node_modules/electron/dist/electron.exe'),
  path.resolve(__dirname, '../release/win-unpacked/Mohivx Messenger.exe'),
  path.join(process.env.LOCALAPPDATA || '', 'Programs/Mohivx Messenger/Mohivx Messenger.exe'),
];

// Sync built app.asar and assets to locally installed Mohivx Messenger if present
const installedDir = path.join(process.env.LOCALAPPDATA || '', 'Programs/Mohivx Messenger');
const builtAsar = path.resolve(__dirname, '../release/win-unpacked/resources/app.asar');
if (fs.existsSync(installedDir) && fs.existsSync(builtAsar)) {
  try {
    const installedAsar = path.join(installedDir, 'resources/app.asar');
    fs.copyFileSync(builtAsar, installedAsar);
    console.log(`[PatchIcon] Synced latest app.asar to installed folder: ${installedAsar}`);
  } catch (err) {
    console.warn(`[PatchIcon] Could not sync app.asar to installed folder:`, err.message);
  }
}
for (const target of targets) {
  if (fs.existsSync(target)) {
    try {
      console.log(`[PatchIcon] Patching PE icon & metadata on: ${target}`);
      execFileSync(rceditPath, [
        target,
        '--set-icon', iconPath,
        '--set-version-string', 'ProductName', 'Mohivx Messenger',
        '--set-version-string', 'FileDescription', 'Mohivx Messenger',
        '--set-version-string', 'CompanyName', 'Mohivx',
        '--set-version-string', 'LegalCopyright', 'Copyright © 2026 Mohivx',
        '--set-file-version', '1.1.0',
        '--set-product-version', '1.1.0',
      ]);
      console.log(`[PatchIcon] Successfully patched ${path.basename(target)}!`);
    } catch (err) {
      console.warn(`[PatchIcon] Could not patch ${target}:`, err.message);
    }
  }
}
