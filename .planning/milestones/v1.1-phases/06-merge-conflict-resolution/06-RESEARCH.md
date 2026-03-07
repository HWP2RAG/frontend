# Phase 6: Merge Conflict Resolution - Research

**Researched:** 2026-03-07
**Domain:** Merge conflict resolution UI, MR-to-merge flow integration, Zustand state management
**Confidence:** HIGH

## Summary

Phase 6 implements the merge conflict resolution page and connects the MR merge action to the merge result page. The codebase already has extensive infrastructure in place: a fully functional `merge-store.ts` (Zustand), a well-built `ConflictResolver` component, complete API functions in `collab-api.ts` (startMerge, resolveConflict, finalizeMerge), MSW mock handlers for all merge endpoints, and an existing legacy merge page at `app/collab/[documentId]/merge/[mergeId]/page.tsx` that contains **a near-complete working implementation** including SSE progress bar, statistics cards, conflict list with ConflictResolver, finalize button with disabled/loading states, and a completed state view.

The main work is: (1) migrate the legacy page's logic to the new route at `app/collab/documents/[documentId]/merge/[mergeResultId]/page.tsx` (currently a stub), (2) enhance the mock fixtures to include a "conflicts" scenario, (3) connect the MR detail page's "merge" action to trigger `startMerge` and navigate to the merge result page, (4) add a "no conflicts" auto-complete flow, and (5) write tests (TDD per project rules).

**Primary recommendation:** Port the legacy merge page implementation to the new route, enhance with the MR integration flow, add conflict mock fixtures, and write comprehensive tests for the merge store and merge page.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MERGE-01 | 사용자가 merge 결과 페이지에서 충돌 목록을 확인할 수 있다 | Legacy page already renders conflicts via ConflictResolver. Needs migration to new route + conflict mock fixtures |
| MERGE-02 | 사용자가 각 충돌에 대해 Local/Remote/직접편집으로 해결할 수 있다 | ConflictResolver component already implements accept_local/accept_remote/manual_edit. merge-store.resolveConflict already works with optimistic updates |
| MERGE-03 | 모든 충돌 해결 후 merge를 확정(finalize)할 수 있다 | merge-store.canFinalize() and finalizeMerge() exist. Legacy page has finalize button with disabled state. Needs test coverage |
| MERGE-04 | MR 상세에서 merge 액션 실행 시 merge 결과 페이지로 자동 이동한다 | MR detail page has "merge" action but currently just calls performMRAction without navigation. Needs: trigger startMerge API -> get mergeResultId -> navigate to merge page |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router pages, client components | Already in use, "use client" pattern |
| Zustand | 5.0.10 | merge-store state management | Already in use, project standard |
| React | 19.2.3 | Component rendering | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| MSW | 2.12.7 | Mock API handlers for merge endpoints | Testing and development |
| Vitest | 4.0.18 | Test runner | All tests |
| @testing-library/react | 16.3.2 | Component rendering in tests | Component tests |
| @testing-library/user-event | 14.6.1 | User interaction simulation | Component interaction tests |
| lucide-react | 0.563.0 | Icons (check-circle, alert-triangle, etc.) | UI icons |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-built conflict UI | @codemirror/merge for diff view | Already have ConflictResolver component with good UX; CodeMirror overkill for this use case since conflicts show XML snippets, not code files |

**Installation:**
No new packages needed. Everything is already installed.

## Architecture Patterns

### Existing Code to Reuse (NOT Re-implement)

```
Existing (KEEP AS-IS):
├── stores/merge-store.ts           # Full merge state management (loadMergeReport, resolveConflict, finalizeMerge, canFinalize)
├── components/collab/conflict-resolver.tsx  # Complete conflict resolution UI
├── hooks/use-merge-progress.ts     # SSE progress hook for merge events
├── lib/collab-api.ts               # startMerge, resolveConflict, finalizeMerge APIs
├── mocks/collab-handlers.ts        # MSW handlers for all merge endpoints
└── mocks/collab-fixtures.ts        # mockMergeReport (needs conflict variant)

Legacy (PORT to new route):
├── app/collab/[documentId]/merge/[mergeId]/page.tsx  # Near-complete merge page with full UI

Stub (REPLACE with real implementation):
└── app/collab/documents/[documentId]/merge/[mergeResultId]/page.tsx  # Current stub

Modify:
├── app/collab/projects/[projectId]/mr/[mrId]/page.tsx  # Add merge->navigate flow
├── mocks/collab-fixtures.ts        # Add conflict variant fixture
└── mocks/collab-handlers.ts        # Dynamic conflict/no-conflict responses
```

