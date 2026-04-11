# Phase 2: Core Project Management - Discussion Log (Assumptions Mode)

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the analysis.

**Date:** 2026-03-28
**Phase:** 02-Core Project Management
**Mode:** assumptions
**Areas analyzed:** Data Model, File Uploads (R2), Form Architecture, Phase Scope

## Assumptions Presented

### Data Model
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| Chart and Project as two separate tables with 1:1 relationship | Confident | Design types.ts separates Chart/Project; CROSS_STITCH_TRACKER_PLAN.md section 5 defines "Chart = design, Project = instance" |
| Auto-create Project when Chart is created | Confident | sample-data.json _meta: "creating a chart auto-creates a project" |

### File Uploads (R2)
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| Presigned URL pattern for all uploads | Confident | ROADMAP.md says "presigned R2 URL"; Vercel 4.5MB hard limit makes server proxy unviable; research confirmed |
| R2 CORS requires explicit header enumeration | Confident | Research: R2 does not support wildcard * in AllowedHeaders |
| @aws-sdk/s3-request-presigner with region: "auto" | Confident | Research: fully compatible, minimal config differences from S3 |

### Form Architecture
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| Client Component forms with Server Action submission + Zod | Confident | Phase 1 pattern; design ChartAddForm.tsx uses extensive useState |
| Tabbed/sectioned form for ~50 fields | Confident | Design component shows tabbed interface |

### Phase Scope
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| Create Designer/Genre tables now, defer management pages to Phase 3 | Likely | ROADMAP.md Phase 3 covers full CRUD; but chart form needs inline creation |

## Corrections Made

No corrections — all assumptions confirmed.

## External Research

- **R2 CORS configuration:** Must explicitly enumerate AllowedHeaders (no wildcard). PUT-based uploads only. CORS changes take ~30s to propagate. (Source: Cloudflare R2 docs)
- **Vercel body limit:** 4.5MB hard limit across all plans — presigned URLs required. (Source: Vercel Functions Limits docs)
- **AWS SDK v3 + R2:** Fully compatible with `region: "auto"` and S3 API endpoint. SigV4 signing works out of the box. (Source: Cloudflare R2 AWS SDK examples)
