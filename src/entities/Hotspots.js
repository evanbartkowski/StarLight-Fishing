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
			const x = Math.max(46, Math.min(this.worldWidth - 46, mapX / 600 * this.worldWidth));
			const y = this.surfaceY + Math.max(-8, Math.min(8, (mapY - 120) / 12));
			return { ...spot, index, x, y, baseY: y, readyAt: 0 };
		});
	}

	update(dt) {
		this.timer += dt / 1000;
		for (const spot of this.hotspots) spot.y = spot.baseY + Math.sin(this.timer * .7 + spot.index) * 3;
	}

	render(ctx, cameraY = 0, width = this.worldWidth, height = 2000) {
		const screenY = this.surfaceY - cameraY;
		if (screenY < -20 || screenY > height + 20) return;
		ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
		for (const spot of this.hotspots) {
			if (spot.x < 34 || spot.x > width - 34) continue;
			const y = spot.y - cameraY;
			const pulse = .5 + .5 * Math.sin(this.timer * 2 + spot.index);
			const color = spot.index === 1 ? '#f4d68a' : '#8bd9d1';
			ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.globalAlpha = .2 + pulse * .12;
			for (let ring = 0; ring < 3; ring++) {
				const phase = (pulse + ring / 3) % 1;
				ctx.beginPath(); ctx.ellipse(spot.x, y + 5, 13 + phase * 15, 3 + phase * 4, 0, 0, Math.PI * 2); ctx.stroke();
			}
			ctx.globalAlpha = .48 + pulse * .25; ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 9;
			ctx.beginPath(); ctx.arc(spot.x, y - 3, 2.5 + pulse, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
			ctx.font = '10px sans-serif'; ctx.fillStyle = '#d9f4eb'; ctx.globalAlpha = .58;
			ctx.fillText(spot.name, spot.x, y - 17);
		}
		ctx.restore();
	}

	checkHit(x, y) {
		if (Math.abs(y - this.surfaceY) > 12) return null;
		const spot = this.hotspots.filter(item => this.timer >= item.readyAt)
			.sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))
			.find(item => Math.abs(item.x - x) <= 32);
		if (!spot) return null;
		spot.readyAt = this.timer + 90;
		const multiplier = this.currentSeaId;
		const reward = spot.index === 0
			? { coins: 140 * multiplier, xp: 55 * multiplier }
			: spot.index === 1
				? { buff: 'sirensGrace', durationMs: 45000 + multiplier * 5000 }
				: { coins: 90 * multiplier, xp: 85 * multiplier };
		return { ...spot, reward, isSunkenSafe: spot.index === 2 };
	}
}
