# State of the Code — 2026-08-17

**What this is:** the A-1 whole-codebase quality + security audit (build-plan Stage A; Beth's
requirement #2 in ruling D-09). The deliberate "go hunt for bad code" sweep this project has
never had — every phase-shaped review before it only ever looked at its own diff.

**How it ran:** eight parallel read-only subagent sweeps (Opus lane), one per dimension —
duplication · dead code · silent failures · query patterns/scale · cache coherence · test
honesty · security foundations + access control · security inputs + integrity with the R2 deep
dive — plus mechanical runs (`npm audit`, deep lint) and synthesis in the main session (Fable
lane). **Zero application code changed.** Findings were deduplicated against the maintenance
ledger and the docs before landing here; everything already known is cited, not re-found.

**Where findings live (one home each):**

- **Proposed items** (§3) — the list `/cleanup` triages with Beth.
- **New maintenance-ledger rows** (7) and **dated A-1 annotations** on 12 existing rows —
  in `docs/process/maintenance-ledger.md`.
- **One new drift row** (kitting percentage) — in `docs/process/work-log/drift.md`.
- **Report-only notes** (§4) — assessments and context that need no separate tracking.

---

## 1. Summary for Beth

The app's foundations are in much better shape than a hunt like this usually finds — every one
of the 105 server actions checks who you are before touching data, nothing secret leaks to the
browser, the money math (skein calculator) is genuinely well-tested, and there are no
placeholder-quality corners. But the audit found real problems, and five matter most:

1. **The front door's outer lock doesn't lock.** The security layer every doc describes as the
   app's outer fence (`proxy.ts`) checks nothing — a one-line configuration piece was never
   added, so it waves every request through. You're currently protected by the _inner_ checks
   (which do hold, everywhere but three spots — two on an old shopping screen nothing links to any more, and one image-thumbnail helper). Related: the "five wrong
   password attempts and you wait" limit only guards the login form — the underlying login
   endpoint can be hammered without limit.
2. **Your stitching dates are recorded one day early in statistics.** A session you log as
   "August 17" is stored in a way that the stats screens read back as "August 16" — the
   calendar, day-of-week charts, best-day records and year boundaries are all shifted. The
   whole test suite avoids the exact times of day that would have caught it.
3. **Uploads aren't really size-checked, and deleting a chart leaves all its images behind.**
   The "50MB limit" and file-type check happen before the upload, but nothing enforces them on
   the upload itself; and deleting a chart removes the database records while every photo and
   file it owned stays in storage forever, unfindable.
4. **When loading fails, screens say "you have none" instead of "couldn't load."** A database
   hiccup on the stats page tells you you've never stitched; the sessions page goes blank; a
   failed save in the supply table keeps showing the number that never saved.
5. **The security patches waiting: 2 critical and 13 high** (the two most serious severity ratings) in the libraries the live app
   ships — including the login library itself. Versions are pinned (by design), so nothing
   updates until a session goes and gets it. That session shouldn't wait for the monthly
   routine.

None of this is on fire — it's a single-user app behind a login, and the inner checks hold.
But 1, 2 and 5 deserve to be near the top of the burn-down. Everything below is the detail,
and the `/cleanup` session decides the order together with you.

---

## 2. Mechanical runs

**`npm audit`** — 29 vulnerabilities total (4 critical / 15 high / 7 moderate / 3 low);
**production graph: 24 (2 critical / 13 high)**. The ones that matter here:

- `next-auth 5.0.0-beta.30` → `@auth/core` — **critical**: homoglyph `@` email bypass in the
  normalizer; plus "configuration errors can cause existence-based auth checks to fail open"
  and an uncaught exception on malformed Bearer headers. This is the library holding the login.
- `next 16.2.4` — **high**: a middleware/proxy bypass in App Router via segment-prefetch
  routes (incomplete-fix follow-up) and a Server Components DoS. `proxy.ts` _is_ this app's
  middleware.
- `sharp 0.34.5` — **high**: four inherited libvips CVEs (CVE-2026-33327/33328/35590/35591).
  Sharp processes Beth's uploaded images server-side.
- `nanoid`, `prisma` — high, lower relevance (nanoid is called with fixed sizes here).
- Dev-only: `vitest` critical (UI-server file read — the UI server isn't used here), `vite`
  high. Real but not shipping.

Most fixes are plain `npm audit fix` (non-breaking); the criticals in the auth stack need the
bleeding-edge care rule (hard rule 8). → Proposed item **P10**.

**Deep lint** — reproduces the 55-eslint-warnings ledger row exactly: 55 warnings in 38 files — 39
`@typescript-eslint/no-unused-vars`, 13 `@next/next/no-img-element`, 2
`jsx-a11y/role-supports-aria-props` (the _two separately-maintained copies_ of
`editable-number.tsx` — see P11 and the new component-duplication ledger row), 1 `jsx-a11y/alt-text`. The three a11y warnings are small
real defects, not just hygiene. Also: **zero** `.skip`/`.only`/`.todo` tests anywhere.

---

## 3. Proposed items — for `/cleanup` triage

Ordered by the audit's severity judgment; the order is Beth's to set. "Gated" = touches
protocol §5 review-gated cores, so the item merges only from a fresh `/review`.

### P1 · Make the outer fence real, and cover the login endpoint — **high, gated (auth core)**

`proxy.ts` re-exports Auth.js's `auth` with **no `authorized` callback** in `src/lib/auth.ts` —
verified in the installed `next-auth` source (`lib/index.js:127-165`): without that callback,
`authorized` stays `true` and every request passes. The middleware fetches the session on every
request and discards the answer. `docs/ARCHITECTURE.md` ("Every other request passes the
session check here **before** routing") and `docs/process/security-checklist.md` ("the app's
outer fence") describe a control that does not exist; what actually holds the line is
`(dashboard)/layout.tsx`'s redirect plus `requireAuth()` in actions. Any future route outside
`(dashboard)` ships unauthenticated. **Until this lands, those doc claims are false — don't
cite them.**

Same item: `checkRateLimit` has exactly one caller — the login _form action_. The Credentials
provider is equally reachable at `POST /api/auth/callback/credentials` (necessarily excluded
from the matcher), so bcrypt guessing runs unthrottled there. The fix that covers both entry
paths is moving the check inside `authorize()`. Also in scope: `src/lib/rate-limit.ts` and the
whole `(auth)` route group have **zero tests** — the JWT/session callbacks that `requireAuth()`
depends on are untested too. Fix, test, then correct the two doc claims in the same PR.

### P2 · R2 upload-action hardening — **high, gated (R2 core)**

Four related weaknesses in `src/lib/actions/upload-actions.ts`:

- **The presigned PUT binds neither content-type nor length.** Verified in
  `@aws-sdk/s3-request-presigner` source: `content-type` is an unsignable header and the
  payload hash is `UNSIGNED_PAYLOAD`, so the signature covers only method + bucket + key +
  expiry. The server-side MIME allowlist and 50MB cap validate _client-declared claims_; the
  actual bytes are unconstrained. Enforcement needs a real mechanism (POST policy with
  `content-length-range`, proxying the upload, or post-upload `HeadObject` verification).
- **Unscoped key primitives are live endpoints.** Every export of a `"use server"` file is a
  callable POST. `deleteFile(key)`, `getPresignedDownloadUrl(key)`, `getPresignedImageUrls`,
  `processAndStoreImage` act on any caller-supplied key after `requireAuth()`;
  `generateThumbnail(chartId, …)` updates any chart with **no ownership check**. None parses
  input with Zod; `projectId`/`entityId` are interpolated into object keys unvalidated
  (namespace pollution, not traversal — keys are flat). The model to copy is
  `chart-file-actions.ts`, which resolves keys from ownership-checked DB rows.
- **`confirmUpload` is dead code but a live Zod-less endpoint** (57 lines, zero non-test
  callers) writing a caller-supplied string into chart cover fields. Delete or wire it —
  noting it is also the only path that would _optimize_ a cover, so today all chart covers are
  stored full-size raw.
- **Test gaps on this exact file:** zero unauthenticated-rejection tests (its sibling
  `chart-file-actions-auth.test.ts` is the model and never got copied over), and **no test in
  the repo inspects any S3 command's `Bucket`/`Key`** — `expect(mockSend).toHaveBeenCalled()`
  is the entire R2 assertion, so deleting the _wrong key_ is invisible to the suite.

### P3 · Delete the superseded shopping feature and the orphaned components — **high value, cheap**

An entire replaced feature is still in the tree: `getShoppingList` (zero non-test callers,
**and no `userId` filter** — it reads every project in the database) and `markSupplyAcquired`
(**no ownership check** — the one IDOR in the action layer, called only by `shopping-list.tsx`,
which only its own test imports). `/shopping` actually uses `getShoppingCartData` +
`ShoppingCart`. Deleting the feature removes both security holes at the root. Also orphaned,
confirmed by exhaustive import tracing (zero dynamic imports exist in production code):
`StatusControl` (superseded by `hero-status-badge`), `CoverThumbnail`, `ui/separator.tsx`, and
three components whose _neighbouring tests assert they are never rendered_
(`CalculatorSettingsBar`, `RankedList`, `YearScopeToggle`). ~1,000 source lines + ~750 green
test lines that inflate the 2448 count. **Deleting tests requires Beth's approval on the
record (hard rule 2) — that approval is what this item asks for at `/cleanup`.**

### P4 · Session dates land one day early in stats — **high, partly gated (stats queries)**

Confirmed by construction: the log-session modal submits a date-only string (`type="date"`),
`session-actions.ts` stores `new Date("YYYY-MM-DD")` = **UTC midnight**, and every
timezone-aware stats reader (`new TZDate(date, "America/Edmonton")`) shifts that instant to
**the previous local calendar day**. Sessions logged on the 1st of a month/year count in the
prior month/year; the calendar grid, daily breakdown, day-of-week averages, best-day records
and streak boundaries are all shifted; client-side `toLocaleDateString` without
`timeZone: "UTC"` (sessions table, gallery — the codebase's own `overview-tab.tsx` documents
the correct pattern) shows the same off-by-one in the browser. The test suite cannot see any
of it: a census of every fixture timestamp across all 19 stats test files shows **every value
≥ 06:00Z** — one test even documents choosing "same calendar date" fixtures. Replace the TZ
conversion with a no-op and the suite stays green.

Fix is a _convention decision_ (store date-only and read date parts as UTC, or store
local-midnight instants) applied consistently across write, stats reads, and display
formatters — plus honest fixtures (03:00Z sessions, DST boundaries) so it can never regress
silently. Fold in the related test-honesty finds: `completion-estimates` asserts
`toBeGreaterThan(0)` where the fixture's exact answer is 100 (inverting the formula to
`remaining * avgPerDay` passes), and `pace-metrics` asserts no query filter at all (a 30-day
window changed to 7 days passes).

### P5 · Stats cache invalidation: complete the writer side — **high**

The gated _reader_ layer is clean — all 18 `unstable_cache` sites verified: every key includes
every varying argument, all tagged `"stats"`, and all 27 `revalidateTag` calls use the correct
Next 16 `{ expire: 0 }` form (verified against `next@16.2.4` source; a bare call would
reintroduce 999.41/999.42). The defects are all on the **writer** side:

- `chart-actions.ts` invalidates on **1 of 6** stats-visible mutations — `createChart`,
  `createChartWithSupplies`, `updateChart`, `deleteChart` all leave every panel stale for
  300–3600s. Deleting a chart with 40k logged stitches keeps them in hero totals for up to
  5 min and in the breakdowns for up to an hour.
- `designer-actions.ts` / `genre-actions.ts` never invalidate at all, and their consumers are
  the 3600s caches — a deleted designer haunts the stats breakdown for up to an hour.
- Test guard: only 4 of supply-actions' 23 mutations assert their invalidation (source-side is
  complete — all 23 verified); session-actions is 3/3 asserted. A per-mutation assertion
  pattern is the durable guard — see the drift-question evidence in §5.

### P6 · Honest failure states: stop rendering errors as zeros — **high**

- `stats/page.tsx` folds a _failed_ `getHeroStats` into `hasNoSessions`, so a DB hiccup
  renders "No sessions logged yet"/"No records yet" across two whole tabs — bypassing the
  `DataUnavailable` fallback every other panel uses correctly.
- Four pages collapse `{success:false}` into empty data: chart detail (session history + stats
  → zeros, unassigned fabrics → "none"), `/sessions` (blank page), the dashboard layout's
  project picker (failure = "no active projects" = **Beth cannot log stitches, with no error
  shown**). `(dashboard)/error.tsx` exists and is honest — these guards are strictly worse
  than not guarding. The 1-of-5-guarded-`/charts` ledger row folds into this item.
- `supply-table.tsx` + its `editable-number`: on save failure the optimistic value is never
  rolled back — the table shows the unsaved number until a hard reload (the sibling
  `shopping-cart.tsx` does this correctly with `failedIds`). Contradicts
  `.claude/rules/form-patterns.md`.
- Small same-shape: `charts/[id]/edit` renders a failed stitch-total aggregate as `0`.

### P7 · One fabric calculator — **medium-high; decides F-2's rewrite**

The fabric-size formula exists **three times with three roundings**: `fabric-calculator.ts`
(2dp, review-gated), `pattern-dive-actions.ts` (1dp, inline), `fabric-requirements-tab.tsx`
(no rounding). The 6" margin constant is declared three times. The fit test is implemented
twice more; pattern-dive compares _pre-rounded_ 1dp values, so a fabric ~0.04" too small can
read as fitting. **The gated copy is the one the Pattern Dive screens don't use** — hard rule
3's gate currently protects the least-used implementation. And the tests cannot tell: every
fabric-size assertion in the repo passes against an _unrounded_ implementation (checked by
hand), so the entire rounding contract is unpinned. Unify on the gated module, pin the
rounding with exact assertions, keep the margin _value_ exactly as is (its provenance is
already open question Q-005 — this item must not answer a domain question by code).
**Build-plan note:** F-2 (fabric matching for null `fabricCount`) says its brief is rewritten
if A-1 finds a deeper cause — this is that cause; F-2's fix belongs in the unified calculator,
after Beth's F-2 domain answer.

### P8 · R2 orphan lifecycle — **medium, gated (R2 core)**

Phase 30 hardened replace paths; delete-the-parent and the failure arms were never covered:

- **`deleteChart` orphans every object the chart owned** — the cascade wipes `ChartFile`,
  `Project`, `StitchSession` rows (the only record of the keys); zero R2 deletes. One chart
  with 10 files and 50 session photos leaks 60+ objects, silently, forever.
- **Every session photo permanently leaks its thumbnail**: `processAndStoreImage` always
  writes `opt-*` and `thumb-*`; sessions persist only `optimizedKey`, and `deleteSession`
  deletes only `photoKey`. One orphan per photo, deterministic.
- **Cover replace can delete the _live_ thumbnail**: `generateThumbnail` returns
  `{success:false}` rather than throwing, the `catch` never fires, the form re-submits the old
  thumbnail key, and the cleanup then deletes the object that key points to — broken
  thumbnail, success toast.
- Pre-save uploads land under literal `covers/unsaved/`/`files/unsaved/` prefixes; abandoning
  a form leaks them, and nothing can enumerate orphans (no reconciliation job, and any
  bucket-side lifecycle rule is unknown — deployment topology, per its ledger row). Decide the
  reconciliation story here.

### P9 · Query scale: the unbounded-read batch — **medium (pays off as the collection grows); index half gated (schema)**

No true N+1 exists anywhere (verified) — the problems are row volume:

- Dashboard `/` reads the whole collection **three times** (~33 queries; every junction row
  fetched twice — once just to `.length` it) to render ~20 cards.
- `/sessions` loads **every session ever logged**, presigns every photo, no pagination — the
  one list whose growth axis is time, not collection size. `getSessionHistory` (25/page)
  already models the right shape.
- Kitting % drags every `quantityRequired/quantityAcquired` junction row across the wire on
  both `/` and `/charts`, where a `groupBy` returns one row per project. Pattern Dive's fabric
  tab materializes O(charts × fabrics) objects; its null-count branch maps _all_ fabrics.
- `record-detection` re-reads the entire session table **on every session write**.
- `/supplies` ships the whole catalogue (DMC alone ~489 rows) unpaginated, sorted in JS.
- Three stats modules scan all sessions for a handful of scalars.
- **Indexes: three exist in the whole schema.** `Project.userId` is unindexed entirely.
  Candidates with their motivating queries are listed in the sweep evidence; batch as one
  gated migration.

### P10 · Dependency patch session — **now, not on the monthly cadence**

§2's audit results. The standing ~monthly maintenance row exists; the audit's finding is the
_urgency_: 2 criticals + 13 highs shipping in production, two of them in the auth stack this
app's fence depends on. Mostly `npm audit fix`-clean; the auth/Next majors-adjacent pieces
need hard rule 8 care and a real verification pass.

### P11 · Small honest fixes, one batch — **low individually, one session together**

- `prisma.config.ts` imports `dotenv`, which is **not a declared dependency** — it resolves
  only through Prisma's own transitive deps, and `prisma generate` is step one of both the
  gate and the Vercel build. One `devDependencies` line before it bites.
- Upload error copy says **10MB** in two places; the limit is 50MB (`validations/upload.ts`).
- `SupplyGridView` declares `onDelete`, never wires it — **grid view has no delete**; table
  view does. (Callers already pass the handler.)
- The two byte-identical upload allowlists (`ALLOWED_FILE_TYPES` / `ALLOWED_CHART_FILE_TYPES`)
  — client checks one, server checks the other; merge them.
- CSP quick wins (from the §4 assessment): drop `unsafe-eval` in production (~30 min; its only
  consumer is dev-mode), add `frame-ancestors 'none'`, `base-uri 'self'`,
  `form-action 'self'`, `object-src 'none'` (~15 min). Nonce work deferred — see §4.
- Progress-% display: 11 hand-written copies, 7 unclamped — the same project reads 100% on the
  gallery card and 137% on the chart hero. Unify the _display_ clamp now; whether logging past
  100% should be blocked stays Beth's open domain question (the over-logging ledger row).
- Quick-added supplies hardcode `colorFamily: "NEUTRAL"`, making them invisible to the
  catalogue's colour-family filter — **needs Beth's word on what quick-add should do** (ask at
  `/cleanup`; may be a `/stitch-fact`).
- The three a11y lint warnings (§2).

### P12 · Test-honesty repairs — **medium; includes test removals needing Beth's approval**

The suite's hygiene is strong (zero assertion-free tests in 2,439 blocks, zero unawaited
userEvent, zero mock-the-module-under-test, exact `revalidateTag` argument assertions where
they exist) — but the sweep found tests that cannot fail where it matters:

