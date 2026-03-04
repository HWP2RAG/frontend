// ─── Types ──────────────────────────────────────────────────────────

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

// ─── API Base ───────────────────────────────────────────────────────

const COLLAB_API_URL =
  process.env.NEXT_PUBLIC_COLLAB_API_URL ?? "http://localhost:3001/api";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${COLLAB_API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Collab API error ${res.status}: ${body || res.statusText}`
    );
  }

  return res.json() as Promise<T>;
}

// ─── Document endpoints ─────────────────────────────────────────────

export async function fetchDocuments(): Promise<DocumentListItem[]> {
  return apiFetch<DocumentListItem[]>("/v1/collab/documents");
}

// ─── Branch endpoints ───────────────────────────────────────────────

export async function fetchBranches(
  documentId: string
): Promise<BranchListItem[]> {
  return apiFetch<BranchListItem[]>(
    `/v1/collab/documents/${documentId}/branches`
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

// ─── Preview endpoint ───────────────────────────────────────────────

export async function fetchPreview(
  documentId: string,
  commitSha: string
): Promise<PreviewResponse> {
  return apiFetch<PreviewResponse>(
    `/v1/collab/documents/${documentId}/preview/${commitSha}`
  );
}

// ─── Diff endpoint ──────────────────────────────────────────────────

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
