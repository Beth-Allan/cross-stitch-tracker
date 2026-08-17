# Phase 15: Chart File Management - Discussion Log

**Date:** 2026-05-16
**Duration:** ~10 minutes
**Areas discussed:** 4/4

## Discussion Summary

### 1. File metadata & schema

| Question | Options | Selected |
|----------|---------|----------|
| What metadata per file? | Minimal (URL+filename) / Practical (+type+size) / Rich (+label+notes) | **Rich (+label+notes)** |
| Label required or optional? | Optional with filename fallback / Required | **Optional with filename fallback** |
| Sort order? | Chronological (newest first) / Manual sort order | **Chronological (newest first)** |
| File type restrictions? | PDFs and images only / Any file type | **Custom allowlist: images, PDF, .pat, .xsd, .css, .saga** |

### 2. Add/remove UX

| Question | Options | Selected |
|----------|---------|----------|
| Where does file management UI live? | Project detail overview / Dedicated tab / Both | **Project detail overview tab (inline)** |
| How does deletion work? | Immediate with undo / Confirmation dialog / Immediate no undo | **Confirmation dialog** |
| Upload during chart creation? | Project detail only / Both creation and detail | **Upload during creation; management on detail only** |

**Notes:** User specifically wants multi-file upload (select multiple at once) available during chart creation. Full management features (delete, edit labels) only on project detail.

### 3. Display on project detail

| Question | Options | Selected |
|----------|---------|----------|
| How should each file appear? | Compact row (icon+label+size) / Card per file / Simple link list | **Compact row (icon+label+size)** |
| Click behavior? | Direct download/open / Detail popover first | **Direct download/open** |
| Kitting checklist handling? | Keep checklist + separate list / Replace with file list | **Keep checklist + separate list below** |

### 4. Migration strategy

| Question | Options | Selected |
|----------|---------|----------|
| What happens to existing data? | Auto-migrate / Drop & start fresh / Keep both | **Auto-migrate to ChartFile rows** |
| Drop old column timing? | Drop immediately / Keep deprecated | **Drop immediately after migration** |

## Claude's Discretion Items

- File-type icon design
- Upload progress indicator style
- Presigned URL generation pattern
- R2 key naming scheme
- Error handling UX for failed uploads

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Generated: 2026-05-16*
