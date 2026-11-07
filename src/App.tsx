import React, { useState, useEffect, useCallback } from 'react';
import {
  ViewFilter,
  NetworkId,
  Thread,
  Message,
  Account,
  NetworkInfo,
  UpdateInfo,
  AppSettings,
  DEFAULT_APP_SETTINGS,
} from './types';
import { INITIAL_NETWORKS, INITIAL_ACCOUNTS, INITIAL_THREADS, INITIAL_MESSAGES } from './data/mockData';
import { LeftRail } from './components/LeftRail';
import { ThreadList } from './components/ThreadList';
import { ConversationView } from './components/ConversationView';
import { CommandPalette } from './components/CommandPalette';
import { NewChatModal } from './components/NewChatModal';
import { SettingsModal } from './components/SettingsModal';
import { AddAccountModal } from './components/AddAccountModal';
import { TelegramAuthModal } from './components/TelegramAuthModal';
import { UpdateNotification } from './components/UpdateNotification';
import { useLanguage } from './i18n/LanguageContext';
import mohivxIcon64 from './assets/icon-64.png';
import mohivxLogo128 from './assets/icon-128.png';

export const App: React.FC = () => {
  const { dir, setDirectionMode, setLanguage } = useLanguage();
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [currentFilter, setCurrentFilter] = useState<ViewFilter>('inbox');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState<NetworkId | null>(null);

  const [networks, setNetworks] = useState<NetworkInfo[]>(INITIAL_NETWORKS);
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem('mohivx_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_ACCOUNTS;
  });
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>('thread-1');
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);

  const [searchOpen, setSearchOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [telegramAuthOpen, setTelegramAuthOpen] = useState(false);
  const [isTelegramConnected, setIsTelegramConnected] = useState(false);
  const [activeUpdate, setActiveUpdate] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('mohivx_accounts', JSON.stringify(accounts));
    } catch {}
  }, [accounts]);

  // Synchronize ALL settings from Electron / Standalone Settings Window
  useEffect(() => {
    const api = (window as any).mohivxApi;
    if (!api) return;

    const applySettings = (s: Partial<AppSettings>) => {
      if (!s) return;
      setAppSettings((prev) => ({ ...prev, ...s }));
      if (s.directionMode) setDirectionMode(s.directionMode);
      if (s.language === 'ar' || s.language === 'en') {
        setLanguage(s.language);
      }
      if (s.zoomLevel) {
        document.body.style.zoom = `${s.zoomLevel}%`;
      }
    };

    if (api.getAppSettings) {
      api
        .getAppSettings()
        .then((s: any) => applySettings(s))
        .catch(() => {});
    }

    const cleanups: (() => void)[] = [];

    if (api.onAppSettingsUpdated) {
      const c1 = api.onAppSettingsUpdated((s: any) => applySettings(s));
      if (typeof c1 === 'function') cleanups.push(c1);
    }

    if (api.onArchiveBulkChats) {
      const c2 = api.onArchiveBulkChats((payload: { filter: 'all' | 'unread'; days: number }) => {
        setThreads((prev) =>
          prev.map((t) => {
            if (payload.filter === 'unread' && t.unreadCount === 0) return t;
            return {
              ...t,
              isArchived: true,
              unreadCount: appSettings.markReadOnArchive ? 0 : t.unreadCount,
            };
          })
        );
      });
      if (typeof c2 === 'function') cleanups.push(c2);
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [setDirectionMode, setLanguage, appSettings.markReadOnArchive]);

  // Sync Telegram threads and check connection status
  const checkTelegramStatus = useCallback(async () => {
    try {
      const api = (window as any).mohivxApi;
      if (!api?.telegram) return;

      const res = await api.telegram.getStatus();
      if (res?.connected) {
        setIsTelegramConnected(true);
        setNetworks((prev) =>
          prev.map((n) => (n.id === 'telegram' ? { ...n, connected: true, status: 'online' } : n))
        );

        setAccounts((prev) => {
          if (prev.some((a) => a.networkId === 'telegram')) return prev;
          return [
            ...prev,
            {
              id: 'acc-telegram-mtproto',
              networkId: 'telegram',
              username: 'Connected MTProto',
              displayName: 'Telegram Account',
              avatarUrl: mohivxLogo128,
              connectedAt: new Date().toISOString().split('T')[0],
              status: 'active',
            },
          ];
        });

        const realThreads = await api.telegram.syncThreads(40);
        if (realThreads && realThreads.length > 0) {
          setThreads((prev) => {
            const nonTg = prev.filter((t) => t.networkId !== 'telegram');
            return [...realThreads, ...nonTg];
          });
          if (realThreads[0]?.id) {
            setSelectedThreadId(realThreads[0].id);
            const initialMsgs = await api.telegram.getMessages(realThreads[0].id, 30);
            if (initialMsgs && initialMsgs.length > 0) {
              setMessagesMap((prev) => ({ ...prev, [realThreads[0].id]: initialMsgs }));
            }
          }
        }
      }
    } catch (err) {
      console.warn('[App] Error during Telegram status check:', err);
    }
  }, []);

  useEffect(() => {
    checkTelegramStatus();
  }, [checkTelegramStatus]);

  // In-App Update Listener & Startup Check
  useEffect(() => {
    const api = (window as any).mohivxApi;
    if (!api?.updater) return;

    const removeListener = api.updater.onUpdateAvailable((info: UpdateInfo) => {
      if (info && info.updateAvailable) {
        setActiveUpdate(info);
      }
    });

    api.updater
      .checkForUpdates()
      .then((info: UpdateInfo) => {
        if (info && info.updateAvailable) {
          setActiveUpdate(info);
        }
      })
      .catch(() => {});

    return () => {
      if (typeof removeListener === 'function') removeListener();
    };
  }, []);

  // Real-time message listener from Electron IPC
  useEffect(() => {
    const api = (window as any).mohivxApi;
    if (!api?.onIncomingMessage) return;

    const cleanup = api.onIncomingMessage((msg: any) => {
      if (!msg?.threadId) return;

      if (appSettings.soundEnabled) {
        try {
          const audio = new Audio('./sounds/receive.wav');
          audio.volume = Math.min(1, Math.max(0, (appSettings.soundVolume ?? 80) / 100));
          audio.play().catch(() => {});
        } catch {}
      }

      if (appSettings.autoCopyOtp && typeof msg.content === 'string') {
        const otpMatch = msg.content.match(/\b(\d{4,8})\b/);
        if (otpMatch && /code|otp|verification|login|رمز|كود/i.test(msg.content)) {
          navigator.clipboard?.writeText(otpMatch[1]);
        }
      }

      setMessagesMap((prev) => {
        const existing = prev[msg.threadId] || [];
        if (existing.some((m) => m.id === msg.id)) return prev;
        return {
          ...prev,
          [msg.threadId]: [...existing, msg],
        };
      });

      setThreads((prev) => {
        const found = prev.some((t) => t.id === msg.threadId);
        if (found) {
          return prev.map((t) =>
            t.id === msg.threadId
              ? {
                  ...t,
                  lastMessageSnippet: msg.content || '[Media]',
                  lastMessageSender: msg.senderName || '',
                  lastMessageTime: msg.timestamp || '',
                  unreadCount:
                    selectedThreadId === msg.threadId && !appSettings.incognitoMode
                      ? 0
                      : t.unreadCount + 1,
                }
              : t
          );
        } else {
          const newThread: Thread = {
            id: msg.threadId,
            networkId: msg.networkId || 'telegram',
            title: msg.senderName || 'New Conversation',
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              msg.senderName || 'TG'
            )}&background=2EA4DB&color=fff`,
            isGroup: false,
            lastMessageSnippet: msg.content || '[Media]',
            lastMessageSender: msg.senderName || '',
            lastMessageTime: msg.timestamp || '',
            unreadCount: 1,
          };
          return [newThread, ...prev];
        }
      });
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [selectedThreadId, appSettings.soundEnabled, appSettings.soundVolume, appSettings.incognitoMode, appSettings.autoCopyOtp]);

  // Network auth success listener from external login window
  useEffect(() => {
    const api = (window as any).mohivxApi;
    if (!api?.onNetworkAuthSuccess) return;

    const cleanup = api.onNetworkAuthSuccess((accData: any) => {
      setNetworks((prev) =>
        prev.map((n) => (n.id === accData.networkId ? { ...n, connected: true, status: 'online' } : n))
      );
      setAccounts((prev) => {
        const filtered = prev.filter((a) => a.networkId !== accData.networkId);
        const next = [...filtered, accData];
        try {
          localStorage.setItem('mohivx_accounts', JSON.stringify(next));
        } catch {}
        return next;
      });
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  const handleOpenSettings = (tab = 'general') => {
    const api = (window as any).mohivxApi;
    if (api?.openSettingsWindow) {
      api.openSettingsWindow(tab);
    } else {
      setSettingsOpen(true);
    }
  };

  // Toggle Archive on a Thread (respecting markReadOnArchive and afterArchive settings)
  const handleToggleArchiveThread = useCallback(
    (threadId: string) => {
      setThreads((prev) => {
        const idx = prev.findIndex((t) => t.id === threadId);
        if (idx === -1) return prev;
        const target = prev[idx];
        const nextArchived = !target.isArchived;

        const updated = prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                isArchived: nextArchived,
                unreadCount:
                  nextArchived && appSettings.markReadOnArchive ? 0 : t.unreadCount,
              }
            : t
        );

        if (nextArchived && selectedThreadId === threadId) {
          const visible = prev.filter((t) => !t.isArchived && t.id !== threadId);
          if (appSettings.afterArchive === 'close' || visible.length === 0) {
            setSelectedThreadId(null);
          } else if (appSettings.afterArchive === 'previous') {
            setSelectedThreadId(visible[Math.max(0, idx - 1)]?.id || visible[0].id);
          } else {
            setSelectedThreadId(visible[Math.min(visible.length - 1, idx)]?.id || visible[0].id);
          }
        }
        return updated;
      });
    },
    [appSettings.markReadOnArchive, appSettings.afterArchive, selectedThreadId]
  );

  const handleTogglePinThread = useCallback((threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, isPinned: !t.isPinned } : t))
    );
  }, []);

  const handleToggleReadThread = useCallback(
    (threadId: string) => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, unreadCount: t.unreadCount > 0 ? 0 : 1 } : t
        )
      );
      if (appSettings.afterMarkReadUnread === 'next' && selectedThreadId === threadId) {
        const visible = threads.filter((t) => !t.isArchived && t.id !== threadId);
        if (visible.length > 0) {
          setSelectedThreadId(visible[0].id);
        }
      }
    },
    [appSettings.afterMarkReadUnread, selectedThreadId, threads]
  );

  // Global hotkeys (Ctrl+K, Ctrl+N, Ctrl+,, Ctrl+E, Ctrl+Shift+U)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setNewChatOpen(true);
      } else if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        handleOpenSettings('general');
      } else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (selectedThreadId) handleToggleArchiveThread(selectedThreadId);
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        if (selectedThreadId) handleToggleReadThread(selectedThreadId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedThreadId, handleToggleArchiveThread, handleToggleReadThread]);

  const handleSelectThread = async (threadId: string) => {
    setSelectedThreadId(threadId);

    // Clear unread count ONLY if incognitoMode is OFF
    if (!appSettings.incognitoMode) {
      setThreads((prev) =>
        prev.map((th) => (th.id === threadId ? { ...th, unreadCount: 0 } : th))
      );
    }

    const t = threads.find((th) => th.id === threadId);
    if (t?.networkId === 'telegram' && isTelegramConnected) {
      const existing = messagesMap[threadId];
      if (!existing || existing.length === 0) {
        try {
          const api = (window as any).mohivxApi;
          const history = await api?.telegram?.getMessages(threadId, 30);
          if (history && history.length > 0) {
            setMessagesMap((prev) => ({ ...prev, [threadId]: history }));
          }
        } catch (e) {
          console.warn('[App] Could not fetch thread history:', e);
        }
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedThreadId) return;

    const currentThread = threads.find((t) => t.id === selectedThreadId);

    if (currentThread?.networkId === 'telegram' && isTelegramConnected) {
      try {
        const api = (window as any).mohivxApi;
        const sentMsg = await api?.telegram?.sendMessage(selectedThreadId, content);
        if (sentMsg) {
          setMessagesMap((prev) => ({
            ...prev,
            [selectedThreadId]: [...(prev[selectedThreadId] || []), sentMsg],
          }));

          setThreads((prev) =>
            prev.map((t) =>
              t.id === selectedThreadId
                ? {
                    ...t,
                    lastMessageSnippet: content,
                    lastMessageSender: 'You',
                    lastMessageTime: sentMsg.timestamp,
                    unreadCount: 0,
                  }
                : t
            )
          );
          return;
        }
      } catch (err: any) {
        console.error('[App] Failed to send Telegram message:', err);
        alert(`Failed to send Telegram message: ${err?.message || 'Unknown error'}`);
        return;
      }
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      threadId: selectedThreadId,
      senderId: 'me',
      senderName: appSettings.displayName || 'Mohivx',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOutgoing: true,
      networkId: currentThread?.networkId || 'telegram',
      status: 'sent',
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedThreadId]: [...(prev[selectedThreadId] || []), newMessage],
    }));

    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedThreadId
          ? {
              ...t,
              lastMessageSnippet: content,
              lastMessageSender: 'You',
              lastMessageTime: newMessage.timestamp,
              unreadCount: 0,
            }
          : t
      )
    );
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    if (!selectedThreadId) return;
    setMessagesMap((prev) => {
      const threadMsgs = prev[selectedThreadId] || [];
      return {
        ...prev,
        [selectedThreadId]: threadMsgs.map((m) => {
          if (m.id !== messageId) return m;
          const reactions = m.reactions ? [...m.reactions] : [];
          const existing = reactions.find((r) => r.emoji === emoji);
          if (existing) {
            existing.count += 1;
            existing.meReacted = true;
          } else {
            reactions.push({ emoji, count: 1, meReacted: true });
          }
          return { ...m, reactions };
        }),
      };
    });
  };

  const handleCreateChat = (name: string, network: NetworkId) => {
    const newId = `thread-${Date.now()}`;
    const newThread: Thread = {
      id: newId,
      networkId: network,
      title: name,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces`,
      isGroup: false,
      lastMessageSnippet: 'Active conversation',
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadCount: 0,
    };
    setThreads((prev) => [newThread, ...prev]);
    setSelectedThreadId(newId);
    setMessagesMap((prev) => ({
      ...prev,
      [newId]: [
        {
          id: `m-welcome-${newId}`,
          threadId: newId,
          senderId: 'contact',
          senderName: name,
          content: 'Welcome to Mohivx Messenger!',
          timestamp: newThread.lastMessageTime,
          isOutgoing: false,
          networkId: network,
        },
      ],
    }));
  };

  const handleConnectNetwork = (network: NetworkId, sourceBrowser?: string) => {
    if (network === 'telegram' && !sourceBrowser) {
      setTelegramAuthOpen(true);
      return;
    }

    const networkLabels: Record<NetworkId, string> = {
      whatsapp: 'WhatsApp',
      x: 'X (Twitter)',
      telegram: 'Telegram',
      slack: 'Slack',
      discord: 'Discord',
      facebook: 'Facebook Messenger',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      googlemessages: 'Google Messages',
      signal: 'Signal',
      googlechat: 'Google Chat',
      line: 'LINE',
      matrix: 'Matrix',
      viber: 'Viber',
      wechat: 'WeChat',
    };

    const label = networkLabels[network] || network;

    setNetworks((prev) => {
      const found = prev.some((n) => n.id === network);
      if (found) {
        return prev.map((n) => (n.id === network ? { ...n, connected: true, status: 'online' } : n));
      }
      return [
        ...prev,
        {
          id: network,
          name: label,
          color: '#2EA4DB',
          iconBg: '#2EA4DB',
          category: 'chat',
          connected: true,
          status: 'online',
        },
      ];
    });

    setAccounts((prev) => {
      if (prev.some((a) => a.networkId === network)) return prev;
      return [
        ...prev,
        {
          id: `acc-${network}-${Date.now()}`,
          networkId: network,
          username: sourceBrowser ? `@mohivx • ${sourceBrowser}` : '@mohivx • Connected Bridge',
          displayName: `${label} Account`,
          avatarUrl: mohivxLogo128,
          connectedAt: new Date().toISOString().split('T')[0],
          status: 'active',
        },
      ];
    });
    setActiveNetwork(network);
  };

  const handleTelegramAuthSuccess = async () => {
    await checkTelegramStatus();
  };

  const handleDisconnectAccount = async (account: Account) => {
    if (account.networkId === 'telegram' && isTelegramConnected) {
      try {
        const api = (window as any).mohivxApi;
        await api?.telegram?.disconnect();
        setIsTelegramConnected(false);
      } catch (err) {
        console.error('Error disconnecting Telegram account:', err);
      }
    }
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === account.networkId
          ? { ...n, connected: false, status: 'disconnected', unreadCount: 0 }
          : n
      )
    );
    setAccounts((prev) => prev.filter((a) => a.id !== account.id));
    if (activeNetwork === account.networkId) {
      setActiveNetwork(null);
    }
  };

  const selectedThread = threads.find((t) => t.id === selectedThreadId) || null;
  const currentMessages = selectedThreadId ? messagesMap[selectedThreadId] || [] : [];
  const totalUnread = threads.filter((t) => !t.isArchived).reduce((acc, t) => acc + (t.unreadCount > 0 ? 1 : 0), 0);
  const connectedNetworkIds = accounts.map((a) => a.networkId);

  return (
    <div
      className={`flex flex-col w-screen h-screen ${
        appSettings.theme === 'light' ? 'bg-[#f2f2f7] text-[#1c1c1e]' : 'bg-[#202228] text-[#f5f5f7]'
      } overflow-hidden select-none font-sans`}
    >
      {/* Top Native-Style Beeper Window Titlebar (32px, always LTR so controls stay on right) */}
      <header
        dir="ltr"
        className="h-[32px] bg-[#202228] flex items-center justify-between pl-[12px] pr-[2px] shrink-0 titlebar-drag-region"
      >
        <div className="flex items-center gap-[8px]">
          <img src={mohivxIcon64} alt="Mohivx" className="w-[15px] h-[15px] rounded-[4px]" />
          <span className="text-[12px] font-medium text-white/85">Beeper</span>
        </div>

        <div className="flex items-center titlebar-no-drag">
          <button
            onClick={() => (window as any).mohivxApi?.minimizeWindow?.()}
            className="w-[40px] h-[30px] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors text-[12px]"
            title="Minimize"
          >
            ─
          </button>
          <button
            onClick={() => (window as any).mohivxApi?.maximizeWindow?.()}
            className="w-[40px] h-[30px] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors text-[11px]"
            title="Maximize"
          >
            ▢
          </button>
          <button
            onClick={() => (window as any).mohivxApi?.closeWindow?.()}
            className="w-[44px] h-[30px] flex items-center justify-center text-white/60 hover:text-white hover:bg-[#e81123] transition-colors text-[13px]"
            title="Close"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Main 3-Pane Beeper Workspace */}
      <div dir={dir} className="flex-1 flex overflow-hidden">
        {/* 1. Left Rail (56px, toggleable via Appearance -> Show sidebar) */}
        {appSettings.showSidebar && (
          <LeftRail
            currentFilter={currentFilter}
            onSelectFilter={setCurrentFilter}
            unreadCount={totalUnread}
            showUnreads={appSettings.showUnreads}
            colorizeNetworkIcons={appSettings.colorizeNetworkIcons}
            onOpenSettings={() => handleOpenSettings('general')}
            onOpenAddAccount={() => setAddAccountOpen(true)}
            activeNetwork={activeNetwork}
            connectedNetworks={connectedNetworkIds}
            onSelectNetwork={(net) => {
              setActiveNetwork(net);
              if (net === 'telegram' && !isTelegramConnected && !connectedNetworkIds.includes('telegram')) {
                setTelegramAuthOpen(true);
              }
            }}
          />
        )}

        {/* 2. Thread List (260px) */}
        <ThreadList
          threads={threads}
          selectedThreadId={selectedThreadId}
          onSelectThread={handleSelectThread}
          onToggleArchiveThread={handleToggleArchiveThread}
          onTogglePinThread={handleTogglePinThread}
          onToggleReadThread={handleToggleReadThread}
          currentFilter={currentFilter}
          onSelectFilter={setCurrentFilter}
          filterUnreadOnly={filterUnreadOnly}
          onToggleFilterUnread={() => setFilterUnreadOnly(!filterUnreadOnly)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNewChat={() => setNewChatOpen(true)}
          activeNetwork={activeNetwork}
          settings={appSettings}
        />

        {/* 3. Conversation Pane */}
        <ConversationView
          thread={selectedThread}
          messages={currentMessages}
          onSendMessage={handleSendMessage}
          onAddReaction={handleAddReaction}
          onToggleArchive={handleToggleArchiveThread}
          onTogglePin={handleTogglePinThread}
          activeNetwork={activeNetwork}
          settings={appSettings}
        />
      </div>

      {/* Modals & Overlays */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        threads={threads}
        onSelectThread={handleSelectThread}
      />

      <NewChatModal
        isOpen={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onCreateChat={handleCreateChat}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        accounts={accounts}
        onOpenAddAccount={() => {
          setSettingsOpen(false);
          setAddAccountOpen(true);
        }}
        onDisconnectAccount={handleDisconnectAccount}
      />

      <AddAccountModal
        isOpen={addAccountOpen}
        onClose={() => setAddAccountOpen(false)}
        onConnectNetwork={handleConnectNetwork}
        connectedNetworks={connectedNetworkIds}
      />

      <TelegramAuthModal
        isOpen={telegramAuthOpen}
        onClose={() => setTelegramAuthOpen(false)}
        onSuccess={handleTelegramAuthSuccess}
      />

      {activeUpdate && (
        <UpdateNotification updateInfo={activeUpdate} onDismiss={() => setActiveUpdate(null)} />
      )}
    </div>
  );
};
