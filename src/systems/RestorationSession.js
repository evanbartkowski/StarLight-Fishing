export const RESTORATION_TOOLS = {
  brush: { name: 'Soft brush', action: 'Brush away sediment', radius: 32, strength: .65, color: '#a78bfa' },
  pick: { name: 'Detail pick', action: 'Lift the barnacles', radius: 18, strength: 1, color: '#fbbf24' },
  polish: { name: 'Polishing cloth', action: 'Polish the surface', radius: 38, strength: .55, color: '#5eead4' },
};
const STAGES = Object.keys(RESTORATION_TOOLS);

export class RestorationSession {
  constructor({ cols = 28, rows = 18, width = 420, height = 280, mask, progress } = {}) {
    Object.assign(this, { cols, rows, width, height });
    this.mask = Array.from({ length: cols * rows }, (_, i) => mask ? !!mask[i] :
      ((i % cols + .5 - cols / 2) / (cols * .32)) ** 2 + ((Math.floor(i / cols) + .5 - rows / 2) / (rows * .38)) ** 2 < 1);
    if (!this.mask.some(Boolean)) this.mask[Math.floor(this.mask.length / 2)] = true;
    this.stage = Number.isInteger(progress?.stage) && progress?.version === 1 ? Math.max(0, Math.min(3, progress.stage)) : 0;
    this.resetLayer();
    if (Array.isArray(progress?.cells) && progress.cells.length === this.cells.length) {
      this.cells = progress.cells.map((value, i) => this.initial[i] && Number.isFinite(value) ? Math.max(0, Math.min(this.initial[i], value)) : 0);
    }
  }
  get complete() { return this.stage === 3; }
  get requiredTool() { return STAGES[this.stage]; }
  get layerProgress() {
    const total = this.initial.reduce((sum, value) => sum + value, 0);
    return total ? 1 - this.cells.reduce((sum, value) => sum + value, 0) / total : 1;
  }
  get progress() { return this.complete ? 1 : (this.stage + this.layerProgress) / 3; }
  resetLayer() {
    this.initial = this.mask.map((active, i) => !active || this.complete ? 0 :
      this.stage === 1 ? ((i * 7 + Math.floor(i / this.cols) * 3) % 13 === 0 ? 1 : 0) : 1);
    if (!this.complete && !this.initial.some(Boolean)) this.initial[this.mask.indexOf(true)] = 1;
    this.cells = [...this.initial];
  }
  stroke(x, y, tool) {
    if (this.complete || tool !== this.requiredTool || !Number.isFinite(x) || !Number.isFinite(y)) return false;
    const { radius, strength } = RESTORATION_TOOLS[tool];
    let changed = false;
    for (let i = 0; i < this.cells.length; i++) {
      if (!this.cells[i]) continue;
      const cx = (i % this.cols + .5) * this.width / this.cols;
      const cy = (Math.floor(i / this.cols) + .5) * this.height / this.rows;
      if ((x - cx) ** 2 + (y - cy) ** 2 > radius ** 2) continue;
      this.cells[i] = Math.max(0, Math.round((this.cells[i] - strength) * 100) / 100);
      changed = true;
    }
    if (this.layerProgress >= .96) { this.stage++; this.resetLayer(); }
    return changed;
  }
  snapshot() { return { version: 1, stage: this.stage, cells: [...this.cells] }; }
}
