import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage } from 'telegram/events';
import { app, safeStorage } from 'electron';
import fs from 'fs';
import path from 'path';
import { IMessengerConnector, ConnectorMessage, ConnectorThread, NetworkId } from './types';
import { LocalDatabase } from '../database';

// Standard official Telegram Desktop client API ID & Hash
const DEFAULT_API_ID = 2040;
const DEFAULT_API_HASH = 'b18441a1ff607e10a989891a5462e627';

export interface TelegramAuthChallenge {
  phoneNumber: string;
  phoneCodeHash: string;
}

export class TelegramConnector implements IMessengerConnector {
  public readonly networkId: NetworkId = 'telegram';
  private client: TelegramClient | null = null;
  private sessionFilePath: string;
  private messageCallbacks: ((msg: ConnectorMessage) => void)[] = [];
  private activeChallenge: TelegramAuthChallenge | null = null;
  private activeApiId: number = DEFAULT_API_ID;
  private activeApiHash: string = DEFAULT_API_HASH;
  private db: LocalDatabase;

  constructor(database: LocalDatabase) {
    this.db = database;
    const userData = app?.getPath ? app.getPath('userData') : process.cwd();
    this.sessionFilePath = path.join(userData, 'storage', 'telegram_session.enc');
  }

  public isConnected(): boolean {
    return this.client !== null && !!this.client.connected;
  }

  public async autoConnect(): Promise<boolean> {
    try {
      if (!fs.existsSync(this.sessionFilePath)) return false;
      const encrypted = fs.readFileSync(this.sessionFilePath);
      let sessionStr = '';
      if (safeStorage && safeStorage.isEncryptionAvailable()) {
        sessionStr = safeStorage.decryptString(encrypted);
      } else {
        sessionStr = encrypted.toString('utf8');
      }

      if (!sessionStr) return false;

      this.client = new TelegramClient(new StringSession(sessionStr), DEFAULT_API_ID, DEFAULT_API_HASH, {
        connectionRetries: 5,
      });

      await this.client.connect();
      const me = await this.client.getMe();
      if (me) {
        console.log(`[Telegram] Auto-connected as: ${(me as any).username || (me as any).firstName}`);
        this.setupEventListener();
        return true;
      }
      return false;
    } catch (err: any) {
      console.warn('[Telegram] Auto-connect failed:', err.message);
      return false;
    }
  }

  public async sendCode(phoneNumber: string, apiId = DEFAULT_API_ID, apiHash = DEFAULT_API_HASH): Promise<{ phoneCodeHash: string }> {
    this.activeApiId = apiId;
    this.activeApiHash = apiHash;

    if (this.client) {
      try {
        await this.client.disconnect();
      } catch {}
    }

    this.client = new TelegramClient(new StringSession(''), apiId, apiHash, {
      connectionRetries: 5,
    });

    await this.client.connect();
    const result = await this.client.sendCode(
      { apiId, apiHash },
      phoneNumber
    );

    this.activeChallenge = {
      phoneNumber,
      phoneCodeHash: result.phoneCodeHash,
    };

    return { phoneCodeHash: result.phoneCodeHash };
  }

  public async signInWithCode(code: string): Promise<{ success: boolean; requires2FA?: boolean; user?: any }> {
    if (!this.client || !this.activeChallenge) {
      throw new Error('No active login challenge. Please send phone code first.');
    }

    try {
      const user = await this.client.invoke(
        new Api.auth.SignIn({
          phoneNumber: this.activeChallenge.phoneNumber,
          phoneCodeHash: this.activeChallenge.phoneCodeHash,
          phoneCode: code,
        })
      );

      await this.persistSession();
      this.setupEventListener();
      return { success: true, user };
    } catch (err: any) {
      if (
        (err.message && err.message.includes('SESSION_PASSWORD_NEEDED')) ||
        err.errorMessage === 'SESSION_PASSWORD_NEEDED'
      ) {
        return { success: false, requires2FA: true };
      }
      throw err;
    }
  }

  public async signInWith2FA(password: string): Promise<{ success: boolean; user?: any }> {
    if (!this.client) throw new Error('Telegram client not initialized');
    const apiId = this.activeApiId || DEFAULT_API_ID;
    const apiHash = this.activeApiHash || DEFAULT_API_HASH;

    const user = await this.client.signInWithPassword(
      { apiId, apiHash },
      {
        password: async () => password,
        onError: async (err: any) => {
          throw err;
        },
      }
    );

    await this.persistSession();
    this.setupEventListener();
    return { success: true, user };
  }

