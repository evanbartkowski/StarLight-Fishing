# Starlight Fishing

An atmospheric browser fishing game about exploring seven fantasy seas, collecting unusual catches, and building a personal aquarium. Built with JavaScript, HTML5 Canvas, Web Audio, and Vite.

## Explore, collect, and upgrade

- Discover fish from coastal shoals to the Eldritch Chrono Void, including shiny catches, crown records, legendary creatures, and mythics.
- Earn coins and Angler XP, upgrade your tackle and boat, and meet the requirements to unlock new seas.
- Dodge underwater hazards, including giant wrecks, fossil ribcages, mines, volcanic columns, and monoliths with varied sizes.
- Recover treasure, open loot crates, restore relics, assemble fossils, and track discoveries in the journal.
- Complete quests and achievements, encounter wandering NPCs, and unlock boat companions and seabed traps.
- Fish through changing weather and time of day with ambient ocean audio.

Fresh games begin at **level 0**. Fishing line upgrades reach from **60m to 3,000m**. Chartering a realm unlocks its native ecosystem; a longer line alone does not unlock another realm's fish or treasure.

## Seven distinct ecosystems

Every realm has **39 native fish** (273 native species total), plus special mythic encounters where available. Fish differ in silhouette, markings, movement, size, depth niche, and rarity. Only one migrating species from a neighboring realm can occasionally appear; most catches are exclusive to their home waters.

| Realm | Charter fee | Typical common fish base value | Fish XP multiplier |
| --- | ---: | ---: | ---: |
| Sunlit Shoals | Free | $6 | 1x |
| Bioluminescent Trench | $3,000 | $30 | 1.3x |
| Astral Shimmerfall | $17,500 | $85 | 1.7x |
| Sunken Atlantis | $35,000 | $170 | 2.2x |
| Whispering Aether Sea | $70,000 | $320 | 2.9x |
| Magma Caldera Trench | $140,000 | $700 | 3.8x |
| Eldritch Chrono Void | $1,000,000 | $4,800 | 5x |

Actual sale values also depend on species, size, rarity, shiny/crown status, and gear. Previously unlocked realms remain unlocked.

Deeper water favors rarer and more valuable fish, with unique deep-water species and occasional leviathans in every realm. Slow jellyfish groups start at 40m, solitary hunters at 250m, and rare giant sea monsters at 900m. Hunters pursue the hook briefly before resting.

Each realm adds four signature static hazards, three marine threats, six treasures/fossils, a native mystery cache, and two restorable relics. Coral thickets, glowing spores, meteor shards, clockwork ruins, aether cyclones, volcanic chimneys, and temporal fractures give the waters their own visual identity. Later realms have denser hazards and much more valuable fish, treasures, restored relics, and cache rewards.

Native species occupy shallow nurseries as well as deep habitats, so arriving in a new realm immediately offers new catches. The journal and nautical chart reflect the expanded rosters and economics. The chart requires Angler Level 4 and the Nautical Astrolabe upgrade; realm gates also require the listed level, vessel, and tackle.

## Playing

1. Continue as a guest or select a local Captain account.
2. Press and hold on the water to aim, then release to cast. Mouse and touch input are supported.
3. Move the pointer or drag to steer the hook toward catches and away from hazards.
4. Press **Space** during descent to retrieve early. The hook reels automatically; continue steering on the way up.
5. Manage catches in your inventory, sell them for upgrades, or display favorites in your aquarium.

## Make it your own

Open **Settings > Customize Appearance** to choose your angler's skin tone, coat, hair, hat color, and headwear, with a live preview. Choices save with the active local profile.

Four companions can join your voyages: Angela the cat (eligible from level 8), Evan the pelican (14), Gracie the dolphin (22), and **Irene the shark**, who joins automatically at level 36. Existing level-36+ saves also receive Irene.

Maxed-out upgrades move to the bottom of the shop, leaving available purchases first.

## Personal aquarium

Purchase the Personal Marine Aquarium in the tackle shop, then assign catches from your inventory. Upgrades increase capacity from 4 to 45 slots. Display fish, treasures, fossils, and relics. Choose a tank theme, golden sand/pebbles/obsidian/pearl gravel, kelp/coral/ruins/crystal scenery, lighting, and bubble density. Tap the glass and drop food into the water. Treasures use display slots and only fish generate tips; unopened crates must be opened or sold instead. Fish pursue food and gradually return to a calmer cruising speed once it is gone.

