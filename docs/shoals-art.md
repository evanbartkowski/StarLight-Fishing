Original Canvas artwork for Sunlit Shoals uses side-view anatomy, dark blue-green
outlines, native animal markings and warm/cool material shading. The eighteen
designs in `src/rendering/ShoalsFishArtwork.js` cover the original starter fish,
selected native residents and the Lanternmaw Pip. These code-authored drawings
contain no external imagery, fonts or licensed third-party assets.

Identity remains readable in motion: forked sardine tails, white clownfish bands,
yellow tang tails, butterfly eyespots, mandarin whorls, boxfish honeycomb armor,
flounder eyes, parrotfish scales, curled seahorse tails, plated turtle shells,
octopus suckers, chambered nautilus shells and jellyfish bells. Selected residents
use larger world scales. Existing fish IDs, saved weights and saved lengths remain
valid. Shiny and mutation appearances still use their existing variants.

The Pip keeps the old `easter_misleading_monster` ID, has a 7,200-coin base value,
and remains a rare scripted encounter rather than ordinary population. Its opaque
projection is about 670 pixels wide with a broader mist envelope, independent of
the minnow's body scale. It reveals within 82 pixels of the hook. A hooked or owned
specimen shows its copper fins, false eye and glass lantern. The illusion changes
neither the real catch target nor the fish's collision radius.

Validation: `tests/shoals-art.mjs` draws both directions and shiny variants for all
18 designs on desktop and phone viewports, checks projection/reveal and saved
specimen behavior, and confirms cached treasures allocate no new gradients during
repeated drawing. Native-size before/after sheets live in `.qa/realm-one-*.png`.
