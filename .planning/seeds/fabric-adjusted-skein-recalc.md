---
name: Fabric-adjusted skein recalculation
description: Auto-recalculate skein requirements when user's fabric differs from chart's reference fabric setup
type: seed
planted_date: 2026-04-14
trigger_condition: When fabric assignment or fabric count selection is implemented/enhanced — ties into the existing fabric selector and any future auto-calculation from fabric dimensions
---

## Idea

When a chart specifies "model stitched on 14-count over two with 2 strands" but the user assigns an 18-count fabric stitching over one, the app could auto-adjust skein quantities based on the difference in thread consumption.

## Why it matters

Users currently do this mental math themselves ("chart says 6 skeins on 14-count, I'm on 18-count so I probably need fewer"). Automating it would save guesswork and reduce over-buying.

## What it would need

- Capture chart's reference fabric setup (count, over-X) — this is the main friction point
- Compare against the user's actual linked fabric
- Apply a ratio adjustment to calculated skeins
- Could trigger on fabric assignment: "Your fabric differs from the chart's reference. Recalculate quantities?"

## Why it's parked

Requires the user to input what the chart's model was stitched with — extra data entry for uncertain payoff. Revisit once the base calculator is in use and we can see if users want this.

## Integration points

- Fabric selector (already built in Phase 5)
- Fabric count field on the fabric entity
- Skein calculator (Phase 7)
- Could surface as a prompt when linking fabric to a project that already has calculated skein quantities
