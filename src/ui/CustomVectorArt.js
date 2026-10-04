// CustomVectorArt.js — Detailed, bespoke vector illustrations for shop items, realm destinations, radio stations, and journal exhibits

/**
 * Helper to wrap SVG content with standard viewbox and styles
 */
function svgWrap(content, viewBox = '0 0 48 48', extraClass = '') {
  return `<svg class="custom-vector-art ${extraClass}" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${content}</svg>`;
}

/**
 * 1. UPGRADE SHOP ART
 */
export const SHOP_ART = {
  // Line Length: Spool of shimmering high-tensile braided nylon and steel filament
  lineLength: svgWrap(`
    <defs>
      <linearGradient id="spoolRim" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <linearGradient id="lineWrap" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#818cf8"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
    </defs>
    <!-- Back flange -->
    <ellipse cx="24" cy="14" rx="18" ry="6" fill="#0369a1" stroke="#38bdf8" stroke-width="1.5"/>
    <!-- Central spool cylinder with wound line -->
    <rect x="9" y="14" width="30" height="20" rx="3" fill="url(#lineWrap)"/>
    <!-- Thread winding texture -->
    <path d="M9 18h30M9 22h30M9 26h30M9 30h30" stroke="#bae6fd" stroke-width="1" stroke-opacity="0.65"/>
    <!-- Front flange -->
    <ellipse cx="24" cy="34" rx="18" ry="6" fill="url(#spoolRim)" stroke="#38bdf8" stroke-width="1.8"/>
    <!-- Spool spindle core -->
    <circle cx="24" cy="34" r="5" fill="#0f172a" stroke="#7dd3fc" stroke-width="1.2"/>
    <!-- Trailing glowing line -->
    <path d="M39 26c4 3 6 8 2 13-3 4-8 5-11 5" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2 1"/>
    <!-- Sparkle glint -->
    <circle cx="34" cy="18" r="1.5" fill="#ffffff"/>
  `),

  // Tackle Capacity: Heavy woven coastal tackle basket / creel with brass clasp
  hookCapacity: svgWrap(`
    <defs>
      <linearGradient id="creelWicker" x1="0" y1="14" x2="0" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#d97706"/>
        <stop offset="100%" stop-color="#78350f"/>
      </linearGradient>
      <linearGradient id="creelLid" x1="0" y1="6" x2="0" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
    </defs>
    <!-- Leather shoulder strap -->
    <path d="M8 20C6 10 14 4 24 4s18 6 16 16" stroke="#92400e" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <!-- Basket main body -->
    <path d="M7 16h34l-3 24a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4L7 16z" fill="url(#creelWicker)" stroke="#451a03" stroke-width="1.5"/>
    <!-- Wicker weave cross-hatching -->
    <path d="M10 22h28M9 28h30M8 34h32M10 40h28" stroke="#fde68a" stroke-width="1" stroke-opacity="0.35"/>
    <path d="M16 16v26M24 16v26M32 16v26" stroke="#451a03" stroke-width="1" stroke-opacity="0.4"/>
    <!-- Creel lid -->
    <path d="M5 13a3 3 0 0 1 3-3h32a3 3 0 0 1 3 3v4H5v-4z" fill="url(#creelLid)" stroke="#78350f" stroke-width="1.5"/>
    <!-- Creel top drop slot -->
    <ellipse cx="24" cy="13" rx="7" ry="2" fill="#451a03"/>
    <!-- Brass buckle -->
    <rect x="22" y="18" width="4" height="6" rx="1" fill="#facc15" stroke="#78350f" stroke-width="1"/>
  `),

  // Reel Winch & Motor: Precision high-torque spinning reel with geared rotor
  reelPower: svgWrap(`
    <defs>
      <linearGradient id="reelMetal" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="50%" stop-color="#334155"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <linearGradient id="goldTrim" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#fde047"/>
        <stop offset="100%" stop-color="#ca8a04"/>
      </linearGradient>
    </defs>
    <!-- Rod mount foot -->
    <path d="M24 4v9M18 4h12" stroke="#64748b" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Gear housing body -->
    <circle cx="21" cy="24" r="11" fill="url(#reelMetal)" stroke="#38bdf8" stroke-width="1.5"/>
    <!-- Spool rotor -->
    <rect x="28" y="17" width="12" height="14" rx="2" fill="url(#goldTrim)" stroke="#78350f" stroke-width="1.2"/>
    <path d="M30 20h8M30 24h8M30 28h8" stroke="#ffffff" stroke-width="1" stroke-opacity="0.7"/>
    <!-- Bail wire -->
    <path d="M26 15c8-4 15 2 15 9s-7 13-15 9" stroke="#e2e8f0" stroke-width="1.8" fill="none"/>
    <!-- Crank arm -->
    <line x1="21" y1="24" x2="11" y2="33" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>
    <!-- Ergonomic handle knob -->
    <circle cx="10" cy="34" r="4.5" fill="#f59e0b" stroke="#78350f" stroke-width="1.2"/>
    <!-- High-torque electric lightning spark -->
    <path d="M19 19l2 3h-3l2 4" stroke="#38bdf8" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  // Reinforced Line: High-tension braided spectra weave with molecular bonds
  highTensionLine: svgWrap(`
    <defs>
      <linearGradient id="strandA" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
      <linearGradient id="strandB" x1="48" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#a855f7"/>
        <stop offset="100%" stop-color="#6366f1"/>
      </linearGradient>
    </defs>
    <!-- Intertwining braided ropes -->
    <path d="M6 10c8 6 12 14 20 14s12-8 16-14" stroke="url(#strandA)" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <path d="M6 38c8-6 12-14 20-14s12 8 16 14" stroke="url(#strandB)" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <path d="M6 24c6-4 12 0 18 0s12-4 18 0" stroke="#f8fafc" stroke-width="2" stroke-dasharray="3 2" fill="none"/>
    <!-- Tensile force stress nodes -->
    <circle cx="26" cy="24" r="4.5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
    <circle cx="14" cy="18" r="2.5" fill="#c084fc"/>
    <circle cx="38" cy="30" r="2.5" fill="#c084fc"/>
    <!-- Energy glow burst -->
    <path d="M26 15v3M26 30v3M17 24h3M32 24h3" stroke="#e0f2fe" stroke-width="1.5" stroke-linecap="round"/>
  `),

  // Hook Agility: Aerodynamic hydro-glider hook with steering vector fins
  hookAgility: svgWrap(`
    <defs>
      <linearGradient id="hookSteel" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="40%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>
    </defs>
    <!-- Hook top ring eyelet -->
    <circle cx="24" cy="8" r="4" fill="none" stroke="#38bdf8" stroke-width="2"/>
    <!-- Curved shank -->
    <path d="M24 12v14c0 8-6 14-14 14s-6-5-6-9c0-6 6-11 14-11" stroke="url(#hookSteel)" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <!-- Sharp barbed point -->
    <path d="M18 20l4-3-3 7" fill="#38bdf8" stroke="#0284c7" stroke-width="1"/>
    <!-- Hydrodynamic vector steering glider fins -->
    <path d="M24 15l10-4-3 7z" fill="#0284c7" stroke="#38bdf8" stroke-width="1"/>
    <path d="M24 23l12-3-4 8z" fill="#0284c7" stroke="#38bdf8" stroke-width="1"/>
    <!-- Speed/maneuver motion arcs -->
    <path d="M38 12c3 5 4 12 1 18" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2 2" fill="none"/>
    <path d="M42 16c2 4 2 9 0 13" stroke="#7dd3fc" stroke-width="1.4" stroke-linecap="round" fill="none"/>
  `),

  // Fishing Rod: Seven Seas carbon-fiber rod with gold guides and cork grip
  fishingRod: svgWrap(`
    <defs>
      <linearGradient id="rodBlank" x1="6" y1="42" x2="42" y2="6" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#451a03"/>
        <stop offset="35%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#38bdf8"/>
      </linearGradient>
    </defs>
    <!-- Rod blank shaft -->
    <line x1="8" y1="40" x2="38" y2="8" stroke="url(#rodBlank)" stroke-width="3" stroke-linecap="round"/>
    <!-- Cork handle -->
    <line x1="8" y1="40" x2="16" y2="32" stroke="#d97706" stroke-width="5" stroke-linecap="round"/>
    <!-- Reel seat & reel mounted -->
    <circle cx="18" cy="30" r="4.5" fill="#facc15" stroke="#78350f" stroke-width="1.2"/>
    <!-- Ceramic line guides -->
    <line x1="22" y1="24" x2="25" y2="21" stroke="#fbbf24" stroke-width="2"/>
    <line x1="29" y1="17" x2="32" y2="14" stroke="#fbbf24" stroke-width="1.8"/>
    <!-- Rod tip eyelet -->
    <circle cx="39" cy="7" r="2.5" fill="none" stroke="#facc15" stroke-width="1.5"/>
    <!-- Arching monofilament line with water spray -->
    <path d="M39 7Q44 14 36 28T14 38" stroke="#e0f2fe" stroke-width="1" stroke-dasharray="2 1" fill="none"/>
    <!-- Starlight prism sparkle -->
    <path d="M41 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="#fef08a"/>
  `),

  // Boat Vessel: Seafaring expedition vessel sailing over foaming blue crests
  boatVessel: svgWrap(`
    <defs>
      <linearGradient id="hullGrad" x1="0" y1="20" x2="0" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#92400e"/>
        <stop offset="100%" stop-color="#451a03"/>
      </linearGradient>
      <linearGradient id="sailGrad" x1="0" y1="4" x2="0" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#cbd5e1"/>
      </linearGradient>
    </defs>
    <!-- Ocean wave crests beneath -->
    <path d="M4 38c5-2 9 0 14 0s9-3 14 0 8 0 12 0" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    <!-- Wooden ship hull -->
    <path d="M6 30l4 8h28l6-10H6z" fill="url(#hullGrad)" stroke="#b45309" stroke-width="1.5"/>
    <!-- Brass trim stripe -->
    <path d="M8 32h34" stroke="#facc15" stroke-width="1.2"/>
    <!-- Main mast -->
    <line x1="22" y1="8" x2="22" y2="30" stroke="#78350f" stroke-width="2.5"/>
    <!-- Fore sail -->
    <path d="M22 9l14 13H22z" fill="url(#sailGrad)" stroke="#94a3b8" stroke-width="1"/>
    <!-- Jib / staysail -->
    <path d="M20 11L9 24h11z" fill="url(#sailGrad)" stroke="#94a3b8" stroke-width="1"/>
    <!-- Captain pennant flag -->
    <path d="M22 8l-6-3 6-3z" fill="#ef4444"/>
  `),

  // Abyssal Lantern: Brass cage lantern glowing with luminous deepwater amber
  abyssalLantern: svgWrap(`
    <defs>
      <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="rgba(217, 119, 6, 0)"/>
      </radialGradient>
    </defs>
    <!-- Radial ambient glow halo -->
    <circle cx="24" cy="26" r="16" fill="url(#lanternGlow)"/>
    <!-- Top hanger ring & cap -->
    <circle cx="24" cy="7" r="4" fill="none" stroke="#d97706" stroke-width="2"/>
    <path d="M16 14h16l-3-4H19l-3 4z" fill="#b45309" stroke="#78350f" stroke-width="1.2"/>
    <!-- Glass lantern chamber -->
    <rect x="15" y="14" width="18" height="20" rx="3" fill="rgba(254, 240, 138, 0.45)" stroke="#78350f" stroke-width="1.2"/>
    <!-- Protective brass cage ribs -->
    <line x1="19" y1="14" x2="19" y2="34" stroke="#b45309" stroke-width="1.5"/>
    <line x1="24" y1="14" x2="24" y2="34" stroke="#b45309" stroke-width="1.5"/>
    <line x1="29" y1="14" x2="29" y2="34" stroke="#b45309" stroke-width="1.5"/>
    <!-- Central luminescent flame core -->
    <ellipse cx="24" cy="25" rx="3" ry="5" fill="#ffffff"/>
    <!-- Heavy base -->
    <rect x="14" y="34" width="20" height="5" rx="2" fill="#78350f" stroke="#b45309" stroke-width="1.2"/>
  `),

  // Treasure Sonar: Sub-bottom radar array emitting acoustic pulse waves
  treasureSonar: svgWrap(`
    <defs>
      <linearGradient id="dishGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
    </defs>
    <!-- Sonar transmitter tripod mount -->
    <path d="M16 38l6-12M32 38l-6-12M22 26h4v12h-4z" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>
    <!-- Radar parabolic dish -->
    <path d="M14 16c6-8 14-8 20 0l-10 6z" fill="url(#dishGrad)" stroke="#0284c7" stroke-width="1.5"/>
    <!-- Transmitter feed horn -->
    <line x1="24" y1="19" x2="24" y2="12" stroke="#facc15" stroke-width="2"/>
    <circle cx="24" cy="11" r="2" fill="#facc15"/>
    <!-- Concentric radar pulse waves -->
    <path d="M17 7c4-3 10-3 14 0" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M12 4c8-4 16-4 24 0" stroke="#7dd3fc" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 1" fill="none"/>
    <!-- Sunken treasure ping blip -->
    <circle cx="36" cy="32" r="3" fill="#facc15" stroke="#ffffff" stroke-width="1"/>
    <path d="M36 26v2M36 36v2M30 32h2M40 32h2" stroke="#facc15" stroke-width="1"/>
  `),

  // Paleo Fossil Scanner: Prehistoric raptor fossil skull & resonance radar
  fossilRadar: svgWrap(`
    <defs>
      <linearGradient id="boneGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#ca8a04"/>
      </linearGradient>
    </defs>
    <!-- Prehistoric amber geological rock base -->
    <path d="M6 36l8-10 16-4 12 10-4 10H10z" fill="#451a03" stroke="#78350f" stroke-width="1.2"/>
    <!-- Ancient fossilized skull / jaw -->
    <path d="M14 26c2-8 10-14 20-12 6 1 9 6 8 10l-14 4-6 2-8-4z" fill="url(#boneGrad)" stroke="#854d0e" stroke-width="1.5"/>
    <!-- Eye socket orbit -->
    <circle cx="26" cy="19" r="3.5" fill="#1e293b"/>
    <!-- Serrated predator teeth -->
    <path d="M22 25l2 4 2-4 2 4 2-4 2 4" stroke="#fef9c3" stroke-width="1.5" fill="none"/>
    <!-- Geo-resonance scan grid lines -->
    <path d="M8 12c10-6 22-6 32 0" stroke="#22c55e" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M12 8c8-4 16-4 24 0" stroke="#86efac" stroke-width="1.2" stroke-dasharray="2 1" fill="none"/>
  `),

  // Lure Charm & Luck: Iridescent prism squid lure with feather streamers
  lureLuck: svgWrap(`
    <defs>
      <linearGradient id="lurePrism" x1="0" y1="6" x2="48" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#f43f5e"/>
        <stop offset="50%" stop-color="#a855f7"/>
        <stop offset="100%" stop-color="#38bdf8"/>
      </linearGradient>
    </defs>
    <!-- Gilded attachment ring -->
    <circle cx="24" cy="6" r="3" fill="none" stroke="#facc15" stroke-width="1.8"/>
    <!-- Minnow/Squid lure aerodynamic body -->
    <path d="M24 9c5 6 7 15 5 21-2 4-5 6-5 6s-3-2-5-6c-2-6 0-15 5-21z" fill="url(#lurePrism)" stroke="#ffffff" stroke-width="1.2"/>
    <!-- Lure big reflective 3D prism eye -->
    <circle cx="24" cy="16" r="3.5" fill="#facc15"/>
    <circle cx="24" cy="16" r="1.8" fill="#0f172a"/>
    <circle cx="25" cy="15" r="0.8" fill="#ffffff"/>
    <!-- Glittering skirt tentacles / streamers -->
    <path d="M21 34c-3 4-5 9-2 11" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M24 36v9" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/>
    <path d="M27 34c3 4 5 9 2 11" stroke="#c084fc" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <!-- Treble hook hanging below -->
    <path d="M22 41c0 3 2 5 4 5s4-2 4-5" stroke="#94a3b8" stroke-width="1.5" fill="none"/>
    <!-- Starlight sparkle charm -->
    <path d="M12 12l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#fef08a"/>
    <path d="M36 22l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#fef08a"/>
  `),

  // Line Armor: Aegis energy shield deflecting underwater hazard spines
  lineArmor: svgWrap(`
    <defs>
      <linearGradient id="shieldGrad" x1="0" y1="4" x2="0" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#1e40af"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <!-- Aegis crest shield body -->
    <path d="M24 4L8 10v14c0 12 10 20 16 22 6-2 16-10 16-22V10L24 4z" fill="url(#shieldGrad)" stroke="#7dd3fc" stroke-width="2"/>
    <!-- Inner reinforced border -->
    <path d="M24 9l-11 4v11c0 9 7 15 11 17 4-2 11-8 11-17V13L24 9z" stroke="#38bdf8" stroke-width="1.2" stroke-opacity="0.6" fill="none"/>
    <!-- Central heraldic anchor / hook emblem -->
    <path d="M24 16v14m-6-6c2 6 10 6 12 0" stroke="#facc15" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <circle cx="24" cy="16" r="2.5" fill="#facc15"/>
    <!-- Deflection energy sparkles -->
    <circle cx="10" cy="12" r="1.5" fill="#ffffff"/>
    <circle cx="38" cy="14" r="1.5" fill="#ffffff"/>
  `),

  // Seabed Drift Pots: Heavy timber & wire lobster/crab trap cage
  seabedTraps: svgWrap(`
    <defs>
      <linearGradient id="trapWood" x1="0" y1="12" x2="0" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#b45309"/>
        <stop offset="100%" stop-color="#78350f"/>
      </linearGradient>
    </defs>
    <!-- Half-round crab pot frame -->
    <path d="M8 38V22c0-7 7-12 16-12s16 5 16 12v16H8z" fill="url(#trapWood)" stroke="#451a03" stroke-width="2"/>
    <!-- Wire mesh netting grid -->
    <path d="M12 16h24M9 22h30M8 28h32M8 34h32" stroke="#cbd5e1" stroke-width="1" stroke-opacity="0.45"/>
    <path d="M16 12v26M24 10v28M32 12v26" stroke="#451a03" stroke-width="1.8"/>
    <!-- Inverted funnel entrance -->
    <ellipse cx="24" cy="24" rx="5" ry="4" fill="#0f172a" stroke="#f59e0b" stroke-width="1.2"/>
    <!-- Little coastal crab resting inside -->
    <ellipse cx="24" cy="32" rx="4" ry="2.5" fill="#ef4444"/>
    <circle cx="22" cy="30" r="0.8" fill="#ffffff"/>
    <circle cx="26" cy="30" r="0.8" fill="#ffffff"/>
    <!-- Float buoy line attached -->
    <path d="M24 10c0-4 4-6 4-8" stroke="#facc15" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  `),

  // Personal Aquarium: Curved glass aquatic nano-tank with coral and tropical fish
  personalAquarium: svgWrap(`
    <defs>
      <linearGradient id="waterTank" x1="0" y1="8" x2="0" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
    </defs>
    <!-- Glass tank body -->
    <rect x="6" y="10" width="36" height="28" rx="6" fill="url(#waterTank)" fill-opacity="0.85" stroke="#7dd3fc" stroke-width="2"/>
    <!-- Sandy substrate bed -->
    <path d="M6 33c6 1 12-1 18 1s12 0 18-1v2a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-2z" fill="#fde047" stroke="#ca8a04" stroke-width="1"/>
    <!-- Red coral branch -->
    <path d="M12 33v-8m0 4l-3-3m3 1l3-3" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/>
    <!-- Swimming tropical clownfish -->
    <ellipse cx="26" cy="22" rx="6" ry="3.5" fill="#ea580c"/>
    <path d="M31 22l4-3v6z" fill="#ea580c"/>
    <path d="M26 18.5v7" stroke="#ffffff" stroke-width="1.5"/>
    <circle cx="23" cy="21" r="0.8" fill="#000000"/>
    <!-- Air bubbles rising -->
    <circle cx="34" cy="28" r="1.5" fill="#ffffff" fill-opacity="0.8"/>
    <circle cx="35" cy="22" r="2" fill="#ffffff" fill-opacity="0.8"/>
    <circle cx="33" cy="15" r="1.2" fill="#ffffff" fill-opacity="0.8"/>
  `),

  // Storage Tackle Box: Heavy dual-tier cantilever metal organizer
  tackleBox: svgWrap(`
    <defs>
      <linearGradient id="boxMetal" x1="0" y1="12" x2="0" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#059669"/>
        <stop offset="100%" stop-color="#064e3b"/>
      </linearGradient>
    </defs>
    <!-- Top carry handle -->
    <path d="M18 12V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" stroke="#e2e8f0" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <!-- Main tackle box container -->
    <rect x="6" y="14" width="36" height="26" rx="4" fill="url(#boxMetal)" stroke="#022c22" stroke-width="2"/>
    <!-- Top tray lid seam -->
    <line x1="6" y1="22" x2="42" y2="22" stroke="#34d399" stroke-width="1.8"/>
    <!-- Brass latches -->
    <rect x="14" y="20" width="4" height="6" rx="1" fill="#facc15" stroke="#78350f" stroke-width="1"/>
    <rect x="30" y="20" width="4" height="6" rx="1" fill="#facc15" stroke="#78350f" stroke-width="1"/>
    <!-- Bottom reinforced bumper feet -->
    <rect x="8" y="40" width="6" height="2" fill="#0f172a"/>
    <rect x="34" y="40" width="6" height="2" fill="#0f172a"/>
  `),

  // Nautical Astrolabe: Antique brass celestial navigation instrument
  nauticalAstrolabe: svgWrap(`
    <defs>
      <linearGradient id="brassGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#eab308"/>
        <stop offset="100%" stop-color="#854d0e"/>
      </linearGradient>
    </defs>
    <!-- Suspension throne ring -->
    <circle cx="24" cy="6" r="4" fill="none" stroke="url(#brassGrad)" stroke-width="2.2"/>
    <!-- Outer mater ring -->
    <circle cx="24" cy="26" r="18" fill="url(#brassGrad)" stroke="#78350f" stroke-width="2"/>
    <circle cx="24" cy="26" r="14" fill="#0f172a" stroke="#ca8a04" stroke-width="1.2"/>
    <!-- Rete web & celestial pointers -->
    <circle cx="24" cy="26" r="9" fill="none" stroke="#fef08a" stroke-width="1.2"/>
    <line x1="24" y1="12" x2="24" y2="40" stroke="#facc15" stroke-width="1"/>
    <line x1="10" y1="26" x2="38" y2="26" stroke="#facc15" stroke-width="1"/>
    <!-- Rotating alidade rule arm -->
    <line x1="12" y1="38" x2="36" y2="14" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="24" cy="26" r="3" fill="#ca8a04" stroke="#ffffff" stroke-width="1"/>
  `),

  // Maritime Radio: Shortwave fleet radio with dials, tubes & antenna
  maritimeRadio: svgWrap(`
    <defs>
      <linearGradient id="radioCase" x1="0" y1="14" x2="0" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#475569"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <!-- Telescoping antenna with broadcast wave arcs -->
    <line x1="12" y1="16" x2="7" y2="4" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
    <circle cx="7" cy="4" r="1.8" fill="#38bdf8"/>
    <path d="M3 2c3-2 6-2 9 0" stroke="#38bdf8" stroke-width="1.2" fill="none"/>
    <!-- Vintage metal radio casing -->
    <rect x="6" y="16" width="36" height="26" rx="4" fill="url(#radioCase)" stroke="#38bdf8" stroke-width="1.5"/>
    <!-- Speaker grille -->
    <circle cx="17" cy="29" r="8" fill="#1e293b" stroke="#64748b" stroke-width="1.2"/>
    <circle cx="17" cy="29" r="5" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2 1"/>
    <!-- Frequency tuner window -->
    <rect x="28" y="20" width="11" height="6" rx="1" fill="#0284c7" stroke="#7dd3fc" stroke-width="1"/>
    <line x1="33" y1="20" x2="33" y2="26" stroke="#ef4444" stroke-width="1.2"/>
    <!-- Tuning dials -->
    <circle cx="30" cy="33" r="3" fill="#cbd5e1" stroke="#334155" stroke-width="1"/>
    <circle cx="37" cy="33" r="2.5" fill="#cbd5e1" stroke="#334155" stroke-width="1"/>
  `),
};

/**
 * 2. SEVEN FANTASY SEAS REALM DESTINATION ART
 */
export const REALM_ART = {
  // Sea 1: Sunlit Shoals — Tropical turquoise atoll, palm island & golden sun
  1: svgWrap(`
    <defs>
      <linearGradient id="sea1Sky" x1="0" y1="0" x2="0" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    </defs>
    <!-- Sky backdrop & radiant sun -->
    <rect width="48" height="48" rx="10" fill="url(#sea1Sky)"/>
    <circle cx="36" cy="12" r="6" fill="#facc15" stroke="#fef08a" stroke-width="1.5"/>
    <!-- Distant sandy cay island -->
    <path d="M4 34c6-4 18-5 28-2 6 2 10 3 12 3v13H4V34z" fill="#fde047"/>
    <!-- Tropical coconut palms -->
    <path d="M18 34c1-6 4-13 8-15" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M26 19c-4-4-10-3-12-1m12 1c1-5 6-7 10-6m-10 7c3 4 8 5 11 3m-11-3c-3 5-7 7-10 6" stroke="#15803d" stroke-width="2" stroke-linecap="round"/>
    <!-- Turquoise shallow reef waves -->
    <path d="M0 38c7-2 15 2 24-1s16 2 24-1v12H0V38z" fill="#06b6d4" fill-opacity="0.9"/>
    <path d="M0 42c8-1 16 1 24 0s16 0 24-1v7H0v-6z" fill="#0284c7"/>
  `),

  // Sea 2: Bioluminescent Trench — Glowing photophore jellyfish & neon corals
  2: svgWrap(`
    <defs>
      <linearGradient id="sea2Deep" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#3b0764"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#sea2Deep)"/>
    <!-- Bioluminescent neon canyon walls -->
    <path d="M0 16l8 12-4 20H0zM48 12l-10 14 6 22h4z" fill="#0e7490" fill-opacity="0.6"/>
    <!-- Large glowing purple jellyfish -->
    <ellipse cx="24" cy="18" rx="9" ry="7" fill="#a855f7" fill-opacity="0.85" stroke="#c084fc" stroke-width="1.5"/>
    <ellipse cx="24" cy="16" rx="5" ry="3" fill="#f3e8ff"/>
    <!-- Floating neon tentacles -->
    <path d="M19 23c-2 6 2 12-1 17m3-17c1 7-2 12 1 18m3-18c2 7-1 13 2 18m3-17c2 5-2 11 1 16" stroke="#22d3ee" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <!-- Bioluminescent spore particles -->
    <circle cx="10" cy="24" r="1.5" fill="#22d3ee"/>
    <circle cx="38" cy="20" r="2" fill="#e879f9"/>
    <circle cx="34" cy="38" r="1.2" fill="#22d3ee"/>
  `),

  // Sea 3: Astral Shimmerfall — Cosmic constellations, falling meteor & stardust
  3: svgWrap(`
    <defs>
      <linearGradient id="sea3Night" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e1b4b"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#sea3Night)"/>
    <!-- Shooting star / meteor trail -->
    <path d="M4 10l20 12" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
    <path d="M4 10l12 7" stroke="#818cf8" stroke-width="3.5" stroke-linecap="round" stroke-opacity="0.4"/>
    <circle cx="24" cy="22" r="3" fill="#ffffff" stroke="#facc15" stroke-width="1"/>
    <!-- Constellation star cluster -->
    <circle cx="36" cy="10" r="1.5" fill="#ffffff"/>
    <circle cx="42" cy="18" r="1.8" fill="#fde047"/>
    <circle cx="34" cy="26" r="1.5" fill="#ffffff"/>
    <line x1="36" y1="10" x2="42" y2="18" stroke="#818cf8" stroke-width="0.8" stroke-dasharray="2 1"/>
    <line x1="42" y1="18" x2="34" y2="26" stroke="#818cf8" stroke-width="0.8" stroke-dasharray="2 1"/>
    <!-- Reflective starlit ocean tide -->
    <path d="M0 34c8-3 16 3 24 0s16 3 24 0v14H0V34z" fill="#312e81"/>
    <path d="M0 40c8-2 16 2 24 0s16 2 24 0v8H0v-8z" fill="#4338ca"/>
  `),

  // Sea 4: Sunken Atlantis — Submerged classical marble columns & emerald reef
  4: svgWrap(`
    <defs>
      <linearGradient id="sea4Atlan" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#064e3b"/>
        <stop offset="100%" stop-color="#022c22"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#sea4Atlan)"/>
    <!-- Classical temple arch pediment -->
    <path d="M8 18l16-8 16 8v3H8v-3z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
    <!-- Fluted marble columns -->
    <rect x="11" y="21" width="5" height="21" rx="1" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
    <rect x="21" y="21" width="6" height="21" rx="1" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
    <rect x="32" y="21" width="5" height="21" rx="1" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
    <!-- Sunken pedestal foundation -->
    <rect x="6" y="40" width="36" height="6" rx="2" fill="#e2e8f0" stroke="#64748b" stroke-width="1"/>
    <!-- Emerald current seafoam & kelp vine -->
    <path d="M10 42c3-8-2-16 2-22" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <circle cx="24" cy="14" r="2" fill="#facc15"/>
  `),

  // Sea 5: Whispering Aether Sea — Floating sky-island clouds & lilac horizon
  5: svgWrap(`
    <defs>
      <linearGradient id="sea5Aether" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#701a75"/>
        <stop offset="100%" stop-color="#1e1b4b"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#sea5Aether)"/>
    <!-- Floating sky-island landmass -->
    <path d="M12 24c4-3 18-3 24 0l-5 12c-4 4-10 4-14 0l-5-12z" fill="#4c1d95" stroke="#a21caf" stroke-width="1.5"/>
    <path d="M10 24c3-3 12-4 28 0" stroke="#f472b6" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Soft ethereal clouds drifting below -->
    <ellipse cx="14" cy="38" rx="10" ry="5" fill="#f5d0fe" fill-opacity="0.8"/>
    <ellipse cx="32" cy="36" rx="12" ry="6" fill="#f5d0fe" fill-opacity="0.8"/>
    <ellipse cx="24" cy="40" rx="14" ry="6" fill="#ffffff" fill-opacity="0.9"/>
    <!-- Celestial wind chimes / sparkle motes -->
    <circle cx="20" cy="14" r="1.8" fill="#fdf4ff"/>
    <circle cx="34" cy="12" r="2" fill="#f472b6"/>
  `),

  // Sea 6: Magma Caldera Trench — Smoldering volcano core, molten vents & basalt
  6: svgWrap(`
    <defs>
      <linearGradient id="sea6Magma" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#7f1d1d"/>
        <stop offset="100%" stop-color="#180404"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#sea6Magma)"/>
    <!-- Obsidian volcanic peak -->
    <path d="M8 44l12-24h8l12 24H8z" fill="#292524" stroke="#44403c" stroke-width="1.5"/>
    <!-- Glowing molten crater caldera -->
    <ellipse cx="24" cy="20" rx="6" ry="2.5" fill="#facc15" stroke="#ea580c" stroke-width="1.5"/>
    <!-- Cascading molten lava rivers -->
    <path d="M22 22l-4 12 3 10M26 22l3 9-2 13" stroke="#f97316" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M22 22l-4 12 3 10M26 22l3 9-2 13" stroke="#fef08a" stroke-width="1" stroke-linecap="round"/>
    <!-- Superheated volcanic ash & embers -->
    <circle cx="16" cy="12" r="1.5" fill="#fb923c"/>
    <circle cx="24" cy="8" r="2" fill="#facc15"/>
    <circle cx="32" cy="14" r="1.5" fill="#ef4444"/>
  `),

  // Sea 7: Eldritch Chrono Void — Time dilation vortex & prismatic aurora void
  7: svgWrap(`
    <defs>
      <linearGradient id="sea7Void" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#sea7Void)"/>
    <!-- Outer time dilation ring -->
    <circle cx="24" cy="24" r="18" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="4 2" stroke-opacity="0.8" fill="none"/>
    <circle cx="24" cy="24" r="12" stroke="#c084fc" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>
    <!-- Event horizon black hole core -->
    <circle cx="24" cy="24" r="7" fill="#030712" stroke="#67e8f9" stroke-width="2"/>
    <!-- Curved spacetime warp spirals -->
    <path d="M24 6c10 0 18 8 18 18m-36 0c0 10 8 18 18 18" stroke="#a855f7" stroke-width="2" stroke-linecap="round" fill="none"/>
    <circle cx="24" cy="24" r="2.5" fill="#ffffff"/>
  `),
};

/**
 * 3. COASTAL RADIO STATION ART
 */
export const RADIO_ART = {
  harbor_breeze: svgWrap(`
    <defs>
      <linearGradient id="rad1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#rad1)"/>
    <!-- Acoustic guitar body -->
    <ellipse cx="21" cy="30" rx="9" ry="11" fill="#d97706" stroke="#78350f" stroke-width="1.5"/>
    <ellipse cx="21" cy="18" rx="6" ry="7" fill="#f59e0b" stroke="#78350f" stroke-width="1.5"/>
    <circle cx="21" cy="24" r="3.5" fill="#451a03"/>
    <!-- Guitar neck & headstock -->
    <rect x="19" y="4" width="4" height="12" fill="#78350f"/>
    <!-- Gentle musical notes floating -->
    <path d="M34 10v8m0 0a3 3 0 1 1-3-3h3m0-5h6v8m0 0a3 3 0 1 1-3-3h3" stroke="#fef08a" stroke-width="1.8" fill="none"/>
  `),

  rainy_lighthouse: svgWrap(`
    <defs>
      <linearGradient id="rad2" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#rad2)"/>
    <!-- Lighthouse tower -->
    <path d="M18 44l4-30h8l4 30H18z" fill="#f8fafc" stroke="#475569" stroke-width="1.5"/>
    <rect x="20" y="24" width="8" height="6" fill="#ef4444"/>
    <rect x="19" y="36" width="10" height="6" fill="#ef4444"/>
    <!-- Lantern room & glowing beam -->
    <rect x="21" y="9" width="6" height="5" fill="#facc15" stroke="#78350f" stroke-width="1"/>
    <!-- Rotating light beacon rays -->
    <path d="M27 11l17-6v10z" fill="#fef08a" fill-opacity="0.6"/>
    <!-- Rain streaks -->
    <line x1="8" y1="14" x2="6" y2="22" stroke="#93c5fd" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="14" y1="28" x2="12" y2="36" stroke="#93c5fd" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="38" y1="24" x2="36" y2="32" stroke="#93c5fd" stroke-width="1.5" stroke-linecap="round"/>
  `),

  deep_blue: svgWrap(`
    <defs>
      <linearGradient id="rad3" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#0c4a6e"/>
        <stop offset="100%" stop-color="#082f49"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#rad3)"/>
    <!-- Deep blue underwater resonance spheres / bubbles -->
    <circle cx="24" cy="24" r="14" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="3 2" fill="none"/>
    <circle cx="24" cy="24" r="8" fill="#0284c7" stroke="#7dd3fc" stroke-width="1.5"/>
    <circle cx="22" cy="22" r="2.5" fill="#ffffff" fill-opacity="0.8"/>
    <circle cx="36" cy="14" r="4" fill="#38bdf8" fill-opacity="0.4"/>
    <circle cx="12" cy="34" r="3" fill="#38bdf8" fill-opacity="0.4"/>
  `),

  peaceful_lagoon: svgWrap(`
    <defs>
      <linearGradient id="rad4" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#0d9488"/>
        <stop offset="100%" stop-color="#115e59"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#rad4)"/>
    <!-- Peaceful white coastal dove over calm ripples -->
    <path d="M14 26c4-6 10-8 16-6l6-4c-2 6-4 10-2 14-4 2-12 2-20-4z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
    <path d="M22 22c3-4 8-6 12-4" stroke="#94a3b8" stroke-width="1.5" fill="none"/>
    <!-- Water ripples -->
    <path d="M6 38c8-2 16 2 24 0s12-2 14 0" stroke="#5eead4" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  `),

  zen_meditation: svgWrap(`
    <defs>
      <linearGradient id="rad5" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#4c1d95"/>
        <stop offset="100%" stop-color="#2e1065"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#rad5)"/>
    <!-- Lotus blossom / meditative ocean chime -->
    <path d="M24 16c4 6 5 14 0 18-5-4-4-12 0-18z" fill="#e879f9" stroke="#f5d0fe" stroke-width="1.2"/>
    <path d="M24 24c6-4 13-3 14 3-5 5-11 2-14-3z" fill="#c084fc" stroke="#f5d0fe" stroke-width="1.2"/>
    <path d="M24 24c-6-4-13-3-14 3 5 5 11 2 14-3z" fill="#c084fc" stroke="#f5d0fe" stroke-width="1.2"/>
    <circle cx="24" cy="35" r="2.5" fill="#facc15"/>
    <!-- Harmonic chime rings -->
    <circle cx="24" cy="24" r="17" stroke="#d8b4fe" stroke-width="1" stroke-dasharray="2 3" fill="none"/>
  `),

  tropical_solitude: svgWrap(`
    <defs>
      <linearGradient id="rad6" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#ea580c"/>
        <stop offset="100%" stop-color="#9a3412"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#rad6)"/>
    <!-- Warm sunset tropical palm silhouette -->
    <circle cx="24" cy="22" r="10" fill="#facc15"/>
    <path d="M16 42c2-8 6-16 12-18" stroke="#431407" stroke-width="3" stroke-linecap="round"/>
    <path d="M28 24c-4-5-10-4-12-2m12 2c1-6 7-8 11-7m-11 8c3 4 8 5 11 3" stroke="#431407" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M4 42h40" stroke="#7c2d12" stroke-width="3"/>
  `),

  ocean_waves: svgWrap(`
    <defs>
      <linearGradient id="rad7" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#rad7)"/>
    <!-- Rhythmic swelling coastal surf crests -->
    <path d="M4 22c6-6 12-6 18 0s12 6 18 0" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M8 30c6-6 12-6 18 0s12 6 18 0" stroke="#7dd3fc" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M4 38c6-4 12-4 18 0s12 4 18 0" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none"/>
  `),

  midnight_current: svgWrap(`
    <defs>
      <linearGradient id="rad8" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#rad8)"/>
    <!-- Crescent moon and nocturnal current -->
    <path d="M28 8a12 12 0 1 0 12 12 10 10 0 0 1-12-12z" fill="#facc15" stroke="#fef08a" stroke-width="1.2"/>
    <path d="M6 34c8-4 18 4 26 0s8-3 12-1" stroke="#818cf8" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M4 40c8-4 18 4 26 0s8-3 12-1" stroke="#c7d2fe" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <circle cx="14" cy="14" r="1.2" fill="#ffffff"/>
  `),
};

/**
 * 4. FIELD JOURNAL & LOGBOOK TAB ART
 */
export const JOURNAL_TAB_ART = {
  // Angler's Almanac book
  almanac: svgWrap(`
    <path d="M8 8h14a4 4 0 0 1 4 4v26a3 3 0 0 0-4-3H8V8z" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
    <path d="M40 8H26a4 4 0 0 0-4 4v26a3 3 0 0 1 4-3h14V8z" fill="#0369a1" stroke="#38bdf8" stroke-width="1.5"/>
    <path d="M26 12v26M12 14h8M12 18h8M12 22h6M28 14h8M28 18h8" stroke="#e0f2fe" stroke-width="1.2" stroke-linecap="round"/>
  `, '0 0 48 48'),

  // Trophy Scoreboard
  scoreboard: svgWrap(`
    <path d="M14 8h20v14a10 10 0 0 1-20 0V8z" fill="#f59e0b" stroke="#ca8a04" stroke-width="1.5"/>
    <path d="M14 12H8a4 4 0 0 0 0 8h6M34 12h6a4 4 0 0 1 0 8h-6" stroke="#ca8a04" stroke-width="2" fill="none"/>
    <path d="M24 32v6M16 42h16" stroke="#ca8a04" stroke-width="3" stroke-linecap="round"/>
    <circle cx="24" cy="16" r="3" fill="#fef08a"/>
  `, '0 0 48 48'),

  // Personal Aquarium
  aquarium: svgWrap(`
    <rect x="8" y="10" width="32" height="26" rx="5" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
    <ellipse cx="22" cy="22" rx="5" ry="3" fill="#ea580c"/>
    <path d="M26 22l3-2v4z" fill="#ea580c"/>
    <circle cx="30" cy="18" r="1.5" fill="#ffffff"/>
    <circle cx="31" cy="25" r="1.2" fill="#ffffff"/>
  `, '0 0 48 48'),

  // Vessel Crew
  crew: svgWrap(`
    <!-- Paw print -->
    <ellipse cx="24" cy="28" rx="8" ry="6" fill="#38bdf8"/>
    <circle cx="14" cy="18" r="3.5" fill="#38bdf8"/>
    <circle cx="21" cy="13" r="3.5" fill="#38bdf8"/>
    <circle cx="27" cy="13" r="3.5" fill="#38bdf8"/>
    <circle cx="34" cy="18" r="3.5" fill="#38bdf8"/>
  `, '0 0 48 48'),

  // Cabin Shelf Relics
  relics: svgWrap(`
    <!-- Ancient amphora vase -->
    <path d="M18 10h12l-2 8c4 4 6 10 4 16-2 5-6 6-8 6s-6-1-8-6c-2-6 0-12 4-16l-2-8z" fill="#d97706" stroke="#78350f" stroke-width="1.5"/>
    <path d="M16 14c-4 2-5 6-3 9s5 2 5-1m14-8c4 2 5 6 3 9s-5 2-5-1" stroke="#b45309" stroke-width="1.5" fill="none"/>
  `, '0 0 48 48'),

  // Fossil Workshop
  fossils: svgWrap(`
    <!-- Prehistoric bone -->
    <path d="M12 16a4 4 0 0 0-6 4 4 4 0 0 0 6 4l20 8a4 4 0 0 0 6-4 4 4 0 0 0-6-4l-20-8z" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
    <circle cx="10" cy="17" r="2.5" fill="#ca8a04"/>
    <circle cx="38" cy="31" r="2.5" fill="#ca8a04"/>
  `, '0 0 48 48'),

  // Seabed Traps
  traps: svgWrap(`
    <path d="M10 36V22c0-6 6-10 14-10s14 4 14 10v14H10z" fill="#b45309" stroke="#451a03" stroke-width="1.5"/>
    <line x1="14" y1="18" x2="34" y2="18" stroke="#cbd5e1" stroke-width="1"/>
    <line x1="10" y1="26" x2="38" y2="26" stroke="#cbd5e1" stroke-width="1"/>
    <circle cx="24" cy="24" r="3.5" fill="#0f172a" stroke="#f59e0b" stroke-width="1"/>
  `, '0 0 48 48'),

  // Relic Museum
  museum: svgWrap(`
    <!-- Classical museum colonnade -->
    <path d="M6 14l18-8 18 8v3H6v-3z" fill="#f8fafc" stroke="#64748b" stroke-width="1.2"/>
    <rect x="10" y="17" width="4" height="20" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
    <rect x="18" y="17" width="4" height="20" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
    <rect x="26" y="17" width="4" height="20" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
    <rect x="34" y="17" width="4" height="20" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
    <rect x="6" y="37" width="36" height="5" fill="#e2e8f0" stroke="#64748b" stroke-width="1"/>
  `, '0 0 48 48'),
};

/**
 * 5. CREW PET PORTRAIT ART (Cat, Pelican, Dolphin, Shark)
 */
export const CREW_ART = {
  cat: svgWrap(`
    <!-- Warm calico cat portrait -->
    <ellipse cx="24" cy="26" rx="14" ry="12" fill="#ea580c"/>
    <ellipse cx="24" cy="30" rx="9" ry="7" fill="#f8fafc"/>
    <!-- Cat ears -->
    <path d="M13 18l-5-10 10 5z" fill="#c2410c" stroke="#7c2d12" stroke-width="1"/>
    <path d="M35 18l5-10-10 5z" fill="#c2410c" stroke="#7c2d12" stroke-width="1"/>
    <!-- Cute blinking eyes -->
    <ellipse cx="19" cy="24" rx="2.5" ry="3.5" fill="#15803d"/>
    <ellipse cx="29" cy="24" rx="2.5" ry="3.5" fill="#15803d"/>
    <circle cx="19" cy="23" r="1" fill="#ffffff"/>
    <circle cx="29" cy="23" r="1" fill="#ffffff"/>
    <!-- Nose & whiskers -->
    <polygon points="24,28 22,26 26,26" fill="#f43f5e"/>
    <line x1="16" y1="28" x2="6" y2="26" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="16" y1="31" x2="7" y2="33" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="32" y1="28" x2="42" y2="26" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="32" y1="31" x2="41" y2="33" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
  `),

  pelican: svgWrap(`
    <!-- Evan the Seafarer Pelican -->
    <ellipse cx="22" cy="26" rx="13" ry="11" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
    <!-- Wing shoulder -->
    <path d="M12 24c4-4 10-3 12 5l-8 5z" fill="#94a3b8"/>
    <!-- Cute eye -->
    <circle cx="28" cy="18" r="2.5" fill="#0f172a"/>
    <circle cx="29" cy="17" r="0.9" fill="#ffffff"/>
    <!-- Distinctive long yellow bill & throat pouch -->
    <path d="M26 20h14c4 0 6 3 3 5l-11 5c-3 1-6-4-6-10z" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>
    <path d="M30 26c3 5 8 5 11 0" stroke="#d97706" stroke-width="1.2" fill="none"/>
  `),

  dolphin: svgWrap(`
    <!-- Gracie the Dolphin cute portrait -->
    <path d="M10 28c3-10 14-16 26-10 6 3 9 9 9 12-4 2-10 2-14-1-8 6-17 3-21-1z" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
    <path d="M14 28c4-4 12-4 18 1-6 4-13 4-18-1z" fill="#e0f2fe"/>
    <!-- Cute curved dorsal fin -->
    <path d="M24 16c2-8 7-8 10-4z" fill="#0284c7"/>
    <!-- Big sparkly eye -->
    <ellipse cx="32" cy="22" rx="3.5" ry="4" fill="#0f172a"/>
    <circle cx="31.5" cy="21" r="1.5" fill="#ffffff"/>
    <circle cx="33.5" cy="23.5" r="0.8" fill="#ffffff"/>
    <!-- Blushing pink cheek & smile -->
    <circle cx="32" cy="27" r="3" fill="#fb7185" fill-opacity="0.6"/>
    <path d="M36 26c2 1 5 1 8-1" stroke="#0369a1" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  `),

  shark: svgWrap(`
    <!-- Irene the Shark friendly portrait -->
    <path d="M8 26c4-10 16-14 28-8 5 3 8 7 8 11-6 2-14 2-18-2-6 5-13 3-18-1z" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
    <path d="M14 28c4-3 12-2 18 2-6 3-12 3-18-2z" fill="#e2e8f0"/>
    <!-- Triangular dorsal fin -->
    <path d="M22 16l6-10 4 10z" fill="#475569"/>
    <!-- Gill slits -->
    <path d="M20 22c-1 2-1 4 0 6m3-6c-1 2-1 4 0 6" stroke="#334155" stroke-width="1.2" stroke-linecap="round"/>
    <!-- Friendly smiling eye -->
    <circle cx="34" cy="24" r="2.5" fill="#0f172a"/>
    <circle cx="34.5" cy="23.5" r="0.9" fill="#ffffff"/>
    <!-- Gentle curved smile with small white tooth -->
    <path d="M35 29c2 1 6 1 8-1" stroke="#1e293b" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <polygon points="38,29 40,31 41,29" fill="#ffffff"/>
  `),
};

/**
 * 6. FOSSILS & SKELETON EXHIBITS ART
 */
export const FOSSIL_ART = {
  megalodonJaw: svgWrap(`
    <!-- Megalodon Jaw Exhibit -->
    <path d="M12 18c0-8 24-8 24 0v16c0 6-24 6-24 0V18z" fill="#334155" stroke="#cbd5e1" stroke-width="1.5"/>
    <path d="M16 20c0-4 16-4 16 0v12c0 4-16 4-16 0V20z" fill="#0f172a"/>
    <!-- Top sharp teeth -->
    <polygon points="16,20 18,24 20,20" fill="#f8fafc"/>
    <polygon points="20,19 22,25 24,19" fill="#f8fafc"/>
    <polygon points="24,19 26,25 28,19" fill="#f8fafc"/>
    <polygon points="28,20 30,24 32,20" fill="#f8fafc"/>
    <!-- Bottom sharp teeth -->
    <polygon points="17,32 19,28 21,32" fill="#f8fafc"/>
    <polygon points="21,32 23,26 25,32" fill="#f8fafc"/>
    <polygon points="25,32 27,26 29,32" fill="#f8fafc"/>
    <polygon points="29,32 31,28 33,32" fill="#f8fafc"/>
    <!-- Museum brass mount bracket -->
    <rect x="22" y="38" width="4" height="6" fill="#ca8a04"/>
    <rect x="18" y="44" width="12" height="2" rx="1" fill="#eab308"/>
  `),

  dunkleosteus: svgWrap(`
    <!-- Dunkleosteus Placoderm Armor -->
    <path d="M10 24c2-8 12-14 24-10 6 3 10 9 10 16-4 4-12 6-20 4-8-2-12-6-14-10z" fill="#475569" stroke="#94a3b8" stroke-width="1.5"/>
    <!-- Heavy armored cranial dermal plates -->
    <path d="M22 14c4 4 10 6 16 3M16 22c6 2 14 1 20-3M26 24v12" stroke="#cbd5e1" stroke-width="1.3" stroke-linecap="round"/>
    <!-- Bony gnathal shearing bladed plates -->
    <polygon points="36,26 42,27 38,32" fill="#f1f5f9"/>
    <polygon points="35,35 41,33 39,29" fill="#f1f5f9"/>
    <!-- Ancient eye orbit -->
    <circle cx="32" cy="20" r="3" fill="#1e293b" stroke="#94a3b8" stroke-width="1"/>
  `),

  plesiosaur: svgWrap(`
    <!-- Plesiosaur Marine Skeleton -->
    <!-- S-curved long articulated neck -->
    <path d="M12 36c4-2 8-8 8-14s6-12 12-12c5 0 8 4 10 2" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Reptilian skull -->
    <ellipse cx="43" cy="11" rx="4" ry="2.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <!-- Flippers & ribs -->
    <path d="M14 36c-4 3-8 5-10 8M18 36c-2 4-4 8-4 10M20 34c4 5 7 9 9 12" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
    <!-- Vertebrae nodes -->
    <circle cx="16" cy="30" r="1.5" fill="#94a3b8"/>
    <circle cx="19" cy="24" r="1.5" fill="#94a3b8"/>
    <circle cx="23" cy="18" r="1.5" fill="#94a3b8"/>
    <circle cx="28" cy="13" r="1.5" fill="#94a3b8"/>
    <circle cx="35" cy="11" r="1.5" fill="#94a3b8"/>
  `),

  boneFragment: svgWrap(`
    <!-- Bone fragment -->
    <path d="M14 21a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 2 2.8V25a3 3 0 0 0-2 2.8 3 3 0 0 0 3 3 3 3 0 0 0 3-3l20-7a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-2-2.8V23a3 3 0 0 0 2-2.8 3 3 0 0 0-3-3 3 3 0 0 0-3 3z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  `),
};

/**
 * 7. MISC UI ART (Baskets, pots, primary tabs)
 */
export const MISC_ART = {
  harvestBasket: svgWrap(`
    <path d="M12 20h24l-3 18a3 3 0 0 1-3 3H18a3 3 0 0 1-3-3l-3-18z" fill="#d97706" stroke="#78350f" stroke-width="1.5"/>
    <path d="M15 20C15 13 19 8 24 8s9 5 9 12" stroke="#b45309" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M13 26h22M14 32h20M16 38h16" stroke="#fde68a" stroke-width="1" stroke-opacity="0.4"/>
  `),

  trapPot: svgWrap(`
    <path d="M10 20h28l-2 18a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3L10 20z" fill="#0f766e" stroke="#134e4a" stroke-width="1.5"/>
    <path d="M10 20c0-4 6-7 14-7s14 3 14 7" fill="#14b8a6" stroke="#0f766e" stroke-width="1.5"/>
    <ellipse cx="24" cy="20" rx="6" ry="2.5" fill="#042f2e"/>
    <path d="M12 27h24M13 34h22M17 20v21M24 20v21M31 20v21" stroke="#5eead4" stroke-width="1" stroke-opacity="0.4"/>
  `),

  fieldJournalBook: svgWrap(`
    <rect x="10" y="8" width="28" height="34" rx="3" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
    <path d="M10 8h5v34h-5z" fill="#451a03"/>
    <rect x="18" y="14" width="16" height="22" rx="1" fill="#fef3c7" stroke="#b45309" stroke-width="1"/>
    <!-- Compass emblem on cover -->
    <circle cx="26" cy="25" r="5" fill="none" stroke="#ca8a04" stroke-width="1.2"/>
    <polygon points="26,22 28,25 26,28 24,25" fill="#d97706"/>
    <!-- Silk bookmark ribbon -->
    <path d="M30 8v16l-3-2-3 2V8" fill="#ef4444"/>
  `),

  trophyCup: svgWrap(`
    <path d="M16 12h16v12a8 8 0 0 1-16 0V12z" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
    <path d="M16 15H11a4 4 0 0 0 4 4h1M32 15h5a4 4 0 0 1-4 4h-1" stroke="#ca8a04" stroke-width="1.5" fill="none"/>
    <path d="M22 24v8M26 24v8" stroke="#ca8a04" stroke-width="2"/>
    <rect x="16" y="32" width="16" height="6" rx="2" fill="#a16207" stroke="#713f12" stroke-width="1"/>
    <!-- Star shine -->
    <polygon points="24,14 25.5,18 30,18 26.5,20.5 28,25 24,22 20,25 21.5,20.5 18,18 22.5,18" fill="#fef08a"/>
  `),
};