- Five validation tests pass **for the wrong reason**: the prisma lookup is unmocked, so
  "rejects invalid date"/"rejects zero stitch count"/"rejects negative quantity" get
  "not found" errors whether or not Zod ran. Delete the schema rules: still green. One-line
  fix each (assert the message — `fabric-actions.test.ts` is the model).
- Three tests titled "recalculates progress atomically" assert only that `$transaction` was
  called — the arithmetic (`startingStitches + sessionSum`) is asserted nowhere; flip `+` to
  `-` and they pass. Progress % feeds the dashboard, gallery and stats.
- `creation-flow-adapter.test.ts` neutralizes the `isNeedOverridden` guard with a stale
  comment claiming the code doesn't set it (it does) — the only thing stopping the skein
  calculator from overwriting a hand-typed "Need" is set by code no test reaches.
- Two genuinely conditional assertions (`if (x) expect(…)`) that can execute zero assertions;
  fix with `expect.assertions(n)`.
- ~40 phantom tests that cannot fail (`types/stats.test.ts` asserting literals against
  themselves, `chart-configs.test.ts` `toBeDefined()` on typed constants) — **removal needs
  Beth's on-the-record approval (hard rule 2)**; `tsc` already does their real work.
- Four test titles no longer describe their assertions (the "chart name required" error-mapping
  path has no coverage at all — the string appears in zero test files); scratch reasoning
  comments shipped in `fabric-calculator.test.ts`.
