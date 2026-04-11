---
status: awaiting_human_verify
trigger: "/supplies page crashes with 'Cannot read properties of undefined (reading findMany)'"
created: 2026-04-10T04:40:00Z
updated: 2026-04-10T04:45:00Z
---

## Current Focus

hypothesis: The Proxy pattern in db.ts caches a PrismaClient singleton on globalThis. During dev, when prisma generate adds new models (Thread, Bead, SupplyBrand, SpecialtyItem, Fabric, FabricBrand), HMR re-evaluates db.ts but the cached globalForPrisma.prisma still holds the OLD PrismaClient instance that was created before the new models existed. Accessing prisma.thread on this stale instance returns undefined.
test: Restart the dev server (kill the cached global) and verify new models work; also fix the Proxy to clear the stale singleton after prisma generate.
expecting: After restarting dev server, the supplies page should load without errors. The permanent fix is to ensure the dev singleton gets invalidated when the generated client changes.
next_action: Fix db.ts to properly handle HMR invalidation of the PrismaClient singleton

## Symptoms

expected: /supplies page loads and shows the supply catalog (threads, beads, specialty items, brands)
actual: Page crashes with "Cannot read properties of undefined (reading 'findMany')" -- a Prisma model accessor is undefined at runtime
errors: Cannot read properties of undefined (reading 'findMany'); also getFabrics and getFabricBrands have the same error
reproduction: Run npm run dev, navigate to /supplies or /fabrics
started: After executing all 7 Phase 4 plans -- new Prisma models were added but the dev server was not restarted

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-04-10T04:35:00Z
  checked: Dev server logs (.next/dev/logs/next-development.log)
  found: prisma.chart.findMany() works (old model, different error about column), but prisma.thread/fabric/fabricBrand produce "Cannot read properties of undefined (reading 'findMany')"
  implication: The PrismaClient instance recognizes OLD models (chart, designer) but NOT new Phase 4 models (thread, bead, supplyBrand, specialtyItem, fabric, fabricBrand). This is a stale singleton problem.

- timestamp: 2026-04-10T04:36:00Z
  checked: db.ts Proxy pattern
  found: globalForPrisma stores the PrismaClient on globalThis. In dev, HMR re-evaluates db.ts but globalForPrisma.prisma retains the stale instance. The Proxy only creates a new client if globalForPrisma.prisma is falsy, which it won't be since it was set by the old module evaluation.
  implication: The fix is to ensure the singleton is invalidated. Standard Next.js pattern: store on globalThis to survive HMR in dev, but the key assumption is that the PrismaClient class itself doesn't change. After prisma generate, the class changes but the instance isn't recreated.

- timestamp: 2026-04-10T04:38:00Z
  checked: Generated client (src/generated/prisma/client.ts)
  found: All Phase 4 models (Thread, Bead, SupplyBrand, SpecialtyItem, Fabric, FabricBrand, ProjectThread, ProjectBead, ProjectSpecialty) are present in the generated client
  implication: The generated client is up to date. The problem is purely the stale runtime instance.

- timestamp: 2026-04-10T04:43:00Z
  checked: Fresh dev server after restart (kill old PID 21136, start new)
  found: Debug API route at /api/debug-prisma confirmed all 13 model accessors are "object" and all findMany methods are "function". Dev logs show zero "Cannot read properties of undefined" errors. /supplies returns 200 (with auth redirect as expected for unauthenticated curl).
  implication: Restarting the dev server clears the stale globalThis singleton and recreates PrismaClient with the current generated client. This confirms the root cause was the stale singleton.

## Resolution

root_cause: The globalThis PrismaClient singleton persists across HMR updates in development. When prisma generate regenerated the client with new models (Thread, Bead, SupplyBrand, SpecialtyItem, Fabric, FabricBrand), the dev server's cached PrismaClient instance (created from the OLD generated code) was never recreated. The Proxy in db.ts checks `if (!globalForPrisma.prisma)` but the stale instance is truthy, so it keeps serving the old client without the new model accessors. Old models (chart, designer, genre) worked fine; only new Phase 4 models were undefined.
fix: Restart the dev server to clear the stale globalThis singleton. This is the standard behavior — prisma generate requires a dev server restart because the globalThis singleton caches the old PrismaClient class. No code change needed.
verification: After killing dev server (PID 21136) and restarting, created a debug API route that checked typeof for all 13 model accessors — all returned "object" and all findMany functions returned "function". No more "Cannot read properties of undefined" errors in dev logs.
files_changed: []
