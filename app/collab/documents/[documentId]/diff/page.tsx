"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  fetchDiff,
  fetchBranchDiff,
  fetchBranches,
  fetchBlobContent,
} from "@/lib/collab-api";
import type {
  BranchListItem,
  DiffResult,
  BlockDiff,
} from "@/lib/collab-api";
import { BlockDiffList } from "@/components/collab/block-diff-list";

export default function DocumentDiffPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const searchParams = useSearchParams();

  const baseParam = searchParams.get("base");
  const targetParam = searchParams.get("target");
  const mode = searchParams.get("mode") ?? "branch"; // "branch" or "commit"

  const [branches, setBranches] = useState<BranchListItem[]>([]);
  const [baseBranch, setBaseBranch] = useState(baseParam ?? "main");
  const [targetBranch, setTargetBranch] = useState(targetParam ?? "");
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<BlockDiff | null>(null);
  const [blobOld, setBlobOld] = useState<string | null>(null);
  const [blobNew, setBlobNew] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBlobs, setIsLoadingBlobs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load branches
  useEffect(() => {
    if (!documentId) return;
    fetchBranches(documentId).then(setBranches).catch(() => {});
  }, [documentId]);

  // Auto-load diff if params provided
  useEffect(() => {
    if (!documentId || !baseParam || !targetParam) return;
    loadDiff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, baseParam, targetParam]);

  const loadDiff = useCallback(async () => {
    if (!documentId) return;
    setIsLoading(true);
    setError(null);
    setSelectedBlock(null);
    setBlobOld(null);
    setBlobNew(null);

    try {
      let result: DiffResult;
      if (mode === "commit" && baseParam && targetParam) {
        result = await fetchDiff(documentId, baseParam, targetParam);
      } else {
        result = await fetchBranchDiff(documentId, baseBranch, targetBranch);
      }
      setDiffResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Diff 로딩 실패");
    } finally {
      setIsLoading(false);
    }
  }, [documentId, mode, baseParam, targetParam, baseBranch, targetBranch]);

  // Load blob contents when a block is selected
  const handleBlockSelect = useCallback(
    async (diff: BlockDiff) => {
      setSelectedBlock(diff);
      setBlobOld(null);
      setBlobNew(null);

      if (diff.status === "modified" && diff.oldBlobSha256 && diff.newBlobSha256) {
        setIsLoadingBlobs(true);
        try {
          const [oldContent, newContent] = await Promise.all([
            fetchBlobContent(diff.oldBlobSha256),
            fetchBlobContent(diff.newBlobSha256),
          ]);
          setBlobOld(oldContent);
          setBlobNew(newContent);
        } catch {
          // silently fail - blobs are optional
        } finally {
          setIsLoadingBlobs(false);
        }
      }
    },
    []
  );

  const isBranchMode = mode !== "commit";

  return (
    <main className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <header className="shrink-0 border-b border-border px-4 py-3 space-y-2">
        <div className="flex items-center gap-3">
          <Link
            href={`/collab/documents/${documentId}`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            문서
          </Link>
          <h1 className="text-lg font-semibold">변경 비교 (Diff)</h1>
        </div>

        {/* Branch selector row */}
        {isBranchMode && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={baseBranch}
              onChange={(e) => setBaseBranch(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              {branches.map((b) => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
            <span className="text-sm text-muted-foreground">vs</span>
            <select
              value={targetBranch}
              onChange={(e) => setTargetBranch(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              {branches.map((b) => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
            <button
              onClick={loadDiff}
              disabled={isLoading || !baseBranch || !targetBranch || baseBranch === targetBranch}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              비교
            </button>
          </div>
        )}

        {!isBranchMode && baseParam && targetParam && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{baseParam.slice(0, 8)}</code>
            <span>vs</span>
            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{targetParam.slice(0, 8)}</code>
          </div>
        )}
      </header>

      {error && (
        <div className="mx-4 mt-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 grid grid-cols-[280px_1fr]">
        {/* Block list sidebar */}
        <aside className="border-r border-border overflow-hidden">
          {isLoading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : diffResult ? (
            <BlockDiffList
              diffs={diffResult.diffs}
              selectedBlockUuid={selectedBlock?.blockUuid ?? null}
              onBlockSelect={handleBlockSelect}
              summary={diffResult.summary}
            />
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              {isBranchMode ? "브랜치를 선택하고 비교를 클릭하세요" : "로딩 중..."}
            </div>
          )}
        </aside>

        {/* Diff detail */}
        <section className="overflow-y-auto p-4">
          {!selectedBlock ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              {diffResult ? "왼쪽에서 변경된 블록을 선택하세요" : "비교 결과가 없습니다"}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Block header */}
              <div className="flex items-center gap-3">
                <code className="text-sm font-mono text-muted-foreground">
                  {selectedBlock.blockUuid}
                </code>
                <span className="text-xs font-mono text-muted-foreground">
                  {selectedBlock.elementTag}
                </span>
                <DiffStatusBadge status={selectedBlock.status} />
              </div>

              {/* Content comparison */}
              {selectedBlock.status === "modified" && (
                isLoadingBlobs ? (
                  <div className="h-40 bg-muted animate-pulse rounded" />
                ) : blobOld && blobNew ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Base</h4>
                      <pre className="text-xs bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded p-3 overflow-x-auto whitespace-pre-wrap break-all">
                        {blobOld}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Changed</h4>
                      <pre className="text-xs bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded p-3 overflow-x-auto whitespace-pre-wrap break-all">
                        {blobNew}
                      </pre>
                    </div>
                  </div>
                ) : null
              )}

              {selectedBlock.status === "added" && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded p-4 text-sm">
                  새로 추가된 블록
                </div>
              )}

              {selectedBlock.status === "deleted" && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded p-4 text-sm">
                  삭제된 블록
                </div>
              )}

              {/* Text patches */}
              {selectedBlock.textPatches && selectedBlock.textPatches.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">텍스트 변경 ({selectedBlock.textPatches.length}건)</h4>
                  <div className="space-y-1">
                    {selectedBlock.textPatches.map((patch, i) => (
                      <div key={i} className="text-xs bg-muted rounded p-2 font-mono">
                        offset: {patch.offset}, delete: {patch.deleteCount}, insert: &quot;{patch.insertText}&quot;
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attribute changes */}
              {selectedBlock.attributeChanges && selectedBlock.attributeChanges.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">속성 변경 ({selectedBlock.attributeChanges.length}건)</h4>
                  <div className="space-y-1">
                    {selectedBlock.attributeChanges.map((change, i) => (
                      <div key={i} className="text-xs bg-muted rounded p-2">
                        <span className="font-mono">{change.attributeName}</span>:{" "}
                        <span className="text-red-600 dark:text-red-400">{change.oldValue ?? "(없음)"}</span>
                        {" → "}
                        <span className="text-green-600 dark:text-green-400">{change.newValue ?? "(없음)"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function DiffStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    added: { label: "추가됨", cls: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    modified: { label: "수정됨", cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
    deleted: { label: "삭제됨", cls: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    moved: { label: "이동됨", cls: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  };
  const c = config[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${c.cls}`}>
      {c.label}
    </span>
  );
}
