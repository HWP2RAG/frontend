---
phase: 6
slug: merge-conflict-resolution
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-07
---

# Phase 6 — Validation Strategy

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
| 06-01-01 | 01 | 1 | MERGE-01, MERGE-02, MERGE-03 | unit | `npx vitest run stores/__tests__/merge-store.test.ts` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | MERGE-02 | unit | `npx vitest run components/collab/__tests__/conflict-resolver.test.tsx` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 1 | MERGE-01 | fixture | N/A (fixture update) | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 2 | MERGE-01, MERGE-03 | component | `npx vitest run components/collab/__tests__/merge-page.test.tsx` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 2 | MERGE-04 | component | `npx vitest run components/collab/__tests__/mr-merge-flow.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `stores/__tests__/merge-store.test.ts` — stubs for MERGE-01, MERGE-02, MERGE-03
- [ ] `components/collab/__tests__/conflict-resolver.test.tsx` — stubs for MERGE-02
- [ ] `components/collab/__tests__/merge-page.test.tsx` — stubs for MERGE-01, MERGE-03
- [ ] `components/collab/__tests__/mr-merge-flow.test.tsx` — stubs for MERGE-04
- [ ] `mocks/collab-fixtures.ts` update — add `mockMergeReportWithConflicts` fixture
- [ ] `mocks/collab-handlers.ts` update — dynamic merge report handler (conflict vs no-conflict)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SSE progress bar animation during merge | MERGE-01 | Visual animation timing | Start merge, verify progress bar fills smoothly |
| Dark mode styling for conflict resolution UI | MERGE-02 | Visual theme rendering | Toggle dark mode, verify all elements visible |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
