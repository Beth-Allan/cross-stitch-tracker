# Chart files

The digital files a chart arrives as, and which of them Beth keeps against a chart in the app.
The physical side of a chart lives in `kitting-and-storage.md`; the words themselves are in
`vocabulary.md` (VOC-009, the digital working copy).

Opened 2026-08-19 — the first topic in this directory seeded from Beth rather than from the plan.

---

### CHF-001 — Beth keeps three kinds of file against a chart

The files she attaches to a chart in the tracker are:

1. **PDF charts** — the usual thing a designer sells;
2. **Photos or scans** of a chart — a phone photo, a scan of a paper chart, a screenshot
   (JPG, PNG, WebP);
3. **Pattern-software files** — files that open in a charting program rather than a reader
   (CHF-002).

Asked as one list, ticked as three; the fourth option offered — zip folders — she did not take
(CHF-003).

[stated by Beth 2026-08-19]

### CHF-002 — The pattern-software formats are `.xsd`, `.pat`, `.saga` and `.oxs`

The charting programs whose files she has:

- **Pattern Maker** — `.xsd`
- **PCStitch** — `.pat`
- **plus `.saga` and `.oxs`**, which she confirmed she has without naming the program behind
  them — named at **CHF-006** (Cross Stitch Saga).

These are the files browsers cannot identify: a `.xsd` is announced as generic XML, so a rule
written against what the browser claims a file is will reject them (the defect item P13b fixes).

[stated by Beth 2026-08-19]

### CHF-003 — Zip folders are not something she keeps

Offered "a whole chart pack downloaded as one zipped folder that you keep as-is", she did not
take it. So a `.zip` is not a chart file for this app's purposes, and the app should stop
claiming to accept one.

**Was baked into the app before she was asked:** `ALLOWED_FILE_TYPES` /
`ALLOWED_CHART_FILE_TYPES` carried `application/zip` and `application/x-zip-compressed`, and the
extension list carried `.zip`, from before this question existed. Item **P13b** removes them on
this fact — the first constant in the app to be narrowed by Beth's own word rather than widened
by a guess.

[stated by Beth 2026-08-19]

### CHF-004 — `.css` is accepted by the app and traces to nobody

`ALLOWED_CHART_FILE_EXTENSIONS` carries `.css`, and both allowlists carried `text/css`, with a
code comment claiming "CrossStitch pattern files report as text/css in browsers". No source is
recorded for that, and it was **not** among the endings Beth named at CHF-002 — but it was never
put to her either, so its absence from her list is not a rejection.

**Recorded so it stops being invisible, not so it can be built on.** P13b leaves `.css` accepted,
because dropping an ending she may use without asking is the more expensive mistake; the question
is Q-007.

[in the app, origin unknown — treat as unverified]

_Superseded by **CHF-005** (2026-10-24): Beth keeps `.css` chart files, so the ending now traces
to her. The code comment's claim about what browsers report is still unsourced._

### CHF-005 — `.css` is a chart file she keeps

Asked directly whether she keeps `.css` chart files, Beth said **yes, she has some**. So `.css`
stays accepted, and it is now accepted on her word rather than by accident (CHF-004).

What the app already does is right: no change follows from this. The program behind them is
CHF-006.

[stated by Beth 2026-10-24]

### CHF-006 — `.css`, `.saga` and `.oxs` are Cross Stitch Saga files

The program behind all three endings is **Cross Stitch Saga**. Beth's words: _"It's Cross Stitch
Saga — usually .css, .saga and .oxs are all Saga application files."_ "Usually" is hers: these are
the endings she meets as Saga files, not a claim that no other program ever writes them.

So the app's message about these files can name **Cross Stitch Saga**, alongside Pattern Maker
(`.xsd`) and PCStitch (`.pat`) from CHF-002. The unsourced code comment at CHF-004 ("CrossStitch
pattern files report as text/css") was most likely gesturing at this program. Its claim about
what browsers report is still unverified and does not matter, because the upload rule decides by
file ending (`resolveChartFileContentType`).

[stated by Beth 2026-10-24]
