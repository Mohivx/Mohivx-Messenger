import React, { useState } from 'react';
import { UpdateInfo } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import mohivxIcon from '../assets/icon-64.png';

interface UpdateNotificationProps {
  updateInfo: UpdateInfo;
  onDismiss: () => void;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  updateInfo,
  onDismiss,
}) => {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartUpdate = async () => {
    const api = (window as any).mohivxApi;
    if (!api?.updater) {
      if (updateInfo.releaseUrl) {
        window.open(updateInfo.releaseUrl, '_blank');
      }
      return;
    }

    if (!updateInfo.downloadUrl) {
      // Fallback to release page
      api.updater.openReleasePage(updateInfo.releaseUrl);
      onDismiss();
      return;
    }

    try {
      setDownloading(true);
      setErrorMsg(null);

      const removeProgressListener = api.updater.onUpdateProgress((prog: { percent: number }) => {
        setDownloadProgress(prog.percent);
      });

      const removeDownloadedListener = api.updater.onUpdateDownloaded(() => {
        setDownloading(false);
        setDownloaded(true);
      });

      await api.updater.startUpdate(updateInfo.downloadUrl);

      if (removeProgressListener) removeProgressListener();
      if (removeDownloadedListener) removeDownloadedListener();
    } catch (err: any) {
      console.error('[UpdateNotification] Error during update:', err);
      setDownloading(false);
      setErrorMsg(err.message || 'Download failed');
    }
  };

  const handleInstallAndRestart = () => {
    const api = (window as any).mohivxApi;
    if (api?.updater?.installAndRestart) {
      api.updater.installAndRestart();
    }
  };

  const handleOpenReleaseNotes = () => {
    const api = (window as any).mohivxApi;
    if (api?.updater?.openReleasePage) {
      api.updater.openReleasePage(updateInfo.releaseUrl);
    } else {
      window.open(updateInfo.releaseUrl, '_blank');
    }
  };

  return (
    <div className="fixed top-[16px] left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200 select-none">
      <div className="w-[420px] bg-[#1c1c1e] border border-[#0a84ff]/40 rounded-[16px] shadow-[0_16px_40px_rgba(0,0,0,0.85)] p-[16px] flex flex-col gap-[12px] relative backdrop-blur-xl">
        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="absolute top-[12px] left-[12px] text-white/40 hover:text-white p-[4px] rounded-full transition-colors"
          title={t('close')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px]">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header & Icon */}
        <div className="flex items-start gap-[12px] pr-[16px]">
          <div className="relative shrink-0">
            <img src={mohivxIcon} alt="Mohivx" className="w-[40px] h-[40px] rounded-[12px] object-contain shadow-md" />
            <div className="absolute -top-[3px] -right-[3px] w-[10px] h-[10px] bg-[#0a84ff] rounded-full ring-2 ring-[#1c1c1e]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[8px] mb-[2px]">
              <h3 className="text-[14px] font-semibold text-white">
                {downloaded ? t('updateDownloadedTitle') : t('updateAvailableTitle')}
              </h3>
              <span className="text-[10px] font-bold px-[6px] py-[1px] bg-[#0a84ff]/20 text-[#0a84ff] border border-[#0a84ff]/30 rounded-full">
                {updateInfo.latestVersion}
              </span>
            </div>
            <p className="text-[12px] text-white/70 leading-snug">
              {downloaded
                ? t('updateDownloadedDesc')
                : t('updateAvailableDesc', { version: updateInfo.latestVersion })}
            </p>
          </div>
        </div>

        {/* Progress Bar (during download) */}
        {downloading && (
          <div className="flex flex-col gap-[6px] mt-[2px]">
            <div className="flex items-center justify-between text-[11px] text-white/60">
              <span>{t('updateDownloading', { percent: downloadProgress })}</span>
              <span className="font-mono text-[#0a84ff]">{downloadProgress}%</span>
            </div>
            <div className="w-full h-[6px] bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0a84ff] to-[#60a5fa] transition-all duration-150 rounded-full"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error message if any */}
        {errorMsg && (
          <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-[10px] py-[4px] rounded-[8px]">
            {errorMsg}
          </div>
        )}

        {/* Actions Buttons */}
        <div className="flex items-center justify-between pt-[4px] border-t border-white/5">
          <button
            onClick={handleOpenReleaseNotes}
            className="text-[11px] text-white/50 hover:text-white hover:underline flex items-center gap-[4px] transition-colors"
          >
            <span>{t('releaseNotes')}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[11px] h-[11px]">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>

          <div className="flex items-center gap-[8px]">
            {!downloaded && !downloading && (
              <button
                onClick={onDismiss}
                className="px-[12px] py-[6px] rounded-[10px] text-[12px] font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                {t('updateLater')}
              </button>
            )}

            {downloaded ? (
              <button
                onClick={handleInstallAndRestart}
                className="px-[16px] py-[6px] rounded-[10px] text-[12px] font-semibold bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-md transition-all active:scale-95 flex items-center gap-[6px]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[14px] h-[14px]">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                <span>{t('restartAndInstall')}</span>
              </button>
            ) : (
              <button
                onClick={handleStartUpdate}
                disabled={downloading}
                className="px-[16px] py-[6px] rounded-[10px] text-[12px] font-semibold bg-[#0a84ff] hover:bg-[#0071e3] text-white shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-[6px]"
              >
                {downloading ? (
                  <>
                    <div className="w-[12px] h-[12px] border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{downloadProgress}%</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[14px] h-[14px]">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>{t('updateNow')}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
