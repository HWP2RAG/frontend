# Phase 7: Preview, Auth UI, UX Polish - Research

**Researched:** 2026-03-07
**Domain:** Next.js page implementation, Google OAuth UI, route cleanup
**Confidence:** HIGH

## Summary

Phase 7 addresses four distinct requirements: implementing a commit-based document preview page (PREV-01), adding a Google login button to the collab layout header (AUTH-01), displaying actual document names in the document view header (UX-01), and removing legacy routes (UX-02).

All infrastructure for these features already exists in the codebase. The `fetchPreview` API function, `PreviewResponse`/`HtmlBlock` types, mock handlers, and preview fixtures are all in place. The `LoginButton` component with `@react-oauth/google` integration is fully built and working in the main header. The `collab-api.ts` has `fetchDocuments()` for document name lookup. The legacy routes at `app/collab/[documentId]/*` contain 5 files that are superseded by `app/collab/documents/[documentId]/*`.

**Primary recommendation:** This is a straightforward implementation phase. No new libraries, stores, or API endpoints are needed. Reuse existing patterns from the codebase.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PREV-01 | /preview?commit=sha for commit-based document preview | `fetchPreview` API exists, `PreviewResponse`/`HtmlBlock` types exist, mock handler exists, DOMPurify already used for HTML sanitization in document view page |
| AUTH-01 | Google login button in collab layout header | `LoginButton` component fully implemented with `@react-oauth/google`, `GoogleOAuthWrapper` provider wraps entire app, `useAuthStore` has `login`/`logout`/`ensureFreshToken` |
| UX-01 | Document name in document view header | `fetchDocuments()` returns `DocumentListItem[]` with `name` field, `mockCollabDocuments` has names like "용역계약서_v3" |
| UX-02 | Remove legacy routes `app/collab/[documentId]/*` | 5 legacy files identified, all superseded by `app/collab/documents/[documentId]/*` equivalents |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router pages | Already in use |
| React | 19.2.3 | Components | Already in use |
| Zustand | 5.0.10 | State management | Already in use |
| DOMPurify | 3.3.2 | HTML sanitization | Already used in document view |
| @react-oauth/google | 0.13.4 | Google login | Already in use in LoginButton |
| Vitest | 4.0.18 | Testing | Already in use |
| MSW | 2.12.7 | Mock API | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | 16.3.2 | Component testing | Test preview page rendering |
| lucide-react | 0.563.0 | Icons | Already used in history page |

### Alternatives Considered
None needed - all infrastructure exists.

## Architecture Patterns

### Existing Project Structure (No Changes Needed)
```
app/collab/
  layout.tsx              # Collab layout - AUTH-01 targets this
  documents/[documentId]/
    page.tsx              # Document view - UX-01 targets this
    preview/page.tsx      # Preview page - PREV-01 targets this (stub exists)
    diff/page.tsx         # Already implemented
    history/page.tsx      # Already implemented
    governance/page.tsx   # Already implemented
    merge/[mergeResultId]/page.tsx  # Already implemented

app/collab/[documentId]/  # LEGACY - UX-02 removes these
  page.tsx
  diff/page.tsx
  history/page.tsx
  preview/page.tsx
  merge/[mergeId]/page.tsx
```

### Pattern 1: Preview Page (PREV-01)
**What:** A read-only page that renders blocks as sanitized HTML for a specific commit SHA.
**When to use:** When user navigates via `/collab/documents/[documentId]/preview?commit=SHA`.
**Existing reference:** The document view page (`app/collab/documents/[documentId]/page.tsx`) already renders preview blocks using `DOMPurify.sanitize()` and the collab store's `loadPreview()` method. The preview page should follow the same pattern but be simpler (read-only, no branch selector, no diff badges, no editing).

