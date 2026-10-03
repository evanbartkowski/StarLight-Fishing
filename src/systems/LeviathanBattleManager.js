// LeviathanBattleManager.js — Mythic Titan Apex Encounters State Machine
// Multi-phase boss battle loop: Phase 1 (Surge Drag), Phase 2 (Surface Breach QTE), Phase 3 (Charge Counter)

import { soundManager } from '../audio/SoundManager.js';

export class LeviathanBattleManager {
  constructor(saveSystem, uiManager, particleSystem) {
    this.saveSystem = saveSystem;
    this.uiManager = uiManager;
    this.particles = particleSystem;

    this.isActive = false;
    this.boss = null;
    this.phase = 'SURGE'; // 'SURGE' | 'BREACH' | 'CHARGE' | 'VICTORY' | 'DEFEAT'

    this.stamina = 1000;
    this.maxStamina = 1000;

    this.boatHull = 100;
    this.screenRumble = 0;

    // Phase 2: QTE Breach State
    this.qteTarget = null;
    this.qteTimeRemaining = 0;
    this.qteSuccessCount = 0;
    this.qteTargetCount = 3;

    // Phase 3: Charge Counter State
    this.chargeProgress = 0; // 0 (start) to 100 (impact)
    this.isCounterWindowActive = false;
    this.hasCountered = false;

    // Callbacks
    this.onBattleEnd = null;

    // Key listener for QTE & Counter
    this.boundKeyDown = this.handleKeyDown.bind(this);
  }

  startEncounter(bossDef, onEndCallback = null) {
    this.boss = bossDef;
    this.isActive = true;
    this.phase = 'SURGE';
    this.onBattleEnd = onEndCallback;

    this.stamina = bossDef.maxStamina;
    this.maxStamina = bossDef.maxStamina;
    this.boatHull = 100;
    this.screenRumble = 0.6;

    this.qteSuccessCount = 0;
    this.chargeProgress = 0;
    this.isCounterWindowActive = false;
    this.hasCountered = false;

    window.addEventListener('keydown', this.boundKeyDown);

    soundManager.playThunder?.();
    this.uiManager.showToast(bossDef.dialogue.roar);
    this.uiManager.showToast(bossDef.dialogue.surge);
  }

  handleKeyDown(e) {
    if (!this.isActive) return;

    // Phase 2 QTE Check
    if (this.phase === 'BREACH' && this.qteTarget) {
      const key = e.key;
      const keyMap = {
        ArrowLeft: 'ArrowLeft',
        a: 'ArrowLeft',
        A: 'ArrowLeft',
        ArrowRight: 'ArrowRight',
        d: 'ArrowRight',
        D: 'ArrowRight',
        ArrowUp: 'ArrowUp',
        w: 'ArrowUp',
        W: 'ArrowUp',
        ArrowDown: 'ArrowDown',
        s: 'ArrowDown',
        S: 'ArrowDown',
      };

      const mappedKey = keyMap[key] || key;
      if (mappedKey === this.qteTarget) {
        this.resolveQTESuccess();
      } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'].includes(key)) {
        this.resolveQTEFailure();
      }
    }

