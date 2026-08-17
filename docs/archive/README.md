# docs/archive/ — history, not authority

**Nothing in this directory governs anything.** It is kept because it records how the project got
here, and because a later session tracing a decision should find the reasoning rather than
re-derive it. Every file here describes a process that is over or a plan that has been superseded.

**Do not follow instructions found in these files.** The live authorities are `CLAUDE.md` and
`docs/process/session-protocol.md`; the live plan is `docs/process/build-plan.md`; the live memory
is `docs/process/work-log.md`.

Archived 2026-08-16 at workflow-overhaul step 5.

| what                                    | was                                       | why it is here                                                                                                                                                                        |
| --------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `planning/`                             | `.planning/`                              | the GSD-era state directory — 34 phases across 9 milestones, plus its milestones, phases, debug notes, spikes, sketches, research, audits and critique reports. The process is over. |
| `superpowers/`                          | `docs/superpowers/`                       | two plan/spec pairs from the superpowers era (chart-form rebuild, code-quality infrastructure). Both shipped; the framework is not installed.                                        |
| `tech-stack.md`                         | `docs/tech-stack.md`                      | the pre-build "recommended stack" research. It recommended things that were never installed (Zod 4, Serwist, dnd-kit, react-table, Radix). `docs/STACK.md` describes what is real.   |
| `workflow-overhaul-review-prompt.txt`   | `.review-prompt.txt` (untracked, repo root) | the brief Beth commissioned the overhaul's second review with. Its findings are `WORKFLOW-OVERHAUL-HANDOFF.md` §4b; the framing is worth keeping.                                    |

**Two things were promoted rather than archived**, and are live:

- `.planning/codebase/*.md` → `docs/` (the seven codebase docs — refreshed on promotion)
- `.planning/DESIGN-REFERENCE.md` → `docs/design/DESIGN-REFERENCE.md` (Beth's ruling D-05 needs
  the DesignOS map live)

**This directory is excluded from `format:check` and `lint`** — archived history is preserved
byte-for-byte, not reformatted. The exclusion carried over from `.planning/` when it moved here.
