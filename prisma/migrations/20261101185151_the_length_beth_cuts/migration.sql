/*
  The length Beth cuts: each thread line carries its own cut, and every saved need the calculator
  worked out is worked out again from it.

  The order is fixed: the cuts → the six marks cleared → the recompute. Run before a line has its
  cut, the recompute would pass that line by; run before the marks clear, it would pass those six
  by, and Arctic Owl 3's DMC 310 would keep the 30 it was left with in April.

  A cut lands only on the lines Beth gave one for (THR-016): every other line's stays unknown, and
  the calculator gives such a line no figure (Q-009). Step 3 is `threadNeed` in SQL, in the same
  order of operations and in the same floating point, so it lands on the same whole number.
*/

BEGIN;

-- AlterTable
ALTER TABLE "ThreadLine" ADD COLUMN     "cutLengthInches" INTEGER;

-- 1. Her cuts: about 24 inches of the six-strand floss she has described, about 15 of every
--    Kreinik line, since she said it of Kreinik and not of particular lines.
UPDATE "ThreadLine" l
SET "cutLengthInches" = spec."cut"
FROM (
  VALUES
    ('DMC',             24),
    ('Anchor',          24),
    ('Weeks Dye Works', 24),
    ('The Gentle Art',  24),
    ('Kreinik',         15)
) AS spec("brand", "cut")
JOIN "SupplyBrand" b ON lower(b."name") = lower(spec."brand") AND b."supplyType" = 'THREAD'
WHERE l."brandId" = b."id";

-- 2. Six needs the app marked as typed when Beth had typed nothing (Beth's ruling, 2026-10-31).
--    The guard skips one she has already handed back with the button.
UPDATE "ProjectThread"
SET "isNeedOverridden" = false
WHERE "isNeedOverridden" = true
  AND "id" IN (
    'cmogdb777000004l4a7l2lbd0', -- Arctic Owl 3, DMC 310
    'cmp0fggbc000204laiy8z8iiw', -- Censored Eggplant, DMC 327
    'cmr2tv2kr000d04jx3aeta7fp', -- Pink Clouds, DMC 807
    'cmr2tv2ks000m04jx1eetyoa0', -- Pink Clouds, DMC 3766
    'cmr2tv2ks000h04jxpfm5pdq6', -- Pink Clouds, DMC B5200
    'cmvmz5vrr000c07jmfrq5ctg8'  -- Violet Tulip, DMC 310
  );

-- 3. Every saved need the calculator worked out, from its project's settings today, whatever it
--    was saved at (Beth's ruling, 2026-11-01). The same rows the supply table reworks when a
--    project's settings change: a stitch count, not marked as typed. A line the calculator cannot
--    read is left as it is. A project with no fabric is read at 14-count, as its Supplies tab
--    reads it, and a strand count outside 1-6 as 2.
WITH inputs AS (
  SELECT
    pt."id",
    pt."stitchCount"::float8 AS "stitches",
    (CASE
      WHEN l."strandStructure" = 'USED_WHOLE' THEN 6
      WHEN p."strandCount" BETWEEN 1 AND 6 THEN p."strandCount"
      ELSE 2
    END)::float8 AS "strandTerm",
    COALESCE(f."count", 14)::float8 AS "fabricCount",
    p."overCount"::float8 AS "overCount",
    p."wastePercent"::float8 AS "wastePercent",
    ((l."skeinLengthMm" * 10 / (l."cutLengthInches" * 254)) * (l."cutLengthInches" - 3))::float8
      AS "usableInches"
  FROM "ProjectThread" pt
  JOIN "Project" p ON p."id" = pt."projectId"
  JOIN "Thread" t ON t."id" = pt."threadId"
  JOIN "ThreadLine" l ON l."id" = t."lineId"
  LEFT JOIN "Fabric" f ON f."linkedProjectId" = p."id"
  WHERE pt."stitchCount" > 0
    AND pt."isNeedOverridden" = false
    AND l."strandStructure" IS NOT NULL
    AND l."skeinLengthMm" IS NOT NULL
    AND l."cutLengthInches" > 3
),
worked AS (
  SELECT
    "id",
    CASE
      WHEN "fabricCount" <= 0 THEN 1
      ELSE GREATEST(1, CEIL(
        ("stitches" * "strandTerm" * (1 + "wastePercent" / 100))
        / (("fabricCount" / "overCount") * "usableInches")
      ))::integer
    END AS "need"
  FROM inputs
  WHERE "usableInches" > 0
)
UPDATE "ProjectThread" pt
SET "quantityRequired" = worked."need"
FROM worked
WHERE pt."id" = worked."id"
  AND pt."quantityRequired" IS DISTINCT FROM worked."need";

COMMIT;
