import { RARITY_CONFIG } from '../data/FishData.js';

export class Treasure {
  constructor(itemConfig, x, y) {
    this.isTreasure = true;
    this.category = itemConfig.category || 'treasure';
    this.isCrate = !!itemConfig.isCrate || itemConfig.category === 'crate';
    this.crateRank = itemConfig.crateRank || 1;
    this.itemConfig = itemConfig;
    this.zone = itemConfig.zone;
    this.rewardMultiplier = itemConfig.rewardMultiplier || 1;
    this.id = itemConfig.id;
    this.name = itemConfig.name;
    this.rarity = itemConfig.rarity;
    this.rarityColor = RARITY_CONFIG[itemConfig.rarity]?.color || '#ffffff';
    this.rarityGlow = RARITY_CONFIG[itemConfig.rarity]?.glow || '#fde68a';
    this.value = itemConfig.value;
    this.lore = itemConfig.lore;

    this.x = x;
    this.y = y;
    this.radius = itemConfig.radius || 18;
    this.state = 'IDLE'; // 'IDLE' | 'HOOKED'
    this.hook = null;
    this.hookOffset = { x: 0, y: 0 };
    this.timer = Math.random() * Math.PI * 2;
  }

  update(dt, worldWidth, hook) {
    const deltaSec = dt / 1000;
    this.timer += 2.5 * deltaSec;

    if (this.state === 'IDLE') {
      this.y += Math.sin(this.timer) * 0.25;
    } else if (this.state === 'HOOKED' && hook) {
      this.x = hook.x + this.hookOffset.x;
      this.y = hook.y + this.hookOffset.y;
    }
  }

  hookTo(hook, slotIndex) {
    this.state = 'HOOKED';
    this.hook = hook;
    this.hookIndex = slotIndex;
    const side = slotIndex % 2 === 0 ? 1 : -1;
    this.hookOffset = {
      x: side * 3,
      y: -(22 + slotIndex * 26),
    };
    this.x = hook.x + this.hookOffset.x;
    this.y = hook.y + this.hookOffset.y;
  }

