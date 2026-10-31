import React, { useState, useEffect } from 'react';
import { ViewFilter, NetworkId, Thread, Message } from './types';
import { INITIAL_NETWORKS, INITIAL_ACCOUNTS, INITIAL_THREADS, INITIAL_MESSAGES } from './data/mockData';
import { LeftRail } from './components/LeftRail';
import { ThreadList } from './components/ThreadList';
import { ConversationView } from './components/ConversationView';
import { CommandPalette } from './components/CommandPalette';
import { NewChatModal } from './components/NewChatModal';
import { SettingsModal } from './components/SettingsModal';
import { AddAccountModal } from './components/AddAccountModal';

export const App: React.FC = () => {
  const [currentFilter, setCurrentFilter] = useState<ViewFilter>('inbox');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState<NetworkId | null>(null);

  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>('thread-1');
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);

  const [searchOpen, setSearchOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);

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

  const handleSendMessage = (content: string) => {
    if (!selectedThreadId) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      threadId: selectedThreadId,
      senderId: 'me',
      senderName: 'Mohivx',
      content,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      isOutgoing: true,
      networkId: threads.find((t) => t.id === selectedThreadId)?.networkId || 'telegram',
      status: 'sent',
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedThreadId]: [...(prev[selectedThreadId] || []), newMessage],
    }));

    // Update thread last snippet
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
    // Add realistic connected account & notification
    console.log('Connected network:', network);
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
        onSelectNetwork={setActiveNetwork}
      />

      {/* 2. Thread List (252px) */}
      <ThreadList
        threads={threads}
        selectedThreadId={selectedThreadId}
        onSelectThread={setSelectedThreadId}
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
        onSelectThread={setSelectedThreadId}
      />

      <NewChatModal
        isOpen={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onCreateChat={handleCreateChat}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        accounts={INITIAL_ACCOUNTS}
        onOpenAddAccount={() => {
          setSettingsOpen(false);
          setAddAccountOpen(true);
        }}
      />

      <AddAccountModal
        isOpen={addAccountOpen}
        onClose={() => setAddAccountOpen(false)}
        onConnectNetwork={handleConnectNetwork}
      />
    </div>
  );
};
