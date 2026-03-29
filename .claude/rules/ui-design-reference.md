---
globs:
  - "src/components/features/**/*.tsx"
  - "product-plan/**/*"
---

# UI Design Reference Rules

The entire UI has been designed in DesignOS. **The design is the spec.**

Before building ANY feature component:

1. Find the design reference in `product-plan/sections/` (see `.planning/DESIGN-REFERENCE.md`)
2. Read the component .tsx file — layout, fields, sub-components, interaction patterns
3. Read the screenshot .png — intended visual result
4. Read shared sub-components in the same section's `components/` directory
5. Adapt to Next.js — server/client split, server actions, Zod validation
6. If no design reference exists, flag it before building

Design section to phase mapping:

| Section | Path | Phase |
|---------|------|-------|
| project-management | `product-plan/sections/project-management/` | 2 |
| supply-tracking-and-shopping | `product-plan/sections/supply-tracking-and-shopping/` | 3 |
| stitching-sessions-and-statistics | `product-plan/sections/stitching-sessions-and-statistics/` | 4 |
| fabric-series-and-reference-data | `product-plan/sections/fabric-series-and-reference-data/` | 5 |
| gallery-cards-and-advanced-filtering | `product-plan/sections/gallery-cards-and-advanced-filtering/` | 6 |
| dashboards-and-views | `product-plan/sections/dashboards-and-views/` | 7 |
| goals-and-plans | `product-plan/sections/goals-and-plans/` | 8 |