  private async persistSession(): Promise<void> {
    if (!this.client) return;
    const sessionStr = (this.client.session as any).save();
    let data: Buffer;
    if (safeStorage && safeStorage.isEncryptionAvailable()) {
      data = safeStorage.encryptString(sessionStr);
    } else {
      data = Buffer.from(sessionStr, 'utf8');
    }
    const dir = path.dirname(this.sessionFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.sessionFilePath, data);
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
    if (fs.existsSync(this.sessionFilePath)) {
      fs.unlinkSync(this.sessionFilePath);
    }
  }

  public async connect(_credentials: any): Promise<boolean> {
    return this.autoConnect();
  }

  public async syncThreads(limit = 40): Promise<ConnectorThread[]> {
    if (!this.client || !this.client.connected) return [];

    const dialogs = await this.client.getDialogs({ limit });
    const threads: ConnectorThread[] = [];

    for (const d of dialogs) {
      const isGroup = (d.isGroup || d.isChannel) ?? false;
      const title = d.title || (d.entity as any)?.firstName || 'Telegram Chat';
      const id = `tg-${d.id?.toString()}`;
      const lastMsg = d.message?.message || '';
      const date = d.date ? new Date(d.date * 1000).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '';
      const unreadCount = d.unreadCount || 0;

      const thread: ConnectorThread = {
        id,
        networkId: 'telegram',
        title,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=2EA4DB&color=fff`,
        isGroup,
        lastMessageSnippet: lastMsg,
        lastMessageTime: date,
        unreadCount,
      };

      threads.push(thread);
      this.db.upsertThread(thread);
    }

    return threads;
  }

  public async getMessages(peerId: string, limit = 30): Promise<ConnectorMessage[]> {
    if (!this.client || !this.client.connected) {
      // Return cached from SQLite
      return this.db.getMessages(peerId).map(m => ({
        id: m.id,
        threadId: m.threadId,
        senderId: m.senderId,
        senderName: m.senderName,
        content: m.content,
        timestamp: m.timestamp,
        isOutgoing: m.isOutgoing,
        networkId: 'telegram',
      }));
    }

    const cleanPeer = peerId.replace(/^tg-/, '');
    const msgs = await this.client.getMessages(cleanPeer, { limit });
    const me = await this.client.getMe();
    const myId = (me as any)?.id?.toString();

    const result: ConnectorMessage[] = [];
    for (const m of msgs.reverse()) {
      if (!m.message && !m.media) continue;
      const isOutgoing = m.out || (m.senderId?.toString() === myId);
      const senderName = isOutgoing ? 'أنت' : (m.sender as any)?.firstName || 'Telegram User';
      const timestamp = m.date ? new Date(m.date * 1000).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '';

      const item: ConnectorMessage = {
        id: `tg-msg-${m.id}`,
        threadId: peerId,
        senderId: m.senderId?.toString() || '',
        senderName,
        content: m.message || (m.media ? '[Media/Photo]' : ''),
        timestamp,
        isOutgoing,
        networkId: 'telegram',
      };

      result.push(item);
      this.db.insertMessage(item);
    }

    return result;
  }

  public async sendMessage(threadId: string, text: string): Promise<ConnectorMessage> {
    if (!this.client || !this.client.connected) {
      throw new Error('Telegram is not connected. Please connect your account first.');
    }

    const cleanPeer = threadId.replace(/^tg-/, '');
    const sent = await this.client.sendMessage(cleanPeer, { message: text });
    const timestamp = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    const msg: ConnectorMessage = {
      id: `tg-msg-${sent.id}`,
      threadId,
      senderId: 'me',
      senderName: 'أنت',
      content: text,
      timestamp,
      isOutgoing: true,
      networkId: 'telegram',
    };

    this.db.insertMessage(msg);
    return msg;
  }

  private setupEventListener(): void {
    if (!this.client) return;

    this.client.addEventHandler(async (event: any) => {
      try {
        const message = event.message;
        if (!message) return;
        const threadId = `tg-${message.chatId?.toString() || message.peerId?.channelId?.toString() || message.peerId?.userId?.toString()}`;
        const isOutgoing = message.out || false;
        const timestamp = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

        const connectorMsg: ConnectorMessage = {
          id: `tg-msg-${message.id}`,
          threadId,
          senderId: message.senderId?.toString() || '',
          senderName: isOutgoing ? 'أنت' : (message.sender as any)?.firstName || 'Telegram User',
          content: message.message || '',
          timestamp,
          isOutgoing,
          networkId: 'telegram',
        };

        this.db.insertMessage(connectorMsg);
        this.messageCallbacks.forEach((cb) => cb(connectorMsg));
      } catch (e) {
        console.error('[Telegram] Error handling event:', e);
      }
    }, new NewMessage({}));
  }

  public onMessageReceived(callback: (msg: ConnectorMessage) => void): void {
    this.messageCallbacks.push(callback);
  }
}
