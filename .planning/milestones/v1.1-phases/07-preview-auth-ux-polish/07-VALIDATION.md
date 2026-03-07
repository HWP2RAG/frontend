---
phase: 7
slug: preview-auth-ux-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-07
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test:run` |
| **Full suite command** | `npm run test:run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:run`
- **After every plan wave:** Run `npm run test:run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | PREV-01 | unit | `npx vitest run components/collab/__tests__/preview-page.test.tsx` | No - W0 | pending |
| 7-01-02 | 01 | 1 | PREV-01 | unit | `npx vitest run components/collab/__tests__/preview-page.test.tsx` | No - W0 | pending |
| 7-02-01 | 02 | 1 | AUTH-01 | unit | `npx vitest run components/collab/__tests__/collab-layout.test.tsx` | No - W0 | pending |
| 7-03-01 | 03 | 1 | UX-01 | unit | `npx vitest run components/collab/__tests__/document-name.test.tsx` | No - W0 | pending |
| 7-04-01 | 04 | 1 | UX-02 | manual | `ls app/collab/\[documentId\]/ 2>/dev/null` | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `components/collab/__tests__/preview-page.test.tsx` — stubs for PREV-01
- [ ] `components/collab/__tests__/collab-layout.test.tsx` — stubs for AUTH-01
- [ ] `components/collab/__tests__/document-name.test.tsx` — stubs for UX-01
- Framework install: None needed (Vitest + RTL + MSW all already configured)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Legacy routes removed | UX-02 | Filesystem deletion check | Verify `app/collab/[documentId]/` directory no longer exists |
| No broken internal links | UX-02 | Cross-page link integrity | Grep codebase for `/collab/${` patterns not using `/documents/` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
