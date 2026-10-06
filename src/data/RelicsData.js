import { REALM_PROFILES } from './RealmContent.js';
import { FANTASY_SEAS } from '../entities/SeasData.js';
// RelicsData.js — Archaeological artifacts dredged from the seafloor
// Each relic has barnacle grime that the player brushes away at the Restoration Desk

export const RELIC_TYPES = [
  {
    id: 'brass_compass',
    name: 'Barnacled Brass Compass',
    icon: '🧭',
    era: 'c. 1720',
    description: 'A navigator\'s compass with a hand-engraved rose. The needle still trembles toward magnetic north.',
    grimeLevel: 3,
    restoredValue: 1800,
    rawValue: 280,
    rarity: 'uncommon',
    minDepth: 80,
    maxDepth: 300,
    shelfSlot: 'compass',
    drawRestored(ctx, t) {
      // Brass disc body
      ctx.fillStyle = '#d97706';
      ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2; ctx.stroke();
      // Glass face
      ctx.fillStyle = 'rgba(186,230,253,0.4)';
      ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.fill();
      // Rose lines
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
        ctx.stroke();
      }
      // Needle
      const needleAngle = Math.PI * 0.15 + Math.sin(t * 0.8) * 0.04;
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(needleAngle) * 13, Math.sin(needleAngle) * 13);
      ctx.stroke();
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-Math.cos(needleAngle) * 9, -Math.sin(needleAngle) * 9);
      ctx.stroke();
    },
  },
  {
    id: 'diving_helmet',
    name: 'Antique Diving Helmet',
    icon: '🪖',
    era: 'c. 1890',
    description: 'A copper and brass diving helmet from the era of hard-hat diving. Porthole glass still intact.',
    grimeLevel: 4,
    restoredValue: 3200,
    rawValue: 450,
    rarity: 'rare',
    minDepth: 120,
    maxDepth: 380,
    shelfSlot: 'helmet',
    drawRestored(ctx, t) {
      // Dome
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(0, -8, 20, Math.PI, 0);
      ctx.fill();
      // Neck ring
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-20, -10, 40, 10);
      // Porthole
      ctx.fillStyle = 'rgba(186,230,253,0.6)';
      ctx.beginPath(); ctx.ellipse(-2, -10, 9, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2.5; ctx.stroke();
      // Cross bars on porthole
      ctx.beginPath();
      ctx.moveTo(-11, -10); ctx.lineTo(7, -10);
      ctx.moveTo(-2, -18); ctx.lineTo(-2, -2);
      ctx.stroke();
      // Air valve
      ctx.fillStyle = '#d97706';
      ctx.beginPath(); ctx.arc(12, -20, 4, 0, Math.PI * 2); ctx.fill();
    },
  },
  {
    id: 'pirate_doubloon',
    name: 'Pirate Doubloon Cache',
    icon: '🪙',
    era: 'c. 1680',
    description: 'A cluster of Spanish gold doubloons fused together by centuries of seawater. Markings still visible.',
    grimeLevel: 2,
    restoredValue: 2500,
    rawValue: 650,
    rarity: 'rare',
    minDepth: 60,
    maxDepth: 240,
    shelfSlot: 'doubloon',
    drawRestored(ctx, t) {
      // Coin stack
      for (let i = 3; i >= 0; i--) {
        ctx.fillStyle = i % 2 === 0 ? '#eab308' : '#d97706';
        ctx.beginPath(); ctx.ellipse(i * 1.5, -i * 2, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#92400e'; ctx.lineWidth = 1; ctx.stroke();
      }
      // Cross on top coin
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-8, -8); ctx.lineTo(8, -8);
      ctx.moveTo(0, -14); ctx.lineTo(0, -2);
      ctx.stroke();
      // Shimmer
      const shimmer = Math.abs(Math.sin(t * 1.5));
      ctx.fillStyle = `rgba(254,240,138,${shimmer * 0.4})`;
      ctx.beginPath(); ctx.ellipse(4, -8, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
    },
  },
  {
    id: 'porcelain_tea_set',
    name: 'Porcelain Tea Set Fragment',
    icon: '🫖',
    era: 'c. 1850',
    description: 'Blue willow pattern porcelain from a merchant vessel\'s cargo. The teapot handle is still intact.',
    grimeLevel: 3,
    restoredValue: 1500,
    rawValue: 220,
    rarity: 'uncommon',
    minDepth: 50,
    maxDepth: 200,
    shelfSlot: 'teapot',
    drawRestored(ctx, t) {
      // Teapot body
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(-4, 0, 18, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1.5; ctx.stroke();
      // Blue willow pattern lines
      ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(-4, 0, 10, -Math.PI * 0.6, Math.PI * 0.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-4, 2, 6, Math.PI * 0.8, Math.PI * 2);
      ctx.stroke();
      // Spout
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(14, -4); ctx.lineTo(22, -8); ctx.lineTo(22, -4); ctx.lineTo(14, 2);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1; ctx.stroke();
      // Handle
      ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(-22, 0, 8, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(-22, 0, 8, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
      // Lid
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.ellipse(-4, -14, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath(); ctx.arc(-4, -18, 2.5, 0, Math.PI * 2); ctx.fill();
    },
  },
  {
    id: 'astrolabe',
    name: 'Medieval Brass Astrolabe',
    icon: '⚙️',
    era: 'c. 1540',
    description: 'An instrument for celestial navigation, cast in brass. The mater and rete plates are remarkably preserved.',
    grimeLevel: 5,
    restoredValue: 4800,
    rawValue: 360,
    rarity: 'epic',
    minDepth: 200,
    maxDepth: 450,
    shelfSlot: 'astrolabe',
    drawRestored(ctx, t) {
      // Outer ring
      ctx.strokeStyle = '#d97706'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.stroke();
      // Inner rete ring
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke();
      // Alidade arm
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-20 * Math.cos(t * 0.2), -20 * Math.sin(t * 0.2));
      ctx.lineTo(20 * Math.cos(t * 0.2), 20 * Math.sin(t * 0.2));
      ctx.stroke();
      // Latitude lines
      ctx.strokeStyle = 'rgba(251,191,36,0.5)'; ctx.lineWidth = 1;
      for (let l = -2; l <= 2; l++) {
        ctx.beginPath(); ctx.moveTo(-14, l * 4); ctx.lineTo(14, l * 4); ctx.stroke();
      }
      // Center pivot
      ctx.fillStyle = '#d97706';
      ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill();
      // Throne (suspension ring)
      ctx.strokeStyle = '#92400e'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, -25, 5, Math.PI, 0); ctx.stroke();
    },
  },
];

export const RELIC_SPAWN = {
  minDepth: 50,
  spawnChance: 0.18,
};


const realmRelicNames = [
  ['Coral Navigator Compass', 'Pearl Diver Memorial'],
  ['Lantern Keeper Lens', 'Sporeglass Pilgrim Seal'],
  ['Fallen Observatory Astrolabe', 'Moonwatcher Star Map'],
  ['Atlantean Coronation Seal', 'Imperial Clockwork Heart'],
  ['Skyfarer Wind Compass', 'Aether Harp Fragment'],
  ['Caldera Forge Dial', 'Obsidian Dragon Tablet'],
  ['Chrononaut Memory Compass', 'Last Epoch Testament'],
];
const relicTemplates = [...RELIC_TYPES];
export const REALM_RELICS = FANTASY_SEAS.flatMap(sea => realmRelicNames[sea.id - 1].map((name, i) => ({
  ...relicTemplates[i % relicTemplates.length],
  id: `realm_${sea.id}_relic_${i}`, name, zone: sea.id,
  era: `${sea.name} antiquity`,
  description: `A lost relic from the ${REALM_PROFILES[sea.id].habitat}. Clean away the encrusted sediment to reveal its history.`,
  rawValue: REALM_PROFILES[sea.id].commonValue * (35 + i * 35),
  restoredValue: REALM_PROFILES[sea.id].commonValue * (175 + i * 175),
  minDepth: 10 + Math.round(sea.maxDepth * (0.1 + i * 0.25)), maxDepth: sea.maxDepth,
})));
RELIC_TYPES.push(...REALM_RELICS);