### Pattern 1: Legacy Page Migration
**What:** The legacy route `app/collab/[documentId]/merge/[mergeId]/page.tsx` contains a fully functional merge page with:
- SSE progress bar (useMergeProgress hook)
- Statistics cards (auto-merged count, conflict count, resolved count)
- Conflict list rendering with ConflictResolver
- Finalize button (disabled until all conflicts resolved)
- Completed state with success message
- StatusBadge sub-component

**When to use:** Port this implementation directly to the new route
**Key differences in new route:**
- Route param is `mergeResultId` (not `mergeId`)
- Back link should go to `/collab/documents/${documentId}` (already correct in legacy)
- Legacy page uses `router.push(`/collab/${documentId}`)` which should be `/collab/documents/${documentId}`

### Pattern 2: MR-to-Merge Navigation Flow
**What:** When user clicks "Merge" on MR detail page:
1. Call `startMerge(documentId, sourceBranch, targetBranch)` to initiate merge
2. Receive `{ jobId, documentId, status }` response
3. Navigate to `/collab/documents/${documentId}/merge/${mergeResultId}`
4. Merge page loads report, shows SSE progress, renders conflicts or success

**Critical insight:** The current `performMRAction` call with `action: "merge"` needs to be augmented. The MR action API (`POST /projects/:projectId/merge-requests/:mrId/actions` with `{ action: "merge" }`) triggers the merge on the backend. After the action, the MR's `mergeResultId` field should be populated. The flow should:
1. Call `performAction("merge")` -> refreshes MR
2. Read `selectedMR.mergeResultId` from the refreshed MR
3. Navigate to merge result page using `selectedMR.documentId` and `selectedMR.mergeResultId`

**Alternative approach:** Call `startMerge` directly (bypassing MR action). This is simpler but doesn't update the MR status. The MR action approach is preferred because it keeps MR status consistent (open -> merged workflow).

### Pattern 3: Conditional Merge Result (No Conflicts)
**What:** When merge has no conflicts (status: "completed"), show success immediately without conflict resolution UI
**Implementation:** The legacy page already handles this via `mergeReport.status === "completed" && mergeReport.resultCommitSha256`

### Pattern 4: Zustand Store Testing Pattern (Project Convention)
```typescript
// Source: stores/__tests__/mr-store.test.ts (existing project pattern)
vi.mock("@/lib/collab-api", () => ({
  functionName: vi.fn(),
}));

import { functionName } from "@/lib/collab-api";
const mockFunctionName = vi.mocked(functionName);

describe("useStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStore.getState().reset();
  });
  // Test loading states, success, error, optimistic updates
});
```

### Pattern 5: Component Testing Pattern (Project Convention)
```typescript
// Source: components/collab/__tests__/block-editor-dialog.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Component", () => {
  const defaultProps = { /* ... */ };
  beforeEach(() => { vi.clearAllMocks(); });

  it("renders when open", () => { /* ... */ });
  it("handles user interaction", async () => {
    const user = userEvent.setup();
    // ...
  });
});
```

