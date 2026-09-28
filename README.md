# Starlight Fishing

An atmospheric browser fishing game about exploring seven fantasy seas, collecting unusual catches, and building a personal aquarium. Built with JavaScript, HTML5 Canvas, Web Audio, and Vite.

## Explore, collect, and upgrade

- Discover fish from coastal shoals to the Eldritch Chrono Void, including shiny catches, crown records, legendary creatures, and mythics.
- Earn coins and Angler XP, upgrade your tackle and boat, and meet the requirements to unlock new seas.
- Dodge underwater hazards, including giant wrecks, fossil ribcages, mines, volcanic columns, and monoliths with varied sizes.
- Recover treasure, open loot crates, restore relics, assemble fossils, and track discoveries in the journal.
- Complete quests and achievements, encounter wandering NPCs, and unlock boat companions and seabed traps.
- Fish through changing weather and time of day with ambient ocean audio.

Fresh games begin at **level 0**. The starting line reaches **50m**; purchased line upgrades reach **100, 160, 230, 310, 400, 500, 600, 700, 800, 900, and 1,000m**. Line reach is separate from habitat depth: the current sea habitats extend to 660m.

## The seven seas

| Sea | Habitat depth |
| --- | --- |
| Sunlit Shoals | 0?45m |
| Bioluminescent Trench | 45?105m |
| Astral Shimmerfall | 105?180m |
| Sunken Atlantis | 180?280m |
| Whispering Aether Sea | 280?410m |
| Magma Caldera Trench | 410?530m |
| Eldritch Chrono Void | 530?660m |

Use the nautical chart to inspect sea gates and travel. The chart requires Angler Level 4 and the Nautical Astrolabe upgrade. Depth alone does not unlock a sea.

## Playing

1. Continue as a guest or select a local Captain account.
2. Press and hold on the water to aim, then release to cast. Mouse and touch input are supported.
3. Move the pointer or drag to steer the hook toward catches and away from hazards.
4. Press **Space** during descent to retrieve early. The hook reels automatically; continue steering on the way up.
5. Manage catches in your inventory, sell them for upgrades, or display favorites in your aquarium.

## Personal aquarium

Purchase the Personal Marine Aquarium in the tackle shop, then assign catches from your inventory. Upgrades increase capacity from 4 to 45 slots. Display fish and relics, choose a tank theme, tap the glass, and drop food into the water. Fish pursue food and gradually return to a calmer cruising speed once it is gone.

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

Guest progress and Captain accounts are stored in this browser's `localStorage`. Returning guests resume their saved progress. Captain accounts have separate local saves, but they are **not Firebase Authentication accounts or cloud saves**.

Progress does not sync across devices or browsers. Localhost, a Firebase domain, and a custom domain each have separate browser storage; clearing site data removes local saves.

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
| `npm run build` | Generate the production site in `dist/` |
| `npm run preview` | Preview the existing production build locally |

There is currently no automated test script in `package.json`. Build and check affected gameplay flows before publishing.

## Firebase Hosting deployment

`firebase.json` serves **`dist/`** and rewrites routes to `index.html`. The build folder is intentionally ignored by Git. This checkout currently has **no GitHub Actions deployment workflow**, and `.firebaserc` is empty, so no default Firebase project is recorded.

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
