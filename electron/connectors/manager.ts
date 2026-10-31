import { IMessengerConnector, NetworkId, ConnectorMessage, ConnectorThread } from './types';
import { TelegramConnector } from './telegram';
import { LocalDatabase } from '../database';

export class ConnectorManager {
  private connectors = new Map<NetworkId, IMessengerConnector>();
  private messageListeners: ((msg: ConnectorMessage) => void)[] = [];
  public telegram: TelegramConnector;
  public db: LocalDatabase;

  constructor(database: LocalDatabase) {
    this.db = database;
    this.telegram = new TelegramConnector(database);
    this.register(this.telegram);
  }

  public register(connector: IMessengerConnector): void {
    this.connectors.set(connector.networkId, connector);
    connector.onMessageReceived((msg) => {
      this.messageListeners.forEach((fn) => fn(msg));
    });
  }

  public getConnector(networkId: NetworkId): IMessengerConnector | undefined {
    return this.connectors.get(networkId);
  }

  public async autoConnectAll(): Promise<{ telegram: boolean }> {
    const tg = await this.telegram.autoConnect();
    return { telegram: tg };
  }

  public async sendMessage(networkId: NetworkId, threadId: string, text: string): Promise<ConnectorMessage> {
    const conn = this.connectors.get(networkId);
    if (!conn || !conn.isConnected()) {
      throw new Error(`Service ${networkId} is not connected.`);
    }
    return await conn.sendMessage(threadId, text);
  }

  public onMessage(callback: (msg: ConnectorMessage) => void): void {
    this.messageListeners.push(callback);
  }
}
