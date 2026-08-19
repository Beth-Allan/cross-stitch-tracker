# scripts/

Standalone helpers that are run by hand. Nothing here is imported by the app, and nothing
here runs as part of `npm run gate`, the build, or a deploy.

| File                         | What it is                                                                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generate-icons.mjs`         | Build helper — regenerates the PWA icon set. Re-run when the source icon changes.                                                                                         |
| `migrate-working-copies.sql` | **History, already run.** Moved `Chart.digitalWorkingCopyUrl` into `ChartFile` rows before that column was dropped. Idempotent; kept for the record, not to be run again. |

Schema migrations do **not** live here — they are Prisma's, in `prisma/migrations/`.
