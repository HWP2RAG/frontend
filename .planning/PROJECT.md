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

### Active

- [ ] Merge conflict resolution page (wire up existing store + component)
- [ ] Preview page for specific commit SHA
- [ ] Legacy route cleanup (remove app/collab/[documentId]/*)
- [ ] Google login UI (login button + flow on collab pages)
- [ ] MR merge -> merge result page flow
- [ ] Document name display in document view header

### Out of Scope

- Real-time collaborative editing (WebSocket) -- too complex for current scope
- Mobile-responsive layout -- web-first
- i18n -- Korean only for now

## Context

- Backend: NestJS on Railway (`https://hwptorag-server-production.up.railway.app`)
- Auth: Supabase Auth (Google OAuth -> JWT)
- All MVP APIs implemented on backend
- MSW mock handlers for dev mode
- 191 tests passing across 26 test files

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

---
*Last updated: 2026-03-07 after milestone v1.1 start*