- The kitting-% contradiction found inside a test file is **drift, not a test fix** — see §5.

---

## 4. Report-only notes (no separate tracking needed)

- **Stats-page width (closes the open half of the stats-fan-out ledger row):** the "16 queries" is really
  16 _functions_ ≈ **45–50 queries** per cold render — but `@prisma/adapter-neon` passes only
  `connectionString`, and `@neondatabase/serverless` defaults **`max: 10`**, so the fan-out is
  a 10-wide pool with a queue. Pool exhaustion as described in `docs/CONCERNS.md` is not
  reachable at this width; the live cost is cold-render latency (and `revalidateTag` on every
  session write makes cold the common case). The thing to bound is rows per query (P9), not
  query count.
- **`/charts` eager batch measured (annotates the pagination ledger row):** ~33 queries + a presign per image key;
  rows ≈ 3N + 2T + 2F where T (junction rows) ≈ 30N dominates; ~0.5MB of presigned URLs in
  the payload at N=500, four of five tabs unopened.
- **CSP assessment (the CSP ledger row):** Next 16 supports nonces only when the CSP header is generated
  per-request in middleware — a static `next.config.ts` header can never carry one, which is
  why the current setup is stuck with `unsafe-inline`. A per-request nonce also forces dynamic
  rendering (this app statically generates routes) — that trade is Beth's, and deferring it is
  reasonable. The two quick wins that don't need any of that are in P11. Keep
  `style-src 'unsafe-inline'` (next/font inline styles).
