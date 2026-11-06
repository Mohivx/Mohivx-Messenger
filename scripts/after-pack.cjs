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

module.exports = async function(context) {
  if (context.electronPlatformName !== 'win32') {
    return;
  }

  const rceditPath = findRcedit();
  if (!rceditPath) {
    console.warn('[AfterPack] rcedit-x64.exe not found; skipping icon patch.');
    return;
  }

  const iconPath = path.resolve(__dirname, '../assets/icon.ico');
  if (!fs.existsSync(iconPath)) {
    console.warn('[AfterPack] Icon file missing at:', iconPath);
    return;
  }

  const exeName = (context.packager && context.packager.appInfo && context.packager.appInfo.productFilename)
    ? `${context.packager.appInfo.productFilename}.exe`
    : 'Mohivx Messenger.exe';

  const exePath = path.join(context.appOutDir, exeName);
  if (fs.existsSync(exePath)) {
    try {
      console.log(`[AfterPack] Patching icon & metadata on: ${exePath}`);
      execFileSync(rceditPath, [
        exePath,
        '--set-icon', iconPath,
        '--set-version-string', 'ProductName', 'Mohivx Messenger',
        '--set-version-string', 'FileDescription', 'Mohivx Messenger',
        '--set-version-string', 'CompanyName', 'Mohivx',
        '--set-version-string', 'LegalCopyright', 'Copyright © 2026 Mohivx',
        '--set-file-version', '1.1.0',
        '--set-product-version', '1.1.0',
      ]);
      console.log(`[AfterPack] Successfully patched ${exeName} before installer creation!`);
    } catch (err) {
      console.warn(`[AfterPack] Failed to patch ${exePath}:`, err.message);
    }
  }
};