  render(ctx, cameraY = 0) {
    const drawY = this.y - cameraY;

    // Leader wire connecting to hook if hooked
    if (this.state === 'HOOKED' && this.hook) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(this.hook.x, this.hook.y - cameraY);
      ctx.lineTo(this.x, drawY);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(this.x, drawY);

    // Glowing aura
    ctx.save();
    ctx.shadowColor = this.rarityGlow;
    ctx.shadowBlur = 16;

    if (this.itemConfig.realmStyle && !this.isCrate) {
      const shape = this.itemConfig.treasureShape;
      ctx.fillStyle = this.itemConfig.color;
      ctx.strokeStyle = this.itemConfig.glow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (shape === 0) {
        ctx.moveTo(0, -20); ctx.lineTo(16, -5); ctx.lineTo(11, 13);
        ctx.lineTo(0, 20); ctx.lineTo(-14, 8); ctx.lineTo(-16, -8); ctx.closePath();
      } else if (shape === 1) {
        ctx.rect(-14, -17, 28, 34);
      } else {
        ctx.ellipse(0, 0, 19, 13, Math.sin(this.timer) * 0.15, 0, Math.PI * 2);
      }
      ctx.fill(); ctx.stroke();
      ctx.font = '17px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText({ reef: '?', spore: '?', crystal: '?', ruins: '?', cloud: '?', lava: '?', void: '?' }[this.itemConfig.realmStyle], 0, 0);
    } else if (this.isCrate || this.category === 'crate') {
      // HIGH-FIDELITY RANKED MYSTERY LOOT CRATES (Ranks 1 to 5)
      const rank = this.crateRank || 1;
      const hw = this.radius * 1.1; // Crate width half
      const hh = this.radius * 0.78; // Crate body half-height
      const lidH = hh * 0.45;        // Domed/reinforced lid height
      const t = this.timer || 0;

      // Gentle underwater buoyant tilt
      ctx.rotate(Math.sin(t * 1.6) * 0.035);

      // Rank-specific color palettes and materials
      const crateThemes = {
        1: { // Weathered Driftwood Crate
          bodyTop: '#854d0e', bodyBottom: '#592c08', plankLine: '#3e1a04',
          lidTop: '#a16207', lidBottom: '#713f12',
          trim: '#3f3f46', trimAccent: '#71717a', rivet: '#a1a1aa',
          latch: '#ca8a04', latchGlow: '#fef08a', rune: null,
          glow: 'rgba(253, 230, 138, 0.45)', outerGlow: 'rgba(245, 158, 11, 0.15)',
        },
        2: { // Sunken Ironbound Strongbox
          bodyTop: '#475569', bodyBottom: '#1e293b', plankLine: '#0f172a',
          lidTop: '#64748b', lidBottom: '#334155',
          trim: '#0f172a', trimAccent: '#334155', rivet: '#94a3b8',
          latch: '#38bdf8', latchGlow: '#7dd3fc', rune: null,
          glow: 'rgba(56, 189, 248, 0.45)', outerGlow: 'rgba(14, 165, 233, 0.18)',
        },
        3: { // Gilded Corsair's Treasure Chest
          bodyTop: '#78350f', bodyBottom: '#451a03', plankLine: '#260e02',
          lidTop: '#92400e', lidBottom: '#592c08',
          trim: '#eab308', trimAccent: '#fde047', rivet: '#fef08a',
          latch: '#f43f5e', latchGlow: '#fda4af', rune: 'skull',
          glow: 'rgba(250, 204, 21, 0.55)', outerGlow: 'rgba(234, 179, 8, 0.22)',
        },
        4: { // Abyssal Leviathan Coffer
          bodyTop: '#1e1b4b', bodyBottom: '#0f0d26', plankLine: '#060514',
          lidTop: '#2e1065', lidBottom: '#1e1b4b',
          trim: '#7c3aed', trimAccent: '#c084fc', rivet: '#e9d5ff',
          latch: '#a855f7', latchGlow: '#d8b4fe', rune: 'eye',
          glow: 'rgba(168, 85, 247, 0.65)', outerGlow: 'rgba(147, 51, 234, 0.28)',
        },
        5: { // Mythic Celestial Reliquary
          bodyTop: '#090d16', bodyBottom: '#020617', plankLine: '#0284c7',
          lidTop: '#0c1a2e', lidBottom: '#040b17',
          trim: '#0284c7', trimAccent: '#38bdf8', rivet: '#f0fdf4',
          latch: '#f43f5e', latchGlow: '#38bdf8', rune: 'star',
          glow: 'rgba(56, 189, 248, 0.85)', outerGlow: 'rgba(244, 63, 94, 0.35)',
        },
      };

      const theme = crateThemes[rank] || crateThemes[1];
      const pulse = Math.sin(t * 2.4) * 0.18 + 0.82; // 0.64 to 1.0 glow multiplier

      // 1. UNDERWATER PULSING AURA (Radial Glow)
      const auraRadius = Math.max(1, this.radius * 2.2 * pulse);
      try {
        const auraGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, auraRadius);
        auraGrad.addColorStop(0, theme.glow);
        auraGrad.addColorStop(0.55, theme.outerGlow);
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
        ctx.fill();
      } catch (_) {
        // Fallback if gradient not supported in mock
      }

      // 2. AMBIENT UNDERWATER PARTICLES / GLINT MOTES
      for (let p = 0; p < 3; p++) {
        const phase = t * 1.5 + p * 2.094;
        const px = Math.sin(phase) * (hw + 8 + p * 3);
        const py = -hh - 6 - ((t * 12 + p * 15) % 22);
        const pSize = 1.2 + Math.sin(phase * 2) * 0.4;
        ctx.fillStyle = theme.latchGlow;
        ctx.globalAlpha = Math.max(0, Math.min(1, 0.7 - ((t * 12 + p * 15) % 22) / 22));
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.5, pSize), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 3. MAIN CHEST LOWER HULL (Body)
      const bodyY = -hh * 0.2;
      const bodyH = hh * 1.2;

      // Body background fill (with subtle vertical depth)
      ctx.fillStyle = theme.bodyTop;
      ctx.fillRect(-hw, bodyY, hw * 2, bodyH);

      // Body shadow at base
      ctx.fillStyle = theme.bodyBottom;
      ctx.fillRect(-hw, bodyY + bodyH * 0.45, hw * 2, bodyH * 0.55);

      // Wood plank horizontal seams or tech segments
      ctx.strokeStyle = theme.plankLine;
      ctx.lineWidth = 1.5;
      const seamY1 = bodyY + bodyH * 0.33;
      const seamY2 = bodyY + bodyH * 0.66;
      ctx.beginPath();
      ctx.moveTo(-hw, seamY1); ctx.lineTo(hw, seamY1);
      ctx.moveTo(-hw, seamY2); ctx.lineTo(hw, seamY2);
      ctx.stroke();

      // 4. ARCHED / DOMED CHEST LID WITH OVERHANG
      const lidY = bodyY - lidH;
      const lidW = hw + 3; // Slight overhang past chest body

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-lidW, bodyY);
      ctx.quadraticCurveTo(0, lidY - 4, lidW, bodyY);
      ctx.lineTo(lidW, bodyY + 3);
      ctx.lineTo(-lidW, bodyY + 3);
      ctx.closePath();