- **`deleteFile`'s `.catch()` handlers are decorative** — it catches internally and returns
  `{success:false}`, which all seven callers discard; the failure _is_ logged inside, so
  nothing is lost, but the handlers imply coverage they don't provide. Worth folding into P8's
  edits, not tracking separately.
- **`collection-breakdown.ts:30`'s `?? "var(--chart-1)"` arm is provably unreachable** (total
  `Record` over the status enum) — harmless; would paint a status slice with the wrong palette
  if it ever became reachable.
- **SUSPECTED, unconfirmed:** the local `.next` build's middleware manifests are empty while
  the compiled middleware chunk exists — most likely a truncated local build. Moot while P1 is
  open (the middleware checks nothing anyway); worth a glance at deployed headers when P1
  lands.
- **Factory `as` casts (the factory-casts ledger row) checked:** none currently hides a real shape mismatch — the
  discriminated-union invariant they bypass is fully covered by `focal-point.test.ts`, and no
  test passes a half-set pair. The row stays valid as a latent hazard.
- **Neon backup/restore posture remains unknown** — not answerable from the repo; already
  owned by the deployment-topology ledger row, which the queued `/cleanup` covers.
- **Briefing correction for future audits:** `src/lib/actions/` holds **18** action files
  (105 exported actions), not 21 — the higher count was inflated by test files.

