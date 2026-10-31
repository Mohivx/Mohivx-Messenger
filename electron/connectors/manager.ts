import { IMessengerConnector, NetworkId, ConnectorMessage, ConnectorThread } from './types';

export class ConnectorManager {
  private connectors = new Map<NetworkId, IMessengerConnector>();
  private messageListeners: ((msg: ConnectorMessage) => void)[] = [];

  public register(connector: IMessengerConnector): void {
    this.connectors.set(connector.networkId, connector);
    connector.onMessageReceived((msg) => {
      this.messageListeners.forEach((fn) => fn(msg));
    });
  }

  public getConnector(networkId: NetworkId): IMessengerConnector | undefined {
    return this.connectors.get(networkId);
  }

  public async connectNetwork(networkId: NetworkId, credentials: any): Promise<boolean> {
    const conn = this.connectors.get(networkId);
    if (!conn) throw new Error(`Connector for ${networkId} is not installed`);
    return await conn.connect(credentials);
  }

  public async sendMessage(networkId: NetworkId, threadId: string, text: string): Promise<ConnectorMessage> {
    const conn = this.connectors.get(networkId);
    if (!conn || !conn.isConnected()) {
      // Local fallback
      return {
        id: `local-${Date.now()}`,
        threadId,
        senderId: 'me',
        senderName: 'Mohivx',
        content: text,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        isOutgoing: true,
        networkId,
      };
    }
    return await conn.sendMessage(threadId, text);
  }

  public onMessage(callback: (msg: ConnectorMessage) => void): void {
    this.messageListeners.push(callback);
  }
}
