# Milestones

## v1.1 Collab Page Enhancement (Shipped: 2026-03-07)

**Phases completed:** 2 phases, 4 plans, 9 tasks
**Stats:** 30 files changed, +3,713 / -777 lines
**Git range:** feat(06-01)..docs(phase-07)

**Key accomplishments:**
- Merge conflict resolution page with ConflictResolver (Local/Remote/Manual edit) and finalize flow
- MR detail merge action navigates to merge result page
- Commit-based document preview with DOMPurify-sanitized block rendering
- Collab layout header with Google LoginButton on all /collab/* pages
- Dynamic document name display in document view header
- Legacy route cleanup (removed app/collab/[documentId]/*)

---

## v1.0 — Collab MVP (Completed)

**Shipped:** 2026-03-07

### Phases completed: 1-5

- Phase 1: Infrastructure (collab-api, MSW mocks, SSE hooks, auth store)
- Phase 2: Project CRUD + Members (store, dialogs, dashboard, project detail)
- Phase 3: Core Collaboration (document view, branch/edit/commit, MR, comments, diff, history)
- Phase 4: Post-MVP (governance, commit graph)
- Phase 5: Final cleanup

### Validated
- 191 tests, 26 test files, 0 type errors
- Full collab flow: upload -> branch -> edit -> commit -> diff -> MR -> merge -> export