**Key implementation details:**
- Use `useSearchParams()` to read `commit` query parameter
- Call `fetchPreview(documentId, commitSha)` directly (no store needed since it's a simple one-shot read)
- Render blocks with `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.html) }}`
- Reuse the same `hwpx-preview` CSS styles from the document view page
- Include a "back to document" link using `Link` component

```typescript
// Source: Existing pattern from app/collab/documents/[documentId]/page.tsx
import DOMPurify from "dompurify";
import { fetchPreview } from "@/lib/collab-api";
import type { PreviewResponse, HtmlBlock } from "@/lib/collab-api";

// In component:
const searchParams = useSearchParams();
const commitSha = searchParams.get("commit");

useEffect(() => {
  if (documentId && commitSha) {
    fetchPreview(documentId, commitSha)
      .then(setResponse)
      .catch(setError);
  }
}, [documentId, commitSha]);

// Render each block:
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.html) }} />
```

### Pattern 2: Auth UI in Collab Layout (AUTH-01)
**What:** Add the existing `LoginButton` component to the collab layout header.
**When to use:** Always visible in `/collab/*` routes.
**Existing reference:** The `app/collab/layout.tsx` is currently a minimal wrapper. The `LoginButton` component is already fully implemented in `components/login-button.tsx` and used in the global `Header` component.

**Key details:**
- The `LoginButton` handles all auth states: not hydrated (placeholder), logged out (Google button), logged in (avatar + logout)
- `GoogleOAuthWrapper` is already wrapping the entire app in `app/layout.tsx`
- The `useAuthHydration()` hook handles SSR/client hydration mismatch
- The collab layout should add a minimal header bar with the login button

```typescript
// Source: Existing pattern from components/login-button.tsx
import { LoginButton } from "@/components/login-button";

export default function CollabLayout({ children }) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="...border-b...">
        <span>HWPX 협업</span>
        <LoginButton />
      </header>
      {children}
    </div>
  );
}
```

### Pattern 3: Document Name Display (UX-01)
**What:** Show the actual document name instead of the generic "문서 뷰" text in the document view header.
**When to use:** On the document full view page.
**Existing reference:** The `useCollabStore` already loads documents via `loadDocuments()`. The `fetchDocuments()` API returns `DocumentListItem[]` with `name` field. The mock data includes names like "용역계약서_v3".

**Two approaches:**
1. **Simple approach:** Use the existing `useCollabStore.documents` list and find by ID (requires documents to be loaded)
2. **Direct approach:** Fetch the document list and find the matching document

Since the collab store already has `documents` and `loadDocuments()`, and the document view page already uses `useCollabStore`, the simplest path is to ensure documents are loaded and find the name.

```typescript
// Source: Existing pattern from stores/collab-store.ts
const documents = useCollabStore((s) => s.documents);
const loadDocuments = useCollabStore((s) => s.loadDocuments);

useEffect(() => {
  if (documents.length === 0) loadDocuments();
}, [documents, loadDocuments]);

const documentName = documents.find(d => d.id === documentId)?.name ?? "문서 뷰";
```

### Pattern 4: Legacy Route Removal (UX-02)
**What:** Delete the old `app/collab/[documentId]/*` route directory.
**Files to remove:**
1. `app/collab/[documentId]/page.tsx` - replaced by `app/collab/documents/[documentId]/page.tsx`
2. `app/collab/[documentId]/diff/page.tsx` - replaced by `app/collab/documents/[documentId]/diff/page.tsx`
3. `app/collab/[documentId]/history/page.tsx` - replaced by `app/collab/documents/[documentId]/history/page.tsx`
4. `app/collab/[documentId]/preview/page.tsx` - replaced by `app/collab/documents/[documentId]/preview/page.tsx`
5. `app/collab/[documentId]/merge/[mergeId]/page.tsx` - replaced by `app/collab/documents/[documentId]/merge/[mergeResultId]/page.tsx`

**Verification:** Check that no internal links point to `/collab/[documentId]` (vs `/collab/documents/[documentId]`). Any references in the new pages should already use `/collab/documents/` paths.

### Anti-Patterns to Avoid
- **Creating a new store for preview:** The preview page is a simple read-only view. Use local state with direct API call rather than creating a new Zustand store.
- **Duplicating LoginButton logic:** Reuse the existing `LoginButton` component. Do not create a new login component for the collab layout.
- **Using router.push for back navigation:** Use `Link` component (consistent with new pages like governance and diff pages).
- **Fetching document name with a separate API call:** There is no `fetchDocument(id)` endpoint for individual documents. Use the existing `fetchDocuments()` which returns all documents.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML sanitization | Custom sanitizer | DOMPurify | XSS prevention, already in use |
| Google login UI | Custom OAuth flow | `@react-oauth/google` GoogleLogin | Handles popup, token exchange, already configured |
| Auth state hydration | Manual localStorage check | `useAuthHydration()` hook | Handles SSR/client mismatch, already built |
| Auth token management | Manual token refresh | `useAuthStore.ensureFreshToken()` | Handles refresh, expiry, already in all API calls |

**Key insight:** Every piece of infrastructure needed for Phase 7 already exists. This phase is pure UI wiring.

## Common Pitfalls

### Pitfall 1: Preview Page Without commit Query Parameter
**What goes wrong:** User navigates to `/collab/documents/[documentId]/preview` without `?commit=SHA`
**Why it happens:** Direct navigation or broken link
**How to avoid:** Show an informative error state when `commit` param is missing. The existing diff page (legacy `app/collab/[documentId]/diff/page.tsx`) has a good pattern for this.
**Warning signs:** Empty page with no content and no error message

### Pitfall 2: Collab Layout Header Conflicts with Main Header
**What goes wrong:** Two headers visible (main app Header + collab layout header)
**Why it happens:** The `RootLayout` in `app/layout.tsx` already renders `<Header />` globally
**How to avoid:** The collab layout header should be subtle - possibly just a toolbar/breadcrumb bar, not a full duplicate header. Or conditionally hide the main header on collab routes.
**Warning signs:** Double navigation bars, visual clutter

### Pitfall 3: Legacy Route Links Still Referenced
**What goes wrong:** After removing legacy routes, some pages still link to `/collab/[documentId]` instead of `/collab/documents/[documentId]`
**Why it happens:** References in new pages that were copied from old patterns
**How to avoid:** After deletion, grep the entire codebase for `/collab/${documentId}` patterns that don't include `/documents/`. The new pages in `app/collab/documents/` already use correct paths, but verify.
**Warning signs:** 404 errors when navigating

### Pitfall 4: Document Name Not Loading
**What goes wrong:** Document name shows fallback "문서 뷰" even when API works
**Why it happens:** Documents not loaded in the store because `loadDocuments()` was never called on the document view page
**How to avoid:** Call `loadDocuments()` if the store's documents array is empty. The `useCollabStore` already has this action.
**Warning signs:** Header always shows generic text instead of actual document name

### Pitfall 5: LoginButton in Collab Layout Needs "use client"
**What goes wrong:** Hydration error or missing interactivity
**Why it happens:** Collab layout is currently a simple component without "use client" directive
**How to avoid:** Add "use client" to collab layout since it will now use client-side components (LoginButton uses hooks)
**Warning signs:** React hydration mismatch errors in console

## Code Examples

### Preview Page (PREV-01) - Full Implementation Pattern
```typescript
// Source: Derived from existing document view page patterns
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import DOMPurify from "dompurify";
import { fetchPreview } from "@/lib/collab-api";
import type { HtmlBlock } from "@/lib/collab-api";

export default function DocumentPreviewPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const searchParams = useSearchParams();
  const commitSha = searchParams.get("commit");

  const [blocks, setBlocks] = useState<HtmlBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId || !commitSha) return;
    setIsLoading(true);
    fetchPreview(documentId, commitSha)
      .then((res) => setBlocks(res.blocks))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "미리보기 로딩 실패")
      )
      .finally(() => setIsLoading(false));
  }, [documentId, commitSha]);

  if (!commitSha) {
    return (
      <main className="flex flex-col items-center justify-center p-8 flex-1">
        <p className="text-muted-foreground">commit 파라미터가 필요합니다</p>
      </main>
    );
  }

  // ... render blocks with DOMPurify.sanitize()
}
```

### Collab Layout with Login (AUTH-01) - Full Pattern
```typescript
// Source: Derived from existing LoginButton + layout pattern
"use client";

import { LoginButton } from "@/components/login-button";
import { useAuthStore } from "@/stores/auth-store";

export default function CollabLayout({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex-1 flex flex-col">
      <div className="shrink-0 border-b border-border px-4 py-2 flex items-center justify-between bg-card">
        <span className="text-sm font-medium text-muted-foreground">HWPX 협업</span>
        <LoginButton />
      </div>
      {children}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Legacy routes `/collab/[documentId]/*` | New routes `/collab/documents/[documentId]/*` | Phase 2-3 | All new pages use new routes, old routes are dead code |
| Generic "문서 뷰" header | Dynamic document name | Phase 7 (this phase) | Better UX, users know which document they're viewing |
| Login only in global header | Login in collab layout too | Phase 7 (this phase) | Better discoverability for collab auth |

**Deprecated/outdated:**
- `app/collab/[documentId]/*`: All 5 files are dead code. Replaced by `app/collab/documents/[documentId]/*` with improved implementations.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm run test:run` |
| Full suite command | `npm run test:run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PREV-01 | Preview page renders blocks for commit SHA | unit | `npx vitest run components/collab/__tests__/preview-page.test.tsx` | No - Wave 0 |
| PREV-01 | Preview page shows error without commit param | unit | `npx vitest run components/collab/__tests__/preview-page.test.tsx` | No - Wave 0 |
| AUTH-01 | Collab layout renders LoginButton | unit | `npx vitest run components/collab/__tests__/collab-layout.test.tsx` | No - Wave 0 |
| UX-01 | Document view header shows document name | unit | `npx vitest run components/collab/__tests__/document-name.test.tsx` | No - Wave 0 |
| UX-02 | Legacy routes removed (filesystem check) | manual | `ls app/collab/[documentId]/ 2>/dev/null` | N/A |

### Sampling Rate
- **Per task commit:** `npm run test:run`
- **Per wave merge:** `npm run test:run`
- **Phase gate:** Full suite green (225+ tests passing)

### Wave 0 Gaps
- [ ] `components/collab/__tests__/preview-page.test.tsx` -- covers PREV-01
- [ ] `components/collab/__tests__/collab-layout.test.tsx` -- covers AUTH-01
- [ ] `components/collab/__tests__/document-name.test.tsx` -- covers UX-01
- Framework install: None needed (Vitest + RTL + MSW all already configured)
- Test setup: `vitest.setup.ts` already configures MSW server lifecycle

## Open Questions

1. **Collab layout header design with existing global header**
   - What we know: The app already has a global `Header` component rendered in `RootLayout`. The collab layout is a child that currently just wraps children.
   - What's unclear: Should the collab layout's login bar supplement or replace the global header on collab pages? Having two headers could be visually cluttered.
   - Recommendation: Add a small toolbar/breadcrumb bar in the collab layout. The global header already has LoginButton, so this is about discoverability. A subtle secondary bar with "HWPX 협업" label and a LoginButton is sufficient. If the user finds it cluttered, the global header's LoginButton could be conditionally hidden on collab routes in a future iteration.

2. **Document name fetch strategy**
   - What we know: There is no single-document fetch endpoint. `fetchDocuments()` returns all documents.
   - What's unclear: Performance if document list is very large.
   - Recommendation: Use the existing `useCollabStore.documents` + `loadDocuments()`. The documents list is small (project-scoped). This is consistent with how the collab dashboard already works.

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection of all files listed in this research
- `lib/collab-api.ts` -- confirmed `fetchPreview`, `PreviewResponse`, `HtmlBlock` types
- `mocks/collab-handlers.ts` -- confirmed preview mock handler exists at `*/api/v1/collab/documents/:documentId/preview/:commitSha`
- `mocks/collab-fixtures.ts` -- confirmed `mockPreviewBlocks` with 6 blocks
- `components/login-button.tsx` -- confirmed full Google login implementation
- `stores/auth-store.ts` -- confirmed `login`, `logout`, `ensureFreshToken`, `hydrate`
- `app/collab/layout.tsx` -- confirmed minimal wrapper (just div with flex)
- `app/collab/documents/[documentId]/page.tsx` -- confirmed DOMPurify usage pattern
- `app/collab/[documentId]/*` -- confirmed 5 legacy files exist

### Secondary (MEDIUM confidence)
- None needed -- all information from direct codebase inspection

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in use, versions confirmed from package.json
- Architecture: HIGH - all patterns derived from existing codebase, no new architecture needed
- Pitfalls: HIGH - identified from concrete code analysis (layout conflicts, missing params, link references)

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (stable -- all infrastructure already exists)
