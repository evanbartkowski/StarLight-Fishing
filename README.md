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

Every realm has **35 native fish** (245 regular species total), plus special mythic encounters where available. Fish differ in silhouette, markings, movement, size, depth niche, and rarity. Only one migrating species from a neighboring realm can occasionally appear; most catches are exclusive to their home waters.

| Realm | Charter fee | Typical common fish base value | Fish XP multiplier |
| --- | ---: | ---: | ---: |
| Sunlit Shoals | Free | $6 | 1x |
| Bioluminescent Trench | $3,000 | $30 | 1.3x |
| Astral Shimmerfall | $17,500 | $130 | 1.7x |
| Sunken Atlantis | $35,000 | $280 | 2.2x |
| Whispering Aether Sea | $70,000 | $538 | 2.9x |
| Magma Caldera Trench | $140,000 | $1,176 | 3.8x |
| Eldritch Chrono Void | $1,000,000 | $8,800 | 5x |

Actual sale values also depend on species, size, rarity, shiny/crown status, and gear. Previously unlocked realms remain unlocked.

Each realm adds four signature hazards, six treasures/fossils, a native mystery cache, and two restorable relics. Coral thickets, glowing spores, meteor shards, clockwork ruins, aether cyclones, volcanic chimneys, and temporal fractures give the waters their own visual identity. Later realms have denser hazards and much more valuable fish, treasures, restored relics, and cache rewards.

Native species occupy shallow nurseries as well as deep habitats, so arriving in a new realm immediately offers new catches. The journal and nautical chart reflect the expanded rosters and economics. The chart requires Angler Level 4 and the Nautical Astrolabe upgrade; realm gates also require the listed level, vessel, and tackle.

## Playing

1. Continue as a guest or select a local Captain account.
2. Press and hold on the water to aim, then release to cast. Mouse and touch input are supported.
3. Move the pointer or drag to steer the hook toward catches and away from hazards.
4. Press **Space** during descent to retrieve early. The hook reels automatically; continue steering on the way up.
5. Manage catches in your inventory, sell them for upgrades, or display favorites in your aquarium.

## Make it your own

Open **Settings ? Customize Appearance** to choose your angler's skin tone, coat, hair, hat color, and headwear, with a live preview. Choices save with the active local profile.

Four companions can join your voyages: Angela the cat (eligible from level 8), Evan the pelican (14), Echo the dolphin (22), and **Irene the shark**, who joins automatically at level 36. Existing level-36+ saves also receive Irene.

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

Guest progress and Captain accounts are stored in this browser's `localStorage`. Returning guests resume their saved progress. Captain accounts have separate local saves; their passwords and full saves are not uploaded.

Progress does not sync across devices or browsers. Localhost, a Firebase domain, and a custom domain each have separate browser storage; clearing site data removes local saves.

The World Angler Scoreboard uses Firestore for shared Top 100 rankings by level or coins. Registered captains publish public stats once a minute when changed, and when opening or refreshing the scoreboard. Guests can view rankings but cannot join them. Network failures show explicitly labelled browser-only standings and preserve local progress.

Each local captain gets a separate persisted Firebase anonymous identity for ownership of their score. Captain names are display names, not globally unique logins. Clearing browser storage creates a new identity, and existing captains appear online after they next play. Rankings are client-reported, not protected against edited local saves; rules restrict writes to the owner's row and validate public fields.

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
