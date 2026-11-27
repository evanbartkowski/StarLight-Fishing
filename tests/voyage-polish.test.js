import test from 'node:test';
import assert from 'node:assert/strict';
import { WorldCycle } from '../src/systems/WorldCycle.js';
import { AfkManager } from '../src/systems/AfkManager.js';
import { OceanWorld } from '../src/world/OceanWorld.js';
import { getVesselLayout } from '../src/rendering/VesselRenderer.js';
import { Powerup, POWERUP_TYPES } from '../src/entities/Powerup.js';
import { Relic } from '../src/entities/Relic.js';
import { RELIC_TYPES } from '../src/data/RelicsData.js';
import { getConstellationScreenCoords, handleConstellationClick } from '../src/systems/EasterEggs.js';

test('solved and unsolved constellations fade and leave after three minutes', () => {
  for (const solved of [false, true]) {
    const cycle = new WorldCycle();
    cycle.constellationState = { active: true, solved, clicked: new Set(), lastNightKey: 0, remainingSec: 180, alpha: 1 };
    cycle.ensureNightConstellation(true, 170);
    assert.ok(cycle.constellationState.alpha > 0 && cycle.constellationState.alpha < 1);
    cycle.ensureNightConstellation(true, 10);
    assert.equal(cycle.constellationState.active, false);
    cycle.ensureNightConstellation(true, 1);
    assert.equal(cycle.constellationState.active, false, 'expiry must not spawn another fish the same night');
  }
});

test('a completed constellation also leaves at dawn', () => {
  const cycle = new WorldCycle();
  cycle.constellationState.active = cycle.constellationState.solved = true;
  cycle.ensureNightConstellation(false);
  assert.equal(cycle.constellationState.active, false);
});

test('every star in the smaller constellation remains selectable on a phone', () => {
  const state = { active: true, clicked: new Set(), solved: false };
  let result;
  for (const star of getConstellationScreenCoords(390, 220, 0)) result = handleConstellationClick(state, star.x, star.y, 390, 220, 0);
  assert.equal(result.completed, true);
});

test('holding an input cannot trigger idle knitting or the AFK pause', () => {
  const afk = new AfkManager();
  afk.setInputHeld('pointer:1', true);
  afk.tick(1800);
  assert.equal(afk.idleSeconds, 0);
  assert.equal(afk.isPaused, false);
  afk.setInputHeld('pointer:1', false);
  afk.tick(299);
  assert.equal(afk.isKnittingReady('SURFACE_IDLE', null), false);
  afk.tick(1);
  assert.equal(afk.isKnittingReady('SURFACE_IDLE', null), true);
  afk.recordInteraction();
  assert.equal(afk.isKnittingReady('SURFACE_IDLE', null), false);
});

test('rod anchors follow the captain seat and scale in both aim directions', async () => {
  const { getVesselRig } = await import('../src/rendering/VesselRenderer.js');
  for (const style of ['standard', 'pirate', 'submarine', 'chinese_junk', 'viking', 'ghost_ship', 'steampunk']) {
    for (let tier = 0; tier <= 8; tier++) {
      const left = getVesselRig(tier, 140, 40, style, -1);
      const right = getVesselRig(tier, 140, 40, style, 1);
      assert.deepEqual(left.anglerPos, right.anglerPos, 'facing must not move the captain to another seat');
      const world = new OceanWorld({ width: 800, height: 600 });
      world.saveSystem = { getUpgradeLevel: () => tier, getBoatHull: () => style };
      world.boat.x = 400; world.boat.y = 206; world.boat.angle = .13;
      for (const dir of [-1, 1]) {
        const rig = dir < 0 ? left : right;
        world.aimDirection = dir; world.updateRodTip();
        const x = 400 + rig.rodTip.x * Math.cos(.13) - rig.rodTip.y * Math.sin(.13);
        const y = 206 + rig.rodTip.x * Math.sin(.13) + rig.rodTip.y * Math.cos(.13);
        assert.ok(Math.abs(world.rodTip.x - x) < 1e-8);
        assert.ok(Math.abs(world.rodTip.y - y) < 1e-8);
      }
    }
  }
});

test('the submarine captain and hatch share one cockpit geometry', async () => {
  const { getSubmarineCockpit } = await import('../src/rendering/VesselRenderer.js');
  const cockpit = getSubmarineCockpit(140);
  const layout = getVesselLayout(8, 140, 40, 'submarine');
  assert.equal(layout.anglerPos.x, cockpit.x);
  assert.ok(layout.anglerPos.y - 48 * layout.anglerScale >= cockpit.y - cockpit.radius);
  assert.ok(cockpit.x - cockpit.radius > -18, 'glass must clear the aft tower');
});

test('a powerup effect failing inside a nested save cannot displace the fishing line', () => {
  let depth = 0;
  const ctx = { save() { depth++; }, restore() { depth--; }, translate() {}, scale() {}, rotate() {},
    setLineDash() {}, beginPath() {}, arc() { throw new Error('effect failed'); } };
  const powerup = new Powerup(POWERUP_TYPES[0], 100, 1000);
  assert.throws(() => powerup.render(ctx, 700), /effect failed/);
  assert.equal(depth, 0);
});

test('a submerged tea set draws its actual porcelain silhouette instead of an icon', () => {
  const ellipses = [], text = [];
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({ globalAlpha: 1,
    createRadialGradient: () => gradient, createLinearGradient: () => gradient,
    ellipse: (...args) => ellipses.push(args), fillText: value => text.push(value),
  }, { get: (target, key) => key in target ? target[key] : () => {} });
  new Relic(RELIC_TYPES.find(relic => relic.id === 'porcelain_tea_set'), 150, 350).render(ctx, 100);
  assert.ok(ellipses.some(([x, y, rx, ry]) => x === -4 && y === 0 && rx === 18 && ry === 14));
  assert.equal(text.length, 0);
});

test('restoration requires all three tools and completed work survives reopening', async () => {
  const { RestorationSession } = await import('../src/systems/RestorationSession.js');
  const session = new RestorationSession({ cols: 8, rows: 6, width: 80, height: 60 });
  const untouched = session.progress;
  session.stroke(40, 30, 'polish');
  assert.equal(session.progress, untouched, 'the wrong tool must not silently finish another stage');
  for (const tool of ['brush', 'pick', 'polish']) {
    assert.equal(session.requiredTool, tool);
    for (let pass = 0; pass < 6 && session.requiredTool === tool; pass++) {
      for (let y = 5; y < 60; y += 8) for (let x = 5; x < 80; x += 8) session.stroke(x, y, tool);
    }
  }
  assert.equal(session.complete, true);
  const restored = new RestorationSession({ cols: 8, rows: 6, width: 80, height: 60, progress: session.snapshot() });
  assert.equal(restored.complete, true);
  assert.equal(restored.progress, 1);
});

test('restoration resumes partial cleaning and ignores invalid pointer coordinates', async () => {
  const { RestorationSession } = await import('../src/systems/RestorationSession.js');
  const session = new RestorationSession();
  session.stroke(210, 140, 'brush');
  assert.ok(session.progress > 0);
  const saved = session.snapshot();
  const restored = new RestorationSession({ progress: saved });
  assert.equal(restored.progress, session.progress);
  restored.stroke(NaN, 50, 'brush');
  assert.deepEqual(restored.snapshot(), saved);
});
