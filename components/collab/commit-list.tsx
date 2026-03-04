"use client";

import type { CommitHistoryItem } from "@/lib/collab-api";

interface CommitListProps {
  commits: CommitHistoryItem[];
  onCommitSelect?: (commitSha: string) => void;
  selectedCommitSha?: string | null;
  isLoading?: boolean;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 30) return `${diffDay}일 전`;

  return date.toLocaleDateString("ko-KR");
}

export function CommitList({
  commits,
  onCommitSelect,
  selectedCommitSha,
  isLoading = false,
}: CommitListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-16 bg-muted animate-pulse rounded-md"
          />
        ))}
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        커밋 히스토리가 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {commits.map((commit) => (
        <button
          key={commit.sha256}
          onClick={() => onCommitSelect?.(commit.sha256)}
          className={`w-full text-left px-3 py-2.5 rounded-md transition-colors text-sm ${
            selectedCommitSha === commit.sha256
              ? "bg-primary/10 border border-primary/20"
              : "hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <code className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                {commit.sha256.slice(0, 8)}
              </code>
              <span className="truncate">{commit.message}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
              <span>{commit.blockCount} blocks</span>
              <span>{formatRelativeTime(commit.createdAt)}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
