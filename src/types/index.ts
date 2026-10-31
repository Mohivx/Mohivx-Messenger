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