      // Lid gradient/shading
      ctx.fillStyle = theme.lidTop;
      ctx.fill();
      ctx.strokeStyle = theme.plankLine;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // Lid rim highlight strip (giving 3D lip illusion)
      ctx.fillStyle = theme.trimAccent;
      ctx.fillRect(-lidW, bodyY - 1, lidW * 2, 3);

      // 5. REINFORCED METAL CORNER BRACKETS & VERTICAL BANDS
      const bandW = Math.max(3.5, hw * 0.22);
      const bandL = -hw + hw * 0.28;
      const bandR = hw - hw * 0.28 - bandW;

      ctx.fillStyle = theme.trim;
      // Left vertical iron/gold strap
      ctx.fillRect(bandL, bodyY, bandW, bodyH);
      // Right vertical iron/gold strap
      ctx.fillRect(bandR, bodyY, bandW, bodyH);

      // Left and right outer corner plates
      const cornerW = 4;
      ctx.fillStyle = theme.trim;
      ctx.fillRect(-hw, bodyY, cornerW, bodyH);
      ctx.fillRect(hw - cornerW, bodyY, cornerW, bodyH);
      ctx.fillRect(-hw, bodyY + bodyH - 3, hw * 2, 3); // Bottom reinforcement bar

      // Trim rim borders
      ctx.strokeStyle = theme.trimAccent;
      ctx.lineWidth = 1.0;
      ctx.strokeRect(-hw, bodyY, hw * 2, bodyH);

