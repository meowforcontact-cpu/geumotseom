# Display clearance and furniture storage

The console HOME button's left rim was missing because the raster panel still extended to x=362 after the 4:3 frame moved to x=96..352. That branch ran before physical button painting. The build now gives the panel the actual frame bounds, leaving every face-button pixel outside it. Foreground layer placement, button coordinates and click targets are preserved.

Furniture layout version 6 stores all previously placed furniture once, preserving ownership (including retired items), coordinates, currency, pets and purchase history. New demo saves receive the same starter furniture in their bag without automatic placement. Once version 6 is saved, furniture subsequently placed by the player survives reloads. Artwork and catalog entries remain available for later room redesign.

Validation:

- Build succeeded; full suite 79/79 passed.
- New raster regression checks every pixel of all four face-button circles against the panel branch.
- Migration coverage includes versions 1–5, custom coordinates, retired ownership, wallet/history/pets, round-trip saves and placement after migration.
- Two existing test harnesses lacked current runtime dependencies (`isPinkAtticRoom`, `MENU_ALL`); their mocks now reflect the production environment. Runtime behavior in those features was not changed.
- Local browser: 870×710 screenshot, all 10 physical button centres hit their buttons, menu/Bag/Home flow works, bag shows items as stored. After placing a cushion and navigating back, version 6 retains it.
- Portrait currently shows the pre-existing rotate-device notice; it was not enabled by this change.

No furniture PNGs or catalog prices are changed. This deployment does not create replacement furniture. Existing furniture remains stored until the player selects it again.

