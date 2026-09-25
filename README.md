# 🌊 Seven Seas Fishing

A cozy, relaxing web-based Canvas fishing game built with Vite and vanilla JavaScript. Designed for long, low-stress play sessions—perfect for keeping running on a second screen or background tab while listening to ambient procedural soundscapes.

---

## 🧭 Table of Contents
1. [Quick Start & Setup](#-quick-start--setup)
2. [Core Gameplay Loop & Controls](#-core-gameplay-loop--controls)
3. [The Seven Seas (Depth Zones)](#-the-seven-seas-depth-zones)
4. [Vessel Upgrades & Visual Customization](#-vessel-upgrades--visual-customization)
5. [Ship Companions](#-ship-companions)
6. [Coastal Radio & Procedural Audio](#-coastal-radio--procedural-audio)
7. [Ranked Mystery Loot Crates](#-ranked-mystery-loot-crates)
8. [Idle Seabed Drift Traps](#-idle-seabed-drift-traps)
9. [Prehistoric Museum & Sunken Relics](#-prehistoric-museum--sunken-relics)
10. [Mythic & Legendary Fish Mechanics](#-mythic--legendary-fish-mechanics)
11. [Quests & Achievements](#-quests--achievements)

---

## 🚀 Quick Start & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18+ recommended)

### Installation & Launch
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```
Once the dev server starts, open your browser to `http://localhost:5173/` and click **"Set Sail ⛵"** to start your voyage.

---

## 🎮 Core Gameplay Loop & Controls

### 1. Aiming & Casting
* **Mouse Drag:** Click and hold anywhere left or right of the boat. A dotted trajectory line with an aim target indicator will appear, reflecting launch angle and power.
* **Release:** Releasing the mouse launches your hook into the air. The hook arcs dynamically and splashes down into the ocean.

### 2. The Ocean Descent
* **Steering:** As the hook sinks into the depths, move your mouse horizontally or use the **A / D** (or **Left / Right Arrow**) keys to steer.
* **Line Depth:** The hook descends up to your currently purchased line depth limit (upgraded in the Tackle Shop).
* **Dodging Hazards:** The ocean contains sharp reefs, colossal boulders, jellyfish swarms, and hydrothermal vents. Bumping into obstacles causes shock damage and can consume your protective shields.

### 3. Hooking & Multi-Catch Capacity
* **Hooking Fish:** When the hook reaches its maximum depth or collides with a fish, it immediately begins reeling back up.
* **Line Attachment:** Fish stay hooked on the line just above the hook barb and follow the line smoothly toward the surface.
* **Catching on the Way Up:** You can steer into additional fish as you rise, hooking multiple catches up to your **Hook Capacity** limit.
* **Ascent Hazard Collisions:** Be careful on the way up! Hitting sharp obstacles or colossal hazards on retrieval can knock catches loose from your line.

### 4. Catch Summary & Rewards
* Upon surfacing, your haul is processed:
  * **Coins 🪙:** Used to purchase boat upgrades, tackle, and traps.
  * **XP ⭐:** Increases your Angler Level to unlock deeper ocean zones and higher-tier equipment.
  * **Discoveries 📖:** Automatically logs new species, crown sizes (Gold Giant / Silver Mini), and shiny color variants into your Field Guide.

---

## 🌊 The Seven Seas (Depth Zones)

As you upgrade your line length and level up, you gain access to 7 distinct depth layers:

| Zone | Depth Range | Atmospheric Profile | Notable Marine Life |
| :--- | :--- | :--- | :--- |
| **Sea 1: Sunlit Shallows** | 0m – 50m | Golden sunlight, gentle waves | Sardines, Mackerel, Seabass, Sea Turtles |
| **Sea 2: Kelp Forest & Reefs** | 50m – 120m | Lush green kelp towers, coral arches | Yellowfin Tuna, Snappers, Coral Eels, Giant Lobsters |
| **Sea 3: Twilight Shallows** | 120m – 220m | Deep indigo gradients, fading sunlight | Moonfish, Opah, Barracuda, Swordfish |
| **Sea 4: Midnight Depths** | 220m – 350m | Pitch-black water with bioluminescent flecks | Lanternfish, Viperfish, Oarfish, Gulper Eels |
| **Sea 5: Abyssal Trench** | 350m – 500m | Crushing pressure, deep ocean vents | Giant Squids, Coelacanths, Goblin Sharks |
| **Sea 6: Volcanic Hydrothermal Vents** | 500m – 700m | Molten vents, thermal currents, magma fissures | Magma Dories, Vent Crabs, Dragonfish |
| **Sea 7: Hadal Cosmic Abyss** | 700m+ | Starfall luminescence, ethereal cosmic rift | Celestial Moon-Jelly, Cosmic Trench Leviathans |

---

## ⛵ Vessel Upgrades & Visual Customization

Your vessel visibly transforms on the Canvas across 5 progressive tiers, scaling in size, hull craftsmanship, and deck accessories:

### Vessel Tiers
1. **Tier 0: Weathered Dinghy (Starter)**
   * Small rustic wooden skiff with timber planking, simple pine bench, brass oarlocks, coiled bow rope, and a single wooden lantern post.
2. **Tier 1: Coastal Dory**
   * Flared navy-blue hull with ivory waterline stripe, cushioned vinyl seat with tufting, twin brass rod holders on the gunwales, cedar sea chest, and bow cleat.
3. **Tier 2: Expedition Trawler**
   * Commercial sea-teal hull with white bulwarks and teak deck. Equipped with a sun-protective canvas bimini shade roof, aft davit crane with hanging brass pulley, lifebuoy ring, and crab trap sorting bench.
4. **Tier 3: Grand Schooner**
   * Dark mahogany hull with polished brass rub-rail trim. Raised quarterdeck with balustrade spindles, 8-spoke brass ship wheel, pilot cabin with warm glowing amber portholes, dual wooden masts with rigging, billowing sails, crow's nest, and wooden bowsprit.
5. **Tier 4: Mythic Celestial Ketch**
   * Obsidian and cosmic-indigo vessel adorned with glowing cyan and violet runic star-inlays. Features a celestial gold helm wheel, rear observation deck with a brass astronomy telescope, dual masts with shimmering translucent starfall sails, and permanent volumetric underwater floodlights illuminating seabed fish.

### Dynamic Deck Equipment
* **Fishing Rod Models (Levels 1–6):** Hand-carved Bamboo $\rightarrow$ Neon Blue Fiberglass $\rightarrow$ Matte Dark Graphite $\rightarrow$ Titanium Alloy $\rightarrow$ Gilded Sovereign (ornate gold trim) $\rightarrow$ **Poseidon's Trident** (radiant electric prongs with lightning sparks).
* **Catch Storage:** Cedar slatted bucket $\rightarrow$ Marine cooler box $\rightarrow$ Aerated stainless steel livewell tank with bubbling water.
* **Abyssal Lanterns:** Soft candle flame $\rightarrow$ Halogen brass cage $\rightarrow$ Bioluminescent jellyfish globe $\rightarrow$ High-beam phosphor floodlight $\rightarrow$ Radiant celestial sunstone core.
* **Treasure Sonar:** Brass ship bell $\rightarrow$ Spinning radar scanner $\rightarrow$ Enclosed sonar radome $\rightarrow$ Resonant magnetic coil array.
* **Seabed Pots:** Stacked woven drift pots on the aft deck with bright orange, red, and teal surface buoys.
* **Coastal Radio:** Mahogany cabinet with brass tuning dial and animated musical notes drifting into the sky when music is playing.

---

## 🐾 Ship Companions

Cozy companions live aboard your vessel to add life and idle perks:

* **The Ship's Cat 🐱:**
  * Sleeps curled up on the deck bench or cabin roof.
  * **Interaction:** Click the cat to pet it; triggers a synthesized purr.
  * **Daily Perk:** Once every in-game morning, it playfully paws up free bait, drift shells, or coins onto the deck.
* **The Perched Pelican 🪶:**
  * Rests atop the bowsprit, bobbing rhythmically to the waves.
  * **Interaction:** Feed it common fish to build trust. At high trust, it occasionally dives into the surf to retrieve floating drift bottles or loose coins.
* **Friendly Horizon Dolphin 🐬:**
  * Periodically breaches and leaps through the background ocean waves on clear, sunny days.

---

## 📻 Coastal Radio & Procedural Audio

Access the vintage brass radio by clicking the **📻 Radio** icon on the HUD. All stations and sound effects are 100% procedurally synthesized in real time via the native **Web Audio API** (zero external sound files required):

* **Station 1 (Harbor Breeze):** Warm nylon acoustic guitar chord progressions with gentle swelling ocean wave surf.
* **Station 2 (Rainy Lighthouse):** Calming rain white-noise patter, distant low rolling thunder rumbles, and a warm foghorn drone.
* **Station 3 (Deep Blue Reverie):** Slow, warm ambient synth pads with gentle underwater bubbling resonance.
* **Off-Tab Notifications:** When a rare/legendary fish bites or passive seabed traps fill up, the game plays a gentle two-tone celestial chime and updates `document.title` to alert you if you are browsing another tab or window.

---

## 🎁 Ranked Mystery Loot Crates

Dredged up from sunken shipwrecks and seabed rifts. When opened in the Catch Summary, crates roll from comprehensive loot tables:

| Crate Tier | Name | Depth Range | Reward Profile |
| :--- | :--- | :--- | :--- |
| **Rank 1** | Weathered Driftwood Crate | 8m – 60m | Beachcomber junk, pastel sea glass, silver stashes, carved bobbers |
| **Rank 2** | Sunken Ironbound Strongbox | 40m – 160m | Trade silver ingots, aged spiced rum, brass sextants, pyrite ammonites |
| **Rank 3** | Gilded Corsair Chest | 90m – 290m | Pirate doubloons, ruby gems, gold bullion, Megalodon teeth |
| **Rank 4** | Abyssal Leviathan Coffer | 240m – 470m | Black pearls, fire opals, leviathan treasury, Dunkleosteus armor plates |
| **Rank 5** | Mythic Celestial Reliquary | 380m – 620m+ | Atlantean crystals, meteoritic starlight ingots, Heart of Atlantis, Comet bobbers |

* **Loot Grades:**
  * **Super Bad 💔:** Urchin pranks, cuttlefish ink squirts, soggy boots, or mild electrical circuit shorts.
  * **Fair ⚖️:** Generous piles of coins, vintage goods, and crafting relics.
  * **Super Good ⭐:** Massive coin windfalls, rare prehistoric skeleton bones, and exclusive custom bobbers!

---

## 🪤 Idle Seabed Drift Traps

* **Purchasing Pots:** Unlock and upgrade seabed drift pots in the **Tackle & Shipyard** menu (`btn-shop`).
* **Passive Harvesting:** Deployed pots automatically collect crabs, lobsters, and oysters over time—even while you are idle or looking through menus.
* **HUD Notification:** The trap icon (`🪤`) displays a counter and pulses when catches are ready to harvest with a single click.

---

## 🏛️ Prehistoric Museum & Sunken Relics

* **Apex Skeleton Displays:** Dredge up ancient fossils from the seafloor or crack open high-tier loot crates to assemble complete museum skeletons:
  * **Megalodon Jaw**
  * **Giant Plesiosaur**
  * **Armored Dunkleosteus**
* **Sunken Relics:** Uncover historical relics including antique diving helmets, barnacled brass compasses, and porcelain tea sets.
* **Restoration Desk:** Clean away centuries of ocean grime using soothing mouse strokes to restore relics to pristine display condition.

---

## 🐉 Mythic & Legendary Fish Mechanics

Legendary sea titans appear during specific atmospheric conditions (time of day, weather, and lunar cycles):
* **Abyssal Star-Weaver:** Constellation ribbon eel (Night, Clear skies, deep water).
* **Old Mossback Leviathan:** Giant ancient turtle carrying living coral on its shell (Dawn, Overcast/Fog).
* **Aurora Sailfin:** Polar billfish refracting neon twilight colors (Dusk, Clear skies).
* **Golden Coelacanth:** Prehistoric armored fossil fish found in volcanic floor rifts.
* **Clockwork Nautilus:** Ancient mechanical automaton shell that emits gentle clock ticks upon surfacing.
* **Eclipse Moon-Jelly:** Radiant celestial jellyfish pulsing in rhythm with the moon.

### Rhythmic Reeling Mechanic
When a Legendary or Mythic fish is hooked, a tension meter and rhythm indicator activate:
* **Calm Lull 🟢:** Optimal reeling window! Reel smoothly with maximum pull power.
* **Wave Swell 🌊:** High tension window! Ease line retrieval to prevent line snap and loss.

---

## 📜 Quests & Achievements

* **Daily & Depth Quests:** Access quests via the HUD parchment icon (`📜`). Complete fishing objectives to earn extra coin bounties and rare tackle rewards.
* **Field Guide:** Track your caught species, view records for the largest and smallest catches, and discover secret shiny variants.
* **Offline / Idle Friendly:** Auto-saves your progress continuously in `localStorage`. Return anytime and pick up right where you left off!

---

## 🛠️ Tech Stack
* **Language:** Vanilla JavaScript (ES6+ Modules)
* **Bundler & Dev Server:** [Vite](https://vitejs.dev/)
* **Rendering Engine:** HTML5 Canvas 2D API
* **Audio Engine:** Web Audio API (procedural synthesizers, noise generators, LFO filters)
* **Styling:** CSS3 Glassmorphism with modern typography (`Outfit` font)
