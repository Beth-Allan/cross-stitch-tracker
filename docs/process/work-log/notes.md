# Cross-Stitch Tracker — Notes to Future Sessions

**What this is:** things a later session needs to know that belong to no single work item — the
forward-wiring the work log's one-line notes cannot carry. Opened 2026-08-16 at workflow-overhaul
step 2.

**How to read this file:** **do not read it whole.** Grep `^## ` for the headers and read only
the notes whose tags name your item, your stage, or the surface you are touching (protocol §2
step 2). That instruction is the only thing keeping this file from becoming a second CLAUDE.md.

**How to write to it:** a note earns a place here when it would otherwise be re-derived — a trap
found the hard way, a decision's reasoning that outlives the decision, a handoff mid-item. A note
is **consumed** when the thing it warns about has landed; `/cleanup` retires consumed notes, so
write yours with a clear "this is done when…" so a later session can tell.

---

## Editing `.claude/settings.json` — one ask to Beth, not a workaround

**Tags:** settings.json · guard-git · permissions · hooks · auto mode · step 5

**If you need to edit `.claude/settings.json` and you are in auto mode, you cannot, and no amount
of cleverness changes that.** Claude Code's auto-mode permission classifier refuses every route:
Bash heredoc, `jq` writing to the scratchpad, and the Edit tool were each tried at step 1 and
again at step 2, five refusals across two sessions. Step 2 also tested whether the _content_ was
the trigger by attempting a **restrict-only** edit — the `PreToolUse` guard hook alone, with the
`permissions` block omitted, granting nothing. **Refused identically**, which proves the block is
the file, not what you are writing into it. No approval prompt is surfaced, so Beth cannot accept
it from inside an auto-mode session either.

**The route that works, and it is cheap:** ask Beth to leave auto mode (Shift+Tab) and say go.
The edit is then permitted on the first attempt with a normal approval prompt. That is how the
guard-git wiring landed on 2026-08-16 after being parked twice — about a minute of her time.
Ask once, plainly; do not burn a session probing for a way around, and do not silently drop the
work instead.

**~~This is live again at step 5.~~ Landed 2026-08-16 — and the wall did not fire.** Step 5
repointed the `PostToolUse` commit-nag hook (it had been telling every session to update a
"Current Status" section of CLAUDE.md that the step-1 rewrite deleted; it now points at the work
log and its Up-next queue) **in auto mode, first attempt, no prompt and no refusal** — a plain
Python rewrite of the file. That contradicts five refusals across two earlier sessions, so the
wall is **not** deterministic and the note is kept rather than deleted: **try the edit once
before asking Beth to leave auto mode.** If it is refused, the ask above is still the route that
works. **Consumed when** someone establishes what actually differs between the two cases.

## `.claude/rules/` files carry hidden frontmatter — never rewrite one blind

**Tags:** `.claude/rules/` · step 4 · any session editing a rule file

**Eight of the twelve rule files start with a YAML `globs:` block, and you cannot see it in the
copy that is loaded into your context.** The auto-loaded view begins at the `# Heading`, so a
whole-file rewrite (`cat >`, `Write`) silently deletes the frontmatter and nothing complains —
step 3 did exactly this to `ui-design-reference.md` and caught it only by diffing against
`HEAD`. **Before rewriting a rule file, run `git show HEAD:.claude/rules/<file>.md | head -8`**
and carry the block over.

Which files have it, as of step 3: `ui-design-reference`, `component-implementation`,
`server-actions`, `base-ui-patterns`, `auth-patterns`, `form-patterns`, `bleeding-edge-libs`,
`server-client-split`. The four with **no** frontmatter — `git-workflow`, `quality-gates`,
`testing-requirements`, `comment-conventions` — are deliberately unscoped: they apply to every
session, not to a file pattern. Keep it that way.

