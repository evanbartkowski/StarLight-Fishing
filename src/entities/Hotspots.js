import { FANTASY_SEAS } from './SeasData.js';

export class HotspotManager {
	constructor(surfaceY, worldWidth) {
		this.surfaceY = surfaceY;
		this.worldWidth = worldWidth;
		this.currentSeaId = 1;
		this.timer = 0;
		this.hotspots = [];
		this.setSea(1);
	}

	setSea(seaId) {
		this.currentSeaId = seaId;
		const sea = FANTASY_SEAS.find(item => item.id === seaId) || FANTASY_SEAS[0];
		this.hotspots = sea.hotspots.map((spot, index) => {
			const [mapX, mapY] = spot.coords || [300, 120];
			const x = Math.max(80, Math.min(this.worldWidth - 80, (mapX / 600) * this.worldWidth));
			const y = this.surfaceY + Math.max(-6, Math.min(6, (mapY - 120) / 14));
			return { ...spot, index, x, y, baseY: y, readyAt: 0 };
		});
		this.activeSpotIndex = 0;
		this.cycleCooldown = 15;
		this.activeDuration = 35;
	}

	update(dt) {
		const delta = dt / 1000;
		this.timer += delta;
		for (const spot of this.hotspots) {
			spot.y = spot.baseY + Math.sin(this.timer * 0.9 + spot.index * 1.7) * 2;
		}
	}

	render(ctx, cameraY = 0, width = this.worldWidth, height = 2000) {
		const screenY = this.surfaceY - cameraY;
		if (screenY < -60 || screenY > height + 60) return;

		// Select active hotspot based on a cycle so they are rare (only 1 active at a time)
		const cyclePeriod = 55; // 55s cycle
		const cycleTime = this.timer % cyclePeriod;
		// Active for 28 seconds of the 55s window (rare appearance)
		const isHotspotActive = cycleTime < 28;
		if (!isHotspotActive) return;

		const activeIdx = Math.floor(this.timer / cyclePeriod) % this.hotspots.length;
		const spot = this.hotspots[activeIdx];
		if (!spot || spot.x < 30 || spot.x > width - 30) return;
		if (this.timer < spot.readyAt) return; // on cooldown after collection

		// Smooth fade in / fade out at start and end of active window
		let windowAlpha = 1;
		if (cycleTime < 3) windowAlpha = cycleTime / 3;
		else if (cycleTime > 25) windowAlpha = Math.max(0, (28 - cycleTime) / 3);

		const y = spot.y - cameraY;
		const pulse = 0.5 + 0.5 * Math.sin(this.timer * 2.5);

		ctx.save();
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		// 1. Broad soft ambient light-blue surface glow / bloom
		const glowGradient = ctx.createRadialGradient(spot.x, y, 4, spot.x, y, 78);
		glowGradient.addColorStop(0, `rgba(186, 230, 253, ${0.75 * windowAlpha})`);     // #bae6fd luminous core
		glowGradient.addColorStop(0.35, `rgba(56, 189, 248, ${0.45 * windowAlpha})`);    // #38bdf8 bright sky blue
		glowGradient.addColorStop(0.7, `rgba(14, 165, 233, ${0.2 * windowAlpha})`);     // #0ea5e9 deep cyan
		glowGradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
		ctx.fillStyle = glowGradient;
		ctx.beginPath();
		ctx.ellipse(spot.x, y + 2, 85, 24, 0, 0, Math.PI * 2);
		ctx.fill();

		// 2. Animated luminous water caustic ripples
		for (let ring = 0; ring < 4; ring++) {
			const phase = ((this.timer * 0.45) + ring / 4) % 1;
			const radiusX = 14 + phase * 62;
			const radiusY = 4 + phase * 16;
			const ringAlpha = (1 - phase) * (0.55 + pulse * 0.25) * windowAlpha;

			ctx.strokeStyle = `rgba(186, 230, 253, ${ringAlpha})`;
			ctx.lineWidth = 1.8 - phase * 0.9;
			ctx.shadowColor = '#38bdf8';
			ctx.shadowBlur = 8;
			ctx.beginPath();
			ctx.ellipse(spot.x, y + 3, radiusX, radiusY, 0, 0, Math.PI * 2);
			ctx.stroke();
		}

		// 3. Central light-blue water beacon crystal / shimmer orb
		ctx.shadowColor = '#7dd3fc';
		ctx.shadowBlur = 14;
		ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * windowAlpha})`;
		ctx.beginPath();
		ctx.arc(spot.x, y - 2, 3.2 + pulse * 1.2, 0, Math.PI * 2);
		ctx.fill();

		// 4. Upward bioluminescent water sparkle motes
		for (let i = 0; i < 5; i++) {
			const motePhase = ((this.timer * 0.7 + i * 0.38) % 1);
			const mx = spot.x + Math.sin(this.timer * 1.5 + i * 2) * (18 + i * 6);
			const my = y - 4 - motePhase * 28;
			const moteAlpha = Math.sin(motePhase * Math.PI) * 0.85 * windowAlpha;
			ctx.fillStyle = `rgba(186, 230, 253, ${moteAlpha})`;
			ctx.shadowBlur = 6;
			ctx.beginPath();
			ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.restore();
	}

	checkHit(x, y) {
		if (Math.abs(y - this.surfaceY) > 16) return null;
		// Check against currently active hotspot
		const cyclePeriod = 55;
		const cycleTime = this.timer % cyclePeriod;
		if (cycleTime >= 28) return null; // Inactive phase of cycle

		const activeIdx = Math.floor(this.timer / cyclePeriod) % this.hotspots.length;
		const spot = this.hotspots[activeIdx];
		if (!spot || this.timer < spot.readyAt) return null;

		if (Math.abs(spot.x - x) > 42) return null;

		spot.readyAt = this.timer + 70;
		const multiplier = this.currentSeaId;
		const reward = {
			coins: (spot.index === 0 ? 140 : 90) * multiplier,
			xp: (spot.index === 0 ? 55 : 85) * multiplier,
			buff: 'sirensGrace',
			durationMs: 45000 + multiplier * 5000,
		};
		return { index: spot.index, reward, isSunkenSafe: spot.index === 2 };
	}
}