## 5. Evidence for the open drift question — should the `revalidateTag("stats")` callers be review-gated?

(Question ② in `drift.md`, option (c): "let A-1 look first." The ruling is Beth's; this is the
evidence.)

- **Who calls it:** exactly three files — `session-actions.ts`, `supply-actions.ts`,
  `chart-actions.ts` — 27 distinct mutations. All three are outside the gated list, which
  covers the _readers_ (`src/lib/queries/stats/`).
- **What the audit found:** the reader side is fully clean (18/18 keys, tags, TTL forms).
  **Every cache defect found is writer-side** — and the worst offenders
  (`designer-actions.ts`, `genre-actions.ts`, P5) call `revalidateTag` from _no_ file, so
  gating the current callers would not have caught them. A path-based gate can only see files
  that already do the right thing; the actual failure mode is "a new or existing mutation
  lacks the line," which by construction arrives in files the gate doesn't list.
- **What gating would tax:** `chart-actions.ts` and `supply-actions.ts` are the two files
  routine build items touch most — the three files hold the core of the product's write
  surface (all chart CRUD, all supply CRUD, session logging). Gating them routes a large share
  of ordinary items through a fresh `/review` session each.
- **The alternative that covers the same failure without the tax:** a per-mutation test
  pattern asserting `revalidateTag("stats", { expire: 0 })` for every stats-visible mutation
  (today: session 3/3, supply 4/23, chart 1/6 — P5 completes it), which also catches the
  _new_ mutation case. Both options are live for Beth at `/cleanup`.

