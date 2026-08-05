# Design Specification: CV Parsing Success Confirmation Modal with Auto-Close

## Overview
Implement an interactive, high-aesthetic confirmation popup modal for both Single CV AI Wizard and Bulk CV ZIP Ingestion that displays upon parsing completion, shows candidate/batch summary metadata, features a 3-second auto-close countdown, and automatically redirects or closes gracefully.

---

## Key Requirements & UI Behavior

### 1. Reusable Confirmation Modal Component (`features/cv-upload/ParseSuccessModal.tsx`)
- **Trigger**: Displayed when single CV AI extraction completes OR when bulk batch status reaches `"completed"`.
- **Content**:
  - Success Icon & Heading: *"CV Parsing & Classification Complete!"*
  - Summary Details:
    - Single Mode: Candidate Name, Designation, Record ID, PDF File Name.
    - Bulk Mode: Total Processed Count, Success Count, Failed Count.
  - **Auto-Close Countdown**: 3-second visual countdown progress bar ("Auto-redirecting in 3... 2... 1...").
  - Manual Action Buttons:
    - *"View Candidate Profile"* (Direct link to `/profile?id=...`).
    - *"Close Now"* / *"Upload Next"*.

### 2. Single CV AI Wizard Integration (`features/cv-upload/SaveStep.tsx` & `CVUploadWizard.tsx`)
- When single CV extraction finishes, display `ParseSuccessModal`.
- On auto-close expiry or clicking "View Profile", redirect to `/profile?id=${record.id}`.

### 3. Bulk CV Upload Integration (`features/cv-upload/BulkUploadTab.tsx`)
- When batch polling reaches `batchJob.status === "completed"`, trigger `ParseSuccessModal`.
- On auto-close expiry or clicking "Close Now", close popup and reset batch state.

---

## Verification Plan

### Automated Verification
- Run `npm run type-check` for zero TypeScript errors.

### Manual Verification
- Test Single CV upload: Verify success modal pops up, counts down 3s, and auto-redirects to `/profile?id=...`.
- Test Bulk CV upload: Verify success modal pops up when batch completes, counts down 3s, and auto-closes.
