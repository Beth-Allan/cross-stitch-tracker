---
status: complete
phase: 15-chart-file-management
source: [15-01-SUMMARY.md, 15-02-SUMMARY.md, 15-03-SUMMARY.md, 15-04-SUMMARY.md]
started: 2026-05-17T12:00:00Z
updated: 2026-05-17T12:07:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Upload Multiple Working Copies During Chart Creation
expected: When creating a new chart, the form shows an "Upload Working Copies" area. You can select multiple files (PDFs, images, pattern files). Each file shows its name, size, and upload progress. Successfully uploaded files appear in the list with a remove option.
result: pass

### 2. File Type and Size Validation on Upload
expected: Attempting to upload an unsupported file type (e.g., .exe, .doc) is rejected before upload with clear feedback showing allowed formats. Files over 10MB are also rejected.
result: pass

### 3. View File List on Project Detail Overview Tab
expected: On the project detail overview tab, a "Working Copies" section displays all uploaded files. Each file shows a type icon (PDF, image, etc.), file name, and formatted file size (e.g., "2.4 MB"). If no files exist, an empty state is shown.
result: pass

### 4. Download a Chart File
expected: Clicking a download action on a file in the Working Copies list initiates a browser file download. The downloaded file matches the original upload.
result: pass

### 5. Delete a Chart File
expected: Clicking delete on a file opens a confirmation dialog. Confirming removes the file from the list immediately. Canceling keeps the file intact.
result: pass

### 6. Add Files to an Existing Chart
expected: On the project detail overview tab Working Copies section, there is an add/upload action in the section header. Using it lets you upload additional files to a chart that already has files attached.
result: pass

### 7. Kitting Checklist Shows File Count
expected: The kitting status checklist on the overview tab shows a "Working copies" line item reflecting the count of attached files (e.g., "2 files" or similar). When no files are attached, this shows as incomplete/unchecked.
result: pass

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