**New drift row filed (kitting %):** a test titled "returns 100% kitting for project with no
supplies needed" asserts **0%**, with the reasoning resolved inside the test file; a second
test hardens "fabric alone doesn't make a project kittable." Both are product/domain rules
with no `docs/domain/` trace (KIT-001's nine conditions are themselves still unconfirmed with
Beth). What a supply-less project's kitting % should read is Beth's to rule —
`docs/process/work-log/drift.md`, Open.

## 6. What was checked and found sound

The positive assurance, so the next session doesn't re-audit it:

- **Access control:** 105/105 exported server actions across all 18 action files call
  `requireAuth()` before any data access (scripted enumeration, not sampling); zero local
  guard copies; zero fallback IDs; `auth-guard.ts` checks `user.id` specifically and throws
  (fails closed). Ownership scoping verified on every owned-model query/mutation — the only
  gaps are the two on the dead shopping path (P3) plus `generateThumbnail` (P2). The
  documented ownerless arms (unattached charts/fabrics, catalogues) match `docs/CONCERNS.md`
  exactly. All 24 pages checked against the middleware matcher's exclusions — the exclusion
  list itself is correct (the callback behind it is P1).
- **Secrets & bundle:** no secrets in the working tree; zero `"use client"` files import
  server-only modules or touch `process.env`; error sanitization (Phase 22 pattern) holds
  everywhere — no raw error/stack reaches a client.
