import React, { useState, useEffect, useCallback } from 'react';
import { ViewFilter, NetworkId, Thread, Message, Account, NetworkInfo, UpdateInfo } from './types';
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

export const App: React.FC = () => {
  const [currentFilter, setCurrentFilter] = useState<ViewFilter>('inbox');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState<NetworkId | null>(null);

  const [networks, setNetworks] = useState<NetworkInfo[]>(INITIAL_NETWORKS);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
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
              avatarUrl: './assets/icon-128.png',
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

    // Listen for background update detection
    const removeListener = api.updater.onUpdateAvailable((info: UpdateInfo) => {
      if (info && info.updateAvailable) {
        setActiveUpdate(info);
      }
    });

    // Check directly on client start as well
    api.updater.checkForUpdates().then((info: UpdateInfo) => {
      if (info && info.updateAvailable) {
        setActiveUpdate(info);
      }
    }).catch(() => {});

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

      try {
        const audio = new Audio('./sounds/receive.wav');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {}

      setMessagesMap((prev) => {
        const existing = prev[msg.threadId] || [];
        // Avoid duplicate message IDs
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
                  unreadCount: selectedThreadId === msg.threadId ? 0 : t.unreadCount + 1,
                }
              : t
          );
        } else {
          // New thread arrived
          const newThread: Thread = {
            id: msg.threadId,
            networkId: msg.networkId || 'telegram',
            title: msg.senderName || 'New Conversation',
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName || 'TG')}&background=2EA4DB&color=fff`,
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
  }, [selectedThreadId]);

  // Global hotkeys
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
        setSettingsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectThread = async (threadId: string) => {
    setSelectedThreadId(threadId);

    // If it's a telegram thread and connected, fetch real history if empty
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

    // If connected to Telegram and this is a Telegram thread, send through MTProto
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
                    lastMessageSender: 'أنت',
                    lastMessageTime: sentMsg.timestamp,
                  }
                : t
            )
          );
          return;
        }
      } catch (err: any) {
        console.error('[App] Failed to send Telegram message:', err);
        alert(`فشل إرسال الرسالة عبر Telegram: ${err?.message || 'خطأ غير معروف'}`);
        return;
      }
    }

    // Fallback local message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      threadId: selectedThreadId,
      senderId: 'me',
      senderName: 'Mohivx',
      content,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
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
              lastMessageSender: 'أنت',
              lastMessageTime: newMessage.timestamp,
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
      lastMessageSnippet: 'محادثة جديدة نشطة',
      lastMessageTime: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
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
          content: 'أهلاً بك في Mohivx Messenger!',
          timestamp: newThread.lastMessageTime,
          isOutgoing: false,
          networkId: network,
        },
      ],
    }));
  };

  const handleConnectNetwork = (network: NetworkId) => {
    if (network === 'telegram') {
      setTelegramAuthOpen(true);
      return;
    }
    console.log('Connected network:', network);
  };

  const handleTelegramAuthSuccess = async () => {
    await checkTelegramStatus();
  };

  const handleDisconnectAccount = async (account: Account) => {
    if (account.networkId === 'telegram') {
      try {
        const api = (window as any).mohivxApi;
        await api?.telegram?.disconnect();
        setIsTelegramConnected(false);
        setNetworks((prev) =>
          prev.map((n) => (n.id === 'telegram' ? { ...n, connected: false, status: 'disconnected', unreadCount: 0 } : n))
        );
        setAccounts((prev) => prev.filter((a) => a.id !== account.id));
        setThreads((prev) => prev.filter((t) => t.networkId !== 'telegram'));
      } catch (err) {
        console.error('Error disconnecting Telegram account:', err);
      }
    }
  };

  const selectedThread = threads.find((t) => t.id === selectedThreadId) || null;
  const currentMessages = selectedThreadId ? messagesMap[selectedThreadId] || [] : [];
  const totalUnread = threads.reduce((acc, t) => acc + t.unreadCount, 0);

  return (
    <div className="flex w-screen h-screen bg-[#232323] overflow-hidden select-none font-sans">
      {/* 1. Left Rail (68px) */}
      <LeftRail
        currentFilter={currentFilter}
        onSelectFilter={setCurrentFilter}
        unreadCount={totalUnread}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAddAccount={() => setAddAccountOpen(true)}
        activeNetwork={activeNetwork}
        onSelectNetwork={(net) => {
          setActiveNetwork(net);
          // If clicking Telegram and not yet connected, offer to connect
          if (net === 'telegram' && !isTelegramConnected) {
            setTelegramAuthOpen(true);
          }
        }}
      />

      {/* 2. Thread List (252px) */}
      <ThreadList
        threads={threads}
        selectedThreadId={selectedThreadId}
        onSelectThread={handleSelectThread}
        currentFilter={currentFilter}
        filterUnreadOnly={filterUnreadOnly}
        onToggleFilterUnread={() => setFilterUnreadOnly(!filterUnreadOnly)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenNewChat={() => setNewChatOpen(true)}
        activeNetwork={activeNetwork}
      />

      {/* 3. Conversation Pane */}
      <ConversationView
        thread={selectedThread}
        messages={currentMessages}
        onSendMessage={handleSendMessage}
        onAddReaction={handleAddReaction}
      />

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
      />

      {/* Real Telegram MTProto Auth Modal */}
      <TelegramAuthModal
        isOpen={telegramAuthOpen}
        onClose={() => setTelegramAuthOpen(false)}
        onSuccess={handleTelegramAuthSuccess}
      />

      {/* In-App Update Prompt Banner */}
      {activeUpdate && (
        <UpdateNotification
          updateInfo={activeUpdate}
          onDismiss={() => setActiveUpdate(null)}
        />
      )}
    </div>
  );
};
