The dredged-object illustrations in `src/rendering/TreasureArtwork.js` are original,
code-authored vector drawings created for Starlight Fishing. They use the game's
existing navy, brass and realm-color palette; no external images or fonts are used.

The catalog ID resolves the same drawing for water, catches, saved inventory and
inspection. Drawings occupy a 68 by 68 view box with a centered pivot. Canvas uses
cached native Path2D objects; icons use SVG from those same paths. No network loads,
per-frame image decoding, texture atlases or extra animation loops are needed.

`tests/treasure-art.mjs` checks every non-crate catalog item for visible pixels and
compares its SVG silhouette to its native Canvas drawing, then produces a contact
sheet in `.qa/treasure-contact-sheet.png` for visual inspection. Existing saves are
covered by the catalog-ID regression in `tests/treasure-art.test.js`.