Visitor tips add up for every displayed fish:

| Fish rarity | Coins per minute, per fish |
| --- | ---: |
| Common | 3 |
| Uncommon | 5 |
| Rare | 9 |
| Epic | 18 |
| Legendary | 32 |
| Mythic | 52 |

Shiny fish earn an extra 10 coins per minute. Relics do not generate tips. The aquarium displays the combined rate and stores up to one hour of tips for the current collection. Adding or removing fish preserves tips already earned; a newly added fish does not earn tips for time before it was displayed. Collect tips from the aquarium panel.

## Saves and accounts

Guest progress remains in browser storage. Online captains have a local save plus a private cloud save; Firebase Authentication verifies their credentials. Full saves are never included in public rankings.

Online captains use Firebase Authentication and private Firestore cloud saves in the configured US `nam5` database. Existing local captains must log in with their password once on the original laptop to migrate. Cloud saves upload every 30 seconds and when hiding the tab; signing in elsewhere loads the last upload. Guests remain local. Simultaneous device writes are rejected when another device has newer progress. A replaced local save is backed up in browser storage. Localhost, a Firebase domain, and a custom domain each have separate browser storage; clearing site data removes local saves.

The World Angler Scoreboard uses Firestore for shared Top 100 rankings by level or coins. Registered captains publish public stats once a minute when changed, and when opening or refreshing the scoreboard. Guests can view rankings but cannot join them. Network failures show explicitly labelled browser-only standings and preserve local progress.

Online captain usernames are case-insensitive and globally unique. Existing local names that collide with an online account cannot claim it without its password. Older local-only leaderboard entries use anonymous identities; online captains use their authenticated account UID. Password credentials go through Firebase Authentication; saves remain private to their owner. The internal email identifier encodes the username and is not a recovery email, so email password recovery is not available. Rankings are client-reported, not protected against edited local saves; rules restrict writes to the owner's row and validate public fields.

## Run locally

Install Node.js and npm compatible with Vite 6, then:

```sh
git clone https://github.com/evanbartkowski/StarLight-Fishing.git
cd StarLight-Fishing
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm test` | Run gameplay data and realm regression checks |
| `npm run build` | Generate the production site in `dist/` |
| `npm run preview` | Preview the existing production build locally |

Run `npm test` for realm roster, spawning, economy, journal, inventory, and rendering regression checks. Run `npm run build` before publishing.

## Firebase Hosting deployment

`firebase.json` serves **`dist/`** and rewrites routes to `index.html`. The build folder is intentionally ignored by Git. This checkout currently has **no GitHub Actions deployment workflow**. `.firebaserc` selects `starlight-fishing`.

**Pushing to GitHub updates source code; it does not publish this site's Firebase Hosting release.** Build the site and deploy it separately, or configure an automatic deployment workflow.

### Manual deployment

Install and authenticate the Firebase CLI:

```sh
npm install -g firebase-tools
firebase login
firebase projects:list
```

Choose the existing project's ID from Firebase, then build and deploy. Replace `YOUR_PROJECT_ID` below with that ID:

```sh
npm ci
npm run build
firebase deploy --only hosting --project YOUR_PROJECT_ID
```

Always rebuild before deploying; otherwise Firebase uploads the previous contents of `dist/`. Confirm the Hosting URL and release in the deployment output. Optionally run `firebase use --add` to save a default project alias in `.firebaserc`.

For the shared leaderboard, the project also needs a default Firestore database in an explicitly chosen region. Once it exists, deploy the anonymous authentication provider, security rules, and both ranking indexes before publishing the client:

```sh
firebase deploy --only auth,firestore --project starlight-fishing
npm run build
firebase deploy --only hosting --project starlight-fishing
```

Allow both Firestore indexes to finish building before verifying the level and money rankings. The Firebase client configuration in `LeaderboardFirebase.js` is public; database access is controlled by `firestore.rules`.

### Automatic deployments from GitHub

For this existing Hosting setup, run:

```sh
firebase init hosting:github --project YOUR_PROJECT_ID
```

Connect `evanbartkowski/StarLight-Fishing`, configure the build command as `npm ci && npm run build`, and select `main` for live deployments. The setup configures deployment credentials in GitHub secrets and generates workflow files. Review and commit the generated files under `.github/workflows/`.

The live workflow must trigger on pushes to `main`, build the site, and deploy to the `live` channel. A preview-channel deployment does not update the live site. Inspect the repository's **Actions** tab for failed builds, missing secrets, or deployment errors.

