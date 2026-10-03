# Deep-sea fishing audit and implementation

Audited 2026-10-03. The starting working tree already had edits in BoatCompanions,
Fish, Hook, SeasData, Treasure, main, MinimapUI, UIManager and OceanWorld, plus
InteractiveFlora and Powerup. Those edits were preserved and completed in place.

## Feature status matrix

Statuses describe the inspected starting tree. The final column records the patch.

| Feature | Starting status | Files/services | Implemented change |
| --- | --- | --- | --- |
| Startup and ship rendering | Missing / Broken | SeasData, main, OceanWorld, Resource | Restored missing depth exports that prevented module startup; reset canvas state each frame, explicitly render the hull at full opacity, attach image handlers before setting src. All vessel geometry regression tests pass. |
| Pet hover / dolphin targeting | Implemented | main, BoatCompanions | Preserved pointerleave/mouseleave cleanup and expanded rotated dolphin bounds; added touch-cancel cleanup. |
| Join chat focus | Partially Implemented | UIManager | Opens and focuses Fleet Radio once per signed-in captain at the surface without repeatedly stealing focus. |
| Achievement notifications | Partially Implemented | UIManager, AchievementsData | Kept 3.5-second enter/exit toast, cleared stale exit timer, removed duplicate notifications and halved introductory rewards. |
| Almanac | Partially Implemented | CatchTraits, UIManager | Human-readable ID formatting, actual Fish rendering for discoveries/silhouettes; corrected preview entity coordinates that placed fish outside the canvas. |
| Realm/depth chart | Missing / Broken | SeasData, MinimapUI, CSS | Four shared nonuniform bands: 0–15%, 15–40%, 40–72%, 72–100%. Realm-based HUD thresholds, colored contours/borders and pulsing active band. |
| Repetitive audio | Partially Implemented | SoundManager | Reduced existing SFX gain factors from .8 to .45. Music master/recorded tracks remain independently controlled. |
| Realm progression | Partially Implemented | SeasData, RealmContent | Level gates 10,17,23,30,37,43,50; fees 0,6000,35000,35000,210000,420000,3000000; one authoritative fee source. Existing unlocks and free starter access are preserved. |
| Gear economy | Partially Implemented | functions/shared/UpgradesData | Tier 1–2 costs ×1.5; tier 7+ costs ×.65. Shared client/server catalog. |
| Gems / premium uses | Partially Implemented | premium.js, PremiumPurchases, GemShop | Transactional crate purchases, gear skips, four soundtrack unlocks, three boat paints; retained angler and aquarium styles. Removed the unsafe local-only debit of purchased Gems. |
| Stripe pipeline | Partially Implemented | checkout.js, index.js | Four bundles: 10/$1.99, 35/$4.99, 100/$9.99, 225/$19.99. Validates exact USD Price; existing raw-body signatures, receipt idempotency and atomic credits retained. |
| Crate vault | Partially Implemented | UIManager, shared/CrateData, premium.js | Five rank purchase buttons deliver unopened crates to persistent inventory. |
| Drop preview | Partially Implemented | shared/CrateData, UIManager | Per-item odds, including pity-adjusted odds and an explicit 0.1% divine reward. Percentages displayed to four decimal places. |
| Reel / pity | Partially Implemented | CrateData, SaveSystem, UIManager | Visible pity meter, explicit Epic/God rarity, tenth-open guarantee, one local transaction before animation, measured reel width, animation stops on modal removal. |
| Crate catch economy | Partially Implemented | OceanWorld, CrateData | Crate selection weight ×.3, positive table gold ×2, XP ×1.5; active event multiplier actually participates in selection. |
| Spawn depth and taper | Partially Implemented | OceanWorld, Fish | Retained strict spawn pools and swimming bounds; added bounded exponential gold, XP and catch-score depth rewards; corrected depth origin to water surface and guaranteed a habitat-valid shallow resident in sparse realms. |
| Fauna / paths | Partially Implemented | FishData, Fish | Preserved existing diverse shapes; added named Giant Cave Salamander/Rainbow Narwhal using save-compatible IDs and lunge/spiral movement. |
| Flora / power-ups | Implemented | InteractiveFlora, Powerup, Hook | Retained realm-specific slowing/slip plants, overdrive, magnet, capacity and curses; escaped fish return to habitat bounds. |
| Hazards / bosses | Partially Implemented | ExpeditionHazards, Hazard, NaturalHazardArt | Registered divers/submarines in shared ecology, added moving searchlight art, falling stalactites and automated probes; retained depth-scaled threats and existing leviathan encounters. |
| Server weather | Partially Implemented | WorldCycle, serverClock | Existing deterministic 35-minute/5-minute events use a server-measured clock offset online, with offline fallback. |
| Weight / mutation RNG | Partially Implemented | CatchTraits, Fish, SaveSystem | Tiny .5×, Regular 1×, Giant 1.5×, Colossal 2×; Gold/Bioluminescent/Albino sell multipliers; rolls once on attachment and persists in inventory. |
| Catch cards | Missing / Broken | CatchCard, UIManager | Rare-and-above haul card with specimen, weight, captain and realm; Canvas toBlob download and clipboard image copy with unsupported-browser feedback. |
| Fleet alerts | Missing / Broken | announceCatch, ChatManager | Retry-deduplicated server broadcasts from persisted God/Boss catch reports and 0.1% crate reports. Client rules cannot author event messages. |
| Aquarium visits / tips | Missing / Broken | aquarium.js, AquariumSocial, rules | Publish sanitized exhibits, open shared links including Fleet Radio links, spend one coin to give host one Gem, three tips per visitor per UTC day, atomic retry-safe transaction. |
| Aquarium fidelity | Partially Implemented | UIManager, CatchCard, AquariumSocial | Replaced generic oval drawings with Fish.update/render; restores weight, crown, shiny and mutation metadata. Aquarium bounds/visual scale adapt to the tank. |
| Mobile | Partially Implemented | TouchControls, main, CSS | Touch steering/reel buttons with pointer capture/cancellation, keyboard-input isolation, responsive modal grids and safe-area positioning. |
| Schema / typing / verification | Partially Implemented | schemas, tsconfig, tests | Firestore and save schema documentation; strict checks for new trait and backend transaction modules; economic/concurrency and browser regression tests. |

