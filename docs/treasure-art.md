The dredged-object illustrations in `src/rendering/TreasureArtwork.js` are original,
code-authored vector drawings created for Starlight Fishing. They use the game's
existing navy, brass and realm-color palette; no external images or fonts are used.

The catalog ID resolves the same drawing for water, catches, saved inventory and
inspection. Drawings occupy a 68 by 68 view box with a centered pivot. Canvas uses
cached native Path2D objects to build a 136 by 136 material sprite once per catalog
ID; icons use SVG from those same paths and gradients. Drawing an artifact in the
ocean then needs one image draw. The entire 78-item cache is bounded at about 5.5 MB
of uncompressed pixels; only encountered items are allocated. No network loads,
per-frame image decoding or extra animation loops are needed.

`tests/treasure-art.mjs` checks every non-crate catalog item for visible pixels and
compares its SVG silhouette to its native Canvas drawing, then produces a contact
sheet in `.qa/treasure-contact-sheet.png` for visual inspection. Existing saves are
covered by the catalog-ID regression in `tests/treasure-art.test.js`.

The latest material pass adds beveled metals, glass reflections, pearl highlights,
amber inclusions, engraved hardware and weathered fossil slabs. The six native
Sunlit Shoals artifacts and selected salvage are enlarged by 12 to 30 percent in
the water, with matching collision radii. Hooked artifacts retain compact scale.
The Sunken Iron Safe has its own weathered iron case, recessed door, brass wheel,
hinges and keyhole. Timestamped legacy safe IDs share one art cache entry and load
as salvage instead of fish, preserving their value and ownership.
