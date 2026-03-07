---
phase: 06-merge-conflict-resolution
plan: 01
subsystem: testing
tags: [vitest, msw, zustand, conflict-resolution, tdd, merge]

# Dependency graph
requires: []
provides:
  - mockMergeReportWithConflicts fixture with VALUE and DELETE_MODIFY conflicts
  - Dynamic merge mock handlers (conflict vs no-conflict based on mergeResultId)
  - MR action mock returning mergeResultId for "merge" action
  - Merge store test suite (15 tests)
  - ConflictResolver component test suite (10 tests)
affects: [06-02-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dynamic MSW handler routing based on URL params"
    - "Zustand store testing with vi.mock + getState/setState"
    - "Typed vi.fn<T> for component callback props"

key-files:
  created:
    - stores/__tests__/merge-store.test.ts
    - components/collab/__tests__/conflict-resolver.test.tsx
  modified:
    - mocks/collab-fixtures.ts
    - mocks/collab-handlers.ts

key-decisions:
  - "Used vi.spyOn(global, 'fetch') for loadMergeReport tests since it uses raw fetch, not collab-api"
  - "Used vi.fn<OnResolveFn>() typed mock for component callback to satisfy strict TypeScript"

patterns-established:
  - "Dynamic MSW handler: route different responses based on URL param values"
  - "Typed vi.fn pattern: vi.fn<SpecificFnType>() for strict TS compatibility in component tests"

requirements-completed: [MERGE-01, MERGE-02, MERGE-03]

# Metrics
duration: 4min
completed: 2026-03-07
---

# Phase 6 Plan 01: Mock Fixtures and TDD Tests Summary

**Conflict mock fixtures with VALUE/DELETE_MODIFY variants, merge store tests (15), and ConflictResolver component tests (10) enabling TDD for merge conflict resolution**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-07T12:25:41Z
- **Completed:** 2026-03-07T12:29:33Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Added mockMergeReportWithConflicts fixture with 2 conflicts (VALUE + DELETE_MODIFY) and dynamic mock handlers
- Wrote 15 merge store tests covering load, resolve (optimistic update + rollback), canFinalize, finalize, reset
- Wrote 10 ConflictResolver component tests covering all conflict types, resolution strategies, manual edit flow, base toggle, resolved state
- Full test suite remains green: 216 tests, 28 files, 0 failures

## Task Commits

Each task was committed atomically:

1. **Task 1: Add conflict mock fixtures and update handlers** - `79b9b61` (feat)
2. **Task 2: Write merge store tests (TDD)** - `eba3021` (test)
3. **Task 3: Write ConflictResolver component tests (TDD)** - `23a97d2` (test)

## Files Created/Modified
- `mocks/collab-fixtures.ts` - Added mockMergeReportWithConflicts with 2 conflicts (VALUE + DELETE_MODIFY)
- `mocks/collab-handlers.ts` - Dynamic merge report handler, MR action returning mergeResultId, startMerge with mergeResultId
- `stores/__tests__/merge-store.test.ts` - 15 tests for all merge store actions and edge cases
- `components/collab/__tests__/conflict-resolver.test.tsx` - 10 tests for ConflictResolver rendering and interactions

## Decisions Made
- Used `vi.spyOn(global, 'fetch')` for loadMergeReport tests because the store uses raw fetch (not collab-api), unlike resolveConflict/finalizeMerge which use collab-api functions
- Typed `vi.fn<OnResolveFn>()` for component callback mock to satisfy strict TypeScript type checking on the onResolve prop

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed vi.fn() type mismatch in ConflictResolver tests**
- **Found during:** Task 3 (ConflictResolver component tests)
- **Issue:** `vi.fn()` returned a generic mock type that TypeScript rejected for the typed `onResolve` prop
- **Fix:** Used `vi.fn<OnResolveFn>()` with explicit function type alias
- **Files modified:** components/collab/__tests__/conflict-resolver.test.tsx
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** 23a97d2 (Task 3 commit, amended)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor type fix necessary for TypeScript strict mode compliance. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All mock fixtures and tests are in place for 06-02-PLAN.md
- Mock handlers serve dynamic conflict/no-conflict responses ready for merge page implementation
- MR action mock returns mergeResultId, enabling MR -> merge navigation flow in next plan
- 216 tests green, 0 type errors

## Self-Check: PASSED

- All 4 created/modified files verified on disk
- All 3 task commits verified in git log (79b9b61, eba3021, 23a97d2)
- 216 tests passing, 28 test files, 0 type errors

---
*Phase: 06-merge-conflict-resolution*
*Completed: 2026-03-07*
