import { accountManager } from './AccountManager.js';

export class ChatManager {
  constructor(saveSystem) {
    this.saveSystem = saveSystem;
    this.messages = [];
    this.onMessageReceived = null;
    this.senderId = `player_${Date.now()}_${Math.random()}`;
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel('starlight_fishing_fleet_chat');
      this.channel.onmessage = ({ data }) => {
        if (data?.type === 'CHAT_MESSAGE') this.receiveExternalMessage(data.payload);
      };
    }
    window.addEventListener('storage', event => {
      if (event.key !== 'starlight_fleet_chat_tx' || !event.newValue) return;
      try { this.receiveExternalMessage(JSON.parse(event.newValue)); } catch {}
    });
  }

  append(message) {
    this.messages.push(message);
    if (this.messages.length > 100) this.messages.shift();
    this.onMessageReceived?.(message);
  }

  sendMessage(text) {
    if (!this.saveSystem.isChatUnlocked() || typeof text !== 'string' || !text.trim()) return false;
    const message = {
      id: `${this.senderId}_${Date.now()}_${Math.random()}`,
      senderId: this.senderId,
      sender: accountManager.getCurrentUser() || 'Guest Mariner',
      text: text.trim().slice(0, 180),
      kind: 'player',
      isSelf: true,
    };
    this.append(message);
    try { this.channel?.postMessage({ type: 'CHAT_MESSAGE', payload: message }); } catch {}
    try {
      localStorage.setItem('starlight_fleet_chat_tx', JSON.stringify(message));
      localStorage.removeItem('starlight_fleet_chat_tx');
    } catch {}
    return true;
  }

  receiveExternalMessage(payload) {
    if (!this.saveSystem.isChatUnlocked() || payload?.kind !== 'player' || payload.isNPC ||
        !payload.id || payload.senderId === this.senderId || typeof payload.text !== 'string' ||
        !payload.text.trim() || this.messages.some(message => message.id === payload.id)) return;
    this.append({
      id: payload.id,
      sender: String(payload.sender || 'Guest Mariner').slice(0, 40),
      text: payload.text.slice(0, 180),
      isSelf: false,
    });
  }
}
