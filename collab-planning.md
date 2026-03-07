# HWPtoRAG Collab Frontend — 개발 기획서

> **Version:** 1.0
> **Date:** 2026-03-06
> **Backend:** NestJS (Railway) — `https://hwptorag-server-production.up.railway.app`
> **Auth:** Supabase Auth (Google OAuth → JWT)

---

## 1. 제품 비전

HWPX(한글) 문서의 **Git-style 협업 플랫폼**.
- 전체 문서를 웹에서 한 눈에 보면서
- 누가 어디를 수정했는지 추적하고
- 내가 수정해야 할 곳을 할당받고
- 브랜치별로 독립 작업 후 취합(merge)

**핵심 사용자 흐름:**
```
HWPX 업로드 → 문서 미리보기 → 브랜치 생성 → 블록 편집 → 커밋
                                    ↓
                            MR 생성 → 리뷰(diff) → 승인 → Merge → Export
```

---

## 2. 인증 (Authentication)

### 2.1 Google OAuth 로그인

```
POST /api/auth/google
Content-Type: application/json

{
  "credential": "<Google ID Token>"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "picture": "https://..."
  },
  "token": "<Supabase access_token (JWT)>",
  "refreshToken": "<Supabase refresh_token>",
  "expiresAt": 1772786443
}
```

### 2.2 토큰 갱신

```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

**Response 200:**
```json
{
  "token": "<new access_token>",
  "refreshToken": "<new refresh_token>",
  "expiresAt": 1772790043
}
```

### 2.3 인증 방식

모든 인증 필요 API에 Bearer 토큰 전달:
```
Authorization: Bearer <access_token>
```

**에러 응답:**
| Status | Code | 의미 |
|--------|------|------|
| 401 | `AUTH_REQUIRED` | Authorization 헤더 없음 |
| 401 | `INVALID_TOKEN` | JWT 만료 또는 무효 |
| 403 | `RBAC_FORBIDDEN` | 프로젝트 권한 부족 |

> **구현 권장:** access_token 만료 1분 전 자동 갱신 (expiresAt 기반)

---

## 3. 데이터 모델

### 3.1 핵심 개념

```
Project (프로젝트)
  ├── Members (멤버: owner/editor/viewer)
  ├── Documents (문서, N개 연결)
  │     ├── Branches (브랜치)
  │     │     └── Commits (커밋 히스토리)
  │     │           └── Tree → Blocks → Blobs (내용)
  │     └── Block Index (블록 UUID 매핑)
  ├── Merge Requests (병합 요청)
  ├── Comments (댓글/스레드)
  └── Governance Results (AI 검사 결과)
```

### 3.2 TypeScript 인터페이스

```typescript
// ─── Document ───────────────────────────────────────────
interface Document {
  id: string;           // UUIDv7
  name: string;
  createdAt: string;    // ISO 8601
  updatedAt: string;
}

// ─── Branch ─────────────────────────────────────────────
interface Branch {
  name: string;         // e.g. "main", "feature/section2-edit"
  commitSha256: string; // 현재 HEAD commit SHA
  isDefault: boolean;   // main 브랜치 여부
}

// ─── Commit ─────────────────────────────────────────────
interface Commit {
  sha256: string;       // 64-char hex
  message: string;
  authorId: string | null;
  blockCount: number;
  parentSha256: string | null;
  createdAt: string;
}

// ─── Block (미리보기) ───────────────────────────────────
interface PreviewBlock {
  blockUuid: string;    // UUID (블록 고유 식별자)
  html: string;         // 렌더링된 HTML
  sectionPath: string;  // e.g. "Contents/section0.xml"
  position: number;     // 문서 내 순서
}

// ─── Block (체크아웃) ───────────────────────────────────
interface CheckoutBlock {
  blockUuid: string;
  sectionPath: string;
  elementTag: string;   // e.g. "hp:p", "hp:tbl"
  position: number;
  contentSha256: string; // blob SHA (내용 해시)
}

// ─── Diff ───────────────────────────────────────────────
type DiffStatus = 'added' | 'deleted' | 'modified' | 'moved';

interface TextPatch {
  offset: number;
  deleteCount: number;
  insertText: string;
}

interface AttributeChange {
  attributeName: string;
  oldValue: string | null;
  newValue: string | null;
}

interface BlockDiff {
  blockUuid: string;
  status: DiffStatus;
  sectionPath: string;
  elementTag: string;
  textPatches?: TextPatch[];        // 텍스트 변경 (modified만)
  attributeChanges?: AttributeChange[]; // 서식 변경 (modified만)
  oldBlobSha256?: string;
  newBlobSha256?: string;
  oldPosition?: number;             // moved만
  newPosition?: number;
}

