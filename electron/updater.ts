import { app, shell, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

export interface UpdateInfo {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string;
  releaseUrl: string;
  downloadUrl?: string;
  assetName?: string;
  sizeBytes?: number;
}

export function parseSemver(v: string): number[] {
  const clean = v.replace(/^v/i, '').trim();
  const parts = clean.split('-')[0].split('.');
  return [
    parseInt(parts[0] || '0', 10),
    parseInt(parts[1] || '0', 10),
    parseInt(parts[2] || '0', 10),
  ];
}

export function isNewerVersion(latest: string, current: string): boolean {
  const [lMajor, lMinor, lPatch] = parseSemver(latest);
  const [cMajor, cMinor, cPatch] = parseSemver(current);

  if (lMajor > cMajor) return true;
  if (lMajor < cMajor) return false;
  if (lMinor > cMinor) return true;
  if (lMinor < cMinor) return false;
  return lPatch > cPatch;
}

export class AppUpdater {
  private repo = 'Mohivx/Mohivx-Messenger';
  private cachedUpdate: UpdateInfo | null = null;
  private isDownloading = false;
  private downloadedPath: string | null = null;

  public getCurrentVersion(): string {
    return app.getVersion() || '1.1.0';
  }

  public async checkForUpdates(): Promise<UpdateInfo> {
    const currentVersion = this.getCurrentVersion();
    try {
      const url = `https://api.github.com/repos/${this.repo}/releases/latest`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mohivx-Messenger',
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!res.ok) {
        throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const latestTag = data.tag_name || '';
      const releaseName = data.name || latestTag;
      const releaseNotes = data.body || '';
      const releaseUrl = data.html_url || `https://github.com/${this.repo}/releases`;

      // Find Windows installer asset (.exe)
      const assets: any[] = data.assets || [];
      const setupAsset =
        assets.find((a) => a.name?.endsWith('.exe') && a.name?.includes('Setup')) ||
        assets.find((a) => a.name?.endsWith('.exe')) ||
        null;

      const hasUpdate = isNewerVersion(latestTag, currentVersion);

      const updateInfo: UpdateInfo = {
        updateAvailable: hasUpdate,
        currentVersion,
        latestVersion: latestTag,
        releaseName,
        releaseNotes,
        releaseUrl,
        downloadUrl: setupAsset?.browser_download_url,
        assetName: setupAsset?.name,
        sizeBytes: setupAsset?.size,
      };

      this.cachedUpdate = updateInfo;
      return updateInfo;
    } catch (err: any) {
      console.warn('[Updater] Check failed:', err.message);
      return {
        updateAvailable: false,
        currentVersion,
        latestVersion: currentVersion,
        releaseName: '',
        releaseNotes: '',
        releaseUrl: `https://github.com/${this.repo}/releases`,
      };
    }
  }

  public async downloadUpdate(
    downloadUrl: string,
    onProgress?: (percent: number, received: number, total: number) => void
  ): Promise<string> {
    if (this.isDownloading) {
      throw new Error('A download is already in progress');
    }

    this.isDownloading = true;
    try {
      const tempDir = app.getPath('temp');
      const targetPath = path.join(tempDir, 'Mohivx-Messenger-Update.exe');

      const res = await fetch(downloadUrl, {
        headers: { 'User-Agent': 'Mohivx-Messenger' },
        redirect: 'follow',
      });

      if (!res.ok || !res.body) {
        throw new Error(`Failed to download update: ${res.statusText}`);
      }

      const total = parseInt(res.headers.get('content-length') || '0', 10);
      let received = 0;

      const fileStream = fs.createWriteStream(targetPath);
      const reader = (res.body as any).getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.length;
        fileStream.write(Buffer.from(value));
        if (total > 0 && onProgress) {
          const pct = Math.min(100, Math.round((received / total) * 100));
          onProgress(pct, received, total);
        }
      }

      await new Promise<void>((resolve, reject) => {
        fileStream.end(() => resolve());
        fileStream.on('error', reject);
      });

      this.downloadedPath = targetPath;
      return targetPath;
    } finally {
      this.isDownloading = false;
    }
  }

  public installAndRestart(customPath?: string): void {
    const installerPath = customPath || this.downloadedPath;
    if (!installerPath || !fs.existsSync(installerPath)) {
      throw new Error('Installer file not found on disk');
    }

    // Launch the downloaded installer
    const child = spawn(installerPath, [], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();

    // Gracefully exit Mohivx Messenger so files can be updated
    app.quit();
  }

  public openReleasePage(url?: string): void {
    const target = url || this.cachedUpdate?.releaseUrl || `https://github.com/${this.repo}/releases`;
    shell.openExternal(target);
  }
}