### Anti-Patterns to Avoid
- **Don't re-implement ConflictResolver:** It already handles all 4 conflict types (VALUE, DELETE_MODIFY, MOVE_MOVE, STRUCTURAL), 3 resolution strategies, manual edit textarea, base content toggle, and resolved state
- **Don't re-implement merge-store:** It already has loadMergeReport, resolveConflict (with optimistic updates + rollback), finalizeMerge, canFinalize, reset
- **Don't build new SSE hooks:** useMergeProgress already wraps the SSE connection for merge events
- **Don't use EventSource directly:** Project uses fetch + ReadableStream for SSE (auth header support)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Merge state management | Custom useState logic | merge-store.ts (Zustand) | Already built with optimistic updates, error handling, loading states |
| Conflict resolution UI | New conflict component | ConflictResolver | Already handles all 4 conflict types, 3 resolution strategies, dark mode |
| SSE progress tracking | Custom EventSource | useMergeProgress hook | Already handles auth, reconnection, cleanup |
| API calls | Inline fetch calls | collab-api.ts functions | Already have startMerge, resolveConflict, finalizeMerge with auth headers |
| Mock data | New fixtures | Extend collab-fixtures.ts | Maintain single source of mock truth |

**Key insight:** ~80% of the implementation already exists across the codebase. The main work is assembly, integration, route migration, and test coverage.

## Common Pitfalls

### Pitfall 1: Merge Result ID Propagation
**What goes wrong:** After calling the MR "merge" action, the mergeResultId may not be immediately available in the MR response
**Why it happens:** The merge action is asynchronous (returns 202). The MR status update happens async on the backend
**How to avoid:** After `performAction("merge")`, re-fetch the MR to get the updated `mergeResultId`. If null, the mock handler needs to be updated to return a `mergeResultId` on the MR after merge action
**Warning signs:** Navigation to merge page with undefined mergeResultId

### Pitfall 2: Stale resolvedConflicts Set After Page Reload
**What goes wrong:** If user refreshes the merge page, `resolvedConflicts` Set in the store is empty but some conflicts may have been resolved server-side
**Why it happens:** merge-store doesn't persist resolved state; it's in-memory only
**How to avoid:** The current implementation starts with an empty Set on loadMergeReport. For MVP this is acceptable since the backend tracks resolution state. Future enhancement: populate resolvedConflicts from the server response if the API returns resolution status per conflict
**Warning signs:** Conflicts showing as unresolved after page reload even though they were resolved

### Pitfall 3: Legacy Route vs New Route Confusion
**What goes wrong:** Two routes exist for merge: `/collab/[documentId]/merge/[mergeId]` (legacy) and `/collab/documents/[documentId]/merge/[mergeResultId]` (new)
**Why it happens:** Legacy routes haven't been cleaned up yet (mentioned in STATE.md)
**How to avoid:** Implement on the new route only. The legacy route already has working code that should be ported, not extended. All navigation links should point to the new route
**Warning signs:** Links going to wrong route, testing wrong page

### Pitfall 4: Mock Handler for Dynamic Merge State
**What goes wrong:** Current mockMergeReport has `status: "completed"` with no conflicts, so testing conflict resolution flow is impossible
**Why it happens:** Mock fixtures were created for the happy path only
**How to avoid:** Add a `mockMergeReportWithConflicts` fixture with `status: "conflicts"` and actual conflict entries. Update the mock handler to support both scenarios (e.g., based on mergeResultId param)
**Warning signs:** Tests always see "completed" status, never exercise conflict UI

### Pitfall 5: MR Action Mock Not Returning mergeResultId
**What goes wrong:** After performing "merge" action on MR, the mock returns `{ ok: true }` but doesn't update the MR's mergeResultId
**Why it happens:** Current mock handler for MR actions is a simple `{ ok: true }` response
**How to avoid:** Update the MR action mock handler to return the updated MR (or at least update the MR fixture to include mergeResultId when re-fetched). Update the MR detail mock to return a MR with mergeResultId populated after merge action
**Warning signs:** selectedMR.mergeResultId is null after merge action, navigation fails

## Code Examples

### Example 1: Merge Page Port (key structure)
```typescript
// Source: app/collab/[documentId]/merge/[mergeId]/page.tsx (existing legacy code)
// The merge page already has this working structure:

"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMergeStore } from "@/stores/merge-store";
import { useMergeProgress } from "@/hooks/use-merge-progress";
import { ConflictResolver } from "@/components/collab/conflict-resolver";
import type { ResolutionStrategy } from "@/lib/collab-api";

export default function MergePage() {
  const params = useParams<{ documentId: string; mergeResultId: string }>();
  const router = useRouter();
  // ... use mergeStore for all state/actions
  // ... useMergeProgress for SSE
  // ... ConflictResolver for each conflict
  // Key sections: SSE progress bar, stats grid, conflict list, finalize button, completed state
}
```

