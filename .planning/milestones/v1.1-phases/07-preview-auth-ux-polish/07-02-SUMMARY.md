---
phase: 07-preview-auth-ux-polish
plan: 02
subsystem: ui
tags: [login-button, collab-layout, route-cleanup, react]

requires:
  - phase: 06-merge-conflict-resolution
    provides: "Collab document routes at /collab/documents/[documentId]/*"
provides:
  - "Collab layout header bar with LoginButton for auth discoverability"
  - "Clean route structure with no legacy /collab/[documentId]/* routes"
affects: []

tech-stack:
  added: []
  patterns:
    - "Collab layout wraps all /collab/* pages with shared header"

key-files:
  created:
    - app/collab/layout.tsx
    - components/collab/__tests__/collab-layout.test.tsx
  modified: []

key-decisions:
  - "Collab header is a subtle breadcrumb-style bar, not a full duplicate of the global header"
  - "Pre-existing preview-page test failures (from 07-01 stub) left as-is per scope boundary rules"

patterns-established:
  - "Collab layout pattern: shared header with section label + LoginButton wrapping all /collab/* routes"

requirements-completed: [AUTH-01, UX-02]

duration: 2min
completed: 2026-03-07
---

# Phase 7 Plan 2: Collab Layout LoginButton Header + Legacy Route Removal Summary

**Collab layout header bar with "HWPX 협업" label and Google LoginButton, plus deletion of 5 legacy route files**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-07T14:39:02Z
- **Completed:** 2026-03-07T14:41:01Z
- **Tasks:** 2
- **Files modified:** 6 (1 modified, 1 created, 5 deleted)

## Accomplishments
- Added collab layout header bar with "HWPX 협업" label and LoginButton component
- Deleted all 5 legacy route files under app/collab/[documentId]/
- Verified no references to old /collab/{id} route pattern remain in codebase
- 3 new TDD tests pass, 228 total tests pass (30 test files)

## Task Commits

Each task was committed atomically:

1. **Task 1: Collab layout with LoginButton header** - `9c1041d` (feat)
2. **Task 2: Remove legacy routes** - `e66bda8` (chore)

## Files Created/Modified
- `app/collab/layout.tsx` - Collab layout with header bar containing "HWPX 협업" label and LoginButton
- `components/collab/__tests__/collab-layout.test.tsx` - 3 TDD tests for layout (LoginButton rendered, label visible, children rendered)
- `app/collab/[documentId]/page.tsx` - Deleted (legacy route)
- `app/collab/[documentId]/diff/page.tsx` - Deleted (legacy route)
- `app/collab/[documentId]/history/page.tsx` - Deleted (legacy route)
- `app/collab/[documentId]/preview/page.tsx` - Deleted (legacy route)
- `app/collab/[documentId]/merge/[mergeId]/page.tsx` - Deleted (legacy route)

## Decisions Made
- Collab header is a subtle breadcrumb-style bar (not a full duplicate of the global header) per research recommendation
- Pre-existing preview-page test failures (4 tests from 07-01 plan's stub page) are out of scope and left as-is

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Preview page tests (from 07-01 plan) fail because the page is still a stub. Confirmed these failures pre-date this plan's changes. Not caused by route deletion.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Collab layout header with auth button complete
- Legacy routes fully cleaned up
- Preview page implementation (07-01) still needs completion for its tests to pass

## Self-Check: PASSED

- FOUND: app/collab/layout.tsx
- FOUND: components/collab/__tests__/collab-layout.test.tsx
- CONFIRMED: legacy routes deleted (app/collab/[documentId]/ directory absent)
- FOUND: commit 9c1041d (Task 1)
- FOUND: commit e66bda8 (Task 2)

---
*Phase: 07-preview-auth-ux-polish*
*Completed: 2026-03-07*
