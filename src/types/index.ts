export type NetworkId = 
  | 'telegram'
  | 'whatsapp'
  | 'discord'
  | 'slack'
  | 'signal'
  | 'instagram'
  | 'facebook'
  | 'x'
  | 'linkedin'
  | 'googlemessages'
  | 'googlechat'
  | 'matrix'
  | 'line'
  | 'viber'
  | 'wechat';

export interface NetworkInfo {
  id: NetworkId;
  name: string;
  color: string;
  iconBg: string;
  category: 'chat' | 'social' | 'work';
  connected: boolean;
  status: 'online' | 'connecting' | 'disconnected' | 'error';
  unreadCount?: number;
}

export interface Account {
  id: string;
  networkId: NetworkId;
  username: string;
  displayName: string;
  avatarUrl: string;
  connectedAt: string;
  status: 'active' | 'syncing' | 'paused';
}

export interface Reaction {
  emoji: string;
  count: number;
  meReacted?: boolean;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderColor?: string;
  content: string;
  timestamp: string;
  isOutgoing: boolean;
  networkId: NetworkId;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  replyTo?: {
    id: string;
    senderName: string;
    snippet: string;
  };
  reactions?: Reaction[];
  attachments?: {
    type: 'image' | 'file' | 'audio' | 'video';
    url: string;
    name?: string;
    size?: string;
  }[];
}

export interface Thread {
  id: string;
  networkId: NetworkId;
  title: string;
  avatarUrl: string;
  isGroup: boolean;
  lastMessageSnippet: string;
  lastMessageSender?: string;
  lastMessageSenderAvatar?: string;
  lastMessageTime: string;
  unreadCount: number;
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  isVerified?: boolean;
  draft?: string;
}

export type ViewFilter = 'inbox' | 'archive' | 'reminders' | 'sendlater' | 'requests' | 'lowpriority';

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

export interface AppSettings {
  // General
  incognitoMode: boolean;
  showTypingIndicator: boolean;
  language: string;
  directionMode: 'auto' | 'ltr' | 'rtl';
  defaultRemindLater: 'if_no_reply' | 'always';
  archiveOnReminder: boolean;
  syncArchiveState: boolean;
  markReadOnArchive: boolean;
  afterArchive: 'next' | 'previous' | 'close';
  afterMarkReadUnread: 'next' | 'stay';
  doubleClickMessageAction: 'reply' | 'react' | 'copy';
  undoSendDelay: number;
  includeTimestampsOnCopy: boolean;
  emojiAutocomplete: boolean;
  autoCopyOtp: boolean;
  launchOnStartup: boolean;
  closeToTray: boolean;
  minimizeToTray: boolean;
  hardwareAcceleration: boolean;

  // Appearance
  showSidebar: boolean;
  compactPinnedThreads: boolean;
  showUnreads: boolean;
  messagePreviews: boolean;
  compactChatList: boolean;
  showNetworkIcons: boolean;
  colorizeNetworkIcons: boolean;
  theme: 'dark' | 'light' | 'system';
  density: 'comfortable' | 'compact';
  fontSize: number;
  zoomLevel: number;

  // Notifications
  soundEnabled: boolean;
  soundVolume: number;
  notifications: boolean;
  notifyGroupMessages: boolean;
  notifyInFocus: boolean;
  notifyReactions: boolean;
  notifyTyping: boolean;
  delayNotifications: 'off' | '15s' | '30s' | '1m';
  unreadBadge: boolean;
  dnd: boolean;

  // AI
  aiModel: string;
  geminiApiKey: string;
  openaiApiKey: string;
  autoSummarize: boolean;
  smartReplies: boolean;
  autoTranslate: boolean;
  voiceTranscription: boolean;
  aiMentions: boolean;

  // Integrations / Desktop API
  desktopApiEnabled: boolean;
  remoteAccessEnabled: boolean;

  // Profile
  displayName: string;
  username: string;
  email: string;
  bio: string;
  planTier: 'Free' | 'Plus';
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
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