interface DiffResult {
  baseCommitSha256: string;
  targetCommitSha256: string;
  summary: {
    added: number;
    deleted: number;
    modified: number;
    moved: number;
    unchanged: number;
  };
  diffs: BlockDiff[];
  computedInMs: number;
}

// ─── Merge ──────────────────────────────────────────────
type MergeStatus = 'pending' | 'in_progress' | 'completed' | 'conflicts' | 'failed';
type ConflictType = 'VALUE' | 'DELETE_MODIFY' | 'MOVE_MOVE' | 'STRUCTURAL';
type ResolutionStrategy = 'accept_local' | 'accept_remote' | 'manual_edit';

interface MergeReport {
  mergeResultId: string;
  status: MergeStatus;
  sourceBranch: string;
  targetBranch: string;
  baseCommitSha256: string | null;
  resultCommitSha256: string | null;  // null if conflicts
  autoMergedCount: number;
  conflictCount: number;
  conflicts: Array<{
    id: string;
    blockUuid: string;
    conflictType: ConflictType;
    sectionPath: string;
    localContent: string | null;   // XML (source 브랜치)
    remoteContent: string | null;  // XML (target 브랜치)
    baseContent: string | null;    // XML (공통 조상)
  }>;
}

// ─── Project ────────────────────────────────────────────
interface Project {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

type ProjectRole = 'owner' | 'editor' | 'viewer';

interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  createdAt: string;
}

// ─── Merge Request ──────────────────────────────────────
type MRStatus = 'open' | 'approved' | 'merge_pending' | 'rejected' | 'merged' | 'closed';

