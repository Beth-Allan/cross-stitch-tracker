# Kitting and storage

What it means for a project to be ready to stitch, and where the physical things live.

Seeded 2026-08-16 (overhaul step 5) from `CROSS_STITCH_TRACKER_PLAN.md` §3.

---

### KIT-001 — "Kitted" is a calculated state with nine conditions

A project is **kitted** when **all** of the following are true:

1. it has a digital working copy (VOC-009);
2. it is in a project bag (KIT-002);
3. stash has been checked for supplies already owned (VOC-007);
4. all needed thread is acquired;
5. fabric is assigned **and in the bag**;
6. all beads, if the design needs them, are in the bag;
7. all specialty items, if the design needs them, are in the bag;
8. any onion skinning is complete (VOC-008);
9. the chart is loaded into a stitching app, or ready to load.

**It is calculated, never stored** — the app derives it from the underlying facts rather than
letting anyone tick a "kitted" box. That is also the repo's schema convention (calculated fields
at query time).

[from the project plan 2026-08-16 — CROSS_STITCH_TRACKER_PLAN.md §3, not re-confirmed]

### KIT-004 — Kitting % for a project with no supplies recorded is 0%

A project with **no supplies recorded against it** shows **0% kitted**, not 100%: "no kit list
recorded" means _not ready — kit list unknown_, never _nothing left to gather_. Related, ruled in
the same breath: having the right **fabric alone does not make a project kittable** — supplies
decide it (fabric is one of KIT-001's conditions, not a substitute for the list). Chosen over the
alternatives (100%, or a "no kit list" label instead of a percentage) at the 2026-08-17
`/cleanup`, resolving the drift row of the same date.

[stated by Beth 2026-08-17]

### KIT-002 — Project bag

A physical bag or pouch holding all the supplies for a single project.

[from the project plan 2026-08-16 — CROSS_STITCH_TRACKER_PLAN.md §3, not re-confirmed]

### KIT-003 — Project bin

A physical storage container — an accordion folder — holding multiple project bags. The plan
records **~4–5 bins in a bookcase**, and describes a bin as essentially a location label rather
than a container with rules of its own.

[from the project plan 2026-08-16 — CROSS_STITCH_TRACKER_PLAN.md §3, not re-confirmed]