See the official [Firebase Hosting GitHub integration guide](https://firebase.google.com/docs/hosting/github-integration) and [live deployment guide](https://firebase.google.com/docs/hosting/test-preview-deploy).

## Code map

| Path | Responsibility |
| --- | --- |
| `src/main.js` | Input, game state, and system integration |
| `src/GameLoop.js` | Fixed-step update and rendering loop |
| `src/world/OceanWorld.js` | Ocean rendering and entity population |
| `src/entities/` | Hook, fish, hazards, treasure, and companions |
| `src/data/` | Species, upgrades, zones, loot, quests, and achievements |
| `src/systems/` | Saves, local accounts, weather, quests, and other game systems |
| `src/ui/UIManager.js` | HUD, menus, inventory, and aquarium |
| `src/audio/` | Sound and music management |
| `public/` | Static assets copied into the production build |

Aquarium food costs $1 per feeding. Seabeds, scenery, lighting, bubble settings, and water themes show their purchase prices; purchased styles remain owned and can be reapplied for free.

The noticeboard now holds four missions, with six additional short contracts. Three new visitors join the NPC rotation; encounters avoid open menus and have a 90-second cooldown. Pets can rest ashore or come aboard from Journal > Crew, including Gracie the Dolphin. Deep resident fish occupy the full upgraded line range; large Sunlit Shoals hazards begin at 100m.

### Realm specialties and gems

Sunlit Shoals offers relaxed fishing, Bioluminescent Trench has dense schools and jellyfish, Astral Shimmerfall favors rare catches, Atlantis has abundant treasure, Aether has sparse oversized fish, Magma is packed with obstacles, and the Void has the most predators. The chart describes each realm.

The diamond beside gold opens daily login rewards for captain accounts: a 30-day streak with 1 gem on days 1-10, 2 on days 11-20, 3 on days 21-29, and 5 on day 30. The cycle restarts after day 30; missing a day restarts at day 1. Claims reset at midnight UTC. Achievements award 1-3 gems once; crates have a 2% chance of one gem. Gems do not come from selling fish or normal gold rewards. Aquarium styles and angler options are permanent gem purchases; previews are free and owned options can be reused at no cost. Existing styles are preserved, and completed achievements receive their gems once when older saves migrate.


## Latest gameplay changes

- Fish inhabit the entire upgraded line range, with shallow residents in every realm. Vertical swimmers remain near their spawn shelf. Deeper waters favor rare catches, predators, and slightly more obstacles.
- Each realm has a god-tier guardian below 1,600m: a 0.4% encounter chance per eligible dive, large artwork, evasive movement, celestial effects and sounds, and a one-time achievement. Guardians can live in the aquarium.
- Later realms have specialist lionfish, siphonophores, mantis shrimp, spider crabs, storm mantas, scorpionfish, or nautiluses, alongside their sharks, jellyfish, and sea monsters. Pursuit speed and detection increase with realm difficulty.
- Ordinary unshielded return-trip collisions have a 50% chance to drop a random fish. Heavy giants and the strongest specialists consume two shields or guarantee a fish loss. Treasure is not selected as a dropped fish.
- Mid/late fish values, stacked size/shiny bonuses, and XP growth are reduced. Level-up cash is capped at $750. Quests pay according to their assigned realm, count landed catches, and cannot repeat for 30 minutes after claiming. Changing realms cannot inflate a completed contract.
- Boat/line upgrades refresh the surface scene and population immediately. New account isolation is covered by registration and autosave regression tests.
- Settings, traps, Fossils, and the museum have updated layouts. Six discovered fossils or reconstructed sets can be placed in the gallery. Each complete fossil set awards a one-time 3-gem achievement.
- The treasure chart has selectable islands, a compass, and a dotted sailing route. Phone loading/welcome and catch-summary panels stay within the dynamic viewport and scroll internally.

## Core Enhancements & System Balancing

### 1. Obstacle Spawn Balancing
- Obstacle and static hazard spawn rates beyond 1,000 meters have been balanced to avoid dense cluster walls in deep expeditions while maintaining exciting navigation risks.

### 2. Fishing Physics & Hook Stability
- Fixed runaway horizontal steering velocity when hooking fish. Maximum horizontal steering velocity is clamped relative to rod agility, and hooking catches applies instantaneous velocity damping (`vx * 0.25`) to eliminate erratic screen-wide oscillations.

### 3. Persistent Sound Settings & Audio UI
- Audio mute states are preserved across browser refreshes via `localStorage`. The HUD audio toggle automatically reflects the correct muted/unmuted speaker icon on initialization.

### 4. Legendary Fish Rebalancing
- Catchable legendary and mythic fish are now twice as rare across all oceans (`0.006` base weight and halved environmental spawn chances), but reward dedicated anglers with **double their previous selling prices** (`VALUE_BY_RARITY.legendary` doubled from 42 to 84, base sell values doubled).

### 5. Beautiful Mermaid Design & Fluid Art
- Mermaids have been completely redesigned with shimmering scales, pearl chokers, glowing tiaras, and multi-layered flowing hair. Swimming features smooth multi-harmonic sinusoidal tail undulations and natural billow physics.

### 6. Dynamic NPC Dialogue Reward Scaling
- Wandering NPC encounters now scale their Gold and XP rewards based on the player's highest unlocked realm (scaling smoothly from 1.0x in Sunlit Shoals up to 16.0x in Realm 7), making high-sea dialogue rewarding and relevant to late-game progression.

### 7. Rare Noticeboard Quests & Gem Rewards
- High-tier and rare noticeboard quests (such as Apex Predator hunts and Colossal Leviathan challenges) now award bonus Gems (1 to 4 gems per contract), marked with distinct `✨ RARE QUEST` badges.

### 8. Realistic Colossal Creature Motion
- Colossal sea monsters (such as ancient megasharks, kraken tentacles, and leviathans) now feature smooth rotational inertia (`smoothFacing`), realistic turn smoothing, and multi-harmonic aquatic locomotion.

### 9. Realm 6 (Magma Caldera) Obstacle Overhaul
- Caldera obstacles (including volcanic chimneys, magma pillars, and sulfur vents) have been visually overhauled with molten lava veins, pulsing radiant heat glows, thermal distortion halos, and jagged basalt textures.

### 10. Realm 7 (Eldritch Chrono Void) Obstacle & Boat Fixes
- Fixed the Realm 7 boat positioning bug where switching realms caused the vessel to float off-screen or vanish; the vessel position is now dynamically clamped and centered. Colossal void monoliths and temporal fractures now feature pulsing eldritch warning auras and cosmic particulate effects.

### 11. Expanded Legendary & Mythical Roster
- Added seven new realm-themed legendary and mythical species to enrich diversity:
  - *Lagoon Sun Emperor* (Realm 1)
  - *Abyssal Bioluminescent Hydra* (Realm 2)
  - *Cosmic Nova Serpent* (Realm 3)
  - *Atlantean Sun-Crown Leviathan* (Realm 4)
  - *Aetherial Zephyr Kirin* (Realm 5)
  - *Pyrostrom Smoldering Wyrm* (Realm 6)
  - *Eldritch Epoch Devourer* (Realm 7)
- All new species include custom silhouettes, thematic palettes, evasion mechanics, and dedicated almanac icons.

### 12. 100% Reliable Personal Aquarium "To Tank" Button
- Standardized instance ID resolution using string-cast matching (`String(id) === String(instanceId)`) across all aquarium management functions (`isItemInAquarium`, `moveItemToAquarium`, `removeItemFromAquarium`), resolving inconsistent tank transfers.

### 13. Enhanced Inventory & Creature Inspection Modal
- Upgraded the inventory inspection system with an intuitive creature inspection icon and a live animated specimen canvas viewport displaying realistic swimming animations, origin realm badges, and personal crown record indicators.

### 14. Multi-Realm Audio & Soundtrack Integration
- Integrated distinct surface and underwater music tracks from `public/music/` across Realms 2 through 7 with clean state transitions and mutual exclusion to prevent track overlap.
- **Realm 1 (Sunlit Shoals) original soundtrack remains completely unchanged** (`/sprites/seamusic.mp3` on the surface and `/sprites/oceanmusic2.mp3` underwater).

### 15. Realm 7 Fishing Reel Stability & Hard Safety Bounds Clamp
- Resolved the deep abyss camera tracking issue where rapid vertical reel retrieval at extreme depths (~3,000m) could push the hook off-screen.
- Implemented responsive vertical offset interpolation (`12.0 * deltaSec`) and an unbreachable hard safety viewport clamp ensuring the hook is mathematically locked within the active viewport (between 15% and 85% of screen height) at all depths.

### 16. Ultra-Responsive Mouse & Touch Reel Tracking
- Completely overhauled mouse steering responsiveness: horizontal tracking speed factor increased to `8.5 * agility` with immediate acceleration (`14.0 * deltaSec`).
- Fixed screen boundary clamping so high-resolution and ultra-wide displays track the cursor across the entire screen width.
- Catching fish or treasures now cleanly dampens velocity without overwriting `targetX`, preventing sluggish pauses or cursor freezes during active retrieval.

### 17. Surface Background Black Hole Visual Overhaul & Reduced Frequency
- Overhauled the Realm 7 surface background black hole with realistic relativistic astrophysics: Einstein gravitational lensing ring, dual collimated plasma jets with synchrotron shock diamonds, Doppler-boosted 3D accretion disk (approaching blue-shifted matter on left, receding red-shifted matter on right), photon sphere ($1.5 R_s$), and obsidian event horizon.
- Reduced surface spawn frequency to a cinematic 120-second cycle (active for 24s) to preserve rarity and atmosphere.

### 18. Underwater Black Hole Obstacle & Gravitational Accretion Pull
- Added an interactive underwater **Abyssal Black Hole** obstacle to Realm 7.
- Features complete relativistic canvas rendering (accretion disk, photon sphere, and Einstein lensing halo) and active **gravitational accretion pull** that smoothly draws nearby fishing gear toward the singularity.

### 19. Magma Caldera Trench Obstacle Clarifications & Overhaul
- Overhauled all 4 Magma Caldera Trench obstacles into distinct, instantly recognizable volcanic formations:
  1. **Submarine Volcano Caldera Cone**: Stratified basalt tephra base with summit crater lake of boiling molten sulfur and billowing cavitation steam.
  2. **Columnar Basalt & Obsidian Needles**: Geometric hexagonal basalt columns (Giant's Causeway style) with razor-sharp obsidian needles and glowing magma fissures.
  3. **Chained Molten Planetary Core**: Massive fractured magma sphere bound in heavy forged titan iron chain links and glowing tension shackles.
  4. **Colossal Hydrothermal Black Smoker Spire**: Towering stepped mineral chimney erupting superheated black smoker particle plumes with cascading liquid lava flumes.

### 20. Automated Abyss Probe Complete Visual Redesign
- Completely overhauled the deep-sea Automated Abyss Probe (`automated_probe`) from a plain circular outline into a high-tech robotic exploration drone:
  - 4 articulated titanium thruster arms with ducted cowls, ion cavitation jets, and hazard stripes.
  - Sweeping forward laser sensor scanner beam with dynamic conical reticle sweep.
  - Reinforced titanium pressure sphere with hex bolts and circumferential panel seams.
  - Glowing cyclopean optical sensor eye with pupil, reflection glint, and top antenna with flashing red strobe warning beacon.

## Music

The original `seamusic.mp3` and `oceanmusic2.mp3` play in Sunlit Shoals and remain strictly unchanged. Realms 2 through 7 feature unique, curated surface and underwater soundtracks from `public/music/` (including Aquarain, Meditation, Peaceful, Ocean Waves, Tropical House, Ocean Vibes, and atmospheric variations). Transitions between surface and diving modes are seamlessly managed without audio overlap, and muted preferences persist reliably across sessions. Radio overrides realm music until switched off. Sound effects are 20% quieter at the same slider setting.

## Fleet Radio and Gem Store backend

Fleet Radio uses shared Firestore messages, server-acknowledged REST writes, and realtime listeners with metadata updates. Clients show the newest 30 messages from the last 24 hours and remove messages deleted remotely. The two cleanup functions permanently delete excess messages after arrivals and expired messages on a one-minute schedule. **Permanent cleanup requires deploying those functions**; client filtering alone does not erase database records. Backend deletion is asynchronous, so expired records may remain until the next successful cleanup.

The Gem Store presents 10-, 35-, and 100-gem bundles. Stripe prices are configuration, not hardcoded dollar amounts. The signed-in user's `/players/{uid}` wallet streams into the HUD; gameplay-earned gems remain in the captain save. Verified webhook transactions grant purchased gems once per checkout session, including duplicate or concurrent Stripe deliveries. Clients cannot create or increase purchased gem balances. Local gameplay progression and earned gems remain client-reported, so this is not a server-authoritative anti-cheat system.

See [functions/README.md](functions/README.md) for Stripe secrets, prices, webhook setup, retention deployment, and backend tests. Checkout is unavailable until configured. No live purchase is needed for the automated tests.
