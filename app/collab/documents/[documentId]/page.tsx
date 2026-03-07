"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DOMPurify from "dompurify";
import { useCollabStore } from "@/stores/collab-store";
import { fetchBranchDiff, createBranch, createCommit } from "@/lib/collab-api";
import type { DiffStatus, DiffResult, HtmlBlock } from "@/lib/collab-api";
import { BranchSelector } from "@/components/collab/branch-selector";
import { ExportButton } from "@/components/collab/export-button";
import { BlockNavigator } from "@/components/collab/block-navigator";
import { CreateBranchDialog } from "@/components/collab/create-branch-dialog";
import { BlockEditorDialog } from "@/components/collab/block-editor-dialog";

// ─── DiffBadge ──────────────────────────────────────────────────────

function DiffBadge({ status }: { status: DiffStatus }) {
  const config: Record<DiffStatus, { label: string; cls: string }> = {
    added: {
      label: "추가됨",
      cls: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    modified: {
      label: "수정됨",
      cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    deleted: {
      label: "삭제됨",
      cls: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    moved: {
      label: "이동됨",
      cls: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
  };
  const { label, cls } = config[status];
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

// ─── Page ───────────────────────────────────────────────────────────

export default function DocumentFullViewPage() {
  const { documentId } = useParams<{ documentId: string }>();

  // Store state
  const documents = useCollabStore((s) => s.documents);
  const branches = useCollabStore((s) => s.branches);
  const selectedBranch = useCollabStore((s) => s.selectedBranch);
  const commits = useCollabStore((s) => s.commits);
  const previewBlocks = useCollabStore((s) => s.previewBlocks);
  const isLoadingBranches = useCollabStore((s) => s.isLoadingBranches);
  const isLoadingCommits = useCollabStore((s) => s.isLoadingCommits);
  const isLoadingPreview = useCollabStore((s) => s.isLoadingPreview);
  const error = useCollabStore((s) => s.error);

  // Store actions
  const loadDocuments = useCollabStore((s) => s.loadDocuments);
  const loadBranches = useCollabStore((s) => s.loadBranches);
  const selectBranch = useCollabStore((s) => s.selectBranch);
  const loadPreview = useCollabStore((s) => s.loadPreview);

  // Derived
  const documentName = documents.find((d) => d.id === documentId)?.name ?? "문서 뷰";

  // Local state
  const [diffMap, setDiffMap] = useState<Map<string, DiffStatus>>(new Map());
  const [selectedBlockUuid, setSelectedBlockUuid] = useState<string | null>(null);
  const [isLoadingDiff, setIsLoadingDiff] = useState(false);
  const [showCreateBranch, setShowCreateBranch] = useState(false);
  const [editingBlock, setEditingBlock] = useState<HtmlBlock | null>(null);

  // Derived
  const headCommit = commits[0] ?? null;
  const defaultBranch = branches.find((b) => b.isDefault);
  const isOnDefaultBranch = selectedBranch === defaultBranch?.name;

  // 0. Load documents for name display
  useEffect(() => {
    if (documents.length === 0) {
      loadDocuments();
    }
  }, [documents.length, loadDocuments]);

  // 1. Load branches on mount
  useEffect(() => {
    if (documentId) {
      loadBranches(documentId);
    }
  }, [documentId, loadBranches]);

  // 2. Load preview when HEAD commit changes
  useEffect(() => {
    if (documentId && headCommit) {
      loadPreview(documentId, headCommit.sha256);
    }
  }, [documentId, headCommit, loadPreview]);

  // 3. Load branch diff if not on default branch
  useEffect(() => {
    if (!documentId || !selectedBranch || !defaultBranch || isOnDefaultBranch) {
      setDiffMap(new Map());
      return;
    }

    let cancelled = false;
    setIsLoadingDiff(true);

    fetchBranchDiff(documentId, defaultBranch.name, selectedBranch)
      .then((result: DiffResult) => {
        if (cancelled) return;
        const map = new Map<string, DiffStatus>();
        for (const d of result.diffs) {
          map.set(d.blockUuid, d.status);
        }
        setDiffMap(map);
      })
      .catch(() => {
        if (!cancelled) setDiffMap(new Map());
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDiff(false);
      });

    return () => {
      cancelled = true;
    };
  }, [documentId, selectedBranch, defaultBranch, isOnDefaultBranch]);

  // Handlers
  const handleBranchChange = useCallback(
    (branch: string) => {
      selectBranch(branch);
      setSelectedBlockUuid(null);
    },
    [selectBranch]
  );

  const handleBlockClick = useCallback((blockUuid: string) => {
    setSelectedBlockUuid(blockUuid);
    document.getElementById(blockUuid)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const handleCreateBranch = useCallback(
    async (name: string) => {
      if (!documentId) return;
      const newBranch = await createBranch(documentId, { name });
      await loadBranches(documentId);
      selectBranch(newBranch.name);
    },
    [documentId, loadBranches, selectBranch]
  );

  const handleBlockCommit = useCallback(
    async (blockUuid: string, content: string, message: string) => {
      if (!documentId || !selectedBranch) return;
      await createCommit(documentId, {
        message,
        branch: selectedBranch,
        changes: [{ blockUuid, content }],
      });
      // Reload to see updated content
      await loadBranches(documentId);
    },
    [documentId, selectedBranch, loadBranches]
  );

  const handleBlockDoubleClick = useCallback(
    (block: HtmlBlock) => {
      setEditingBlock(block);
    },
    []
  );

  // Loading state
  const isInitialLoading = isLoadingBranches || isLoadingCommits;

  return (
    <main className="flex flex-col h-[calc(100vh-4rem)]">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-border px-4 py-3 space-y-2">
        <div className="flex items-center gap-3">
          <Link
            href="/collab"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            돌아가기
          </Link>
          <h1 className="text-lg font-semibold truncate">
            {documentName}
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <BranchSelector
            branches={branches}
            selectedBranch={selectedBranch}
            onBranchChange={handleBranchChange}
            disabled={isInitialLoading}
          />

          {headCommit && (
            <span className="text-xs text-muted-foreground font-mono">
              {headCommit.sha256.slice(0, 8)}
            </span>
          )}

          {headCommit && (
            <ExportButton
              documentId={documentId}
              commitSha={headCommit.sha256}
              disabled={isLoadingPreview}
            />
          )}

          <button
            onClick={() => setShowCreateBranch(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-border hover:bg-accent transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>
            브랜치
          </button>

          {isLoadingDiff && (
            <span className="text-xs text-muted-foreground animate-pulse">
              diff 로딩 중...
            </span>
          )}
        </div>
      </header>

      {/* ── Error ───────────────────────────────────────────────── */}
      {error && (
        <div className="mx-4 mt-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 grid grid-cols-[250px_1fr]">
        {/* Sidebar */}
        <aside className="border-r border-border overflow-hidden">
          {isInitialLoading || isLoadingPreview ? (
            <div className="p-2 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-7 bg-muted animate-pulse rounded"
                />
              ))}
            </div>
          ) : (
            <BlockNavigator
              blocks={previewBlocks}
              diffMap={diffMap}
              selectedBlockUuid={selectedBlockUuid}
              onBlockClick={handleBlockClick}
            />
          )}
        </aside>

        {/* Main content */}
        <section className="overflow-y-auto p-4">
          {isInitialLoading || isLoadingPreview ? (
            <div className="space-y-3 max-w-3xl mx-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-6 bg-muted animate-pulse rounded"
                  style={{ width: `${60 + Math.random() * 40}%` }}
                />
              ))}
            </div>
          ) : previewBlocks.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              표시할 블록이 없습니다
            </div>
          ) : (
            <div className="hwpx-preview space-y-0 max-w-3xl mx-auto">
              {previewBlocks.map((block) => {
                const status = diffMap.get(block.blockUuid);
                return (
                  <div
                    key={block.blockUuid}
                    id={block.blockUuid}
                    className={`relative group rounded px-2 py-0.5 transition-colors ${
                      selectedBlockUuid === block.blockUuid
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleBlockClick(block.blockUuid)}
                    onDoubleClick={() => handleBlockDoubleClick(block)}
                  >
                    {status && (
                      <span className="absolute -left-1 top-0.5">
                        <DiffBadge status={status} />
                      </span>
                    )}
                    {selectedBlockUuid === block.blockUuid && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleBlockDoubleClick(block); }}
                        className="absolute top-0.5 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1.5 py-0.5 rounded bg-primary text-primary-foreground"
                      >
                        편집
                      </button>
                    )}
                    <div
                      className={status ? "ml-14" : ""}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(block.html),
                      }}
                    />
                  </div>
                );
              })}

              <style jsx global>{`
                .hwpx-preview .hwpx-paragraph {
                  margin: 0.25rem 0;
                  line-height: 1.7;
                }
                .hwpx-preview .hwpx-table {
                  border-collapse: collapse;
                  width: 100%;
                  margin: 0.5rem 0;
                }
                .hwpx-preview .hwpx-table td {
                  border: 1px solid hsl(var(--border));
                  padding: 0.5rem;
                  vertical-align: top;
                }
                .hwpx-preview .hwpx-image {
                  margin: 0.5rem 0;
                }
                .hwpx-preview .hwpx-image .placeholder {
                  background: hsl(var(--muted));
                  color: hsl(var(--muted-foreground));
                  padding: 2rem;
                  text-align: center;
                  border-radius: 0.375rem;
                  font-size: 0.875rem;
                }
                .hwpx-preview .hwpx-error {
                  color: hsl(var(--destructive));
                  padding: 0.5rem;
                  background: hsl(var(--destructive) / 0.1);
                  border-radius: 0.375rem;
                  font-size: 0.875rem;
                }
              `}</style>
            </div>
          )}
        </section>
      </div>

      {/* ── Bottom Toolbar ──────────────────────────────────────── */}
      <footer className="shrink-0 border-t border-border px-4 py-2 flex items-center gap-3">
        <Link
          href={`/collab/documents/${documentId}/history`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-accent transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
          </svg>
          히스토리
        </Link>

        <Link
          href={`/collab/documents/${documentId}/governance`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-accent transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
          AI 검사
        </Link>

        {!isOnDefaultBranch && selectedBranch && (
          <Link
            href={`/collab/documents/${documentId}/diff?base=${defaultBranch?.name ?? "main"}&target=${selectedBranch}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <path d="M13 6h3a2 2 0 0 1 2 2v7" />
              <path d="M6 9v12" />
            </svg>
            MR 생성
          </Link>
        )}
      </footer>

      {/* Dialogs */}
      <CreateBranchDialog
        open={showCreateBranch}
        onOpenChange={setShowCreateBranch}
        onSubmit={handleCreateBranch}
      />
      {editingBlock && (
        <BlockEditorDialog
          open={!!editingBlock}
          onOpenChange={(open) => { if (!open) setEditingBlock(null); }}
          block={editingBlock}
          onCommit={handleBlockCommit}
        />
      )}
    </main>
  );
}
