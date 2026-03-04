"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMergeStore } from "@/stores/merge-store";
import { useMergeProgress } from "@/hooks/use-merge-progress";
import { ConflictResolver } from "@/components/collab/conflict-resolver";
import type { ResolutionStrategy } from "@/lib/collab-api";

export default function MergePage() {
  const params = useParams<{ documentId: string; mergeId: string }>();
  const router = useRouter();
  const documentId = params.documentId;
  const mergeId = params.mergeId;

  const mergeReport = useMergeStore((s) => s.mergeReport);
  const resolvedConflicts = useMergeStore((s) => s.resolvedConflicts);
  const isLoading = useMergeStore((s) => s.isLoading);
  const isFinalizing = useMergeStore((s) => s.isFinalizing);
  const error = useMergeStore((s) => s.error);
  const loadMergeReport = useMergeStore((s) => s.loadMergeReport);
  const resolveConflict = useMergeStore((s) => s.resolveConflict);
  const finalizeMerge = useMergeStore((s) => s.finalizeMerge);
  const canFinalize = useMergeStore((s) => s.canFinalize);

  const mergeProgress = useMergeProgress(documentId);

  useEffect(() => {
    if (documentId && mergeId) {
      loadMergeReport(documentId, mergeId);
    }
  }, [documentId, mergeId, loadMergeReport]);

  const handleResolve = (
    conflictId: string,
    resolution: ResolutionStrategy,
    manualContent?: string
  ) => {
    resolveConflict(documentId, mergeId, conflictId, resolution, manualContent);
  };

  const handleFinalize = async () => {
    await finalizeMerge(documentId, mergeId);
  };

  if (isLoading) {
    return (
      <main className="flex flex-col items-center p-8 flex-1">
        <div className="w-full max-w-4xl space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          <div className="h-32 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center p-8 flex-1">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/collab/${documentId}`)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 flex items-center gap-1"
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

          {mergeReport ? (
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                병합: {mergeReport.sourceBranch} → {mergeReport.targetBranch}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={mergeReport.status} />
              </div>
            </div>
          ) : (
            <h1 className="text-2xl font-bold tracking-tight">병합</h1>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {/* SSE Progress bar */}
        {mergeProgress && mergeProgress.progress < 100 && (
          <div className="mb-6 p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{mergeProgress.stage}</span>
              <span className="text-xs text-muted-foreground">
                {mergeProgress.progress}%
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${mergeProgress.progress}%` }}
              />
            </div>
          </div>
        )}

        {mergeReport && (
          <>
            {/* Statistics bar */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg border border-border bg-card text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {mergeReport.autoMergedCount}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  자동 병합
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {mergeReport.conflictCount}
                </p>
                <p className="text-xs text-muted-foreground mt-1">충돌</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {resolvedConflicts.size}
                </p>
                <p className="text-xs text-muted-foreground mt-1">해결됨</p>
              </div>
            </div>

            {/* Completed state */}
            {mergeReport.status === "completed" &&
              mergeReport.resultCommitSha256 && (
                <div className="mb-6 p-6 rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto mb-3 text-green-600 dark:text-green-400"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <p className="text-lg font-medium text-green-700 dark:text-green-300">
                    병합이 완료되었습니다
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    커밋:{" "}
                    <code className="font-mono bg-muted px-1.5 py-0.5 rounded">
                      {mergeReport.resultCommitSha256.slice(0, 8)}
                    </code>
                  </p>
                  <button
                    onClick={() => router.push(`/collab/${documentId}`)}
                    className="mt-4 inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    문서 상세 페이지로 이동
                  </button>
                </div>
              )}

            {/* Conflict list */}
            {mergeReport.conflicts.length > 0 &&
              mergeReport.status !== "completed" && (
                <div className="space-y-4 mb-6">
                  <h2 className="text-sm font-medium text-muted-foreground">
                    충돌 목록 ({mergeReport.conflicts.length}건)
                  </h2>
                  {mergeReport.conflicts.map((conflict) => (
                    <ConflictResolver
                      key={conflict.id}
                      conflict={conflict}
                      isResolved={resolvedConflicts.has(conflict.id)}
                      onResolve={handleResolve}
                    />
                  ))}
                </div>
              )}

            {/* Finalize button */}
            {mergeReport.status !== "completed" && (
              <div className="flex justify-end">
                <button
                  onClick={handleFinalize}
                  disabled={!canFinalize() || isFinalizing}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFinalizing ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      병합 중...
                    </>
                  ) : (
                    "병합 완료"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    pending: {
      label: "대기 중",
      classes: "bg-muted text-muted-foreground",
    },
    in_progress: {
      label: "진행 중",
      classes: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    completed: {
      label: "완료",
      classes:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    conflicts: {
      label: "충돌",
      classes: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    failed: {
      label: "실패",
      classes: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
  };

  const { label, classes } = config[status] ?? {
    label: status,
    classes: "bg-muted text-muted-foreground",
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${classes}`}>
      {label}
    </span>
  );
}