interface MergeRequest {
  id: string;
  projectId: string;
  documentId: string;
  title: string;
  description: string | null;
  authorId: string;
  sourceBranch: string;
  targetBranch: string;
  status: MRStatus;
  mergeResultId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Comment ────────────────────────────────────────────
interface Comment {
  id: string;
  projectId: string;
  authorId: string;
  targetType: 'block' | 'merge_request';
  targetId: string;
  documentId?: string | null;
  commitSha256?: string | null;
  parentId?: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
}

interface CommentThread {
  comment: Comment;      // top-level
  replies: Comment[];    // 답글들
}

// ─── Governance ─────────────────────────────────────────
interface GovernanceResult {
  id: string;
  documentId: string;
  commitSha256: string;
  status: 'pending' | 'running' | 'completed' | 'partial' | 'failed';
  results: GovernanceFinding[];  // JSONB
  jobId: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface GovernanceFinding {
  checker: string;       // 'speech_level' | 'spelling' | 'format_rule'
  severity: string;      // 'error' | 'warning' | 'info'
  blockUuid: string;
  message: string;
  suggestion?: string;
}
```

---

## 4. API 명세 (전체)

> **Base URL:** `https://hwptorag-server-production.up.railway.app/api`
> **인증이 필요한 엔드포인트:** `[AUTH]` 표시
> **RBAC 검사 포함:** `[RBAC:역할]` 표시

### 4.1 문서 (Documents)

#### `POST /v1/collab/documents` — 문서 생성

```json
// Request
{ "name": "계약서_v1", "ownerId": "uuid (optional)" }

// Response 201
{ "id": "0193...", "name": "계약서_v1" }
```

#### `GET /v1/collab/documents` — 문서 목록

```json
// Response 200
[
  {
    "id": "0193...",
    "name": "계약서_v1",
    "createdAt": "2026-03-06T00:00:00Z",
    "updatedAt": "2026-03-06T01:00:00Z"
  }
]
```

#### `POST /v1/collab/documents/:documentId/upload` — HWPX 업로드 (비동기)

```
Content-Type: multipart/form-data
Field: file (.hwpx 파일, 최대 100MB)
```

```json
// Response 202
{ "jobId": "1", "documentId": "0193...", "status": "queued" }
```

> Ingest 진행률은 SSE로 수신 (Section 5 참고)

### 4.2 브랜치 (Branches)

#### `POST /v1/collab/documents/:documentId/branches` — 브랜치 생성

```json
// Request
{
  "name": "feature/section2-edit",
  "sourceCommitSha256": "abc123... (optional, 생략 시 main HEAD)"
}

// Response 201
{
  "name": "feature/section2-edit",
  "commitSha256": "abc123...",
  "isDefault": false
}
```

#### `GET /v1/collab/documents/:documentId/branches` — 브랜치 목록

```json
// Response 200
[
  { "name": "main", "commitSha256": "abc123...", "isDefault": true },
  { "name": "feature/section2-edit", "commitSha256": "abc123...", "isDefault": false }
]
```

### 4.3 커밋 (Commits)

#### `POST /v1/collab/documents/:documentId/commits` — 블록 수정 + 커밋 생성

```json
// Request — 블록 수정 커밋
{
  "message": "제2조 위약금 비율 수정",
  "branch": "feature/section2-edit",
  "authorId": "uuid (optional)",
  "changes": [
    {
      "blockUuid": "uuid-2",
      "content": "<hp:p hwptorag:block-id=\"uuid-2\"><hp:run><hp:t>수정된 텍스트</hp:t></hp:run></hp:p>"
    }
  ]
}

// Response 201
{
  "commitSha256": "def456...",
  "treeSha256": "ghi789...",
  "parentSha256": "abc123...",
  "branch": "feature/section2-edit",
  "blockCount": 6,
  "changedBlocks": 1
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|:---:|------|
| message | string | Yes | 커밋 메시지 (1자 이상) |
| branch | string | No | 대상 브랜치 (생략 시 default branch) |
| authorId | string | No | 작성자 UUID |
| changes | BlockChange[] | No | 수정할 블록 목록 (생략 시 빈 커밋) |
| changes[].blockUuid | string | Yes | 수정 대상 블록 UUID |
| changes[].content | string | Yes | 블록의 새 XML 내용 |

> **주의사항:**
> - `branch`를 명시했는데 존재하지 않으면 **404** (silent fallback 없음)
> - `changes`에 동일 `blockUuid`가 중복되면 **400**
> - 현재 트리에 없는 `blockUuid`를 지정하면 **400**
> - `changes` 생략 시 동일 트리로 빈 커밋 생성 (마커 커밋 용도)

#### `GET /v1/collab/documents/:documentId/commits` — 커밋 히스토리

| Query | Type | Default | 설명 |
|-------|------|---------|------|
| branch | string | "main" | 브랜치 이름 |
| limit | number | 50 | 최대 200 |
| offset | number | 0 | 페이지네이션 |

```json
// Response 200
[
  {
    "sha256": "def456...",
    "message": "제2조 수정",
    "authorId": "uuid",
    "blockCount": 6,
    "parentSha256": "abc123...",
    "createdAt": "2026-03-06T01:30:00Z"
  }
]
```

### 4.4 체크아웃 & 미리보기

#### `GET /v1/collab/documents/:documentId/checkout/:commitSha` — 체크아웃

특정 커밋 시점의 전체 블록 목록 반환.

```json
// Response 200
{
  "commit": {
    "sha256": "abc123...",
    "message": "Initial commit",
    "authorId": null,
    "blockCount": 6,
    "createdAt": "2026-03-06T00:00:00Z"
  },
  "blockCount": 6,
  "blocks": [
    {
      "blockUuid": "uuid-1",
      "sectionPath": "Contents/section0.xml",
      "elementTag": "hp:p",
      "position": 0,
      "contentSha256": "sha256-of-blob"
    }
  ]
}
```

#### `GET /v1/collab/documents/:documentId/preview/:commitSha` — HTML 미리보기

블록별 HTML 변환 결과. **문서 전체 렌더링의 핵심 API.**

```json
// Response 200
{
  "commitSha": "abc123...",
  "blockCount": 6,
  "blocks": [
    {
      "blockUuid": "uuid-1",
      "html": "<p data-block-uuid=\"uuid-1\" class=\"hwpx-paragraph\"><span class=\"hwpx-run\">제1장 총칙</span></p>",
      "sectionPath": "Contents/section0.xml",
      "position": 0
    },
    {
      "blockUuid": "uuid-2",
      "html": "<p data-block-uuid=\"uuid-2\" class=\"hwpx-paragraph\"><span class=\"hwpx-run\">이 문서는 시험용 HWPX 문서입니다.</span></p>",
      "sectionPath": "Contents/section0.xml",
      "position": 1
    }
  ]
}
```

> **HTML 태그 매핑:**
> | HWPX 태그 | HTML 출력 | 비고 |
> |-----------|-----------|------|
> | `hp:p` | `<p data-block-uuid="...">` | 문단 |
> | `hp:run` | `<span class="hwpx-run">` | 텍스트 런 |
> | `hp:t` | 텍스트 노드 | 실제 텍스트 |
> | `hp:tbl` | `<table class="hwpx-table">` | 표 |
> | `hp:tr` | `<tr>` | 행 |
> | `hp:tc` | `<td colspan="..." rowspan="...">` | 셀 |
> | `hp:pic` | `<figure>[Image]</figure>` | 이미지 플레이스홀더 |
> | `hp:secPr` | (skip) | 페이지 레이아웃 메타데이터 |

### 4.5 Diff (변경 비교)

#### `GET /v1/collab/documents/:documentId/diff` — 커밋 간 Diff

| Query | Type | Required | 설명 |
|-------|------|----------|------|
| base | string | Yes | 기준 커밋 SHA |
| target | string | Yes | 대상 커밋 SHA |

```json
// Response 200
{
  "baseCommitSha256": "abc123...",
  "targetCommitSha256": "def456...",
  "summary": {
    "added": 1,
    "deleted": 0,
    "modified": 2,
    "moved": 0,
    "unchanged": 3
  },
  "diffs": [
    {
      "blockUuid": "uuid-2",
      "status": "modified",
      "sectionPath": "Contents/section0.xml",
      "elementTag": "hp:p",
      "textPatches": [
        { "offset": 5, "deleteCount": 3, "insertText": "새로운 텍스트" }
      ],
      "attributeChanges": [],
      "oldBlobSha256": "old-sha...",
      "newBlobSha256": "new-sha..."
    },
    {
      "blockUuid": "uuid-7",
      "status": "added",
      "sectionPath": "Contents/section0.xml",
      "elementTag": "hp:p"
    }
  ],
  "computedInMs": 12
}
```

#### `GET /v1/collab/documents/:documentId/diff/branches` — 브랜치 간 Diff

| Query | Type | Required | 설명 |
|-------|------|----------|------|
| base | string | Yes | 기준 브랜치 이름 |
| target | string | Yes | 대상 브랜치 이름 |

> Response 형식은 커밋 간 Diff와 동일

### 4.6 Merge (병합)

#### `POST /v1/collab/documents/:documentId/merge` — 비동기 병합 시작

```json
// Request
{ "sourceBranch": "feature/section2-edit", "targetBranch": "main" }

// Response 202
{ "jobId": "5", "documentId": "0193...", "status": "queued" }
```

> 진행률은 SSE `merge-progress` 이벤트로 수신

#### `GET /v1/collab/documents/:documentId/merges/:mergeResultId` — 병합 결과 조회

```json
// Response 200 (충돌 없음)
{
  "mergeResultId": "uuid",
  "status": "completed",
  "sourceBranch": "feature/section2-edit",
  "targetBranch": "main",
  "baseCommitSha256": "abc...",
  "resultCommitSha256": "xyz...",
  "autoMergedCount": 3,
  "conflictCount": 0,
  "conflicts": []
}

// Response 200 (충돌 있음)
{
  "mergeResultId": "uuid",
  "status": "conflicts",
  "sourceBranch": "feature/section2-edit",
  "targetBranch": "main",
  "baseCommitSha256": "abc...",
  "resultCommitSha256": null,
  "autoMergedCount": 2,
  "conflictCount": 1,
  "conflicts": [
    {
      "id": "conflict-uuid",
      "blockUuid": "uuid-2",
      "conflictType": "VALUE",
      "sectionPath": "Contents/section0.xml",
      "localContent": "<hp:p>...source 버전 XML...</hp:p>",
      "remoteContent": "<hp:p>...target 버전 XML...</hp:p>",
      "baseContent": "<hp:p>...공통 조상 XML...</hp:p>"
    }
  ]
}
```

#### `POST /v1/collab/documents/:documentId/merges/:mergeResultId/resolve` — 충돌 해결

```json
// Request (자동 선택)
{
  "conflictId": "conflict-uuid",
  "resolution": "accept_local"  // or "accept_remote"
}

// Request (수동 편집)
{
  "conflictId": "conflict-uuid",
  "resolution": "manual_edit",
  "manualContent": "<hp:p>...수동 편집된 XML...</hp:p>"
}
```

#### `POST /v1/collab/documents/:documentId/merges/:mergeResultId/finalize` — 병합 확정

> 모든 충돌이 해결된 후 호출. merge commit 생성.

### 4.7 Export (내보내기)

#### `GET /v1/collab/documents/:documentId/export/:commitSha` — HWPX 다운로드

```
Response: application/zip
Content-Disposition: attachment; filename="문서명_abc12345.hwpx"
```

> fetch → Blob → createObjectURL → `<a>` 클릭으로 다운로드

### 4.8 Blob (원시 블록 내용)

#### `GET /v1/collab/blobs/:sha256` — 블록 XML 원문

```
Response: text/xml; charset=utf-8
Cache-Control: public, max-age=31536000, immutable
```

> Content-addressable: SHA가 같으면 내용이 동일. 영구 캐시 가능.

### 4.9 프로젝트 (Projects) `[AUTH]`

#### `POST /v1/collab/projects` — 프로젝트 생성

```json
// Request
{ "name": "계약서 검토 TF" }

// Response 201
{ "id": "uuid", "name": "계약서 검토 TF", "ownerId": "user-uuid", ... }
```

> 생성자가 자동으로 owner 멤버로 등록됨

#### `GET /v1/collab/projects` — 내 프로젝트 목록

> 로그인한 사용자가 멤버인 프로젝트만 반환

#### `GET /v1/collab/projects/:projectId` `[RBAC: owner|editor|viewer]`

#### `GET /v1/collab/projects/:projectId/members` `[RBAC: owner|editor|viewer]`

```json
// Response 200
[
  { "id": "uuid", "projectId": "...", "userId": "user-1", "role": "owner", "createdAt": "..." },
  { "id": "uuid", "projectId": "...", "userId": "user-2", "role": "editor", "createdAt": "..." }
]
```

#### `POST /v1/collab/projects/:projectId/members` `[RBAC: owner]`

```json
// Request
{ "userId": "user-uuid", "role": "editor" }
```

#### `DELETE /v1/collab/projects/:projectId/members/:userId` `[RBAC: owner]`

#### `POST /v1/collab/projects/:projectId/documents` `[RBAC: owner|editor]`

```json
// Request — 기존 문서를 프로젝트에 연결
{ "documentId": "doc-uuid" }
```

#### `GET /v1/collab/projects/:projectId/documents` `[RBAC: owner|editor|viewer]`

### 4.10 Merge Request (병합 요청) `[AUTH]` `[RBAC]`

#### `POST /v1/collab/projects/:projectId/merge-requests` `[RBAC: owner|editor]`

```json
// Request
{
  "documentId": "doc-uuid",
  "title": "제2조 수정안",
  "sourceBranch": "feature/section2-edit",
  "targetBranch": "main",           // optional, default "main"
  "description": "제2조 위약금 조항 수정"  // optional
}

// Response 201
{
  "id": "mr-uuid",
  "projectId": "...",
  "documentId": "...",
  "title": "제2조 수정안",
  "authorId": "user-uuid",
  "sourceBranch": "feature/section2-edit",
  "targetBranch": "main",
  "status": "open",
  ...
}
```

#### `GET /v1/collab/projects/:projectId/merge-requests` `[RBAC: owner|editor|viewer]`

| Query | Type | Optional | 설명 |
|-------|------|----------|------|
| status | string | Yes | 필터: open, approved, merged, closed 등 |

#### `GET /v1/collab/projects/:projectId/merge-requests/:mrId` `[RBAC: owner|editor|viewer]`

#### `GET /v1/collab/projects/:projectId/merge-requests/:mrId/diff` `[RBAC: owner|editor|viewer]`

> DiffResult 반환 (Section 4.5와 동일 형식)

#### `POST /v1/collab/projects/:projectId/merge-requests/:mrId/actions` `[RBAC: owner|editor]`

```json
// Request
{ "action": "approve" }
// action: "approve" | "reject" | "reopen" | "close" | "merge"
```

**MR 상태 전이:**
```
open → approved → merged (종료)
open → rejected → open (reopen)
open → closed → open (reopen)
approved → merged (종료)
approved → closed
```

> `"merge"` action 시 자동으로 hwpx-merge 큐에 작업 추가

### 4.11 댓글 (Comments) `[AUTH]` `[RBAC: owner|editor|viewer]`

#### `POST /v1/collab/projects/:projectId/comments` — 댓글 작성

```json
// Request — 블록 댓글
{
  "targetType": "block",
  "targetId": "block-uuid",
  "documentId": "doc-uuid",       // optional
  "commitSha256": "abc123...",     // optional (어떤 커밋 시점의 블록인지)
  "body": "이 조항 수정 필요합니다"
}

// Request — MR 댓글
{
  "targetType": "merge_request",
  "targetId": "mr-uuid",
  "body": "LGTM"
}

// Request — 답글
{
  "targetType": "block",
  "targetId": "block-uuid",
  "parentId": "parent-comment-uuid",
  "body": "동의합니다"
}
```

#### `GET /v1/collab/projects/:projectId/comments`

| Query | Type | Required | 설명 |
|-------|------|----------|------|
| targetType | string | Yes | "block" or "merge_request" |
| targetId | string | Yes | 대상 UUID |

```json
// Response 200 — 스레드 형태
[
  {
    "comment": {
      "id": "c1",
      "authorId": "user-1",
      "body": "이 조항 수정 필요합니다",
      "parentId": null,
      ...
    },
    "replies": [
      {
        "id": "c2",
        "authorId": "user-2",
        "body": "동의합니다",
        "parentId": "c1",
        ...
      }
    ]
  }
]
```

#### `PATCH /v1/collab/projects/:projectId/comments/:commentId` — 수정

```json
{ "body": "수정된 내용" }
```

#### `DELETE /v1/collab/projects/:projectId/comments/:commentId` — 삭제

> 본인 작성 댓글 또는 프로젝트 owner만 삭제 가능

### 4.12 AI 거버넌스 (Governance) `[AUTH]` `[RBAC]`

#### `POST /v1/collab/projects/:projectId/governance` `[RBAC: owner|editor]`

```json
// Request
{
  "documentId": "doc-uuid",
  "commitSha256": "abc123...",
  "checks": ["speech_level", "spelling", "format_rule"]  // optional, 생략 시 전체
}

// Response 202
{ "id": "result-uuid", "status": "pending", ... }
```

> 진행률은 SSE `governance-progress` 이벤트로 수신

#### `GET /v1/collab/projects/:projectId/governance/:resultId` `[RBAC: owner|editor|viewer]`

```json
// Response 200
{
  "id": "result-uuid",
  "documentId": "doc-uuid",
  "commitSha256": "abc123...",
  "status": "completed",
  "results": [
    {
      "checker": "speech_level",
      "severity": "warning",
      "blockUuid": "uuid-2",
      "message": "경어체와 평어체가 혼용되어 있습니다",
      "suggestion": "'합니다'체로 통일하세요"
    },
    {
      "checker": "spelling",
      "severity": "error",
      "blockUuid": "uuid-3",
      "message": "'됬다' → '됐다'",
      "suggestion": "됐다"
    }
  ],
  "completedAt": "2026-03-06T01:35:00Z"
}
```

#### `GET /v1/collab/projects/:projectId/governance?documentId=...` — 검사 이력

---

## 5. SSE (Server-Sent Events) — 실시간 이벤트

### 연결

```
GET /api/v1/collab/documents/:documentId/events
Authorization: Bearer <token>
```

### 이벤트 종류

#### `ingest-progress` — HWPX 업로드 처리 진행률

```json
{
  "documentId": "...",
  "progress": 40,        // 0-100
  "stage": "processing"  // uploading → extracting → processing → storing → committing → complete
}
```

#### `merge-progress` — 병합 진행률

```json
{
  "documentId": "...",
  "progress": 60,
  "stage": "merging"
}
```

#### `governance-progress` — AI 검사 진행률

```json
{
  "documentId": "...",
  "progress": 80,
  "stage": "checking"
}
```

### 프론트엔드 구현 예시

```typescript
const eventSource = new EventSource(
  `${API_URL}/v1/collab/documents/${documentId}/events`,
  // Note: EventSource는 Authorization 헤더를 지원하지 않음
  // 대안: query param으로 token 전달하거나 fetch + ReadableStream 사용
);

eventSource.addEventListener('ingest-progress', (event) => {
  const data = JSON.parse(event.data);
  console.log(`Ingest: ${data.progress}% - ${data.stage}`);
});
```

> **주의:** 브라우저 EventSource는 커스텀 헤더를 지원하지 않습니다. 현재 SSE 엔드포인트는 `RequiredAuthGuard`를 사용하므로, `fetch` + `ReadableStream` 방식이나 polyfill 라이브러리(`eventsource` npm) 사용을 권장합니다.

---

## 6. RBAC (역할 기반 접근 제어)

| 역할 | 프로젝트 관리 | 문서 편집 | MR 생성/승인 | 댓글 | 조회 |
|------|:---:|:---:|:---:|:---:|:---:|
| **owner** | O | O | O | O | O |
| **editor** | X | O | O | O | O |
| **viewer** | X | X | X | O | O |

- 프로젝트 멤버 추가/삭제: owner만
- MR merge action: owner, editor
- 문서 연결 (프로젝트에 문서 추가): owner, editor
- 댓글 삭제: 본인 또는 owner

---

## 7. 페이지 구조 (추천)

### 7.1 라우트 맵

```
/collab
  └── /                              → 프로젝트 목록 (대시보드)
  └── /projects/:projectId           → 프로젝트 상세 (문서 목록 + 멤버)
  └── /projects/:projectId/mr        → MR 목록
  └── /projects/:projectId/mr/:mrId  → MR 상세 (diff + 댓글 + 승인)

/collab/documents/:documentId
  └── /                              → 문서 전체 뷰 (★ 핵심 페이지)
  └── /preview?commit=sha            → 특정 커밋 시점 미리보기
  └── /diff?base=...&target=...      → 두 커밋/브랜치 Diff
  └── /merge/:mergeResultId          → 충돌 해결 UI
  └── /history                       → 커밋 그래프
  └── /governance                    → AI 검사 결과
```

### 7.2 핵심 페이지: 문서 전체 뷰 (`/collab/documents/:documentId`)

**이 페이지가 제품의 핵심입니다.**

```
┌──────────────────────────────────────────────────────────────┐
│  [← 프로젝트]  문서명: 계약서_v1                              │
│  Branch: [main ▼]  Commit: abc1234  [미리보기] [다운로드]      │
├──────────────┬───────────────────────────────────────────────┤
│  블록 네비    │  문서 본문 (HTML 렌더링)                        │
│              │                                               │
│  ■ 제1장 총칙 │  ┌─ Block uuid-1 ──────────────────────────┐  │
│  ■ 제1조     │  │ 제1장 총칙                                │  │
│  ● 제2조 ←── │  └──────────────────────────────────────────┘  │
│    (수정됨)   │  ┌─ Block uuid-2 ──── 🟡 수정됨 ───────────┐  │
│  ■ 제3조     │  │ 제2조 (위약금)                            │  │
│  ■ [표]      │  │ 위약금은 계약 금액의 10%로 한다.           │  │
│              │  │                          ──── 김철수 수정  │  │
│              │  │  💬 2 comments                            │  │
│              │  └──────────────────────────────────────────┘  │
│              │  ┌─ Block uuid-3 ──── 🟢 추가됨 ───────────┐  │
│              │  │ 제2조의2 (면책 조항)                       │  │
│              │  │ 천재지변 등 불가항력의 경우...              │  │
│              │  └──────────────────────────────────────────┘  │
│              │  ┌─ Block uuid-4 ──────────────────────────┐  │
│              │  │ ┌────────┬────────┬────────┐             │  │
│              │  │ │ 구분   │ 금액   │ 비율   │             │  │
│              │  │ │ 위약금 │ 1억원  │ 10%    │             │  │
│              │  │ └────────┴────────┴────────┘             │  │
│              │  └──────────────────────────────────────────┘  │
├──────────────┴───────────────────────────────────────────────┤
│  [커밋 히스토리]  [AI 검사 실행]  [MR 생성]                     │
└──────────────────────────────────────────────────────────────┘
```

**핵심 기능:**
1. **블록별 렌더링**: preview API의 HTML을 `data-block-uuid`로 블록 단위 표시
2. **변경 표시**: diff API로 현재 브랜치 vs main 비교 → 블록별 상태(추가/수정/삭제) 배지
3. **수정자 표시**: commit의 authorId로 누가 마지막에 수정했는지 표시
4. **인라인 댓글**: 블록 클릭 시 해당 블록의 comment thread 표시
5. **블록 네비게이터**: 왼쪽 사이드바에 블록 목록, 수정 상태 아이콘

### 7.3 MR 상세 페이지

```
┌──────────────────────────────────────────────────────────────┐
│  MR #3: 제2조 수정안                                          │
│  feature/section2-edit → main  |  Status: [open]              │
│  Author: 김철수  |  2026-03-06                                │
├──────────────────────────────────────────────────────────────┤
│  Summary: +1 added, 2 modified, 0 deleted                    │
│                                                              │
│  ┌─ uuid-2 ── MODIFIED ─────────────────────────────────┐   │
│  │  [Side-by-side ▼]                                     │   │
│  │  ┌──────────────────┬──────────────────┐              │   │
│  │  │ Base (main)      │ Changed          │              │   │
│  │  │ 위약금은 계약     │ 위약금은 계약     │              │   │
│  │  │ 금액의 [5%]로    │ 금액의 [10%]로   │              │   │
│  │  │ 한다.            │ 한다.            │              │   │
│  │  └──────────────────┴──────────────────┘              │   │
│  │  💬 댓글 (2)                                          │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ uuid-7 ── ADDED ────────────────────────────────────┐   │
│  │  제2조의2 (면책 조항)                                  │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  [Approve] [Reject] [Close]   [댓글 작성...]                  │
└──────────────────────────────────────────────────────────────┘
```

### 7.4 충돌 해결 페이지

```
┌──────────────────────────────────────────────────────────────┐
│  Merge: feature/section2-edit → main                         │
│  Auto-merged: 4 blocks  |  Conflicts: 1                     │
├──────────────────────────────────────────────────────────────┤
│  Conflict #1: uuid-2 (VALUE)                                 │
│                                                              │
│  ┌── Source (내 브랜치) ──┬── Target (main) ──┐              │
│  │ 위약금은 계약 금액의   │ 위약금은 계약 금액의│              │
│  │ 10%로 한다.           │ 15%로 한다.        │              │
│  └───────────────────────┴────────────────────┘              │
│                                                              │
│  [🟢 Source 수락] [🔵 Target 수락] [✏️ 직접 편집]             │
│                                                              │
│  ── Base (공통 조상) ──                                       │
│  위약금은 계약 금액의 5%로 한다.                                │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ✅ 모든 충돌 해결됨   [Merge 확정]                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. API 완성도

모든 MVP API가 구현 완료되었습니다. 블록 수정 → 커밋은 `POST /v1/collab/documents/:documentId/commits`의 `changes[]` 파라미터로 지원됩니다 (Section 4.3 참고).

**전체 흐름 가능:**
```
업로드 → 브랜치 생성 → 블록 수정 커밋 → Diff 확인 → MR 생성 → 리뷰 → Merge → Export
```

---

## 9. 기술 스택 (권장)

| 카테고리 | 기술 | 비고 |
|----------|------|------|
| Framework | Next.js 16+ (App Router) | 기존 프로젝트 사용 중 |
| UI | shadcn/ui + Tailwind CSS 4 | 기존 프로젝트 사용 중 |
| 상태관리 | Zustand | 기존 프로젝트 사용 중 |
| Diff 뷰어 | @codemirror/merge 6.12+ | XML side-by-side/unified diff |
| 테마 | next-themes | 다크/라이트 모드 |
| SSE | fetch + ReadableStream 또는 eventsource polyfill | 커스텀 헤더 필요 |
| 테스트 | Vitest + @testing-library/react + MSW | 기존 프로젝트 사용 중 |
| 인증 | @react-oauth/google | 기존 프로젝트 사용 중 |

### CodeMirror SSR 주의

CodeMirror는 `document` 객체에 접근하므로 SSR에서 에러납니다.
```tsx
// 반드시 dynamic import + ssr: false
import dynamic from 'next/dynamic';
const DiffViewer = dynamic(() => import('./diff-viewer'), { ssr: false });
```

---

## 10. 에러 핸들링

### 공통 에러 형식

```json
{
  "statusCode": 400,
  "message": "에러 메시지",
  "error": "Bad Request"
}
```

### 인증 에러

```json
{
  "code": "AUTH_REQUIRED",     // or "INVALID_TOKEN"
  "message": "로그인이 필요합니다."
}
```

### RBAC 에러

```json
{
  "code": "RBAC_FORBIDDEN",
  "message": "이 작업을 수행할 권한이 없습니다."
}
```

---

## 11. 개발 우선순위 (추천)

### Phase 1: 기본 구조 + 문서 뷰 (MVP 핵심)
1. Google 로그인 + 토큰 관리 (자동 갱신)
2. 프로젝트 CRUD + 멤버 관리
3. 문서 목록 + HWPX 업로드 (ingest SSE 진행률)
4. **문서 전체 뷰** (preview API → 블록별 HTML 렌더링)
5. 브랜치 생성 + 커밋 히스토리

### Phase 2: 편집 + 협업 흐름 (MVP 완성)
6. **블록 수정 + 커밋** (changes[] API 연동)
7. Diff 뷰어 (CodeMirror side-by-side, 변경 블록 하이라이팅)
8. MR 생성/목록/상세/승인/머지 흐름
9. 댓글 CRUD (블록 댓글 + MR 댓글)
10. Merge + 충돌 해결 UI
11. HWPX Export (다운로드)

### Phase 3: 후순위 (MVP 이후)
12. 커밋 그래프 (SVG)
13. AI 거버넌스 (맞춤법/경어체/서식 검사 — API는 준비됨, Section 4.12 참고)

---

## Appendix A: Ingest 파이프라인 (참고)

HWPX 업로드 시 백엔드에서 자동 실행되는 처리 흐름:

```
.hwpx 파일 (ZIP)
  → Supabase Storage 업로드 (원본 보존)
  → ZIP 해제 + XML 추출
  → 블록별 UUID 주입 (hwptorag:block-id 속성)
  → XML 정규화
  → 블록 분해 (hp:p, hp:tbl 단위)
  → SHA-256 해싱 → Blob 저장
  → Tree 생성 (블록→Blob 매핑)
  → Initial Commit 생성
  → main 브랜치 생성
  → Block Index 생성
```

## Appendix B: DB 스키마 (참고)

```sql
-- collab schema 주요 테이블
collab.documents        (id, owner_id, name, original_storage_path, created_at, updated_at)
collab.blobs            (sha256 PK, content BYTEA, size, created_at)
collab.trees            (sha256 PK, entries JSONB, created_at)
collab.commits          (sha256 PK, tree_sha256, parent_sha256, author_id, message, block_count, created_at)
collab.refs             (id, document_id, name, commit_sha256, is_default, updated_at)  -- UNIQUE(document_id, name)
collab.block_index      (id, document_id, block_uuid, section_path, element_tag, position)
collab.merge_results    (id, document_id, source/target_branch, base/source/target_commit, result_commit, status, counts)
collab.conflict_records (id, merge_result_id, block_uuid, conflict_type, local/remote/base_blob, resolution)
collab.projects         (id, name, owner_id, created_at, updated_at)
collab.project_members  (id, project_id, user_id, role, created_at)  -- UNIQUE(project_id, user_id)
collab.project_documents(id, project_id, document_id, created_at)    -- UNIQUE(project_id, document_id)
collab.merge_requests   (id, project_id, document_id, title, author_id, source/target_branch, status, merge_result_id)
collab.comments         (id, project_id, author_id, target_type, target_id, document_id, commit_sha256, parent_id, body)
collab.governance_results(id, document_id, commit_sha256, status, results JSONB, job_id)
```
