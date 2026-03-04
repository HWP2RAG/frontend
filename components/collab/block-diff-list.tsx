"use client";

import type { BlockDiff, DiffStatus } from "@/lib/collab-api";

interface BlockDiffListProps {
  diffs: BlockDiff[];
  selectedBlockUuid: string | null;
  onBlockSelect: (blockDiff: BlockDiff) => void;
  summary: { added: number; deleted: number; modified: number; moved: number };
}

const STATUS_CONFIG: Record<
  DiffStatus,
  { label: string; bg: string; border: string; badge: string }
> = {
  added: {
    label: "추가",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-l-green-500",
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  deleted: {
    label: "삭제",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-l-red-500",
    badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  modified: {
    label: "수정",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    border: "border-l-yellow-500",
    badge:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  moved: {
    label: "이동",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-l-blue-500",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
};

function truncateUuid(uuid: string): string {
  return uuid.slice(0, 8);
}

export function BlockDiffList({
  diffs,
  selectedBlockUuid,
  onBlockSelect,
  summary,
}: BlockDiffListProps) {
  const total = summary.added + summary.deleted + summary.modified + summary.moved;

  return (
    <div className="flex flex-col h-full">
      {/* Summary header */}
      <div className="p-3 border-b border-border bg-muted/50">
        <p className="text-sm font-medium">
          총 {total}건 변경
        </p>
        <div className="flex flex-wrap gap-2 mt-1">
          {summary.added > 0 && (
            <span className="text-xs text-green-600 dark:text-green-400">
              추가 {summary.added}
            </span>
          )}
          {summary.deleted > 0 && (
            <span className="text-xs text-red-600 dark:text-red-400">
              삭제 {summary.deleted}
            </span>
          )}
          {summary.modified > 0 && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400">
              수정 {summary.modified}
            </span>
          )}
          {summary.moved > 0 && (
            <span className="text-xs text-blue-600 dark:text-blue-400">
              이동 {summary.moved}
            </span>
          )}
        </div>
      </div>

      {/* Block list */}
      <div className="flex-1 overflow-y-auto">
        {diffs.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            변경된 블록이 없습니다
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {diffs.map((diff) => {
              const config = STATUS_CONFIG[diff.status];
              const isSelected = diff.blockUuid === selectedBlockUuid;

              return (
                <li key={diff.blockUuid}>
                  <button
                    className={`w-full text-left p-3 border-l-4 transition-colors ${config.border} ${
                      isSelected
                        ? `${config.bg} ring-1 ring-inset ring-primary/20`
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => onBlockSelect(diff)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-xs font-mono text-muted-foreground">
                        {truncateUuid(diff.blockUuid)}
                      </code>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${config.badge}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-mono">{diff.elementTag}</span>
                      {diff.sectionPath && (
                        <span className="ml-1 truncate">
                          | {diff.sectionPath}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
