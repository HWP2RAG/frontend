---
phase: 06-merge-conflict-resolution
plan: 02
subsystem: merge-ui
tags: [merge, conflict-resolution, navigation, pages, tdd]

# Dependency graph
requires: [06-01]
provides:
  - Full merge result page at /collab/documents/[documentId]/merge/[mergeResultId]
  - MR detail page merge navigation to merge result page
  - Merge page tests (7) and MR navigation tests (2)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Mock component pattern for ConflictResolver in page tests"
    - "Indirect store mock via selector function pattern"
    - "Logic-level testing for navigation flow (MR merge -> router.push)"

key-files:
  created:
    - components/collab/__tests__/merge-page.test.tsx
  modified:
    - app/collab/documents/[documentId]/merge/[mergeResultId]/page.tsx
    - app/collab/projects/[projectId]/mr/[mrId]/page.tsx

key-decisions:
  - "Used Link component instead of router.push for back/completed navigation in merge page"
  - "Tested MR merge navigation at logic level (mock + assert) rather than rendering full MR page"
  - "Used getAllByText for ambiguous text matches (e.g. StatusBadge + stat label both show same text)"

patterns-established:
  - "Mock child components with data-testid for page-level tests"

requirements-completed: [MERGE-01, MERGE-02, MERGE-03, MERGE-04]

# Metrics
duration: 2min
completed: 2026-03-07
---

# Phase 6 Plan 02: Merge Page and MR Navigation Summary

**Full merge result page with SSE progress, statistics, conflict resolution via ConflictResolver, finalize flow, and MR detail page merge action navigating to merge result page**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-07T12:31:59Z
- **Completed:** 2026-03-07T12:34:30Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Ported legacy merge page to new route `/collab/documents/[documentId]/merge/[mergeResultId]` with full functionality
- Replaced all legacy route references (`/collab/${documentId}`) with new pattern (`/collab/documents/${documentId}`)
- Used Link component (not router.push) for static navigation (back link, completed state button)
- Added merge navigation to MR detail page: after "merge" action, reads updated store state and navigates to merge result page
- Wrote 9 tests: 7 merge page tests (loading, stats, conflicts, completed, finalize states, error) + 2 MR navigation tests
- Full test suite green: 225 tests, 29 files, 0 failures

## Task Commits

Each task was committed atomically:

1. **Task 1: Port merge page to new route and add MR merge navigation** - `0e960fb` (feat)
2. **Task 2: Write merge page and MR merge navigation tests** - `573f3bf` (test)

## Files Created/Modified
- `app/collab/documents/[documentId]/merge/[mergeResultId]/page.tsx` - Full merge result page replacing stub (SSE progress, statistics grid, conflict list, finalize, completed state)
- `app/collab/projects/[projectId]/mr/[mrId]/page.tsx` - Added useRouter import, merge navigation in handleAction
- `components/collab/__tests__/merge-page.test.tsx` - 9 tests for merge page rendering and MR navigation flow

## Decisions Made
- Used `Link` component for static navigation (back link, completed-state button) instead of `router.push` for better accessibility and SSR compatibility
- Tested MR merge navigation at logic level rather than rendering the full MR detail page (avoids complex multi-store mocking)
- Used `getAllByText` for "충돌" text that appears both in StatusBadge and statistics label

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ambiguous text query in statistics test**
- **Found during:** Task 2 (RED phase test run)
- **Issue:** `screen.getByText("충돌")` found multiple elements (StatusBadge + stats label both render "충돌")
- **Fix:** Changed to `getAllByText("충돌")` with length assertion
- **Files modified:** components/collab/__tests__/merge-page.test.tsx
- **Verification:** All 9 tests pass

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor test selector fix. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All MERGE requirements (MERGE-01 through MERGE-04) are now implemented and tested
- Merge conflict resolution flow is end-to-end: MR detail -> merge action -> merge result page -> conflict resolution -> finalize
- 225 tests green, 0 type errors

## Self-Check: PASSED

- All 3 created/modified files verified on disk
- All 2 task commits verified in git log (0e960fb, 573f3bf)
- 225 tests passing, 29 test files, 0 type errors

---
*Phase: 06-merge-conflict-resolution*
*Completed: 2026-03-07*
