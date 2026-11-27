// AfkManager.js — Tracks screen inactivity for cozy idle knitting (>=5m) and 30m AFK pause prompt

export const AFK_KNITTING_SECONDS = 300; // 5 minutes without input or pointer movement
export const AFK_PAUSE_SECONDS = 1800;   // 30 minutes idle -> pause & ask if still there

export class AfkManager {
  constructor({
    knittingSeconds = AFK_KNITTING_SECONDS,
    pauseSeconds = AFK_PAUSE_SECONDS,
  } = {}) {
    this.knittingSeconds = knittingSeconds;
    this.pauseSeconds = pauseSeconds;
    this.idleSeconds = 0;
    this.isPaused = false;
    this.heldInputs = new Set();
  }

  setInputHeld(input, held) {
    if (held) this.heldInputs.add(input);
    else this.heldInputs.delete(input);
    this.recordInteraction();
  }

  recordInteraction({ allowUnpause = false } = {}) {
    if (this.isPaused && !allowUnpause) return false;
    this.idleSeconds = 0;
    if (allowUnpause) this.isPaused = false;
    return true;
  }

  tick(deltaSec) {
    if (!Number.isFinite(deltaSec) || deltaSec <= 0) {
      return { paused: this.isPaused, justPaused: false };
    }
    if (this.isPaused) {
      return { paused: true, justPaused: false };
    }
    if (this.heldInputs.size) {
      this.idleSeconds = 0;
      return { paused: false, justPaused: false };
    }
    this.idleSeconds += deltaSec;
    if (this.idleSeconds >= this.pauseSeconds) {
      this.isPaused = true;
      return { paused: true, justPaused: true };
    }
    return { paused: false, justPaused: false };
  }

  isKnittingReady(gameState, activeModal) {
    return (
      !this.isPaused &&
      gameState === 'SURFACE_IDLE' &&
      !activeModal &&
      this.idleSeconds >= this.knittingSeconds
    );
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.idleSeconds = 0;
    this.heldInputs.clear();
  }
}
