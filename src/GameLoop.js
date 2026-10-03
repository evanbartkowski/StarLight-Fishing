export class GameLoop {
  constructor(update, render) {
    this.lastFrameTime = null;
    this.accumulatedTime = 0;
    this.timeStep = 1000 / 60; // 60 updates per second

    this.update = update;
    this.render = render;

    this.rafId = null;
    this.isRunning = false;
    this.generation = 0;
  }

  mainLoop = (timestamp) => {
    if (!this.isRunning) return;
    const generation = this.generation;
    this.rafId = null;

    if (this.lastFrameTime === null) {
      this.lastFrameTime = timestamp;
      this.rafId = requestAnimationFrame(this.mainLoop);
      return;
    }

    // Limit delta time to 100ms to avoid spiral of death on lag / tab switch
    const rawDelta = timestamp - this.lastFrameTime;
    const deltaTime = Math.min(100, Math.max(0, rawDelta));
    this.lastFrameTime = timestamp;

    this.accumulatedTime += deltaTime;

    // Fixed time step updates
    let steps = 0;
    while (this.accumulatedTime >= this.timeStep && steps < 5) {
      try {
        this.update(this.timeStep);
      } catch (err) {
        console.error('Error during GameLoop update:', err);
      }
      if (!this.isRunning || generation !== this.generation) return;
      this.accumulatedTime -= this.timeStep;
      steps++;
    }

    // Discard any residual accumulated time if overloaded
    if (this.accumulatedTime > this.timeStep) {
      this.accumulatedTime = 0;
    }

    // Render current frame
    try {
      this.render();
    } catch (err) {
      console.error('Error during GameLoop render:', err);
    }

    // Request next frame
    if (this.isRunning && generation === this.generation) {
      this.rafId = requestAnimationFrame(this.mainLoop);
    }
  };

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.generation++;
      this.lastFrameTime = null;
      this.accumulatedTime = 0;
      this.rafId = requestAnimationFrame(this.mainLoop);
    }
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.isRunning = false;
    this.rafId = null;
    this.generation++;
  }
}
