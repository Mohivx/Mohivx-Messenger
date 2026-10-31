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

export interface ConnectorMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isOutgoing: boolean;
  networkId: NetworkId;
  attachments?: any[];
}

export interface ConnectorThread {
  id: string;
  networkId: NetworkId;
  title: string;
  avatarUrl: string;
  isGroup: boolean;
  lastMessageSnippet: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface IMessengerConnector {
  readonly networkId: NetworkId;
  isConnected(): boolean;
  connect(credentials: any): Promise<boolean>;
  disconnect(): Promise<void>;
  sendMessage(threadId: string, text: string): Promise<ConnectorMessage>;
  syncThreads(): Promise<ConnectorThread[]>;
  onMessageReceived(callback: (msg: ConnectorMessage) => void): void;
}
