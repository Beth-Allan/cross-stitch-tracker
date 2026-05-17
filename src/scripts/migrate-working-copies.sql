-- Migration: Move digitalWorkingCopyUrl data to ChartFile records
-- Run BEFORE dropping the digitalWorkingCopyUrl column from Chart
-- Idempotent: only inserts for charts that have a non-null, non-empty URL
-- and don't already have a ChartFile with label 'Working Copy'

INSERT INTO "ChartFile" ("id", "chartId", "url", "filename", "mimeType", "fileSize", "label", "createdAt")
SELECT
  gen_random_uuid()::text,
  c."id",
  c."digitalWorkingCopyUrl",
  'Working Copy',
  'application/octet-stream',
  0,
  'Working Copy',
  CURRENT_TIMESTAMP
FROM "Chart" c
WHERE c."digitalWorkingCopyUrl" IS NOT NULL
  AND c."digitalWorkingCopyUrl" != ''
  AND NOT EXISTS (
    SELECT 1 FROM "ChartFile" cf
    WHERE cf."chartId" = c."id" AND cf."label" = 'Working Copy'
  );

-- Verification: Count should match
-- SELECT COUNT(*) FROM "ChartFile" WHERE "label" = 'Working Copy';
-- Should equal:
-- SELECT COUNT(*) FROM "Chart" WHERE "digitalWorkingCopyUrl" IS NOT NULL AND "digitalWorkingCopyUrl" != '';