### Example 2: MR Merge Action with Navigation
```typescript
// Pattern for MR detail page merge integration
async function handleMergeAction(projectId: string, mrId: string) {
  // 1. Perform the merge action via MR endpoint
  await performAction(projectId, mrId, "merge");

  // 2. Get the updated MR with mergeResultId
  const mr = useMRStore.getState().selectedMR;
  if (mr?.mergeResultId && mr?.documentId) {
    // 3. Navigate to merge result page
    router.push(`/collab/documents/${mr.documentId}/merge/${mr.mergeResultId}`);
  }
}
```

### Example 3: Mock Fixture with Conflicts
```typescript
// New fixture to add to collab-fixtures.ts
export const mockMergeReportWithConflicts = {
  mergeResultId: "merge-002",
  status: "conflicts" as const,
  sourceBranch: "feature/section2-edit",
  targetBranch: "main",
  baseCommitSha256: "f6a1b2c3...",
  resultCommitSha256: null,
  autoMergedCount: 4,
  conflictCount: 2,
  conflicts: [
    {
      id: "conflict-001",
      blockUuid: "block-005",
      conflictType: "VALUE" as const,
      sectionPath: "Contents/section0.xml",
      localContent: "<hp:p>위약금은 계약 금액의 10%로 한다.</hp:p>",
      remoteContent: "<hp:p>위약금은 계약 금액의 15%로 한다.</hp:p>",
      baseContent: "<hp:p>위약금은 계약 금액의 5%로 한다.</hp:p>",
    },
    {
      id: "conflict-002",
      blockUuid: "block-003",
      conflictType: "DELETE_MODIFY" as const,
      sectionPath: "Contents/section0.xml",
      localContent: null,
      remoteContent: "<hp:p>이 계약은 수정된 조항입니다.</hp:p>",
      baseContent: "<hp:p>이 계약은 원본 조항입니다.</hp:p>",
    },
  ],
};
```

