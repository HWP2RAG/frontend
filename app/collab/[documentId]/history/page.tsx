"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  fetchBranches,
  fetchCommitHistory,
} from "@/lib/collab-api";
import type {
  BranchListItem,
  CommitHistoryItem,
} from "@/lib/collab-api";
import { BranchSelector } from "@/components/collab/branch-selector";
import { CommitGraph } from "@/components/collab/commit-graph";
import { ExportButton } from "@/components/collab/export-button";
import { Eye } from "lucide-react";

export default function HistoryPage() {
  const params = useParams();
  const documentId = params.documentId as string;

  // State
  const [branches, setBranches] = useState<BranchListItem[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [allBranches, setAllBranches] = useState(false);
  const [commits, setCommits] = useState<CommitHistoryItem[]>([]);
  const [selectedCommitSha, setSelectedCommitSha] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load branches on mount
  useEffect(() => {
    (async () => {
      try {
        const branchList = await fetchBranches(documentId);
        setBranches(branchList);
        const defaultBranch = branchList.find((b) => b.isDefault);
        setSelectedBranch(defaultBranch?.name ?? branchList[0]?.name ?? null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "브랜치 목록을 불러오는 중 오류가 발생했습니다"
        );
      }
    })();
  }, [documentId]);

  // Load commits when branch selection or allBranches changes
  useEffect(() => {
    if (branches.length === 0) return;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        let allCommits: CommitHistoryItem[];

        if (allBranches) {
          // Fetch commits from all branches in parallel
          const results = await Promise.all(
            branches.map((b) => fetchCommitHistory(documentId, b.name))
          );

          // Flatten + dedup by sha256
          const dedupMap = new Map<string, CommitHistoryItem>();
          for (const branchCommits of results) {
            for (const commit of branchCommits) {
              if (!dedupMap.has(commit.sha256)) {
                dedupMap.set(commit.sha256, commit);
              }
            }
          }
          allCommits = [...dedupMap.values()];
        } else if (selectedBranch) {
          allCommits = await fetchCommitHistory(documentId, selectedBranch);
        } else {
          allCommits = [];
        }

        setCommits(allCommits);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "커밋 히스토리를 불러오는 중 오류가 발생했습니다"
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [documentId, branches, selectedBranch, allBranches]);

  const handleBranchChange = useCallback((branch: string) => {
    setSelectedBranch(branch);
    setSelectedCommitSha(null);
  }, []);

  const handleToggleAllBranches = useCallback(() => {
    setAllBranches((prev) => !prev);
    setSelectedCommitSha(null);
  }, []);

  const handleCommitClick = useCallback((sha: string) => {
    setSelectedCommitSha((prev) => (prev === sha ? null : sha));
  }, []);

  // Selected commit details
  const selectedCommit = useMemo(
    () => commits.find((c) => c.sha256 === selectedCommitSha) ?? null,
    [commits, selectedCommitSha]
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="text-destructive text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">커밋 히스토리</h1>
        <Link
          href={`/collab/${documentId}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          문서로 돌아가기
        </Link>
      </div>

      {/* Controls: Branch selector + All branches toggle */}
      <div className="flex items-center gap-4">
        <BranchSelector
          branches={branches}
          selectedBranch={selectedBranch}
          onBranchChange={handleBranchChange}
          disabled={allBranches}
        />
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allBranches}
            onChange={handleToggleAllBranches}
            className="rounded border-input"
          />
          전체 브랜치
        </label>
      </div>

      {/* Main content: Graph + Side panel */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          로딩 중...
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_320px] gap-4 min-h-[400px]">
          {/* Commit Graph */}
          <CommitGraph
            commits={commits}
            branches={branches}
            onCommitClick={handleCommitClick}
            selectedSha={selectedCommitSha}
          />

          {/* Side Panel - Commit Details */}
          <div className="border rounded-lg p-4 bg-background">
            {selectedCommit ? (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  커밋 상세
                </h2>

                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">SHA</span>
                    <p className="font-mono text-sm break-all">
                      {selectedCommit.sha256}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground">메시지</span>
                    <p className="text-sm">{selectedCommit.message}</p>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground">작성자</span>
                    <p className="text-sm">
                      {selectedCommit.authorId ?? "시스템"}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground">블록 수</span>
                    <p className="text-sm">{selectedCommit.blockCount}개</p>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground">시간</span>
                    <p className="text-sm">
                      {new Date(selectedCommit.createdAt).toLocaleString("ko-KR")}
                    </p>
                  </div>

                  {selectedCommit.parentSha256 && (
                    <div>
                      <span className="text-xs text-muted-foreground">부모 커밋</span>
                      <p className="font-mono text-xs break-all text-muted-foreground">
                        {selectedCommit.parentSha256.slice(0, 16)}...
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <Link
                    href={`/collab/${documentId}/preview?commit=${selectedCommit.sha256}`}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Eye className="h-4 w-4" />
                    미리보기
                  </Link>
                  <ExportButton
                    documentId={documentId}
                    commitSha={selectedCommit.sha256}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                커밋을 선택하면 상세 정보가 표시됩니다
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
