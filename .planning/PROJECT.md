# HWPtoRAG Collab Frontend

## What This Is

HWPX(한글) 문서의 Git-style 협업 플랫폼 프론트엔드. 문서 업로드, 브랜치 기반 편집, MR 리뷰, AI 거버넌스 검사를 제공한다. Next.js + shadcn/ui + Zustand 기반.

## Core Value

사용자가 HWPX 문서를 웹에서 브랜치별로 독립 편집하고, diff/merge를 통해 안전하게 취합할 수 있어야 한다.

## Requirements

### Validated

- Auth store (Google OAuth + token refresh + localStorage)
- Project CRUD + member management (RBAC: owner/editor/viewer)
- Document creation + HWPX upload with SSE progress
- Document full view (preview, block navigator, diff badges, inline edit)
- Branch creation + commit history (list + graph view)
- Diff viewer (CodeMirror side-by-side/unified, blob fetch)
- MR list/detail/actions (approve/reject/close/merge)
- Comment CRUD (block + MR threads)
- HWPX Export download
- AI Governance (start check, SSE progress, findings, history)
- Merge store + ConflictResolver component
- ✓ Merge conflict resolution page (stats, resolve, finalize) — v1.1
- ✓ MR merge → merge result page navigation — v1.1
- ✓ Commit-based document preview (DOMPurify) — v1.1
- ✓ Google LoginButton in collab layout header — v1.1
- ✓ Dynamic document name in view header — v1.1
- ✓ Legacy route cleanup — v1.1

### Active

(None — define in next milestone)

### Out of Scope

- Real-time collaborative editing (WebSocket) -- too complex for current scope
- Mobile-responsive layout -- web-first
- i18n -- Korean only for now

## Context

- Backend: NestJS on Railway (`https://hwptorag-server-production.up.railway.app`)
- Auth: Supabase Auth (Google OAuth -> JWT)
- All MVP APIs implemented on backend
- MSW mock handlers for dev mode
- 235 tests passing across 32 test files
- 18,719 LOC TypeScript
- v1.0 MVP + v1.1 Enhancement shipped

## Constraints

- **Tech stack**: Next.js + shadcn/ui + Zustand + Vitest + MSW (existing)
- **TDD**: Tests first, then implementation
- **Mock API**: MSW-based dev, real API for prod
- **File size**: HWPX upload max 100MB

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| fetch + ReadableStream for SSE | EventSource doesn't support custom headers | -- Good |
| CodeMirror for diff | XML side-by-side diff support | -- Good |
| Zustand per-domain stores | Separation of concerns, testability | -- Good |
| Routes: /collab/documents/[documentId] | Clean separation from /collab/projects | -- Good |
| DOMPurify for block HTML rendering | XSS prevention for user-generated content | ✓ Good |
| Local state for preview page | No need for global store on standalone pages | ✓ Good |
| Collab layout header (breadcrumb-style) | Subtle auth UI, not duplicating global header | ✓ Good |

---
*Last updated: 2026-03-08 after v1.1 milestone completion*