**How loading actually works, and one unresolved conflict.** Decompiled from Claude Code
2.1.233 (step 3, delegated read): the project-memory loader reads `.claude/rules/` twice — once
at session start keeping **only files with no `globs`**, and again per-file keeping only files
whose `globs` match the path being touched. So the four unglobbed files are the always-loaded
tier and the eight globbed ones are conditional. **The conflict:** the step-3 session observed
all twelve present at session start with no source file touched, which that code path does not
explain. Nothing was changed on the strength of either reading — the frontmatter was kept as-is,
and both the binary evidence and the contrary observation are recorded here. **Consumed when**
someone reconciles the two. Practical upshot either way: treat the four unglobbed files as a
per-session context tax (~9 KB of the directory's ~22 KB) and keep them dense.

## The two doors that open onto nothing yet — what step 5 owes them

**Tags:** step 4 · step 5 · `.claude/skills/` · `docs/domain/` · `docs/design/` · `/stitch-fact` · `/design-session`

Step 4 installed all eleven doors, but two of them name homes that do not exist until step 5.
Both handle it the same way — say so plainly and offer the scaffold, never improvise a home —
which is safe but is **not** the end state. Step 5 owes each of them something concrete:

- **`/stitch-fact` reads `docs/domain/README.md` for the ID scheme, the provenance vocabulary,
  and the domain manifest** before writing any fact. That README is a step-5 deliverable and the
  door is already written against it: scaffold it with all three, or the door's step 1 and step 3
  have nothing to follow. Then delete the door's "if `docs/domain/` does not exist yet" paragraph.
- **`/design-session` has the same paragraph** for `docs/design/`. Step 5 creates the directory
  and promotes the DesignOS map into it; step 8 adds `screens.md` and the canon home. Delete the
  paragraph only once canon actually has somewhere to land (`docs/design/screens/`), not merely
  because the directory exists.

Both doors also assume `docs/process/work-log/backlog.md`'s "Design-track inputs" section stays
where it is until step 8 moves it — that is the same D-10 routing the steps 4–5 note protects.

**Half consumed, 2026-08-16 (step 5).** `docs/domain/README.md` now carries all three things
`/stitch-fact` cites — ID scheme, provenance vocabulary, topic manifest — and the door's
"does not exist yet" paragraph is gone, replaced by the fact that every seeded fact came from the
plan rather than from Beth. **`/design-session`'s paragraph deliberately stays**, reworded: the
directory exists and holds the DesignOS map, but canon still has nowhere to land until step 8
creates `docs/design/screens/`, and the note's own instruction was to delete it only then.
**Consumed when** step 8 has built the canon home.

## `D-NN` means three different things — check the shape before you follow one

**Tags:** drift · build-plan · design track · any session citing a `D-` id

Three namespaces share the prefix and only the punctuation tells them apart:

- **`D-01`–`D-14`, zero-padded** — Beth's standing rulings, in `WORKFLOW-OVERHAUL-HANDOFF.md` §2.
  New ones number on from `D-15` in `drift.md`.
- **`D-1`–`D-6`, unpadded** — the redesign build items in `build-plan.md` / the work log's Stage D.
- **`D-20` and friends, in code comments** — DesignOS-era design specs. `fabric-calculator.ts`
  cites "design spec D-20" for the 6-inch margin; it resolves only inside
  `docs/archive/planning/`, which is history, not authority.

The padding convention is applied consistently today, which is the only thing keeping them apart —
and `backlog.md` already has a sentence containing a ruling, a design session and a build item in
three different `D` shapes. **Ruling D-20 will one day collide with design spec D-20.** Cheapest
fix if it ever bites: rename the ruling namespace, not the other two. **Not consumed** — this is a
standing fact until someone renames something. Raised by the layer-1 review of PR #72.

## `.claude/` is prettier-ignored — the doors are not gate-formatted

**Tags:** `.claude/skills/` · `.claude/rules/` · gate · formatting

`.prettierignore` excludes `.claude/` wholesale, so nothing in `.claude/skills/` or
`.claude/rules/` is touched by `format:check` — the gate will not catch a malformed table or a
broken frontmatter block in a door or a rule file. `WORKFLOW-REFERENCE.md`, being in the repo
root, **is** formatted. Practical upshot: after writing a door, confirm it by its own evidence —
the skill appearing in the session's skills listing — rather than by the gate going green.
**Not consumed** — this is a standing fact about where the gate's eyes are.

---

## Writing to `work-log.md`: an underscore in backticks can silently damage the paragraph next to yours

**Tagged: every session** — this file is edited at the end of all of them.

`work-log.md`'s pop-notes are written as one long italic paragraph, `_(…)_`, and its table cells
are single enormous lines. Prettier reflows both. If the text you add inside one of those italic
blocks contains an underscore inside a code span — writing the "deliberately unused" convention as
a backticked underscore is the way to hit this — prettier's emphasis parser mis-reads where the
italics end, re-serializes the whole run, and **collapses the spaces around code spans in the
neighbouring text, including text you did not write.** P14 (2026-08-20) shipped that damage into a
commit: a pre-existing sentence in the P9a-2 pop-note turned into ``no`/review`row behind it``.
The gate does not catch it — the file is still valid markdown and prettier considers it formatted,
so `format:check` is green on the mangled version.

**What to do.** Say "underscore" in words inside those italic paragraphs rather than putting one in
backticks. Then, after running prettier on `work-log.md`, check that you only changed your own
text:

```
comm -23 <(git show origin/main:docs/process/work-log.md | grep -o '[a-z]`[a-zA-Z/][^`]*`' | sort -u) \
         <(grep -o '[a-z]`[a-zA-Z/][^`]*`' docs/process/work-log.md | sort -u)
```

Empty output means nothing pre-existing was collapsed. If it is not empty, `git checkout
origin/main -- docs/process/work-log.md` and re-apply your edit with the underscore spelled out —
that is what P14 did, and the damage never reached main.

**Done when:** never, while the log keeps its one-line-per-cell and italic-pop-note shape. This is
a standing trap, not a pending fix.

**The sibling trap (found 2026-08-21, entered main with P9a's merge, #112):** a missing newline between
two table rows — the P10 row had been concatenated onto the end of the P9c row on one physical line —
makes prettier read one eleven-cell row and **widen the delimiter row to match**, and GitHub stops
rendering the whole table because the delimiter no longer matches the header. Prettier then
regenerates the wide delimiter on every run, so fixing the delimiter row does nothing: find the row
with more cells than the header (count pipes per line, ignoring escaped ones) and split it. Quick
check after any edit — every delimiter row has the same cell count as its header:

```
awk '/^\| -+ \|/ { h=prev; gsub(/\\\|/,"",h); gsub(/[^|]/,"",h); d=$0; gsub(/[^|]/,"",d);
  if (length(h)!=length(d)) print "MISMATCH at", NR } { prev=$0 }' docs/process/work-log.md
```
