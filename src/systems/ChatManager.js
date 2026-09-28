import { accountManager } from './AccountManager.js';

export class ChatManager {
  constructor(saveSystem) {
    this.saveSystem = saveSystem;
    // In-memory messages strictly for the current session (never persisted on refresh/leave)
    this.messages = [];
    this.onMessageReceived = null;
    this.unreadCount = 0;
    this.isOpen = false;

    // Ambient NPC captains who periodically transmit fleet chatter
    this.ambientCaptains = [
      { name: 'Captain Barnaby', level: 14, icon: '⚓' },
      { name: 'Angler Finn', level: 6, icon: '🎣' },
      { name: 'Deep-Diver Ren', level: 24, icon: '🤿' },
      { name: 'Sailor Mae', level: 9, icon: '⛵' },
      { name: 'Captain Eliza', level: 32, icon: '🧭' },
      { name: 'First-Mate Jax', level: 4, icon: '🐟' },
      { name: 'Old Salt Morgan', level: 19, icon: '🌊' },
      { name: 'Navigator Cora', level: 12, icon: '🗺️' },
    ];

    this.ambientDialogues = [
      'Brisk northern breeze kicking up over the Sunken Shallows.',
      'Anyone got tips for keeping line tension steady on fast swimmers?',
      'Sonar detected something massive swimming near 500m... stay sharp out there.',
      'Angela the ship cat knocked my fresh bait bucket over again haha.',
      'Just hauled up a pristine Sunken Doubloon from the seabed!',
      'Setting sail from port. Wishing everyone fair winds and tight lines!',
      'A storm is gathering out east. The elusive fish always bite during rain.',
      'Watch out for jellyfish shocks when reeling deep catches.',
      'That new reel upgrade makes retrieving deep-sea titans so much smoother.',
      'The starlight looks incredible reflected across the open water tonight.',
      'Just spotted a pod of dolphins skipping across the bow waves!',
      'Make sure to visit the Tavern for daily noticeboard quests before you head out.',
    ];

    this.initBroadcast();
    this.startAmbientTransmissions();
  }

  initBroadcast() {
    // 1. BroadcastChannel for instant inter-tab communication
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('starlight_fishing_fleet_chat');
        this.channel.onmessage = (event) => {
          if (event && event.data && event.data.type === 'CHAT_MESSAGE') {
            this.receiveExternalMessage(event.data.payload);
          }
        };
      } catch (e) {
        this.channel = null;
      }
    }

    // 2. Storage event fallback for cross-window / browser events
    window.addEventListener('storage', (e) => {
      if (e.key === 'starlight_fleet_chat_tx' && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload && payload.senderId !== this.getLocalSenderId()) {
            this.receiveExternalMessage(payload);
          }
        } catch (err) {}
      }
    });
  }

  getLocalSenderId() {
    if (!this._senderId) {
      this._senderId = 'cap_' + Math.random().toString(36).substring(2, 9);
    }
    return this._senderId;
  }

  getPlayerName() {
    const active = accountManager.getActiveUsername();
    return active || 'Captain';
  }

  getPlayerLevel() {
    return this.saveSystem?.data?.level || 0;
  }

  sendMessage(text) {
    if (!text || !text.trim()) return false;
    const cleanText = text.trim().substring(0, 180);

    const message = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      senderId: this.getLocalSenderId(),
      sender: this.getPlayerName(),
      level: this.getPlayerLevel(),
      icon: '⚓',
      text: cleanText,
      timestamp: Date.now(),
      isSelf: true,
    };

    this.messages.push(message);

    // Broadcast to other tabs/windows
    if (this.channel) {
      this.channel.postMessage({ type: 'CHAT_MESSAGE', payload: message });
    }

    // Transient storage pulse for cross-window notifications (deleted immediately so it never persists)
    try {
      localStorage.setItem('starlight_fleet_chat_tx', JSON.stringify(message));
      setTimeout(() => {
        try {
          if (localStorage.getItem('starlight_fleet_chat_tx')) {
            localStorage.removeItem('starlight_fleet_chat_tx');
          }
        } catch (e) {}
      }, 50);
    } catch (e) {}

    if (this.onMessageReceived) {
      this.onMessageReceived(message);
    }
    return true;
  }

  receiveExternalMessage(payload) {
    if (!payload || !payload.id) return;
    // Prevent duplicate processing
    if (this.messages.some((m) => m.id === payload.id)) return;

    const message = {
      ...payload,
      isSelf: false,
    };

    this.messages.push(message);

    if (!this.isOpen) {
      this.unreadCount += 1;
    }

    if (this.onMessageReceived) {
      this.onMessageReceived(message);
    }
  }

  broadcastCatch(fishName, rarity, crown = null, weight = null) {
    if (!this.saveSystem?.isChatUnlocked()) return;
    const rarityIcons = {
      rare: '🔷',
      epic: '💜',
      legendary: '👑',
      mythic: '✨',
    };
    const icon = rarityIcons[rarity] || '🎣';
    const crownPrefix = crown === 'gold' ? '🌟 Giant ' : crown === 'silver' ? '✨ Mini ' : '';
    const weightText = weight ? ` (${weight}kg)` : '';
    const text = `${crownPrefix}${fishName}${weightText} landed aboard!`;

    this.sendMessage(text);
  }

  startAmbientTransmissions() {
    const scheduleNext = () => {
      // Periodic transmission every 35 to 70 seconds
      const delay = 35000 + Math.random() * 35000;
      setTimeout(() => {
        if (this.saveSystem?.isChatUnlocked()) {
          this.triggerAmbientTransmission();
        }
        scheduleNext();
      }, delay);
    };

    // First ambient greeting shortly after starting (18 seconds)
    setTimeout(() => {
      if (this.saveSystem?.isChatUnlocked() && this.messages.length === 0) {
        this.triggerAmbientTransmission('Welcome aboard the fleet channel! May the calm tides bring you bounty.');
      }
      scheduleNext();
    }, 18000);
  }

  triggerAmbientTransmission(customText = null) {
    const captain = this.ambientCaptains[Math.floor(Math.random() * this.ambientCaptains.length)];
    const text = customText || this.ambientDialogues[Math.floor(Math.random() * this.ambientDialogues.length)];

    const message = {
      id: 'ambient_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      senderId: 'npc_' + captain.name.replace(/\s+/g, '_'),
      sender: captain.name,
      level: captain.level,
      icon: captain.icon,
      text,
      timestamp: Date.now(),
      isSelf: false,
      isNPC: true,
    };

    this.messages.push(message);

    if (!this.isOpen) {
      this.unreadCount += 1;
    }

    if (this.onMessageReceived) {
      this.onMessageReceived(message);
    }
  }

  markRead() {
    this.unreadCount = 0;
  }
}
