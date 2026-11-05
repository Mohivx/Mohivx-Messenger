import React, { useState } from 'react';
import { NetworkId } from '../types';
import { NetworkIcon } from './NetworkIcon';
import { useLanguage } from '../i18n/LanguageContext';
import braveLogo from '../assets/browser-logos/brave.svg';
import chromeLogo from '../assets/browser-logos/chrome.svg';
import edgeLogo from '../assets/browser-logos/edge.svg';
import firefoxLogo from '../assets/browser-logos/firefox.svg';
import arcLogo from '../assets/browser-logos/arc.svg';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectNetwork: (net: NetworkId, sourceBrowser?: string) => void;
  connectedNetworks?: NetworkId[];
}

interface DetectedBrowser {
  id: string;
  name: string;
  profileName: string;
  installed: boolean;
}

const BROWSER_LOGOS: Record<string, string> = {
  brave: braveLogo,
  chrome: chromeLogo,
  edge: edgeLogo,
  firefox: firefoxLogo,
  arc: arcLogo,
};

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onConnectNetwork,
  connectedNetworks = [],
}) => {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [connectingNetwork, setConnectingNetwork] = useState<NetworkId | null>(null);
  const [scannerMode, setScannerMode] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [browsers, setBrowsers] = useState<DetectedBrowser[]>([]);
  const [selectedBrowser, setSelectedBrowser] = useState<string>('brave');
  const [selectedNetworks, setSelectedNetworks] = useState<NetworkId[]>([
    'whatsapp',
    'x',
    'instagram',
    'discord',
  ]);

  if (!isOpen) return null;

  const networks: { id: NetworkId; name: string }[] = [
    { id: 'whatsapp', name: 'WhatsApp' },
    { id: 'x', name: 'X' },
    { id: 'telegram', name: 'Telegram' },
    { id: 'slack', name: 'Slack' },
    { id: 'discord', name: 'Discord' },
    { id: 'facebook', name: 'Facebook' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'linkedin', name: 'LinkedIn' },
    { id: 'googlemessages', name: 'Google Messages' },
    { id: 'signal', name: 'Signal' },
    { id: 'googlechat', name: 'Google Chat' },
    { id: 'line', name: 'LINE' },
    { id: 'matrix', name: 'Matrix' },
    { id: 'viber', name: 'Viber' },
    { id: 'wechat', name: 'WeChat' },
  ];

  const filtered = networks.filter((n) =>
    n.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConnect = (net: NetworkId) => {
    if (net === 'telegram') {
      onConnectNetwork('telegram');
      onClose();
      return;
    }
    setConnectingNetwork(net);
    setTimeout(() => {
      onConnectNetwork(net);
      setConnectingNetwork(null);
      onClose();
    }, 650);
  };

  const handleStartBrowserScan = async () => {
    setScannerMode(true);
    setScanning(true);
    try {
      const api = (window as any).mohivxApi;
      if (api?.detectBrowsers) {
        const res: DetectedBrowser[] = await api.detectBrowsers();
        setBrowsers(res);
        const firstInstalled = res.find((b) => b.installed);
        if (firstInstalled) setSelectedBrowser(firstInstalled.id);
      } else {
        setBrowsers([
          { id: 'brave', name: 'Brave Browser', profileName: 'Default Profile', installed: true },
          { id: 'chrome', name: 'Google Chrome', profileName: 'Default Profile', installed: true },
          { id: 'edge', name: 'Microsoft Edge', profileName: 'Personal Profile', installed: true },
        ]);
      }
    } catch {
      setBrowsers([
        { id: 'brave', name: 'Brave Browser', profileName: 'Default Profile', installed: true },
        { id: 'chrome', name: 'Google Chrome', profileName: 'Default Profile', installed: true },
        { id: 'edge', name: 'Microsoft Edge', profileName: 'Personal Profile', installed: true },
      ]);
    } finally {
      setTimeout(() => setScanning(false), 500);
    }
  };

  const toggleSelectedNetwork = (netId: NetworkId) => {
    setSelectedNetworks((prev) =>
      prev.includes(netId) ? prev.filter((id) => id !== netId) : [...prev, netId]
    );
  };

  const handleImportSelected = () => {
    const browserObj = browsers.find((b) => b.id === selectedBrowser);
    const browserLabel = browserObj ? browserObj.name : 'Brave Browser';
    selectedNetworks.forEach((netId) => {
      onConnectNetwork(netId, browserLabel);
    });
    setScannerMode(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-[400px] h-[505px] max-h-[90vh] bg-[#1c1c1e] border border-white/10 rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-[16px] py-[14px] flex items-center justify-between border-b border-white/10">
          <h2 className="text-[14px] font-semibold text-white">
            {scannerMode ? t('detectedBrowsersTitle') : t('addAccountTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-[4px] rounded-full"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[16px] h-[16px]">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {!scannerMode ? (
          <>
            {/* Search */}
            <div className="p-[12px] border-b border-white/5">
              <div className="h-[38px] px-[12px] bg-[#141415] rounded-full flex items-center gap-[8px] border border-white/10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[16px] h-[16px] text-white/40 shrink-0">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('searchServices')}
                  className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder-white/40"
                />
              </div>
            </div>

            {/* Network Grid */}
            <div className="p-[16px] overflow-y-auto flex-1">
              <div className="grid grid-cols-4 gap-[12px]">
                {filtered.map((net) => {
                  const isConnected = connectedNetworks.includes(net.id);
                  return (
                    <button
                      key={net.id}
                      onClick={() => handleConnect(net.id)}
                      disabled={connectingNetwork !== null}
                      className="flex flex-col items-center justify-center p-[10px] rounded-[12px] bg-white/[0.03] hover:bg-white/10 hover:scale-105 active:scale-95 transition-all text-center group disabled:opacity-50 relative"
                    >
                      <div className="relative mb-[6px]">
                        <NetworkIcon network={net.id} size={36} />
                        {isConnected && (
                          <div className="absolute -top-[3px] -right-[3px] w-[14px] h-[14px] rounded-full bg-green-500 border-2 border-[#1c1c1e] flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" className="w-[8px] h-[8px]">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                        {connectingNetwork === net.id && (
                          <div className="absolute inset-0 bg-black/50 rounded-[35%] flex items-center justify-center">
                            <div className="w-[16px] h-[16px] border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-white/90 group-hover:text-white leading-tight">
                        {net.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Authentic Beeper Import Browser Logins Card */}
              <div className="mt-[18px] p-[14px] bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 rounded-[14px]">
                <div className="flex items-center gap-[8px] mb-[6px]">
                  <div className="flex -space-x-1.5 rtl:space-x-reverse items-center">
                    <img src={braveLogo} alt="Brave" className="w-[18px] h-[18px] rounded-full ring-2 ring-[#1c1c1e] bg-[#1c1c1e]" />
                    <img src={chromeLogo} alt="Chrome" className="w-[18px] h-[18px] rounded-full ring-2 ring-[#1c1c1e] bg-[#1c1c1e]" />
                    <img src={edgeLogo} alt="Edge" className="w-[18px] h-[18px] rounded-full ring-2 ring-[#1c1c1e] bg-[#1c1c1e]" />
                    <img src={firefoxLogo} alt="Firefox" className="w-[18px] h-[18px] rounded-full ring-2 ring-[#1c1c1e] bg-[#1c1c1e]" />
                    <img src={arcLogo} alt="Arc" className="w-[18px] h-[18px] rounded-full ring-2 ring-[#1c1c1e] bg-[#1c1c1e]" />
                  </div>
                  <h3 className="text-[12.5px] font-semibold text-white">{t('importBrowserSessions')}</h3>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed mb-[10px]">
                  {t('importBrowserDesc')}
                </p>
                <button
                  onClick={handleStartBrowserScan}
                  className="w-full py-[8px] bg-gradient-to-r from-[#6953F2] to-[#0C52F9] hover:from-[#7b67ff] hover:to-[#2264ff] text-white rounded-full text-[12px] font-semibold shadow-md transition-all flex items-center justify-center gap-[6px]"
                >
                  <img src={braveLogo} alt="Brave" className="w-[14px] h-[14px]" />
                  <span>{t('scanActiveSessions')}</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Browser Session Scanner View */
          <div className="p-[16px] overflow-y-auto flex-1 flex flex-col justify-between space-y-[12px]">
            {scanning ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-[40px] space-y-[12px]">
                <div className="w-[36px] h-[36px] border-2 border-[#0a84ff] border-t-transparent rounded-full animate-spin" />
                <p className="text-[13px] text-white/80 font-medium">{t('scanningBrowsers')}</p>
              </div>
            ) : (
              <>
                <div className="space-y-[10px]">
                  {/* Detected Browsers */}
                  <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                    {language === 'ar' ? 'المتصفحات المثبتة على جهازك' : 'Installed Browsers'}
                  </div>
                  <div className="space-y-[6px]">
                    {browsers.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBrowser(b.id)}
                        className={`w-full p-[10px] rounded-[10px] border flex items-center justify-between transition-all ${
                          selectedBrowser === b.id
                            ? 'bg-[#0a84ff]/15 border-[#0a84ff] text-white'
                            : 'bg-white/[0.03] border-white/5 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-[10px]">
                          <img
                            src={BROWSER_LOGOS[b.id] || braveLogo}
                            alt={b.name}
                            className="w-[24px] h-[24px] object-contain"
                          />
                          <div className="text-start">
                            <div className="text-[13px] font-semibold text-white flex items-center gap-[6px]">
                              <span>{b.name}</span>
                              {b.installed && (
                                <span className="text-[10px] px-[6px] py-[0.5px] rounded-full bg-green-500/20 text-green-400 font-medium">
                                  {language === 'ar' ? 'مثبّت' : 'Detected'}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-white/50">{b.profileName}</div>
                          </div>
                        </div>
                        <div
                          className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center ${
                            selectedBrowser === b.id ? 'border-[#0a84ff] bg-[#0a84ff]' : 'border-white/30'
                          }`}
                        >
                          {selectedBrowser === b.id && <div className="w-[6px] h-[6px] rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Select Sessions to Connect */}
                  <div className="pt-[6px]">
                    <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-[6px]">
                      {language === 'ar' ? 'اختر الحسابات لربطها من المتصفح' : 'Select Accounts to Link'}
                    </div>
                    <div className="grid grid-cols-3 gap-[6px]">
                      {(['whatsapp', 'x', 'instagram', 'discord', 'slack', 'facebook', 'linkedin', 'googlemessages', 'signal'] as NetworkId[]).map(
                        (netId) => {
                          const selected = selectedNetworks.includes(netId);
                          const netObj = networks.find((n) => n.id === netId);
                          return (
                            <button
                              key={netId}
                              onClick={() => toggleSelectedNetwork(netId)}
                              className={`p-[7px] rounded-[9px] border flex items-center gap-[6px] text-start transition-all ${
                                selected
                                  ? 'bg-[#2561fb]/20 border-[#2561fb] text-white'
                                  : 'bg-white/[0.03] border-white/5 text-white/60 hover:bg-white/10'
                              }`}
                            >
                              <NetworkIcon network={netId} size={20} />
                              <span className="text-[11px] font-medium truncate">{netObj?.name || netId}</span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-[6px] pt-[8px]">
                  <button
                    onClick={handleImportSelected}
                    disabled={selectedNetworks.length === 0}
                    className="w-full py-[9px] bg-[#0a84ff] hover:bg-[#0071e3] disabled:opacity-40 text-white rounded-[10px] text-[12.5px] font-semibold shadow-md transition-all"
                  >
                    {t('importSelectedAccounts')} ({selectedNetworks.length})
                  </button>
                  <button
                    onClick={() => setScannerMode(false)}
                    className="w-full py-[6px] text-[12px] text-white/60 hover:text-white transition-colors"
                  >
                    {t('backToNetworks')}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-[16px] py-[10px] bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
          <span>{t('secureConnectorEngine')}</span>
          <span className="text-[#2561fb] hover:underline cursor-pointer">{t('learnMore')}</span>
        </div>
      </div>
    </div>
  );
};
