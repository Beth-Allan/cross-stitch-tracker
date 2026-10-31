/*
  Thread lines (item F-16a): every thread belongs to a line, and the skein calculator reads the
  line's own length and strand structure instead of one 8 m for every brand.

  The order is fixed (build-plan F-16a): every line created with its length and structure → the
  3887 move → the unknown rule. Run before DMC's line has its 8 m six-strand, the unknown rule
  would catch every DMC row.

  Nothing here can abort on a brand it did not expect: a brand is created only where no brand of
  that name exists, of any type, case aside, and filled in only where a THREAD brand of that name
  does (trap ①). The lengths are Beth's (THR-008–THR-010, THR-012, THR-013; D-40 ⑤) and nothing
  else — every other line's length and structure stay unknown (THR-011, D-34).
*/

BEGIN;

CREATE TYPE "StrandStructure" AS ENUM ('SIX_STRAND', 'USED_WHOLE');

CREATE TABLE "ThreadLine" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "skeinLengthMm" INTEGER,
    "strandStructure" "StrandStructure",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThreadLine_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ThreadLine_brandId_name_key" ON "ThreadLine"("brandId", "name");
CREATE UNIQUE INDEX "ThreadLine_id_brandId_key" ON "ThreadLine"("id", "brandId");
ALTER TABLE "ThreadLine" ADD CONSTRAINT "ThreadLine_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "SupplyBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 1. The brands Beth gave lengths for, created where no brand of that name exists (THR-007's
--    spellings). DMC is not created here: every database holding the app has it, and the seed
--    builds it on a fresh one.
INSERT INTO "SupplyBrand" ("id", "name", "supplyType", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, wanted."name", 'THREAD', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES ('Anchor'), ('Weeks Dye Works'), ('The Gentle Art'), ('Kreinik')) AS wanted("name")
WHERE NOT EXISTS (
    SELECT 1 FROM "SupplyBrand" b WHERE lower(b."name") = lower(wanted."name")
);

-- 2. Their lines, filled in on every THREAD brand of exactly that name, case aside. A brand with
--    one kind of thread has one line with a blank name; Kreinik's three are named as Beth named
--    them (THR-012) and used whole (THR-013). No other Kreinik line is created (D-43 ②).
INSERT INTO "ThreadLine" ("id", "brandId", "name", "skeinLengthMm", "strandStructure", "updatedAt")
SELECT gen_random_uuid()::text, b."id", spec."line", spec."mm", spec."structure"::"StrandStructure", CURRENT_TIMESTAMP
FROM (VALUES
    ('DMC',             '',                   8000,  'SIX_STRAND'),
    ('Anchor',          '',                   8000,  'SIX_STRAND'),
    ('Weeks Dye Works', '',                   4572,  'SIX_STRAND'),
    ('The Gentle Art',  '',                   4572,  'SIX_STRAND'),
    ('Kreinik',         'Very Fine #4 Braid', 11000, 'USED_WHOLE'),
    ('Kreinik',         'Fine #8 Braid',      10000, 'USED_WHOLE'),
    ('Kreinik',         'Blending Filament',  50000, 'USED_WHOLE')
) AS spec("brand", "line", "mm", "structure")
JOIN "SupplyBrand" b ON lower(b."name") = lower(spec."brand") AND b."supplyType" = 'THREAD';

-- 3. Every other brand that holds threads, or is a THREAD brand with no line yet, gets one blank
--    line whose length and structure are unknown. A brand that holds threads but has only named
--    lines gets one too, so no thread is left without a line.
INSERT INTO "ThreadLine" ("id", "brandId", "updatedAt")
SELECT gen_random_uuid()::text, b."id", CURRENT_TIMESTAMP
FROM "SupplyBrand" b
WHERE NOT EXISTS (SELECT 1 FROM "ThreadLine" l WHERE l."brandId" = b."id" AND l."name" = '')
  AND (
    EXISTS (SELECT 1 FROM "Thread" t WHERE t."brandId" = b."id")
    OR (
      b."supplyType" = 'THREAD'
      AND NOT EXISTS (SELECT 1 FROM "ThreadLine" l WHERE l."brandId" = b."id")
    )
  );

-- 4. Every thread joins its brand's blank line; uniqueness moves from brand and code to line and
--    code (D-42).
ALTER TABLE "Thread" ADD COLUMN "lineId" TEXT;

UPDATE "Thread" t
SET "lineId" = l."id"
FROM "ThreadLine" l
WHERE l."brandId" = t."brandId" AND l."name" = '';

ALTER TABLE "Thread" ALTER COLUMN "lineId" SET NOT NULL;

DROP INDEX "Thread_brandId_colorCode_key";
CREATE UNIQUE INDEX "Thread_lineId_colorCode_key" ON "Thread"("lineId", "colorCode");
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_lineId_brandId_fkey" FOREIGN KEY ("lineId", "brandId") REFERENCES "ThreadLine"("id", "brandId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5. Beth's 3887 is DMC (D-45 ②③): it moves from "Custom (Thread)" to DMC's line, keeping its id,
--    so its project lines keep their saved needs. Only where exactly one DMC thread brand exists
--    and DMC has no 3887 of its own, in any line — otherwise it stays, and step 6 makes its
--    calculated needs unknown. Only 3887 moves: Beth ruled on that thread alone.
WITH dmc AS (
    SELECT b."id" AS "brandId", l."id" AS "lineId"
    FROM "SupplyBrand" b
    JOIN "ThreadLine" l ON l."brandId" = b."id" AND l."name" = ''
    WHERE lower(b."name") = 'dmc' AND b."supplyType" = 'THREAD'
)
UPDATE "Thread" t
SET "brandId" = dmc."brandId", "lineId" = dmc."lineId"
FROM dmc, "SupplyBrand" custom
WHERE custom."name" = 'Custom (Thread)'
  AND custom."supplyType" = 'THREAD'
  AND t."brandId" = custom."id"
  AND t."colorCode" = '3887'
  AND (SELECT count(*) FROM dmc) = 1
  AND NOT EXISTS (
    SELECT 1 FROM "Thread" d WHERE d."brandId" = dmc."brandId" AND d."colorCode" = '3887'
  );

-- 6. A saved need the calculator can no longer stand behind becomes unknown (D-40 ③ as narrowed
--    by D-45 ①): worked out from a stitch count, not typed by hand, on a line that is not an 8 m
--    six-strand skein. No skein maths here — re-entering the stitch count works it out from the
--    line. DMC and Anchor rows, and every overridden row, are never touched.
ALTER TABLE "ProjectThread" ALTER COLUMN "quantityRequired" DROP NOT NULL;

UPDATE "ProjectThread" pt
SET "quantityRequired" = NULL
FROM "Thread" t
JOIN "ThreadLine" l ON l."id" = t."lineId"
WHERE pt."threadId" = t."id"
  AND pt."stitchCount" > 0
  AND pt."isNeedOverridden" = false
  AND (l."skeinLengthMm" IS DISTINCT FROM 8000 OR l."strandStructure" IS DISTINCT FROM 'SIX_STRAND');

COMMIT;
