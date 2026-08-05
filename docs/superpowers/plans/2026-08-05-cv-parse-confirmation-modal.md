# CV Parsing Confirmation Modal & Auto-Close Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a confirmation modal popup with a 3-second auto-close countdown timer for both Single and Bulk CV uploads after parsing completes.

**Architecture:** Create reusable component `ParseSuccessModal.tsx` and integrate it into `SaveStep.tsx` and `BulkUploadTab.tsx`.

**Tech Stack:** Next.js 14, React (useState, useEffect, useRef), TypeScript, Lucide Icons, Tailwind CSS.

## Global Constraints

- Zero breaking changes to existing upload workflows.
- Auto-close timer defaults to 3 seconds with a visual progress bar.
- 100% type-checked with `npm run type-check`.

---

### Task 1: Reusable `ParseSuccessModal` Component

**Files:**
- Create: `features/cv-upload/ParseSuccessModal.tsx`

**Interfaces:**
- Consumes: `mode: 'single' | 'bulk'`, `candidateName?: string`, `recordId?: string`, `fileName?: string`, `totalFiles?: number`, `successCount?: number`, `isOpen: boolean`, `onClose: () => void`, `onAction?: () => void`.

- [ ] **Step 1: Create `features/cv-upload/ParseSuccessModal.tsx`**

Implement modal with backdrop, 3-second countdown timer, animated progress bar, summary metadata, and auto-close trigger.

- [ ] **Step 2: Commit Task 1**

```bash
git add features/cv-upload/ParseSuccessModal.tsx
git commit -m "feat: create ParseSuccessModal component with 3s auto-close countdown"
```

---

### Task 2: Integrate into Single CV Wizard & SaveStep

**Files:**
- Modify: `features/cv-upload/SaveStep.tsx`

- [ ] **Step 1: Integrate `ParseSuccessModal` into `SaveStep.tsx`**
- Show modal when `record` is available, count down 3s, and auto-redirect to `/profile?id=${record.id}` or reset.

- [ ] **Step 2: Commit Task 2**

```bash
git add features/cv-upload/SaveStep.tsx
git commit -m "feat: integrate ParseSuccessModal auto-close popup into Single CV upload"
```

---

### Task 3: Integrate into Bulk CV Upload Tab

**Files:**
- Modify: `features/cv-upload/BulkUploadTab.tsx`

- [ ] **Step 1: Integrate `ParseSuccessModal` into `BulkUploadTab.tsx`**
- Trigger modal when `batchJob.status === 'completed'`, show total processed & success count, count down 3s, and auto-close modal.

- [ ] **Step 2: Run `npm run type-check` to verify zero errors**

Run: `npm run type-check`
Expected: `0` errors.

- [ ] **Step 3: Commit Task 3**

```bash
git add features/cv-upload/BulkUploadTab.tsx
git commit -m "feat: integrate ParseSuccessModal auto-close popup into Bulk CV upload"
```
