# Room depth ordering

Furniture and the pet now share a single ascending ground-contact Y draw list. Furniture depth comes from its rendered bottom edge, including a live drag draft; pet depth is its ground Y. Stable keys resolve ties independently of equip order. Movement advances once before sorting so painting does not change the position being sorted.

Picking traverses the same list front to back and tests the displayed sprite alpha. Transparent padding passes through; visible foreground furniture or a foreground pet blocks selection behind it. Selection outlines remain UI overlays and do not change object depth.

The existing 4:3 device/camera, assets, sizes, saved positions, ownership and account behavior are unchanged. The patch is built into the public and offline bundles by `build.mjs`.

Validation on origin/main 2eadd99: build succeeds;9 depth regressions pass. Full suite50/57 passes. The7 failures also occur on the unmodified baseline41/48 and concern earlier navigation/save/font/purchase changes. No new failures. Browser verification covers the same overlapping furniture with the pet behind and then in front. No production data is used for the review.