    // Phase 3 Charge Counter Check
    if (this.phase === 'CHARGE' && (e.key === ' ' || e.key === 'f' || e.key === 'F')) {
      this.triggerCounterMeasure();
    }
  }

  triggerCounterMeasure() {
    if (this.phase !== 'CHARGE' || this.hasCountered) return;

    if (this.isCounterWindowActive) {
      // Perfect counter!
      this.hasCountered = true;
      this.stamina = 0;
      soundManager.playUnlockChime?.();
      soundManager.playThunder?.();
      this.screenRumble = 0.8;
      this.particles?.emitSparkles?.(window.innerWidth / 2, window.innerHeight / 2, 45, '#f59e0b');
      this.uiManager.showToast('🛡️ PERFECT COUNTER! Titan stunned by acoustic sound horn shockwave!');
      setTimeout(() => this.triggerVictory(), 800);
    } else {
      // Mistimed counter
      this.uiManager.showToast('⚠️ Counter activated too early! Spool locked!');
    }
  }

  update(dt, isReelingInput) {
    if (!this.isActive) return;

    const deltaSec = dt / 1000;
    this.screenRumble = Math.max(0, this.screenRumble - deltaSec * 0.5);

    // ==========================================
    // PHASE 1: THE SURGE (Automatic Retrieval)
    // ==========================================
    if (this.phase === 'SURGE') {
      // Automatic retrieval: exhaust the boss without a tension minigame.
      this.stamina = Math.max(0, this.stamina - 60 * deltaSec);

      // Transition to Phase 2 Breach at 65% stamina
      if (this.stamina <= this.maxStamina * 0.65) {
        this.phase = 'BREACH';
        this.uiManager.showToast(this.boss.dialogue.breach);
        this.spawnNextQTE();
      }
    }

    // ==========================================
    // PHASE 2: THE BREACH (Surface Reflex QTE)
    // ==========================================
    else if (this.phase === 'BREACH') {
      this.qteTimeRemaining -= deltaSec;
      if (this.qteTimeRemaining <= 0) {
        this.resolveQTEFailure();
      }
    }

    // ==========================================
    // PHASE 3: THE CHARGE (Defensive Counter)
    // ==========================================
    else if (this.phase === 'CHARGE') {
      if (!this.hasCountered) {
        this.chargeProgress += deltaSec * (100 / this.boss.chargeDuration);

        // Counter window active between 68% and 92% of the charge run
        this.isCounterWindowActive = (this.chargeProgress >= 68 && this.chargeProgress <= 92);

        // Ram impact check
        if (this.chargeProgress >= 100) {
          this.boatHull -= 45;
          soundManager.playThud?.();
          this.screenRumble = 1.0;
          this.uiManager.showToast('💥 IMPACT! The Leviathan rammed the vessel hull!');

          if (this.boatHull <= 0) {
            this.triggerDefeat();
          } else {
            // Reset charge phase with weakened beast
            this.chargeProgress = 0;
            this.hasCountered = false;
            this.uiManager.showToast('⚠️ Hull damaged! Prepare for another incoming charge!');
          }
        }
      }
    }
  }

  spawnNextQTE() {
    const directions = this.boss.qteDirections || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    this.qteTarget = directions[Math.floor(Math.random() * directions.length)];
    this.qteTimeRemaining = 1.4; // 1.4s reaction window
  }

  resolveQTESuccess() {
    this.qteSuccessCount += 1;
    this.stamina = Math.max(0, this.stamina - 110);
    this.screenRumble = 0.4;
    soundManager.playLockpickUnlock?.();

    if (this.qteSuccessCount >= this.qteTargetCount || this.stamina <= this.maxStamina * 0.3) {
      // Transition to Phase 3
      this.phase = 'CHARGE';
      this.chargeProgress = 0;
      this.hasCountered = false;
      this.uiManager.showToast(this.boss.dialogue.charge);
    } else {
      this.spawnNextQTE();
    }
  }

  resolveQTEFailure() {
    this.boatHull -= 15;
    this.screenRumble = 0.5;
    soundManager.playThud?.();
    this.uiManager.showToast('❌ MISTIMED REFLEX! Leviathan thrashes against the vessel!');

    if (this.boatHull <= 0) {
      this.triggerDefeat();
    } else {
      this.spawnNextQTE();
    }
  }

  triggerVictory() {
    this.phase = 'VICTORY';
    this.isActive = false;
    window.removeEventListener('keydown', this.boundKeyDown);

    const rewards = this.boss.rewards;

    // 1. Add Mythic centerpiece trophy to inventory
    const trophy = {
      ...rewards.fishTrophy,
      instanceId: 'mythic_trophy_' + Date.now(),
      caughtAt: Date.now(),
      isMythic: true,
      gradeTier: { id: 'Monster', label: 'Mythic Apex', multiplier: 3.0 },
    };
    this.saveSystem.addItemToInventory(trophy);
    this.saveSystem.recordCatch(trophy);

    // 2. Add Primordial material to inventory
    const material = {
      id: rewards.primordialMaterial.id,
      name: rewards.primordialMaterial.name,
      icon: rewards.primordialMaterial.icon,
      type: 'material',
      value: 1200,
      quantity: rewards.primordialMaterial.quantity,
      description: rewards.primordialMaterial.description,
    };
    this.saveSystem.addItemToInventory(material);

    // 3. Record permanent Prestige Badge in Almanac / Achievements
    if (!this.saveSystem.data.achievements) this.saveSystem.data.achievements = {};
    this.saveSystem.data.achievements[rewards.almanacBadge] = {
      unlocked: true,
      unlockedAt: Date.now(),
      title: rewards.badgeTitle,
    };

    // Deduct apex chum from bait
    if (this.saveSystem.data.hasApexChumActive) {
      this.saveSystem.data.hasApexChumActive = false;
    }

    this.saveSystem.save();
    soundManager.playVictoryFanfare?.();

    if (this.onBattleEnd) {
      this.onBattleEnd({ success: true, boss: this.boss, trophy, material });
    }
  }

  triggerDefeat() {
    this.phase = 'DEFEAT';
    this.isActive = false;
    window.removeEventListener('keydown', this.boundKeyDown);

    soundManager.playFishEscape?.();
    this.uiManager.showToast('🌊 The Leviathan tore through your gear and vanished into the depths!');

    if (this.onBattleEnd) {
      this.onBattleEnd({ success: false, boss: this.boss });
    }
  }

  endBattle() {
    this.isActive = false;
    window.removeEventListener('keydown', this.boundKeyDown);
  }

  render(ctx, cameraY, screenWidth, screenHeight) {
    if (!this.isActive) return;

    ctx.save();

    // 1. Ominous Leviathan Water Overlay
    const darkAlpha = 0.45;
    ctx.fillStyle = `rgba(15, 23, 42, ${darkAlpha})`;
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    // 2. Boss Stamina / Health Bar at Top
    const barWidth = Math.min(480, screenWidth - 40);
    const barHeight = 22;
    const barX = (screenWidth - barWidth) / 2;
    const barY = 65;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.roundRect(barX - 4, barY - 4, barWidth + 8, barHeight + 8, 8);
    ctx.fill();
    ctx.stroke();

    // Fill
    const stamPct = Math.max(0, this.stamina / this.maxStamina);
    const fillGrad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    fillGrad.addColorStop(0, '#f43f5e');
    fillGrad.addColorStop(1, '#a855f7');
    ctx.fillStyle = fillGrad;
    ctx.roundRect(barX, barY, barWidth * stamPct, barHeight, 6);
    ctx.fill();

    // Boss Name & Phase Label
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.boss.icon} ${this.boss.name} — Phase: ${this.phase}`, screenWidth / 2, barY - 10);

    // Hull Health Bar
    ctx.font = '12px sans-serif';
    ctx.fillStyle = this.boatHull < 35 ? '#ef4444' : '#38bdf8';
    ctx.fillText(`🛡️ Vessel Hull Integrity: ${Math.round(this.boatHull)}%`, screenWidth / 2, barY + barHeight + 18);

    // ==========================================
    // Phase 2 QTE Visual Display
    // ==========================================
    if (this.phase === 'BREACH' && this.qteTarget) {
      const qteIcons = {
        ArrowLeft: '◀ [LEFT / A]',
        ArrowRight: '▶ [RIGHT / D]',
        ArrowUp: '▲ [UP / W]',
        ArrowDown: '▼ [DOWN / S]',
      };

      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.roundRect(screenWidth / 2 - 140, screenHeight / 2 - 60, 280, 110, 12);
      ctx.fill();

      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.textAlign = 'center';
      ctx.fillText(qteIcons[this.qteTarget] || this.qteTarget, screenWidth / 2, screenHeight / 2 - 10);

      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`⚡ Time: ${this.qteTimeRemaining.toFixed(1)}s`, screenWidth / 2, screenHeight / 2 + 25);
    }

    // ==========================================
    // Phase 3 Charge Counter Display
    // ==========================================
    if (this.phase === 'CHARGE') {
      const chargeY = screenHeight / 2 - 40;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.roundRect(screenWidth / 2 - 180, chargeY, 360, 100, 12);
      ctx.fill();

      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';

      if (this.isCounterWindowActive) {
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 15;
        ctx.fillText('⚡ GOLDEN FLASH! PRESS [SPACE] TO SOUND HORN! ⚡', screenWidth / 2, chargeY + 35);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`⚠️ CHARGING! Distance: ${Math.round(100 - this.chargeProgress)}m`, screenWidth / 2, chargeY + 35);
      }

      // Charge bar
      ctx.fillStyle = '#334155';
      ctx.fillRect(screenWidth / 2 - 140, chargeY + 55, 280, 16);
      ctx.fillStyle = this.isCounterWindowActive ? '#fbbf24' : '#ef4444';
      ctx.fillRect(screenWidth / 2 - 140, chargeY + 55, 280 * (this.chargeProgress / 100), 16);
    }

    ctx.restore();
  }
}