- **Inputs:** every mutating entry point outside `upload-actions.ts` parses with Zod before
  use; `.trim()` before `.min(1)` throughout; dates validated (future dates rejected); numbers
  bounded; mass assignment impossible (non-passthrough schemas strip unknown keys; `userId`
  injected server-side only). Zero raw SQL. Zero unvalidated redirects. SVG is not in any
  upload allowlist.
- **Integrity:** every multi-write mutation enumerated is transactional (chart+project+
  supplies, session+progress recalc, fabric link/unlink, catalogue detaches); session R2
  replace/delete ordering is correct on the happy path.
- **Cache reader layer:** all 18 `unstable_cache` sites correctly keyed/tagged/TTL'd; the
  `{ expire: 0 }` form verified correct against Next 16 source; `record-detection`'s uncached
  read is deliberate and right (it must not compare against a stale best).
- **Silent failures:** Phase 35's claim verified — zero context-discarding catches outside
  the recorded localStorage exception; all four client `fetch()`es check `response.ok`; all
  stats queries log-and-rethrow; optimistic rollback correct in 5 of 6 sites (P6 has the
  sixth).
- **Queries:** no true N+1 anywhere; aggregation pushed to the DB in the right places
  (breakdowns, hero stats, progress recalc); presign fan-out deduped and parallel; prisma and
  R2 clients are proper singletons; `getSessionHistory` is the model paginated shape.
- **Tests:** zero skipped/only/todo; zero assertion-free blocks in 2,439; zero unawaited
  userEvent interactions; zero tests mocking their own module; healthy assertion-strength
  ratio (356 `toHaveBeenCalledWith` vs 138 bare); factories don't bypass code paths; forms
  exercise the real Zod schemas. **The skein calculator's suite is honest**: exact integers,
  boundary cases covered, and the 255 constant traces to `docs/domain/threads.md` (its
  per-brand caveat is open question THR-005, as recorded). Exemplars worth copying:
  `chart-file-actions-auth.test.ts`, `hero-stats.test.ts`, `timezone.test.ts` (DST-aware),
  `fabric-actions.test.ts`, `supplies-tab.nyquist.test.tsx`.
- **Dead code:** only two dead server actions in the whole surface (both in P2/P3); env vars
  fully reconciled with `.env.example`; all Prisma enums live; the ~30 items the ledger's
  seeding note lists as verified-fixed were **not** re-found by any sweep — the seeding was
  accurate.

## 7. Coverage — what this audit did not examine

Union of the sweeps' declared limits: no runtime profiling or `EXPLAIN` (all query costs are
static analysis); no live-browser verification of the UI-facing findings (mechanisms confirmed
in code); no mutation testing (the "removing X breaks no test" claims were hand-computed for
the fabric case only); ~40 of the feature-component test files and 11 of 18 action files not
deep-read by the honesty sweep (its structural scans — skip/only, assertion-free, unawaited —
were repo-wide); `src/generated/`, `prisma/migrations/` SQL, `public/` assets, PWA
service-worker offline paths, and dead Tailwind utilities unexamined; R2 bucket-side
configuration (lifecycle, CORS, public access) and Neon backup posture not inspectable from
the repo; the deployed app's actual response headers unverified (read-only session, no network
calls); dev-dependency vulnerability surface noted but not assessed beyond `npm audit`.

---

_Audit: 2026-08-17, session `item/a-1-codebase-audit` — Fable 5 synthesis over eight Opus
sweeps. Model report: horse-db's `state-of-the-code-2026-07-28.md` (not accessible from this
machine; shape reconstructed from its description in the A-1 brief)._
