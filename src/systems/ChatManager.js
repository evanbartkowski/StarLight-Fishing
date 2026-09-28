import { accountManager } from './AccountManager.js';

export class ChatManager {
  constructor(saveSystem) {
    this.saveSystem = saveSystem;
    this.messages = [];
    this.seen = new Set();
    this.onMessageReceived = null;
    this.loadBackend = () => import('./FleetFirebase.js');
    this.retryAt = 0;
  }

  async connect() {
    if (!this.saveSystem.isChatUnlocked() || this.unsubscribe || this.connecting || Date.now() < this.retryAt) return;
    this.connecting = true;
    try {
      this.unsubscribe = await (await this.loadBackend()).subscribe(message => this.receiveExternalMessage(message), () => {
        this.unsubscribe?.();
        this.unsubscribe = null;
        this.retryAt = Date.now() + 10000;
      });
    } catch { this.retryAt = Date.now() + 10000; }
    finally { this.connecting = false; }
  }

  async sendMessage(text) {
    if (!this.saveSystem.isChatUnlocked() || typeof text !== 'string' || !text.trim() || this.sending) return false;
    this.sending = true;
    try {
      await this.connect();
      await (await this.loadBackend()).send(text.trim().slice(0, 180), accountManager.getCurrentUser() || 'Guest Mariner');
      return true;
    } catch { return false; }
    finally { this.sending = false; }
  }

  receiveExternalMessage(payload) {
    if (!this.saveSystem.isChatUnlocked() || payload?.kind !== 'player' || !payload.id ||
        typeof payload.text !== 'string' || !payload.text.trim() || this.seen.has(payload.id)) return;
    this.seen.add(payload.id);
    if (this.seen.size > 500) this.seen.delete(this.seen.values().next().value);
    const message = { id: payload.id, sender: String(payload.sender || 'Guest Mariner').slice(0, 40), text: payload.text.slice(0, 180), isSelf: !!payload.isSelf };
    this.messages.push(message);
    if (this.messages.length > 100) this.messages.shift();
    this.onMessageReceived?.(message);
  }
}
