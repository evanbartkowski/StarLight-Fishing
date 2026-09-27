export class Hazard {
  constructor(typeConfig, x, y) {
    this.type = typeConfig.id;
    this.name = typeConfig.name;
    this.damage = typeConfig.damage;
    this.knockback = typeConfig.knockback;
    this.color = typeConfig.color;
    this.glow = typeConfig.glow || '#ef4444';
    this.isColossal = !!typeConfig.isColossal;
    this.radius = typeConfig.radius || (this.isColossal ? 35 : 20);

    this.x = x;
    this.y = y;
    this.timer = Math.random() * Math.PI * 2;
    this.pulseSpeed = 1.8 + Math.random() * 1.2;
    this.driftX = (Math.random() * 2 - 1) * (this.isColossal ? 0.25 : 0.45);
  }

  update(dt, worldWidth) {
    const deltaSec = dt / 1000;
    this.timer += this.pulseSpeed * deltaSec;

    // Horizontal drift
    this.x += this.driftX * 30 * deltaSec;
    if (this.x < 35) this.driftX = Math.abs(this.driftX);
    if (this.x > worldWidth - 35) this.driftX = -Math.abs(this.driftX);

    // Subtle vertical wave undulation
    this.y += Math.sin(this.timer * 1.5) * 0.35;
  }

  render(ctx, cameraY = 0) {
    const drawY = this.y - cameraY;
    ctx.save();
    ctx.translate(this.x, drawY);

    // High-visibility danger warning: bold red border and glowing hazard ring
    ctx.save();
    const pulseScale = 1.0 + Math.sin(this.timer * 3.5) * 0.08;
    
    // Glowing red outline around object bounds
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(0, 0, (this.radius + 3) * pulseScale, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary dashed outer warning orbit
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(248, 113, 113, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 9 + Math.sin(this.timer * 2) * 2, 0, Math.PI * 2);
    ctx.stroke();

    // Warning icon indicator
    ctx.setLineDash([]);
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚠️', 0, -this.radius - 8);

    if (this.isColossal) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('COLOSSAL', 0, -this.radius - 20);
    }
    ctx.restore();

    try {
      if (this.type === 'boot') {
        // Encrusted Old Sea Boot
        ctx.fillStyle = '#44403c';
        ctx.beginPath();
        ctx.moveTo(-10, -14);
        ctx.lineTo(2, -14);
        ctx.lineTo(2, -2);
        ctx.lineTo(14, 2);
        ctx.lineTo(14, 10);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fill();

        // White barnacles
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(-4, 4, 2.5, 0, Math.PI * 2);
        ctx.arc(6, 6, 2, 0, Math.PI * 2);
        ctx.arc(-2, -8, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'pufferfish') {
        // Inflated Spiky Pufferfish
        const inflate = 1 + Math.sin(this.timer * 3) * 0.18;
        ctx.scale(inflate, inflate);

        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        // Radiating venom needles
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12);
          ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20);
          ctx.stroke();
        }

        // Puffer eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(6, -4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(7, -4, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'ghost_net') {
        // Tangled Ghost Net mesh
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let i = -14; i <= 14; i += 7) {
          ctx.moveTo(i, -12);
          ctx.lineTo(i + Math.sin(this.timer + i) * 4, 14);
        }
        for (let j = -12; j <= 14; j += 6) {
          ctx.moveTo(-14, j);
          ctx.lineTo(14, j + Math.cos(this.timer + j) * 4);
        }
        ctx.stroke();

        // Sinker weight
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(0, 14, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'electric_eel') {
        // Electric Eel with electric sparks
        const wiggle = Math.sin(this.timer * 4) * 8;
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.quadraticCurveTo(0, wiggle, 18, -wiggle * 0.5);
        ctx.stroke();

        // Lightning zap spark
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#67e8f9';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(18, -6);
        ctx.lineTo(14, -2);
        ctx.lineTo(22, -8);
        ctx.stroke();
      } else if (this.type === 'anchor') {
        // Heavy Rusted Anchor
        ctx.fillStyle = '#475569';
        ctx.fillRect(-3, -16, 6, 28); // Stock
        ctx.fillRect(-12, -12, 24, 4); // Crossbar
        ctx.beginPath();
        ctx.arc(0, 8, 14, 0, Math.PI); // Flukes
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#475569';
        ctx.stroke();
      } else if (this.type === 'jellyfish') {
        const pulse = 1 + Math.sin(this.timer * 3) * 0.15;
        ctx.scale(1, pulse);

        ctx.shadowColor = this.glow;
        ctx.shadowBlur = 14;

        // Bell
        ctx.fillStyle = 'rgba(192, 132, 252, 0.75)';
        ctx.beginPath();
        ctx.arc(0, -6, 16, Math.PI, 0);
        ctx.quadraticCurveTo(0, 4, -16, 0);
        ctx.fill();

        // Stinging tentacles
        ctx.strokeStyle = 'rgba(216, 180, 254, 0.85)';
        ctx.lineWidth = 1.8;
        for (let i = -10; i <= 10; i += 5) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          const wave = Math.sin(this.timer * 4 + i) * 6;
          ctx.bezierCurveTo(i + wave, 12, i - wave, 22, i + wave * 0.5, 30);
          ctx.stroke();
        }
      } else if (this.type === 'urchin') {
        // Dense spiky urchin
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2.2;
        const spikeCount = 14;
        for (let i = 0; i < spikeCount; i++) {
          const angle = (i / spikeCount) * Math.PI * 2 + this.timer * 0.15;
          const len = 17 + Math.sin(this.timer * 4 + i) * 3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * 9, Math.sin(angle) * 9);
          ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
          ctx.stroke();
        }
      } else if (this.type === 'sea_mine') {
        // Naval Mine
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#52525b';
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          ctx.fillRect(Math.cos(angle) * 14 - 2, Math.sin(angle) * 14 - 2, 4, 7);
        }

        // Blinking red detonation light
        if (Math.sin(this.timer * 6) > 0) {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#dc2626';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(0, -16, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (this.type === 'thermal_vent') {
        // Magma rock chimney
        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.moveTo(-16, 16);
        ctx.lineTo(-6, -12);
        ctx.lineTo(6, -12);
        ctx.lineTo(16, 16);
        ctx.closePath();
        ctx.fill();

        // Magma glow
        ctx.fillStyle = '#ea580c';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(0, -12, 7, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'void_tentacle') {
        // Colossal writhing tentacle with suction cups
        const wave = Math.sin(this.timer * 3) * 12;
        ctx.strokeStyle = '#4c0519';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 24);
        ctx.bezierCurveTo(wave, 10, -wave, -4, wave * 0.7, -24);
        ctx.stroke();

        // Glowing red suction cups
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#e11d48';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(wave * 0.3 - 5, 8, 3, 0, Math.PI * 2);
        ctx.arc(-wave * 0.3 - 5, -8, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'mega_mine') {
        // Colossal Dreadnought Naval Mine
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();

        // Heavy steel spikes
        ctx.fillStyle = '#3f3f46';
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a - 0.15) * 24, Math.sin(a - 0.15) * 24);
          ctx.lineTo(Math.cos(a) * 36, Math.sin(a) * 36);
          ctx.lineTo(Math.cos(a + 0.15) * 24, Math.sin(a + 0.15) * 24);
          ctx.closePath();
          ctx.fill();
        }

        // Flashing siren core
        const flash = Math.sin(this.timer * 7) > 0;
        ctx.fillStyle = flash ? '#ef4444' : '#7f1d1d';
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = flash ? 18 : 6;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (this.type === 'colossal_urchin') {
        // Giant Abyssal Void Urchin
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();

        // 20 Long Venomous Spikes
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2.6;
        for (let i = 0; i < 20; i++) {
          const a = (i / 20) * Math.PI * 2 + this.timer * 0.1;
          const len = 34 + Math.sin(this.timer * 3 + i) * 4;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 14);
          ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
          ctx.stroke();
        }
      } else if (this.type === 'razor_spire') {
        // Submerged Razor Reef Spire
        ctx.fillStyle = '#450a0a';
        ctx.beginPath();
        ctx.moveTo(0, -35);
        ctx.lineTo(16, 20);
        ctx.lineTo(12, 32);
        ctx.lineTo(-12, 32);
        ctx.lineTo(-16, 18);
        ctx.closePath();
        ctx.fill();

        // Glowing magma veins
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(-6, 0);
        ctx.lineTo(8, 14);
        ctx.lineTo(2, 30);
        ctx.stroke();
      } else if (this.type === 'abyssal_jaw') {
        // Ancient Megalodon Fossil Skull Trap
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.arc(0, 0, 24, Math.PI, 0);
        ctx.lineTo(20, 24);
        ctx.lineTo(-20, 24);
        ctx.closePath();
        ctx.fill();

        // Serrated White Teeth
        ctx.fillStyle = '#f8fafc';
        for (let x = -16; x <= 16; x += 8) {
          ctx.beginPath();
          ctx.moveTo(x - 3, 2);
          ctx.lineTo(x, 14);
          ctx.lineTo(x + 3, 2);
          ctx.closePath();
          ctx.fill();
        }
      } else if (this.type === 'toxic_colossus_jelly') {
        // Colossal Stygian Dread-Jelly
        ctx.fillStyle = 'rgba(88, 28, 135, 0.85)';
        ctx.beginPath();
        ctx.arc(0, -8, 26, Math.PI, 0);
        ctx.quadraticCurveTo(0, 10, -26, -8);
        ctx.fill();

        // Stinging tendrils
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        for (let i = -18; i <= 18; i += 6) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          const wave = Math.sin(this.timer * 4 + i) * 8;
          ctx.bezierCurveTo(i + wave, 14, i - wave, 28, i + wave * 0.5, 42);
          ctx.stroke();
        }
      } else {
        // Driftwood Log
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(-20, -7);
        ctx.lineTo(20, -7);
        ctx.quadraticCurveTo(24, 0, 20, 7);
        ctx.lineTo(-20, 7);
        ctx.quadraticCurveTo(-24, 0, -20, -7);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    } catch (e) {
      // Safe fallback rendering so hazard never crashes canvas
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

