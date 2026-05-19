# Phase 24: Code Quality - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 24-code-quality
**Areas discussed:** Comment cleanup boundaries, PersonalBestRecord redesign, Date consistency direction, Phase 22 deferred items

---

## Comment Cleanup Boundaries

| Option | Description | Selected |
|--------|-------------|----------|
| A. Full sweep | Remove ALL section markers everywhere, including type files | |
| B. Requirement-literal | Remove exactly the ~47 items named in QUAL-06/07/14 | |
| C. Tiered by file type | Remove JSX labels, function-body markers, planning refs. Keep type-file markers with documented exception | ✓ |
| D. Tiered by judgment | Case-by-case per comment based on surrounding structure | |
| E. Keep all ─── markers | Only remove JSX labels and planning doc refs | |

**User's choice:** C. Tiered by file type
**Notes:** Research identified three distinct comment families. Type-bundle files (stats.ts, dashboard.ts) have no function symbol structure — markers are the only navigation. JSX labels and function-body markers are redundant. Convention exception to be documented in .claude/rules/.

---

## PersonalBestRecord Redesign

| Option | Description | Selected |
|--------|-------------|----------|
| A. Status quo | Keep flat interface with 4 nullable fields | |
| B. Two-variant union | ProjectLinkedRecord (bestDay/bestSession) + AggregateRecord (streaks) | ✓ |
| C. Three-variant | Add EmptyRecord variant for zero-session state | |
| D. Four separate types | One interface per RecordType | |

**User's choice:** B. Two-variant union
**Notes:** Domain split is binary — two record types carry project attribution, two carry only counts. Optional (not nullable) fields for empty-state path. ~6 files touched. BrokenRecordType becomes Exclude<RecordType, "currentStreak"> independently.

---

## Date Consistency Direction

| Option | Description | Selected |
|--------|-------------|----------|
| A. Normalize to string | Change SessionHistoryItem.date from Date to string (YYYY-MM-DD) | ✓ |
| B. Normalize to Date | Convert all string dates to Date objects | |
| C. Document the split | Keep both, add JSDoc explaining why | |
| D. Branded string type | Type-safe LocalDateString nominal type | |

**User's choice:** A. Normalize to string
**Notes:** SessionHistoryItem.date is the lone outlier — 5 other stats date fields already use strings. Research identified a latent serialization bug: React RSC serializes Date to ISO string across SC→CC boundary, making the type diverge from wire format. Component only uses day precision anyway.

---

## Phase 22 Deferred Items

| Option | Description | Selected |
|--------|-------------|----------|
| A. Include without tracking | Do the work but don't add formal requirements | |
| B. Add QUAL-15/16 | Add assertSuccess/assertFailure utility + project-wide vacuous assertion sweep to requirements | ✓ |
| C. Backlog as 999.x | Defer to future milestone | |
| D. Utility only | Build utility, defer sweep | |

**User's choice:** B. Add QUAL-15/16
**Notes:** Research found 43 instances across 12 files (more than Phase 22's ~17 estimate). Utility and sweep are tightly coupled. Honors the explicit Phase 22 deferral to Phase 24. Requirements and roadmap updated with QUAL-15/16.

---

## Claude's Discretion

- Plan structure and grouping of 16 QUAL requirements
- Exact literal union values for MonthLabel, DayLabel, strandCount
- buildDateFilter extraction location
- Scope type definition
- Semantic token mapping for emerald-* → design tokens
- DailyBreakdownEntry/CalendarSession relationship
- AvailableYearsData unwrapping approach
- CompletionEstimate tilde prefix movement
- Convention exception wording

## Deferred Ideas

None — discussion stayed within phase scope.