### Example 4: Merge Store Test Pattern
```typescript
// Test for merge-store following project patterns
describe("useMergeStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMergeStore.getState().reset();
  });

  it("canFinalize returns false when conflicts unresolved", () => {
    useMergeStore.setState({
      mergeReport: mockMergeReportWithConflicts,
      resolvedConflicts: new Set(),
    });
    expect(useMergeStore.getState().canFinalize()).toBe(false);
  });

  it("canFinalize returns true when all conflicts resolved", () => {
    useMergeStore.setState({
      mergeReport: mockMergeReportWithConflicts,
      resolvedConflicts: new Set(["conflict-001", "conflict-002"]),
    });
    expect(useMergeStore.getState().canFinalize()).toBe(true);
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Legacy route `/collab/[documentId]/merge/[mergeId]` | New route `/collab/documents/[documentId]/merge/[mergeResultId]` | Phase 2-3 route restructure | Must use new route pattern |
| Stub merge page | Full merge page (from legacy code) | This phase | Port existing code |

**Deprecated/outdated:**
- Legacy merge page at `app/collab/[documentId]/merge/[mergeId]/page.tsx`: Contains working implementation but lives at wrong route. Port to new route, then legacy route will be cleaned in Phase 7 (UX-02).

## Open Questions

1. **MR action API response for "merge"**
   - What we know: The `POST /projects/:projectId/merge-requests/:mrId/actions` with `{ action: "merge" }` triggers the merge. The MR mock handler currently returns `{ ok: true }`
   - What's unclear: Does the real backend populate `mergeResultId` on the MR immediately, or does it require a separate fetch? Based on the collab-planning.md docs, the "merge" action triggers the hwpx-merge queue
   - Recommendation: Mock should return the updated MR with `mergeResultId` populated. After action, re-fetch MR to get the ID. The current MR detail mock handler for GET always returns `mockMergeRequests[0]` which has `mergeResultId: null` -- this needs updating

2. **No-conflict merge auto-finalize**
   - What we know: Success criteria says "충돌이 없는 merge는 자동 완료 후 성공 상태를 표시한다"
   - What's unclear: Does the backend auto-finalize when there are no conflicts, or does the frontend need to call finalize?
   - Recommendation: Based on the API spec, when merge completes with no conflicts, `status` is already `"completed"` and `resultCommitSha256` is populated. The frontend just displays the success state. The mock fixture `mockMergeReport` already models this (status: "completed", conflicts: [])

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm run test:run` |
| Full suite command | `npm run test:run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MERGE-01 | Merge result page shows conflict list with details (autoMergedCount, conflictCount, conflict items) | unit (store) + component | `npx vitest run stores/__tests__/merge-store.test.ts` | Wave 0: create |
| MERGE-01 | Merge result page shows merge statistics | component | `npx vitest run components/collab/__tests__/merge-page.test.tsx` | Wave 0: create |
| MERGE-02 | Each conflict can be resolved via accept_local/accept_remote/manual_edit | unit (store) + component | `npx vitest run stores/__tests__/merge-store.test.ts` | Wave 0: create |
| MERGE-02 | ConflictResolver calls onResolve with correct strategy | component | `npx vitest run components/collab/__tests__/conflict-resolver.test.tsx` | Wave 0: create |
| MERGE-03 | Finalize button enables only after all conflicts resolved | unit (store) + component | `npx vitest run stores/__tests__/merge-store.test.ts` | Wave 0: create |
| MERGE-03 | finalizeMerge updates status to completed | unit (store) | `npx vitest run stores/__tests__/merge-store.test.ts` | Wave 0: create |
| MERGE-04 | MR detail merge action navigates to merge result page | component | `npx vitest run components/collab/__tests__/mr-merge-flow.test.tsx` | Wave 0: create |

### Sampling Rate
- **Per task commit:** `npm run test:run`
- **Per wave merge:** `npm run test:run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `stores/__tests__/merge-store.test.ts` -- covers MERGE-01, MERGE-02, MERGE-03 (store logic: load, resolve, canFinalize, finalize)
- [ ] `components/collab/__tests__/conflict-resolver.test.tsx` -- covers MERGE-02 (component: render conflict types, resolve actions, manual edit)
- [ ] `mocks/collab-fixtures.ts` update -- add `mockMergeReportWithConflicts` fixture
- [ ] `mocks/collab-handlers.ts` update -- dynamic merge report response (conflict vs no-conflict), MR action returning mergeResultId

## Sources

### Primary (HIGH confidence)
- Existing codebase: `stores/merge-store.ts`, `components/collab/conflict-resolver.tsx`, `hooks/use-merge-progress.ts` -- full implementation examined
- Existing codebase: `lib/collab-api.ts` -- all merge API functions verified (startMerge, resolveConflict, finalizeMerge)
- Existing codebase: `app/collab/[documentId]/merge/[mergeId]/page.tsx` -- working legacy merge page with complete UI
- Existing codebase: `app/collab/projects/[projectId]/mr/[mrId]/page.tsx` -- MR detail page with action handling
- Existing codebase: `mocks/collab-handlers.ts` and `mocks/collab-fixtures.ts` -- all merge mock endpoints
- Project spec: `collab-planning.md` Section 4.6 (Merge API spec) and Section 7.4 (Conflict resolution UI wireframe)

### Secondary (MEDIUM confidence)
- Project memory (MEMORY.md): Phase completion status, test counts (191 tests, 26 files)
- Project spec: `collab-planning.md` Section 4.10 (MR action flow: `"merge"` action triggers hwpx-merge queue)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and in use; no new dependencies needed
- Architecture: HIGH - All components (store, component, API, hooks) already exist; this is assembly + route migration + tests
- Pitfalls: HIGH - Identified from direct code analysis of existing implementations and mock data gaps

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (stable -- existing codebase patterns unlikely to change)
