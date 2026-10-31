import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export interface DbThread {
  id: string;
  networkId: string;
  title: string;
  avatarUrl: string;
  isGroup: boolean;
  lastMessageSnippet: string;
  lastMessageSender?: string;
  lastMessageTime: string;
  unreadCount: number;
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
}

export interface DbMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderColor?: string;
  content: string;
  timestamp: string;
  isOutgoing: boolean;
  networkId: string;
  status?: string;
  replyToJson?: string;
  reactionsJson?: string;
}

export class LocalDatabase {
  private db: Database | null = null;
  private dbPath: string;

  constructor() {
    const userData = app?.getPath ? app.getPath('userData') : process.cwd();
    const dir = path.join(userData, 'storage');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    this.dbPath = path.join(dir, 'mohivx.sqlite');
  }

  public async initialize(): Promise<void> {
    const SQL = await initSqlJs();
    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
    }

    this.createTables();
    this.persist();
  }

  private createTables(): void {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        network_id TEXT NOT NULL,
        username TEXT,
        display_name TEXT,
        avatar_url TEXT,
        connected_at TEXT,
        is_active INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY,
        network_id TEXT NOT NULL,
        title TEXT NOT NULL,
        avatar_url TEXT,
        is_group INTEGER DEFAULT 0,
        last_message_snippet TEXT,
        last_message_sender TEXT,
        last_message_time TEXT,
        unread_count INTEGER DEFAULT 0,
        is_pinned INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0,
        is_muted INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        thread_id TEXT NOT NULL,
        sender_id TEXT,
        sender_name TEXT,
        sender_avatar TEXT,
        sender_color TEXT,
        content TEXT,
        timestamp TEXT,
        is_outgoing INTEGER DEFAULT 0,
        network_id TEXT NOT NULL,
        status TEXT,
        reply_to_json TEXT,
        reactions_json TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
    `);
  }

  public persist(): void {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  public upsertThread(t: DbThread): void {
    if (!this.db) return;
    this.db.run(
      `INSERT OR REPLACE INTO threads 
       (id, network_id, title, avatar_url, is_group, last_message_snippet, last_message_sender, last_message_time, unread_count, is_pinned, is_archived, is_muted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        t.id,
        t.networkId,
        t.title,
        t.avatarUrl || '',
        t.isGroup ? 1 : 0,
        t.lastMessageSnippet || '',
        t.lastMessageSender || '',
        t.lastMessageTime || '',
        t.unreadCount || 0,
        t.isPinned ? 1 : 0,
        t.isArchived ? 1 : 0,
        t.isMuted ? 1 : 0,
      ]
    );
    this.persist();
  }

  public getThreads(networkId?: string): DbThread[] {
    if (!this.db) return [];
    const query = networkId
      ? `SELECT * FROM threads WHERE network_id = ? ORDER BY is_pinned DESC, last_message_time DESC`
      : `SELECT * FROM threads ORDER BY is_pinned DESC, last_message_time DESC`;
    const params = networkId ? [networkId] : [];
    const res = this.db.exec(query, params);
    if (!res || res.length === 0) return [];

    const { columns, values } = res[0];
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((c: string, idx: number) => {
        obj[c] = row[idx];
      });
      return {
        id: obj.id,
        networkId: obj.network_id,
        title: obj.title,
        avatarUrl: obj.avatar_url,
        isGroup: obj.is_group === 1,
        lastMessageSnippet: obj.last_message_snippet,
        lastMessageSender: obj.last_message_sender,
        lastMessageTime: obj.last_message_time,
        unreadCount: obj.unread_count,
        isPinned: obj.is_pinned === 1,
        isArchived: obj.is_archived === 1,
        isMuted: obj.is_muted === 1,
      };
    });
  }

  public insertMessage(m: DbMessage): void {
    if (!this.db) return;
    this.db.run(
      `INSERT OR REPLACE INTO messages
       (id, thread_id, sender_id, sender_name, sender_avatar, sender_color, content, timestamp, is_outgoing, network_id, status, reply_to_json, reactions_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        m.id,
        m.threadId,
        m.senderId,
        m.senderName,
        m.senderAvatar || '',
        m.senderColor || '',
        m.content,
        m.timestamp,
        m.isOutgoing ? 1 : 0,
        m.networkId,
        m.status || 'delivered',
        m.replyToJson || '',
        m.reactionsJson || '',
      ]
    );
    this.persist();
  }

  public getMessages(threadId: string): DbMessage[] {
    if (!this.db) return [];
    const res = this.db.exec(
      `SELECT * FROM messages WHERE thread_id = ? ORDER BY rowid ASC`,
      [threadId]
    );
    if (!res || res.length === 0) return [];
    const { columns, values } = res[0];
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((c: string, idx: number) => {
        obj[c] = row[idx];
      });
      return {
        id: obj.id,
        threadId: obj.thread_id,
        senderId: obj.sender_id,
        senderName: obj.sender_name,
        senderAvatar: obj.sender_avatar,
        senderColor: obj.sender_color,
        content: obj.content,
        timestamp: obj.timestamp,
        isOutgoing: obj.is_outgoing === 1,
        networkId: obj.network_id,
        status: obj.status,
        replyToJson: obj.reply_to_json,
        reactionsJson: obj.reactions_json,
      };
    });
  }
}
