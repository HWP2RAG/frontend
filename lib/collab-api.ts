import { useAuthStore } from "@/stores/auth-store";

// ─── Existing Types ─────────────────────────────────────────────────

export interface HtmlBlock {
  blockUuid: string;
  html: string;
  sectionPath: string;
  position: number;
}

export interface PreviewResponse {
  commitSha: string;
  blockCount: number;
  blocks: HtmlBlock[];
}

export interface DocumentListItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface BranchListItem {
  name: string;
  commitSha256: string;
  isDefault: boolean;
}

export interface CommitHistoryItem {
  sha256: string;
  message: string;
  authorId: string | null;
  blockCount: number;
  createdAt: string;
  parentSha256: string | null;
}

export type DiffStatus = "added" | "deleted" | "modified" | "moved";

export interface TextPatch {
  offset: number;
  deleteCount: number;
  insertText: string;
}

export interface AttributeChange {
  attributeName: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface BlockDiff {
  blockUuid: string;
  status: DiffStatus;
  sectionPath: string;
  elementTag: string;
  textPatches?: TextPatch[];
  attributeChanges?: AttributeChange[];
  oldBlobSha256?: string;
  newBlobSha256?: string;
  oldPosition?: number;
  newPosition?: number;
}

export interface DiffResult {
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

export type ConflictType =
  | "VALUE"
  | "DELETE_MODIFY"
  | "MOVE_MOVE"
  | "STRUCTURAL";
export type MergeStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "conflicts"
  | "failed";
export type ResolutionStrategy =
  | "accept_local"
  | "accept_remote"
  | "manual_edit";

export interface MergeReport {
  mergeResultId: string;
  status: MergeStatus;
  sourceBranch: string;
  targetBranch: string;
  baseCommitSha256: string | null;
  resultCommitSha256: string | null;
  autoMergedCount: number;
  conflictCount: number;
  conflicts: Array<{
    id: string;
    blockUuid: string;
    conflictType: ConflictType;
    sectionPath: string;
    localContent: string | null;
    remoteContent: string | null;
    baseContent: string | null;
  }>;
}

// ─── New Types: Project ─────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectRole = "owner" | "editor" | "viewer";

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  createdAt: string;
}

// ─── New Types: Merge Request ───────────────────────────────────────

export type MRStatus =
  | "open"
  | "approved"
  | "merge_pending"
  | "rejected"
  | "merged"
  | "closed";

export interface MergeRequest {
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

export type MRAction = "approve" | "reject" | "reopen" | "close" | "merge";

// ─── New Types: Comment ─────────────────────────────────────────────

export interface Comment {
  id: string;
  projectId: string;
  authorId: string;
  targetType: "block" | "merge_request";
  targetId: string;
  documentId?: string | null;
  commitSha256?: string | null;
  parentId?: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentThread {
  comment: Comment;
  replies: Comment[];
}

// ─── New Types: Governance ──────────────────────────────────────────

export interface GovernanceResult {
  id: string;
  documentId: string;
  commitSha256: string;
  status: "pending" | "running" | "completed" | "partial" | "failed";
  results: GovernanceFinding[];
  jobId: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface GovernanceFinding {
  checker: string;
  severity: string;
  blockUuid: string;
  message: string;
  suggestion?: string;
}

// ─── New Types: Checkout ────────────────────────────────────────────

export interface CheckoutBlock {
  blockUuid: string;
  sectionPath: string;
  elementTag: string;
  position: number;
  contentSha256: string;
}

export interface CheckoutResponse {
  commit: {
    sha256: string;
    message: string;
    authorId: string | null;
    blockCount: number;
    createdAt: string;
  };
  blockCount: number;
  blocks: CheckoutBlock[];
}

// ─── New Types: Block Change / Commit ───────────────────────────────

export interface BlockChange {
  blockUuid: string;
  content: string;
}

export interface CommitCreateRequest {
  message: string;
  branch?: string;
  authorId?: string;
  changes?: BlockChange[];
}

export interface CommitCreateResponse {
  commitSha256: string;
  treeSha256: string;
  parentSha256: string;
  branch: string;
  blockCount: number;
  changedBlocks: number;
}

// ─── New Types: Branch Creation ─────────────────────────────────────

export interface BranchCreateRequest {
  name: string;
  sourceCommitSha256?: string;
}

// ─── New Types: Document Creation ───────────────────────────────────

export interface DocumentCreateRequest {
  name: string;
  ownerId?: string;
}

// ─── New Types: Upload ──────────────────────────────────────────────

export interface UploadResponse {
  jobId: string;
  documentId: string;
  status: string;
}

// ─── API Base ───────────────────────────────────────────────────────

const COLLAB_API_URL =
  process.env.NEXT_PUBLIC_COLLAB_API_URL ?? "https://hwptorag-server-production.up.railway.app/api";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await useAuthStore.getState().ensureFreshToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${COLLAB_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(init?.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Collab API error ${res.status}: ${body || res.statusText}`
    );
  }

  return res.json() as Promise<T>;
}

async function apiFetchVoid(path: string, init?: RequestInit): Promise<void> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${COLLAB_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(init?.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Collab API error ${res.status}: ${body || res.statusText}`
    );
  }
}

// ─── Document endpoints ─────────────────────────────────────────────

export async function fetchDocuments(): Promise<DocumentListItem[]> {
  return apiFetch<DocumentListItem[]>("/v1/collab/documents");
}

export async function createDocument(
  req: DocumentCreateRequest
): Promise<{ id: string; name: string }> {
  return apiFetch<{ id: string; name: string }>("/v1/collab/documents", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function uploadHwpx(
  documentId: string,
  file: File
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const authHeaders = await getAuthHeaders();
  const res = await fetch(
    `${COLLAB_API_URL}/v1/collab/documents/${documentId}/upload`,
    {
      method: "POST",
      headers: { ...authHeaders },
      body: formData,
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Collab API error ${res.status}: ${body || res.statusText}`
    );
  }

  return res.json() as Promise<UploadResponse>;
}

// ─── Branch endpoints ───────────────────────────────────────────────

export async function fetchBranches(
  documentId: string
): Promise<BranchListItem[]> {
  return apiFetch<BranchListItem[]>(
    `/v1/collab/documents/${documentId}/branches`
  );
}

export async function createBranch(
  documentId: string,
  req: BranchCreateRequest
): Promise<BranchListItem> {
  return apiFetch<BranchListItem>(
    `/v1/collab/documents/${documentId}/branches`,
    {
      method: "POST",
      body: JSON.stringify(req),
    }
  );
}

// ─── Commit endpoints ───────────────────────────────────────────────

export async function fetchCommitHistory(
  documentId: string,
  branch: string,
  limit?: number,
  offset?: number
): Promise<CommitHistoryItem[]> {
  const params = new URLSearchParams({ branch });
  if (limit != null) params.set("limit", String(limit));
  if (offset != null) params.set("offset", String(offset));

  return apiFetch<CommitHistoryItem[]>(
    `/v1/collab/documents/${documentId}/commits?${params}`
  );
}

export async function createCommit(
  documentId: string,
  req: CommitCreateRequest
): Promise<CommitCreateResponse> {
  return apiFetch<CommitCreateResponse>(
    `/v1/collab/documents/${documentId}/commits`,
    {
      method: "POST",
      body: JSON.stringify(req),
    }
  );
}

// ─── Preview endpoint ───────────────────────────────────────────────

export async function fetchPreview(
  documentId: string,
  commitSha: string
): Promise<PreviewResponse> {
  return apiFetch<PreviewResponse>(
    `/v1/collab/documents/${documentId}/preview/${commitSha}`
  );
}

// ─── Checkout endpoint ──────────────────────────────────────────────

export async function fetchCheckout(
  documentId: string,
  commitSha: string
): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>(
    `/v1/collab/documents/${documentId}/checkout/${commitSha}`
  );
}

// ─── Diff endpoints ─────────────────────────────────────────────────

export async function fetchDiff(
  documentId: string,
  base: string,
  target: string
): Promise<DiffResult> {
  const params = new URLSearchParams({ base, target });
  return apiFetch<DiffResult>(
    `/v1/collab/documents/${documentId}/diff?${params}`
  );
}

export async function fetchBranchDiff(
  documentId: string,
  baseBranch: string,
  targetBranch: string
): Promise<DiffResult> {
  const params = new URLSearchParams({ base: baseBranch, target: targetBranch });
  return apiFetch<DiffResult>(
    `/v1/collab/documents/${documentId}/diff/branches?${params}`
  );
}

// ─── Blob endpoint ──────────────────────────────────────────────────

export async function fetchBlobContent(sha256: string): Promise<string> {
  const res = await fetch(`${COLLAB_API_URL}/v1/collab/blobs/${sha256}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch blob ${sha256}: ${res.status}`);
  }
  return res.text();
}

// ─── Merge endpoints ────────────────────────────────────────────────

export async function startMerge(
  documentId: string,
  sourceBranch: string,
  targetBranch: string
): Promise<{ jobId: string; documentId: string; status: string }> {
  return apiFetch(`/v1/collab/documents/${documentId}/merge`, {
    method: "POST",
    body: JSON.stringify({ sourceBranch, targetBranch }),
  });
}

export async function resolveConflict(
  documentId: string,
  mergeResultId: string,
  conflictId: string,
  resolution: ResolutionStrategy,
  manualContent?: string
): Promise<unknown> {
  return apiFetch(
    `/v1/collab/documents/${documentId}/merges/${mergeResultId}/resolve`,
    {
      method: "POST",
      body: JSON.stringify({ conflictId, resolution, manualContent }),
    }
  );
}

export async function finalizeMerge(
  documentId: string,
  mergeResultId: string
): Promise<unknown> {
  return apiFetch(
    `/v1/collab/documents/${documentId}/merges/${mergeResultId}/finalize`,
    { method: "POST" }
  );
}

// ─── Export endpoint ────────────────────────────────────────────────

export async function downloadHwpx(
  documentId: string,
  commitSha: string
): Promise<Blob> {
  const res = await fetch(
    `${COLLAB_API_URL}/v1/collab/documents/${documentId}/export/${commitSha}`,
    { headers: { Accept: "application/octet-stream" } }
  );

  if (!res.ok) {
    throw new Error(`Failed to download HWPX: ${res.status}`);
  }

  return res.blob();
}

// ─── Project endpoints (all auth) ───────────────────────────────────

export async function fetchProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/v1/collab/projects", {});
}

export async function createProject(name: string): Promise<Project> {
  return apiFetch<Project>("/v1/collab/projects", {
    method: "POST",

    body: JSON.stringify({ name }),
  });
}

export async function fetchProject(projectId: string): Promise<Project> {
  return apiFetch<Project>(`/v1/collab/projects/${projectId}`, {});
}

export async function fetchProjectMembers(
  projectId: string
): Promise<ProjectMember[]> {
  return apiFetch<ProjectMember[]>(
    `/v1/collab/projects/${projectId}/members`,
    {}
  );
}

export async function addProjectMember(
  projectId: string,
  userId: string,
  role: ProjectRole
): Promise<ProjectMember> {
  return apiFetch<ProjectMember>(
    `/v1/collab/projects/${projectId}/members`,
    {
      method: "POST",

      body: JSON.stringify({ userId, role }),
    }
  );
}

export async function removeProjectMember(
  projectId: string,
  userId: string
): Promise<void> {
  return apiFetchVoid(
    `/v1/collab/projects/${projectId}/members/${userId}`,
    {
      method: "DELETE",

    }
  );
}

export async function linkDocumentToProject(
  projectId: string,
  documentId: string
): Promise<void> {
  await apiFetch(
    `/v1/collab/projects/${projectId}/documents`,
    {
      method: "POST",

      body: JSON.stringify({ documentId }),
    }
  );
}

export async function fetchProjectDocuments(
  projectId: string
): Promise<DocumentListItem[]> {
  return apiFetch<DocumentListItem[]>(
    `/v1/collab/projects/${projectId}/documents`,
    {}
  );
}

// ─── Merge Request endpoints (all auth) ─────────────────────────────

export async function fetchMergeRequests(
  projectId: string,
  status?: string
): Promise<MergeRequest[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  const qs = params.toString();
  return apiFetch<MergeRequest[]>(
    `/v1/collab/projects/${projectId}/merge-requests${qs ? `?${qs}` : ""}`,
    {}
  );
}

export async function createMergeRequest(
  projectId: string,
  req: {
    documentId: string;
    title: string;
    sourceBranch: string;
    targetBranch?: string;
    description?: string;
  }
): Promise<MergeRequest> {
  return apiFetch<MergeRequest>(
    `/v1/collab/projects/${projectId}/merge-requests`,
    {
      method: "POST",

      body: JSON.stringify(req),
    }
  );
}

export async function fetchMergeRequest(
  projectId: string,
  mrId: string
): Promise<MergeRequest> {
  return apiFetch<MergeRequest>(
    `/v1/collab/projects/${projectId}/merge-requests/${mrId}`,
    {}
  );
}

export async function fetchMergeRequestDiff(
  projectId: string,
  mrId: string
): Promise<DiffResult> {
  return apiFetch<DiffResult>(
    `/v1/collab/projects/${projectId}/merge-requests/${mrId}/diff`,
    {}
  );
}

export async function performMRAction(
  projectId: string,
  mrId: string,
  action: MRAction
): Promise<void> {
  await apiFetch(
    `/v1/collab/projects/${projectId}/merge-requests/${mrId}/actions`,
    {
      method: "POST",

      body: JSON.stringify({ action }),
    }
  );
}

// ─── Comment endpoints (all auth) ───────────────────────────────────

export async function fetchComments(
  projectId: string,
  targetType: string,
  targetId: string
): Promise<CommentThread[]> {
  const params = new URLSearchParams({ targetType, targetId });
  return apiFetch<CommentThread[]>(
    `/v1/collab/projects/${projectId}/comments?${params}`,
    {}
  );
}

export async function createComment(
  projectId: string,
  req: {
    targetType: string;
    targetId: string;
    documentId?: string;
    commitSha256?: string;
    parentId?: string;
    body: string;
  }
): Promise<Comment> {
  return apiFetch<Comment>(
    `/v1/collab/projects/${projectId}/comments`,
    {
      method: "POST",

      body: JSON.stringify(req),
    }
  );
}

export async function updateComment(
  projectId: string,
  commentId: string,
  body: string
): Promise<Comment> {
  return apiFetch<Comment>(
    `/v1/collab/projects/${projectId}/comments/${commentId}`,
    {
      method: "PATCH",

      body: JSON.stringify({ body }),
    }
  );
}

export async function deleteComment(
  projectId: string,
  commentId: string
): Promise<void> {
  return apiFetchVoid(
    `/v1/collab/projects/${projectId}/comments/${commentId}`,
    {
      method: "DELETE",

    }
  );
}

// ─── Governance endpoints (all auth) ────────────────────────────────

export async function startGovernance(
  projectId: string,
  req: {
    documentId: string;
    commitSha256: string;
    checks?: string[];
  }
): Promise<GovernanceResult> {
  return apiFetch<GovernanceResult>(
    `/v1/collab/projects/${projectId}/governance`,
    {
      method: "POST",

      body: JSON.stringify(req),
    }
  );
}

export async function fetchGovernanceResult(
  projectId: string,
  resultId: string
): Promise<GovernanceResult> {
  return apiFetch<GovernanceResult>(
    `/v1/collab/projects/${projectId}/governance/${resultId}`,
    {}
  );
}

export async function fetchGovernanceHistory(
  projectId: string,
  documentId: string
): Promise<GovernanceResult[]> {
  const params = new URLSearchParams({ documentId });
  return apiFetch<GovernanceResult[]>(
    `/v1/collab/projects/${projectId}/governance?${params}`,
    {}
  );
}
