# Phase 36: Type Safety - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-01
**Phase:** 36-type-safety
**Areas discussed:** strandCount bridging, OptionalFocalPoint union, Co-dependent props pattern, Controlled-only cleanup

---

## strandCount Bridging

### Q1: Where should the strandCount literal union (1-6) be enforced?

| Option | Description | Selected |
|--------|-------------|----------|
| Zod at boundary | Keep Prisma as Int. Add StrandCount type alias to shared location. Use Zod coerce/refine at Prisma→app boundary. The `as` cast becomes a validated parse. | ✓ |
| Narrow everything | Define StrandCount = 1\|2\|3\|4\|5\|6 everywhere. Accept Prisma returns number and validate once at query layer. | |
| You decide | Let Claude pick based on codebase patterns. | |

**User's choice:** Zod at boundary

### Q2: Where should the shared StrandCount type live?

| Option | Description | Selected |
|--------|-------------|----------|
| src/types/supply.ts | New file next to focal-point.ts and other shared domain types. Export type + isStrandCount guard. | ✓ |
| src/lib/constants.ts | Already exists (has DEFAULT_SUPPLY_HEX). Add type + validation alongside constant. | |
| You decide | Let Claude pick. | |

**User's choice:** src/types/supply.ts

### Q3: Should skein-calculator CalculateParams also get the literal union?

| Option | Description | Selected |
|--------|-------------|----------|
| Narrow to StrandCount | Enforce constraint at every level. Prevents impossible inputs at compile time. | ✓ |
| Keep as number | Calculator is pure math — works with any positive number. Narrowing is upstream concern. | |

**User's choice:** Narrow to StrandCount

---

## OptionalFocalPoint Union

### Q1: What shape should the discriminated union take?

| Option | Description | Selected |
|--------|-------------|----------|
| Both-or-neither union | `{ focalPointX: number; focalPointY: number } \| { focalPointX: null; focalPointY: null }`. Consumers spread/intersect the same way. | ✓ |
| Nested optional object | `{ focalPoint: { x: number; y: number } \| null }`. Cleaner semantically but requires changing all property accesses. Much larger blast radius. | |
| You decide | Let Claude pick to minimize blast radius. | |

**User's choice:** Both-or-neither union

### Q2: Where should the both-or-neither constraint be enforced?

| Option | Description | Selected |
|--------|-------------|----------|
| Query-level mapping | In each query that selects focal point fields, map raw Prisma result into discriminated union using a mapFocalPoint helper. | ✓ |
| Type assertion at action boundary | Use `as OptionalFocalPoint` at query boundary. Pragmatic but less safe. | |
| You decide | Let Claude pick based on query site count. | |

**User's choice:** Query-level mapping

### Q3: Where should the mapFocalPoint helper live?

| Option | Description | Selected |
|--------|-------------|----------|
| src/types/focal-point.ts | Co-locate type and mapper. Small function, directly tied to type definition. | ✓ |
| src/lib/utils/focal-point.ts | Separate types from runtime code. Matches existing utils pattern. | |

**User's choice:** src/types/focal-point.ts

---

## Co-Dependent Props Pattern

### Q1: SuppliesTab co-dependent props approach?

| Option | Description | Selected |
|--------|-------------|----------|
| Optional object | `calculator?: { fabricOptions: FabricOption[]; chartId: string }`. One prop, either both present or absent. | ✓ |
| Overloaded signatures | Two SuppliesTabProps variants via discriminated union. More explicit but heavier. | |
| You decide | Let Claude pick. | |

**User's choice:** Optional object

### Q2: AggregatedSupply.items non-empty tuple?

| Option | Description | Selected |
|--------|-------------|----------|
| Non-empty tuple | `[ShoppingSupplyNeed, ...ShoppingSupplyNeed[]]`. Encodes at-least-one invariant from aggregation. | ✓ |
| Keep as array | Invariant enforced by aggregation function, not the type. | |

**User's choice:** Non-empty tuple

### Q3: Where should the shared onUpdateAcquired type live?

| Option | Description | Selected |
|--------|-------------|----------|
| src/types/shopping.ts | New file in types/ alongside other domain type files. | ✓ |
| Co-locate in shopping/types.ts | Types.ts inside the shopping feature directory. Closer to consumers. | |
| You decide | Let Claude pick based on import patterns. | |

**User's choice:** src/types/shopping.ts

---

## Controlled-Only Cleanup

### Q1: InlineDesignerDialog approach?

| Option | Description | Selected |
|--------|-------------|----------|
| Delete dead code | Remove trigger, uncontrolled state, isControlled branching, useState ref hack. Props become open/onOpenChange (required) + initialName + onSubmit. | ✓ |
| You decide | Let Claude decide simplest approach. | |

**User's choice:** Delete dead code

### Q2: LocalStateAdapter.updateQuantity fix?

| Option | Description | Selected |
|--------|-------------|----------|
| Narrow field parameter | Change `field: string` to constrained union of updatable SupplyRow fields. Remove `as unknown as` cast. | ✓ |
| You decide | Let Claude determine right field constraints. | |

**User's choice:** Narrow field parameter

### Q3: SuppliesTab persistFields narrowing?

| Option | Description | Selected |
|--------|-------------|----------|
| Narrow to CalcParams pick | `Partial<Pick<CalcParams, 'strandCount' \| 'overCount' \| 'wastePercent'>>`. Prevents typos, self-documenting. | ✓ |
| You decide | Let Claude pick based on actual usage. | |

**User's choice:** Narrow to CalcParams pick

---

## Claude's Discretion

- Ordering of type changes across plans
- Exact field names in LocalStateAdapter `field` union (verify from usage)
- Whether `isStrandCount` should be a function or Zod schema
- How to structure `mapFocalPoint` call sites (individual vs shared mapper)

## Deferred Ideas

None — discussion stayed within phase scope
