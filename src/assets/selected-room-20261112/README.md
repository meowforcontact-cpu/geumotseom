# Selected room, furniture and cat — 2026-11-12

These are the user's selected files from the shared `pixel ai` / `피카 운영` workspace:

- `room.png`: attached 1024×768 topdown background, SHA256 `75ca9ab7ccea643919fc40c3a5b87e8eb02b4249e8d855270c6c2d3b82d1b8c8`.
- `cat/`: latest restored-L eight-direction cat, identical to G. South SHA256 `babdb48e46577edf9469683d97f418663ec9f3e070a92e4fd056e54d6b1e50ea`. No new character design or expression animation was generated.
- `furniture/`: nine cream/blue furniture designs extracted from the current attached atlas plus the hydrangea table. `cream_f5` aliases the tea table;11 files represent10 designs. Original extracted RGBA pixels are retained.

`build.mjs` embeds these files directly into WHITEWOOD_ASSETS (version `selected-20261112`), replacing the old three-furniture embedded set. The old `whitewood-assets.js` is no longer the build input. The generated bundle is tested against every selected PNG's SHA256, with explicit background and cat identity checks.

Whitewood uses a170×128 world filling the existing4:3 LCD. Portrait fits the same entire room width and reveals additional floor below. Furniture bounds, pointer conversion, pet movement and depth sorting share those coordinates. There is no square crop or black landscape margin.

Layout version5 supplies all ten designs for the default room. Old default positions migrate; user-moved positions and intentionally stored pieces remain intact. Pet species, names, wallet and progress are preserved. The selected cat replaces only cat artwork; dog/rabbit/angel assets remain unchanged.

Validation: build succeeds, selected-asset5 tests and depth9 tests pass. Full suite55/62; the same7 failures predate these changes. Browser review uses the actual latest Git build with an isolated sample state.
