---
status: investigating
trigger: "37x42 unassigned fabric not showing as match for project needing 16.7x8 fabric"
created: 2026-04-17T00:00:00Z
updated: 2026-04-17T00:00:00Z
---

## Current Focus

hypothesis: "Fabric matching filters by `f.count === fabricCount` (line 158), requiring exact count match. If the unassigned fabric has a different count than the project's assigned fabric, it's excluded even though it's physically large enough."
test: "Check whether the 37x42 fabric has the same `count` value as the project's assigned fabric"
expecting: "If counts differ, the fabric is silently excluded from matchingFabrics, which explains the 'no fabrics fit' message"
next_action: "Confirm by reading Prisma schema for Fabric model to verify count is fabric thread count (e.g., 14ct, 16ct, 18ct)"

## Symptoms

expected: "A 37x42 inch unassigned fabric should show as a match for a project needing only 16.7x8 inches of fabric"
actual: "UI says 'no fabrics in your stash fit this project' despite having a fabric more than twice the required size"
errors: "No error messages — logic bug, not a crash"
reproduction: "Open Pattern Dive > Fabric Requirements tab > expand a project needing 16.7x8 > no matching fabrics shown"
started: "Discovered during use of Pattern Dive feature"

## Eliminated

## Evidence

- timestamp: 2026-04-17T00:01:00Z
  checked: "getFabricRequirements in pattern-dive-actions.ts, lines 155-176"
  found: "Line 158 filters unassigned fabrics with `f.count === fabricCount` — fabrics must have the EXACT same thread count as the project's assigned fabric. A 14ct project will never see 16ct or 18ct unassigned fabrics, even if they're physically enormous."
  implication: "This is the root cause. The count filter is correct in principle (you can't use 14ct fabric for a 16ct project — stitch density differs), BUT the bug is that when a project has NO assigned fabric (fabric: null), fabricCount is null, and the entire matching block is short-circuited by the ternary on line 155-156: `fabricCount && requiredWidth && requiredHeight ? ... : []`. Projects without assigned fabric get zero matches."

- timestamp: 2026-04-17T00:02:00Z
  checked: "The condition on line 155-156: `fabricCount && requiredWidth && requiredHeight`"
  found: "fabricCount comes from `p.fabric?.count ?? null` (line 134). When a project has no assigned fabric, fabricCount is null, requiredWidth is null, requiredHeight is null. The matching logic returns an empty array `[]`."
  implication: "This is by design — without knowing the fabric count, you can't calculate required dimensions. But this means projects without fabric can NEVER show matching fabrics, which is the exact scenario the user is reporting."

- timestamp: 2026-04-17T00:03:00Z
  checked: "UI component fabric-requirements-tab.tsx, line 277-349"
  found: "The UI shows 'No fabrics in your stash fit this project' when `row.matchingFabrics.length === 0`. It doesn't distinguish between 'no matches because count is unknown' vs 'no matches because all fabrics are too small'."
  implication: "Even if matching works correctly for assigned-fabric projects, unassigned-fabric projects always show 'no fabrics fit' which is misleading."

## Resolution

root_cause: "Catch-22 in getFabricRequirements (pattern-dive-actions.ts, lines 134-176):

The fabric matching logic requires `fabricCount` to calculate required dimensions AND to filter unassigned fabrics by count. But `fabricCount` comes from the project's ASSIGNED fabric (`p.fabric?.count`). The default UI filter ('needs') shows only projects WITHOUT assigned fabric.

Result: Projects shown in the 'Needs Fabric' view ALWAYS have `fabricCount = null`, so `requiredWidth` and `requiredHeight` are null, and the matching ternary (line 155-156) short-circuits to `[]`. These projects can NEVER show matching fabrics.

A secondary issue: even if a project HAS assigned fabric (visible in 'All Projects' view), line 158 filters `f.count === fabricCount`, requiring exact count match. A 37x42 fabric with a different count (e.g., 16ct vs 14ct) won't appear.

The core design problem: fabricCount should be a property of the PROJECT (what count the user plans to stitch on), not derived from the assigned fabric. The Prisma schema has Fabric.count as an Int on the Fabric model but there's no 'planned fabric count' on the Project/Chart."
fix: ""
verification: ""
files_changed: []
