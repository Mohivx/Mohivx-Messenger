import React, { useState } from 'react';
import { NetworkId } from '../types';
import { NetworkIcon } from './NetworkIcon';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectNetwork: (net: NetworkId) => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onConnectNetwork,
}) => {
  const [search, setSearch] = useState('');
  const [connectingNetwork, setConnectingNetwork] = useState<NetworkId | null>(null);

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
    setConnectingNetwork(net);
    setTimeout(() => {
      onConnectNetwork(net);
      setConnectingNetwork(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 select-none animate-in fade-in duration-150">
      <div
        className="w-[420px] max-h-[85vh] bg-[#141415] border border-white/10 rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-[16px] py-[14px] flex items-center justify-between border-b border-white/10">
          <h2 className="text-[14px] font-semibold text-white">Add an Account</h2>
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

        {/* Search */}
        <div className="p-[12px] border-b border-white/5">
          <div className="h-[38px] px-[12px] bg-[#1c1c1d] rounded-full flex items-center gap-[8px] border border-white/5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[16px] h-[16px] text-white/40">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder-white/40"
            />
          </div>
        </div>

        {/* Network Grid */}
        <div className="p-[16px] overflow-y-auto">
          <div className="grid grid-cols-4 gap-[12px]">
            {filtered.map((net) => (
              <button
                key={net.id}
                onClick={() => handleConnect(net.id)}
                disabled={connectingNetwork !== null}
                className="flex flex-col items-center justify-center p-[10px] rounded-[12px] bg-white/[0.03] hover:bg-white/10 hover:scale-105 active:scale-95 transition-all text-center group disabled:opacity-50"
              >
                <div className="relative mb-[6px]">
                  <NetworkIcon network={net.id} size={36} />
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
            ))}
          </div>

          {/* Import Logins Card */}
          <div className="mt-[20px] p-[14px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-[14px]">
            <div className="flex items-center gap-[8px] mb-[6px]">
              <div className="flex -space-x-1">
                <span className="w-[16px] h-[16px] rounded-full bg-blue-500 inline-block ring-2 ring-black" />
                <span className="w-[16px] h-[16px] rounded-full bg-green-500 inline-block ring-2 ring-black" />
                <span className="w-[16px] h-[16px] rounded-full bg-red-500 inline-block ring-2 ring-black" />
              </div>
              <h3 className="text-[13px] font-semibold text-white">Import Browser Sessions</h3>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed mb-[10px]">
              Mohivx Messenger can securely connect via your active browser sessions with full local isolation.
            </p>
            <button
              onClick={() => handleConnect('telegram')}
              className="w-full py-[8px] bg-gradient-to-r from-[#6953F2] to-[#0C52F9] hover:from-[#7b67ff] hover:to-[#2264ff] text-white rounded-full text-[12px] font-semibold shadow-md transition-all"
            >
              Scan Active Sessions
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-[16px] py-[10px] bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
          <span>Mohivx Secure Connector Engine</span>
          <span className="text-[#2561fb] hover:underline cursor-pointer">Learn more</span>
        </div>
      </div>
    </div>
  );
};
