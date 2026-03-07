# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.1 — Collab Page Enhancement

**Shipped:** 2026-03-07
**Phases:** 2 | **Plans:** 4 | **Tasks:** 9

### What Was Built
- Merge conflict resolution page (stats grid, ConflictResolver with 3 strategies, finalize flow)
- MR detail merge action navigating to merge result page
- Commit-based document preview with DOMPurify sanitization
- Collab layout header with Google LoginButton
- Dynamic document name in view header
- Legacy route cleanup

### What Worked
- TDD cycle was fast and effective — tests caught issues early (vi.fn type mismatch, ambiguous text queries)
- Phase execution was very fast (11 minutes total for 4 plans, 9 tasks)
- Existing collab-api and MSW infrastructure enabled rapid feature development
- Clear phase scoping — Phase 6 (merge) and Phase 7 (polish) had well-defined boundaries

### What Was Inefficient
- Mock handlers lack statefulness — POST actions don't update GET responses, causing dev-mode flow breaks (MERGE-04)
- Preview page built without navigation link — feature is unreachable through UI
- VALIDATION.md Wave 0 not completed for either phase

### Patterns Established
- Dynamic MSW handler routing based on URL params
- Typed `vi.fn<T>()` pattern for strict TS component test mocks
- Local state fetch pattern for standalone pages (no Zustand store needed)
- Collab layout pattern: shared header wrapping all /collab/* routes

### Key Lessons
1. When building a page, always verify it has at least one inbound navigation link
2. MSW mock handlers should be stateful for multi-step flows (action → re-fetch should reflect changes)
3. Nyquist validation Wave 0 should be completed during phase planning, not deferred

### Cost Observations
- Sessions: 2 (planning + execution per phase)
- Notable: All 4 plans executed in ~11 minutes total — existing infrastructure made iteration very fast

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 MVP | 5 | ~12 | Full collab platform from scratch |
| v1.1 Enhancement | 2 | 4 | Polish and gap-filling on existing platform |

### Cumulative Quality

| Milestone | Tests | Test Files | TypeScript Errors |
|-----------|-------|------------|-------------------|
| v1.0 | 191 | 26 | 0 |
| v1.1 | 235 | 32 | 0 (prod), 7 (test-only) |

### Top Lessons (Verified Across Milestones)

1. TDD with MSW enables rapid feature development with high confidence
2. Clear phase scoping (single concern per phase) keeps execution fast and focused
