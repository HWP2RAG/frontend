"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchBranches, fetchCommitHistory } from "@/lib/collab-api";
import type { BranchListItem, CommitHistoryItem } from "@/lib/collab-api";
import { BranchSelector } from "@/components/collab/branch-selector";
import { CommitList } from "@/components/collab/commit-list";
import { CommitGraph } from "@/components/collab/commit-graph";

export default function DocumentHistoryPage() {
  const { documentId } = useParams<{ documentId: string }>();

  const [branches, setBranches] = useState<BranchListItem[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [commits, setCommits] = useState<CommitHistoryItem[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");
  const [error, setError] = useState<string | null>(null);

  // Load branches
  useEffect(() => {
    if (!documentId) return;
    setIsLoadingBranches(true);
    fetchBranches(documentId)
      .then((data) => {
        setBranches(data);
        const defaultBranch = data.find((b) => b.isDefault);
        setSelectedBranch(defaultBranch?.name ?? data[0]?.name ?? null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "브랜치 로딩 실패"))
      .finally(() => setIsLoadingBranches(false));
  }, [documentId]);

  // Load commits when branch changes
  useEffect(() => {
    if (!documentId || !selectedBranch) return;
    setIsLoadingCommits(true);
    setSelectedCommit(null);
    fetchCommitHistory(documentId, selectedBranch)
      .then(setCommits)
      .catch((err) => setError(err instanceof Error ? err.message : "커밋 로딩 실패"))
      .finally(() => setIsLoadingCommits(false));
  }, [documentId, selectedBranch]);

  const handleBranchChange = useCallback((branch: string) => {
    setSelectedBranch(branch);
  }, []);

  const selectedCommitData = commits.find((c) => c.sha256 === selectedCommit);

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
          <h1 className="text-lg font-semibold">커밋 히스토리</h1>
        </div>
        <div className="flex items-center gap-3">
          <BranchSelector
            branches={branches}
            selectedBranch={selectedBranch}
            onBranchChange={handleBranchChange}
            disabled={isLoadingBranches}
          />
          <div className="flex rounded-md border border-border overflow-hidden text-xs">
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              목록
            </button>
            <button
              onClick={() => setViewMode("graph")}
              className={`px-2.5 py-1 transition-colors ${viewMode === "graph" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              그래프
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 grid grid-cols-[1fr_350px]">
        {/* Commit list or graph */}
        <section className="overflow-y-auto p-4">
          {viewMode === "list" ? (
            <CommitList
              commits={commits}
              onCommitSelect={setSelectedCommit}
              selectedCommitSha={selectedCommit}
              isLoading={isLoadingCommits}
            />
          ) : (
            <CommitGraph
              commits={commits}
              branches={branches}
              onCommitClick={setSelectedCommit}
              selectedSha={selectedCommit}
            />
          )}
        </section>

        {/* Commit detail sidebar */}
        <aside className="border-l border-border overflow-y-auto p-4">
          {selectedCommitData ? (
            <div className="space-y-4">
              <h3 className="font-medium text-sm">커밋 상세</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">SHA:</span>
                  <code className="ml-2 text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                    {selectedCommitData.sha256.slice(0, 16)}...
                  </code>
                </div>
                <div>
                  <span className="text-muted-foreground">메시지:</span>
                  <span className="ml-2">{selectedCommitData.message}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">블록 수:</span>
                  <span className="ml-2">{selectedCommitData.blockCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">작성일:</span>
                  <span className="ml-2">
                    {new Date(selectedCommitData.createdAt).toLocaleString("ko-KR")}
                  </span>
                </div>
                {selectedCommitData.parentSha256 && (
                  <div>
                    <span className="text-muted-foreground">부모:</span>
                    <code className="ml-2 text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                      {selectedCommitData.parentSha256.slice(0, 16)}...
                    </code>
                  </div>
                )}
              </div>
              <div className="pt-2 space-y-2">
                <Link
                  href={`/collab/documents/${documentId}?commit=${selectedCommitData.sha256}`}
                  className="block w-full text-center px-3 py-1.5 text-sm rounded-md border border-border hover:bg-accent transition-colors"
                >
                  이 커밋 시점 보기
                </Link>
                {selectedCommitData.parentSha256 && (
                  <Link
                    href={`/collab/documents/${documentId}/diff?base=${selectedCommitData.parentSha256}&target=${selectedCommitData.sha256}`}
                    className="block w-full text-center px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    변경 내용 보기
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              커밋을 선택하세요
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
