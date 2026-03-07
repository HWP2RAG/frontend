"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGovernanceStore } from "@/stores/governance-store";
import { useGovernanceProgress } from "@/hooks/use-merge-progress";
import { fetchBranches } from "@/lib/collab-api";
import type { BranchListItem } from "@/lib/collab-api";

const SEVERITY_CONFIG: Record<string, { label: string; cls: string }> = {
  error: {
    label: "오류",
    cls: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  warning: {
    label: "경고",
    cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  info: {
    label: "정보",
    cls: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
};

const CHECKER_LABELS: Record<string, string> = {
  speech_level: "경어체 검사",
  spelling: "맞춤법 검사",
  format_rule: "서식 검사",
};

export default function DocumentGovernancePage() {
  const { documentId } = useParams<{ documentId: string }>();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? "";

  const results = useGovernanceStore((s) => s.results);
  const currentResult = useGovernanceStore((s) => s.currentResult);
  const isLoading = useGovernanceStore((s) => s.isLoading);
  const isRunning = useGovernanceStore((s) => s.isRunning);
  const error = useGovernanceStore((s) => s.error);
  const loadHistory = useGovernanceStore((s) => s.loadHistory);
  const startCheck = useGovernanceStore((s) => s.startCheck);
  const fetchResult = useGovernanceStore((s) => s.fetchResult);
  const reset = useGovernanceStore((s) => s.reset);

  const [branches, setBranches] = useState<BranchListItem[]>([]);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);

  const progress = useGovernanceProgress(isRunning ? documentId : null);

  // Load branches to get HEAD commit
  useEffect(() => {
    if (documentId) {
      fetchBranches(documentId).then(setBranches).catch(() => {});
    }
  }, [documentId]);

  // Load history
  useEffect(() => {
    if (projectId && documentId) {
      loadHistory(projectId, documentId);
    }
    return () => reset();
  }, [projectId, documentId, loadHistory, reset]);

  // Poll result when running
  useEffect(() => {
    if (!isRunning || !currentResult || !projectId) return;
    const interval = setInterval(() => {
      fetchResult(projectId, currentResult.id);
    }, 3000);
    return () => clearInterval(interval);
  }, [isRunning, currentResult, projectId, fetchResult]);

  // Select result
  useEffect(() => {
    if (selectedResultId && projectId) {
      fetchResult(projectId, selectedResultId);
    }
  }, [selectedResultId, projectId, fetchResult]);

  const handleStartCheck = useCallback(async () => {
    if (!projectId || !documentId) return;
    const defaultBranch = branches.find((b) => b.isDefault);
    if (!defaultBranch) return;
    await startCheck(projectId, documentId, defaultBranch.commitSha256);
  }, [projectId, documentId, branches, startCheck]);

  const defaultBranch = branches.find((b) => b.isDefault);
  const displayResult = currentResult ?? (results.length > 0 ? results[0] : null);

  // Group findings by checker
  const findingsByChecker = new Map<string, typeof displayResult extends null ? never : NonNullable<typeof displayResult>["results"]>();
  if (displayResult?.results) {
    for (const finding of displayResult.results) {
      const list = findingsByChecker.get(finding.checker) ?? [];
      list.push(finding);
      findingsByChecker.set(finding.checker, list);
    }
  }

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
          <h1 className="text-lg font-semibold">AI 거버넌스</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleStartCheck}
            disabled={isRunning || !defaultBranch || !projectId}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            {isRunning ? "검사 중..." : "검사 실행"}
          </button>
          {!projectId && (
            <span className="text-xs text-muted-foreground">
              projectId 쿼리 파라미터가 필요합니다
            </span>
          )}
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      {/* Progress bar when running */}
      {isRunning && (
        <div className="mx-4 mt-2">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress?.progress ?? 0}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {progress?.stage ?? "대기 중"} ({progress?.progress ?? 0}%)
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 grid grid-cols-[280px_1fr]">
        {/* History sidebar */}
        <aside className="border-r border-border overflow-y-auto">
          <div className="p-3 border-b border-border bg-muted/50">
            <p className="text-sm font-medium">검사 이력 ({results.length})</p>
          </div>
          {isLoading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              검사 이력이 없습니다
            </div>
          ) : (
            <div className="divide-y divide-border">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => setSelectedResultId(result.id)}
                  className={`w-full text-left p-3 transition-colors text-sm ${
                    displayResult?.id === result.id
                      ? "bg-accent"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <StatusBadge status={result.status} />
                    <span className="text-xs text-muted-foreground">
                      {result.results.length}건
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(result.createdAt).toLocaleString("ko-KR")}
                  </p>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Result detail */}
        <section className="overflow-y-auto p-4">
          {!displayResult ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              {projectId ? "검사를 실행하거나 이력을 선택하세요" : "projectId가 필요합니다"}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Result header */}
              <div className="flex items-center gap-3">
                <StatusBadge status={displayResult.status} />
                <code className="text-xs font-mono text-muted-foreground">
                  commit: {displayResult.commitSha256.slice(0, 8)}
                </code>
                {displayResult.completedAt && (
                  <span className="text-xs text-muted-foreground">
                    완료: {new Date(displayResult.completedAt).toLocaleString("ko-KR")}
                  </span>
                )}
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                {["error", "warning", "info"].map((severity) => {
                  const count = displayResult.results.filter(
                    (r) => r.severity === severity
                  ).length;
                  const config = SEVERITY_CONFIG[severity];
                  return (
                    <div
                      key={severity}
                      className="p-3 rounded-lg border border-border text-center"
                    >
                      <p className="text-2xl font-bold">{count}</p>
                      <p className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full ${config.cls}`}>
                        {config.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Findings by checker */}
              {displayResult.results.length === 0 && displayResult.status === "completed" ? (
                <div className="p-8 rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 text-center">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    문제가 발견되지 않았습니다
                  </p>
                </div>
              ) : (
                Array.from(findingsByChecker.entries()).map(([checker, findings]) => (
                  <div key={checker}>
                    <h3 className="text-sm font-medium mb-2">
                      {CHECKER_LABELS[checker] ?? checker} ({findings.length})
                    </h3>
                    <div className="space-y-2">
                      {findings.map((finding, i) => {
                        const config = SEVERITY_CONFIG[finding.severity] ?? SEVERITY_CONFIG.info;
                        return (
                          <div
                            key={`${finding.blockUuid}-${i}`}
                            className="p-3 rounded-lg border border-border"
                          >
                            <div className="flex items-start gap-2">
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 mt-0.5 ${config.cls}`}>
                                {config.label}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm">{finding.message}</p>
                                {finding.suggestion && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    제안: <span className="text-primary">{finding.suggestion}</span>
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  블록: <code className="font-mono">{finding.blockUuid}</code>
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    pending: { label: "대기", cls: "bg-muted text-muted-foreground" },
    running: { label: "실행 중", cls: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    completed: { label: "완료", cls: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    partial: { label: "부분 완료", cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
    failed: { label: "실패", cls: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  };
  const c = config[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${c.cls}`}>
      {c.label}
    </span>
  );
}
