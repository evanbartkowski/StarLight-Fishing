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
    this.pruneMessages();
    if (!this.saveSystem.isChatUnlocked() || this.unsubscribe || this.connecting || Date.now() < this.retryAt) return;
    this.connecting = true;
    try {
      this.unsubscribe = await (await this.loadBackend()).subscribe(message => this.receiveExternalMessage(message), (error) => {
        this.lastError = error.code || error.message;
        this.unsubscribe?.();
        this.unsubscribe = null;
        this.retryAt = Date.now() + 10000;
      }, messages => this.replaceMessages(messages));
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
    } catch (error) { this.lastError = error.code || error.message; return false; }
    finally { this.sending = false; }
  }

  async sendBroadcast(sender, text) {
    if (typeof text !== 'string' || !text.trim() || this.sending) return false;
    this.sending = true;
    try {
      await (await this.loadBackend()).send(text.trim().slice(0, 180), String(sender || '[Global]').slice(0, 40));
      return true;
    } catch (error) { this.lastError = error.code || error.message; return false; }
    finally { this.sending = false; }
  }

  replaceMessages(messages) {
    this.messages = [];
    this.seen.clear();
    messages.forEach(message => this.receiveExternalMessage(message));
    this.onMessagesChanged?.(this.messages);
  }

  pruneMessages(now = Date.now()) {
    if (this._lastPrune && now - this._lastPrune < 5000) return;
    this._lastPrune = now;
    const kept = this.messages.filter(message => message.createdAt > now - 86400000).slice(-30);
    if (kept.length !== this.messages.length) {
      this.messages = kept;
      this.onMessagesChanged?.(kept);
    }
  }

  receiveExternalMessage(payload) {
    if (!this.saveSystem.isChatUnlocked() || !['player', 'event'].includes(payload?.kind) || !payload.id ||
        typeof payload.text !== 'string' || !payload.text.trim() || this.seen.has(payload.id)) return;
    const createdAt = payload.createdAt?.toMillis?.() ?? payload.createdAt ?? Date.now();
    if (createdAt <= Date.now() - 86400000) return;
    this.seen.add(payload.id);
    if (this.seen.size > 500) this.seen.delete(this.seen.values().next().value);
    const message = { senderId: payload.senderId, createdAt, id: payload.id, sender: String(payload.sender || 'Guest Mariner').slice(0, 40), text: payload.text.slice(0, 180), isSelf: !!payload.isSelf };
    this.messages.push(message);
    if (this.messages.length > 30) this.messages.shift();
    this.onMessageReceived?.(message);
    this.onMessagesChanged?.(this.messages);
  }
}