## Architectural boundaries

- This is a Canvas 2D game. There are no ship meshes, remote-player ship replication,
  or independently piloted player submarines in this repository. Hazard damage and
  knockback act on the existing hook/line/shield system. A separate playable
  submersible would require a new player-control model.
- Gameplay saves, earned Gems, catch reports and local gacha remain client-reported.
  Stripe credits and purchased-Gem debits are server transactions, but this does not
  turn the existing offline game into an authoritative anti-cheat economy. Fleet
  alerts report persisted catches; they are not proof of server-simulated fishing.
- Aquarium visits refresh a sanitized exhibit from the host cloud save; Share creates a link.
  Aquarium motion uses the ocean entity code with tank-sized bounds and scale.
- Strict TypeScript checking is incremental: CatchTraits and backend aquarium and
  premium transactions are checked. The legacy UI/gameplay JavaScript has not been
  converted wholesale to strict TypeScript.
- Live Stripe charges, deployed webhooks, authenticated cross-device visits and
  production Firestore rules require deployment and configured credentials. Game services and hosting are deployed. Stripe is deferred by the owner; no real payment was performed.

## Verification

Final local result: 70 frontend/domain tests and 12 backend tests pass; both
desktop/mobile browser smoke scenarios pass; strict domain checks and production
build pass. Both dependency trees report zero npm audit findings.

- `npm test`: frontend/domain regressions, including per-item probabilities,
  persistent pity, trait boundaries, gates, local rollback, ecology and vessel art.
- `npm test --prefix functions`: Stripe signature/retry tests and transactional
  purchase/tip tests, including concurrent daily limits and UTC rollover.
- `npm run typecheck`: strict checks for the new typed domain modules.
- `npm run build`: production Vite build.
- `npm run test:browser`: Edge headless at 1280×800 and 390×844; game startup,
  shop, crate vault, interrupted spin delivery, aquarium, Almanac, depth chart and
  exported PNG. Start Vite on port 5174, or set GAME_TEST_URL. External service
  requests are blocked in this read-only smoke test.

Balance values are implementation defaults, not the result of player economy
simulation. Vite still reports existing large-bundle warnings; no high-FPS claim
is made without device profiling.

Dependency audit also updated compatible toolchain packages. Firebase's Node-only
gRPC dependency is overridden within major version 1 to a patched release;
gaxios's UUID dependency is overridden to 11.1.1+, retaining the CommonJS `v4()`
API used by gaxios. Both package trees report zero npm audit findings after
installation. Keep these overrides under review when upgrading Firebase/gaxios.

## Final release verification (2026-10-03)

- Added durable aquarium tip receipts: a retry after UTC midnight cannot charge
  another coin or credit another Gem. Receipts bind requests to their original host.
- Corrected companion hover bounds to use the same vessel tier as rendering and clicks.
- Keyboard steering/reeling leaves modal controls alone and prevents page scrolling.
- Browser smoke now completes a real cast, reel, haul confirmation and return to
  the surface using mouse/keyboard on desktop and touch controls on mobile.
- Seven realms now each use four named, widely spaced depth zones in RealmDepths,
  with habitat specialists, depth scenery, gradually declining fish density and
  21 additional creatures. This supersedes the earlier percentage-based chart.
- Current upgrade factors are 1.725 for early tiers and .585 for endgame tiers;
  ordinary SFX gain is .28. These supersede the starting audit values above.
- Fleet Radio cleanup and rare-catch broadcasts are included in the release.
- Authenticated production purchases and tipping are not exercised with real
  player accounts. Transactional tests and mocked browser visits cover those paths.
- Stripe needs the owner's Price IDs and Secret Manager configuration before
  checkout and webhook deployment; see STRIPE_SETUP.md.