      // 6. METALLIC RIVETS (Studs on straps and corner brackets)
      ctx.fillStyle = theme.rivet;
      const rivetRows = [bodyY + 4, bodyY + bodyH * 0.5, bodyY + bodyH - 5];
      const rivetCols = [bandL + bandW / 2, bandR + bandW / 2, -hw + 2, hw - 2];
      for (const ry of rivetRows) {
        for (const rx of rivetCols) {
          ctx.beginPath();
          ctx.arc(rx, ry, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 7. ORNATE CENTER HASP, LOCK & EMBEDDED GEM/RUNE
      const lockY = bodyY;
      const lockW = 10;
      const lockH = 12;

      // Lock Backplate (Hasp)
      ctx.fillStyle = theme.trim;
      ctx.strokeStyle = theme.trimAccent;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.rect(-lockW / 2, lockY - 3, lockW, lockH);
      ctx.fill();
      ctx.stroke();

      // Central Glowing Gem / Lock Core
      ctx.save();
      ctx.shadowColor = theme.latchGlow;
      ctx.shadowBlur = 8 * pulse;
      ctx.fillStyle = theme.latch;

      if (theme.rune === 'skull') {
        // Pirate Gold Skull emblem
        ctx.beginPath();
        ctx.arc(0, lockY + 2, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(-1.5, lockY + 1.2, 1, 1);
        ctx.fillRect(0.5, lockY + 1.2, 1, 1);
      } else if (theme.rune === 'eye') {
        // Abyssal Glowing Eye
        ctx.beginPath();
        ctx.ellipse(0, lockY + 2.5, 4.2, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fdf4ff';
        ctx.beginPath();
        ctx.arc(0, lockY + 2.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (theme.rune === 'star') {
        // Celestial Starlight Core with 4-point star
        ctx.beginPath();
        ctx.arc(0, lockY + 2.5, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, lockY - 1);
        ctx.lineTo(1, lockY + 2.5);
        ctx.lineTo(4.5, lockY + 2.5);
        ctx.lineTo(1, lockY + 3.5);
        ctx.lineTo(0, lockY + 7);
        ctx.lineTo(-1, lockY + 3.5);
        ctx.lineTo(-4.5, lockY + 2.5);
        ctx.lineTo(-1, lockY + 2.5);
        ctx.closePath();
        ctx.fill();

        // Orbiting Cosmic Ring for Rank 5
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, lockY + 2.5, 7.5, 3, t * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Classic Keyhole
        ctx.fillStyle = theme.latch;
        ctx.beginPath();
        ctx.arc(0, lockY + 1.5, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, lockY + 1.2, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-0.8, lockY + 1.5, 1.6, 2.8);
      }
      ctx.restore();

      // Top Lid Rank Crest Gem for high ranks (Rank 3+)
      if (rank >= 3) {
        ctx.save();
        ctx.shadowColor = theme.latchGlow;
        ctx.shadowBlur = (rank === 5 ? 12 : 8) * pulse;
        ctx.fillStyle = rank === 5 ? '#38bdf8' : rank === 4 ? '#c084fc' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, lidY - 2, rank === 5 ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else if (this.category === 'fossil') {
      // PREHISTORIC FOSSILS
      if (this.id === 'fossil_trilobite') {
        // Trilobite Carapace
        ctx.fillStyle = '#71717a';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Segments
        ctx.strokeStyle = '#d4d4d8';
        ctx.lineWidth = 1.8;
        for (let i = -10; i <= 10; i += 5) {
          ctx.beginPath();
          ctx.moveTo(-10, i);
          ctx.lineTo(10, i);
          ctx.stroke();
        }
      } else if (this.id === 'fossil_ammonite') {
        // Spiral Ammonite
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 5; a += 0.2) {
          const r = 2 + a * 0.8;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      } else if (this.id === 'fossil_megalodon') {
        // Megalodon Giant Triangular Tooth
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.lineTo(-14, -12);
        ctx.lineTo(14, -12);
        ctx.closePath();
        ctx.fill();

        // Root gum enamel
        ctx.fillStyle = '#475569';
        ctx.fillRect(-15, -16, 30, 6);
      } else if (this.id === 'fossil_pliosaur') {
        // Pliosaur Marine Skull
        ctx.fillStyle = '#57534e';
        ctx.beginPath();
        ctx.moveTo(-16, -6);
        ctx.lineTo(16, 0);
        ctx.lineTo(-12, 12);
        ctx.closePath();
        ctx.fill();

        // Eye socket cavity
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(-4, -1, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Atlantean Crystal Keystone
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(14, 0);
        ctx.lineTo(0, 18);
        ctx.lineTo(-14, 0);
        ctx.closePath();
        ctx.fill();

        // Glyphs
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      // STANDARD SUNKEN TREASURES
      if (this.id === 'pirate_chest' || this.id === 'royal_relic') {
        const isRoyal = this.id === 'royal_relic';
        ctx.fillStyle = isRoyal ? '#b45309' : '#78350f';
        ctx.fillRect(-15, -10, 30, 20);

        ctx.fillStyle = isRoyal ? '#fef08a' : '#facc15';
        ctx.fillRect(-15, -10, 30, 4);
        ctx.fillRect(-15, 6, 30, 4);
        ctx.fillRect(-3, -4, 6, 8); // Lock
      } else if (this.id === 'ocean_heart') {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(12, -4);
        ctx.lineTo(0, 14);
        ctx.lineTo(-12, -4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(6, -4);
        ctx.lineTo(0, 10);
        ctx.closePath();
        ctx.fill();
      } else if (this.id === 'giant_pearl') {
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(0, 4, 14, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, -2, 7, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.id === 'coin_bag') {
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(0, 4, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#854d0e';
        ctx.fillRect(-4, -10, 8, 4);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('$', 0, 7);
      } else if (this.id === 'bottle') {
        ctx.fillStyle = 'rgba(134, 239, 172, 0.75)';
        ctx.fillRect(-6, -8, 12, 18);
        ctx.fillRect(-3, -13, 6, 5);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-3, -15, 6, 3);
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(-4, -4, 8, 10);
      } else {
        // Iridescent Shell
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(0, 2, 11, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 1;
        for (let i = -8; i <= 8; i += 4) {
          ctx.beginPath();
          ctx.moveTo(0, 2);
          ctx.lineTo(i, -9);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
    ctx.restore();
  }
}

