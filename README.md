# Seven Seas Fishing 🎣✨

A relaxing, atmospheric high-fantasy ocean angling and exploration game built with **HTML5 Canvas**, **Web Audio API**, and **Vite**.

Embark on a voyage across seven fantastical ocean realms—from sunlit coastal shoals to starlit nebula waters, ancient gilded ruins, floating sky-seas, smoldering caldera trenches, and the cosmic chronovoid.

---

## 🌊 The Seven Fantasy Seas

Each sea features unique depth ranges, gate requirements, distinct ambient audio soundscapes, and native fantasy species:

| Realm | Subtitle | Depth Range | Landmark & Atmosphere | Audio Profile |
|---|---|---|---|---|
| **Sea 1: Sunlit Shoals** | *The Golden Coast* | 0m – 50m | Breezy azure shallows, playful gulls, sunny caustics | Calm acoustic nylon guitar & kalimba tones |
| **Sea 2: Bioluminescent Trench** | *The Neon Abyss* | 50m – 120m | Deep violet depths, neon plankton motes, glowing anemones | Resonant deep synth pads & crystalline chime arpeggios |
| **Sea 3: Astral Shimmerfall** | *The Celestial Depths* | 120m – 220m | Starlit crystalline currents under cosmic nebulae | Glass-harp resonance & ambient piano chords |
| **Sea 4: Sunken Atlantis** | *The Gilded Sunken Ruins* | 220m – 340m | Ancient brass gearworks, emerald currents, marble pillars | Soothing orchestral harp & flute harmonies |
| **Sea 5: Whispering Aether Sea** | *The Cloud-Reef Stratosphere* | 340m – 440m | Cloud-shrouded floating sky-islands, lilac winds | Wind chimes & celestial choral pads |
| **Sea 6: Magma Caldera Trench** | *Smoldering Abyssal Depths* | 440m – 530m | Volcanic hydrothermal vents, obsidian spires, rising embers | Warm sub-bass drone with gentle handpan drums |
| **Sea 7: Eldritch Chrono Void** | *The Edge of Horizon* | 530m – 660m | Iridescent auroras, cosmic space-whale silhouettes | Ethereal space drones & theremin harmonics |

---

## 🎮 How to Play & Controls

### 1. Dual-Sided Aiming & Casting
- **Aim**: Move your cursor or touch to either side of the boat to aim left or right. The boat and angler turn to face your direction.
- **Cast**: Click/touch and drag away from the boat to pull back tension, then release to launch the hook arcing through the air.

### 2. Subsea Descent
- **Steer**: Use the **Mouse**, **A / D keys**, or **Left / Right Arrow keys** to steer your hook left and right.
- **Avoid Hazards**: Dodge spiky sea-urchins, shock jellyfish, thermal vents, and phantom hazards.
- **Line Armor**: Hull and line armor shields deflect hazardous hits. Unshielded impacts during retrieval can cause hooked fish to slip off!
- **Manual Retrieve**: Press **Spacebar** or click during descent to stop diving early and start reeling.

### 3. Reeling & Rhythm Tension
- Reeling snagged fish upward earns gold and Angler XP.
- When battling **Epic**, **Legendary**, or **Mythic** fish, the relaxed rhythm meter activates:
  - 🌊 **Lull Phase**: Calm water window with retrieval speed boost.
  - 〰️ **Swell Phase**: Water resistance slows retrieval gently without punishing line snaps.
- Avoid hazards on the way up to maintain your **"Patience of the Tide"** perfect reel streak!

---

## 🧭 Chart Navigation & Minimap

Unlock the **Nautical Chart** (`🧭 Chart` button in the HUD) by meeting the navigation requisites:
- **Angler Level 4+**
- Purchase the **"Brass Astrolabe & Nautical Compass"** tackle upgrade in the Tackle Shop ($350)

### Chart Features:
- Real-time nautical coordinates and weather currents.
- Discovery and tracking of known fishing hotspots per sea.
- Realm gates showing required hull tiers, engine power, line durability, and charter fees.
- Instant sailing between charted ocean realms.

---

## 🧔 Atmospheric NPC Encounters

While fishing and exploring the surface waters, wandering seafarers and entities may approach (~3.5% chance per completed dive):

1. **Barnaby the Drifting Merchant**: Sells enchanted **Star-Bait** (+35% rare catch rate), antique pearl bobbers, or buys beachcomber scraps.
2. **Lyra the Stargazer Siren**: Bestows **Siren's Grace** (+25% rare catch rate for 3 minutes) or **Starlight Oracle Sight** (reveals subsea fish silhouettes).
3. **Captain Vane the Ghost Smuggler**: Pay a safe toll or challenge him to a high-stakes reel struggle for his **Cursed Doubloon Cache** (+$450).
4. **Professor Alden the Cartographer**: Trades survey soundings and fossil bounties for Angler XP and secret hotspot charts.

---

## 📦 Mystery Loot Crates

Dredge mysterious treasure crates from seabed trenches across 5 rarity tiers:
- **Wooden Salvage Crate** (Common)
- **Ironclad Sea Chest** (Uncommon)
- **Gilded Sunken Trunk** (Rare)
- **Abyssal Vault Crate** (Epic)
- **Celestial Kraken Strongbox** (Legendary)

Loot crates contain randomized rewards including gold bounties, rare pearl bobbers, archaeological relics, ancient fossil bones, or sudden mimic shocks!

---

## 📜 Logbook, Field Journal & Museum

- **🏆 Hall of Grand Milestones**:
  - *Cartographer of the Unknown*: Chart and sail to all 7 fantasy realms.
  - *Friend of the Deep*: Complete 10 atmospheric NPC interactions.
  - *Titan Tamer*: Land a legendary specimen from each fantasy sea.
  - *Patience of the Tide*: Achieve 20 "Perfect" tension reel-ins in a row.
- **📜 Angler's Field Log**: Catalog 35+ unique fantasy fish species, recording crown records (Giant Gold 👑 & Mini Silver 🥈) and shiny variants.
- **🏛️ Archaeological Restoration Desk**: Dredge barnacle-encrusted ancient relics and clean them with brush and solvent.
- **🦴 Prehistoric Fossil Museum**: Assemble complete prehistoric titan skeletons (Megalodon, Dunkleosteus, Plesiosaur).
- **🫧 Seven Seas Aquarium**: Visit your personal sanctuary where all discovered fish swim dynamically. Tap the glass and feed them!

---

## 📻 Coastal Procedural Radio

Tune into three procedural ambient radio stations without downloading large audio files:
1. **Station 1: Harbor Breeze** (Acoustic guitar chords & swelling waves)
2. **Station 2: Rainy Lighthouse** (Soft rain, distant thunder & low foghorn)
3. **Station 3: Deep Blue Reverie** (Warm sub-aquatic synth pads)

---

## 🛠️ Development & Running Locally

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
git clone https://github.com/evanbartkowski/seven-seas-fishing.git
cd seven-seas-fishing
npm install
```

### Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173/` in your browser.

### Production Build
```bash
npm run build
```
Generates optimized static assets into `/dist`.
