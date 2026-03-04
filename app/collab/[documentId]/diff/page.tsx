"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useDiffStore } from "@/stores/diff-store";
import { fetchBlobContent } from "@/lib/collab-api";
import type { BlockDiff } from "@/lib/collab-api";
import { BlockDiffList } from "@/components/collab/block-diff-list";
import { DiffViewer } from "@/components/collab/diff-viewer";

export default function DiffPage() {
  const params = useParams<{ documentId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const documentId = params.documentId;
  const base = searchParams.get("base");
  const target = searchParams.get("target");

  const diffResult = useDiffStore((s) => s.diffResult);
  const selectedBlockDiff = useDiffStore((s) => s.selectedBlockDiff);
  const viewMode = useDiffStore((s) => s.viewMode);
  const isLoading = useDiffStore((s) => s.isLoading);
  const error = useDiffStore((s) => s.error);
  const loadDiff = useDiffStore((s) => s.loadDiff);
  const selectBlock = useDiffStore((s) => s.selectBlock);
  const toggleViewMode = useDiffStore((s) => s.toggleViewMode);

  const [originalXml, setOriginalXml] = useState("");
  const [modifiedXml, setModifiedXml] = useState("");
  const [isFetchingBlob, setIsFetchingBlob] = useState(false);

  // Load diff on mount
  useEffect(() => {
    if (documentId && base && target) {
      loadDiff(documentId, base, target);
    }
  }, [documentId, base, target, loadDiff]);

  // Fetch blob content when a block is selected
  const handleBlockSelect = useCallback(
    async (blockDiff: BlockDiff) => {
      selectBlock(blockDiff);
      setIsFetchingBlob(true);
      try {
        const [oldContent, newContent] = await Promise.all([
          blockDiff.oldBlobSha256
            ? fetchBlobContent(blockDiff.oldBlobSha256)
            : Promise.resolve(""),
          blockDiff.newBlobSha256
            ? fetchBlobContent(blockDiff.newBlobSha256)
            : Promise.resolve(""),
        ]);
        setOriginalXml(oldContent);
        setModifiedXml(newContent);
      } catch {
        setOriginalXml("");
        setModifiedXml("");
      } finally {
        setIsFetchingBlob(false);
      }
    },
    [selectBlock]
  );

  if (!base || !target) {
    return (
      <main className="flex flex-col items-center justify-center p-8 flex-1">
        <p className="text-muted-foreground">
          base와 target 커밋 SHA가 필요합니다.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          URL 형식: /collab/{"{documentId}"}/diff?base=SHA&target=SHA
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/collab/${documentId}`)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
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
            문서
          </button>
          <div className="text-xs text-muted-foreground">
            <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
              {base.slice(0, 8)}
            </span>
            <span className="mx-1">...</span>
            <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
              {target.slice(0, 8)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleViewMode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors"
          >
            {viewMode === "side-by-side" ? (
              <>
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
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <line x1="12" x2="12" y1="3" y2="21" />
                </svg>
                Side-by-side
              </>
            ) : (
              <>
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
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <line x1="3" x2="21" y1="12" y2="12" />
                </svg>
                Unified
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 text-sm text-destructive bg-destructive/10">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 grid grid-cols-[300px_1fr] overflow-hidden">
        {/* Left sidebar: Block list */}
        <div className="border-r border-border overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-muted animate-pulse rounded"
                />
              ))}
            </div>
          ) : diffResult ? (
            <BlockDiffList
              diffs={diffResult.diffs}
              selectedBlockUuid={selectedBlockDiff?.blockUuid ?? null}
              onBlockSelect={handleBlockSelect}
              summary={diffResult.summary}
            />
          ) : null}
        </div>

        {/* Right main: Diff viewer */}
        <div className="overflow-auto p-4">
          {isLoading ? (
            <div className="animate-pulse h-64 bg-muted rounded" />
          ) : !diffResult ? null : diffResult.diffs.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto mb-3 text-muted-foreground/50"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <p className="text-sm">두 버전이 동일합니다</p>
              </div>
            </div>
          ) : !selectedBlockDiff ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p className="text-sm">
                왼쪽 목록에서 블록을 선택하세요
              </p>
            </div>
          ) : isFetchingBlob ? (
            <div className="animate-pulse h-64 bg-muted rounded" />
          ) : (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {selectedBlockDiff.blockUuid.slice(0, 8)}
                </span>
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                  {selectedBlockDiff.elementTag}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedBlockDiff.sectionPath}
                </span>
              </div>
              <DiffViewer
                originalXml={originalXml}
                modifiedXml={modifiedXml}
                mode={viewMode}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
