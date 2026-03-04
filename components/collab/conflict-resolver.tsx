"use client";

import { useState } from "react";
import type { ConflictType, ResolutionStrategy } from "@/lib/collab-api";

interface ConflictData {
  id: string;
  blockUuid: string;
  conflictType: ConflictType;
  sectionPath: string;
  localContent: string | null;
  remoteContent: string | null;
  baseContent: string | null;
}

interface ConflictResolverProps {
  conflict: ConflictData;
  isResolved: boolean;
  onResolve: (
    conflictId: string,
    resolution: ResolutionStrategy,
    manualContent?: string
  ) => void;
}

const CONFLICT_TYPE_LABELS: Record<ConflictType, string> = {
  VALUE: "값 충돌",
  DELETE_MODIFY: "삭제/수정 충돌",
  MOVE_MOVE: "이동 충돌",
  STRUCTURAL: "구조 충돌",
};

const CONFLICT_TYPE_COLORS: Record<ConflictType, string> = {
  VALUE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  DELETE_MODIFY: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  MOVE_MOVE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  STRUCTURAL:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

function truncateUuid(uuid: string): string {
  return uuid.slice(0, 8);
}

export function ConflictResolver({
  conflict,
  isResolved,
  onResolve,
}: ConflictResolverProps) {
  const [showManualEdit, setShowManualEdit] = useState(false);
  const [manualContent, setManualContent] = useState(
    conflict.localContent ?? ""
  );
  const [showBase, setShowBase] = useState(false);

  if (isResolved) {
    return (
      <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 p-4">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-600 dark:text-green-400"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            해결됨
          </span>
          <code className="text-xs font-mono text-muted-foreground ml-2">
            {truncateUuid(conflict.blockUuid)}
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono text-muted-foreground">
            {truncateUuid(conflict.blockUuid)}
          </code>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              CONFLICT_TYPE_COLORS[conflict.conflictType]
            }`}
          >
            {CONFLICT_TYPE_LABELS[conflict.conflictType]}
          </span>
          {conflict.sectionPath && (
            <span className="text-xs text-muted-foreground">
              {conflict.sectionPath}
            </span>
          )}
        </div>
        {conflict.baseContent && (
          <button
            onClick={() => setShowBase(!showBase)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showBase ? "Base 숨기기" : "Base 보기"}
          </button>
        )}
      </div>

      {/* Base content (optional 3rd pane) */}
      {showBase && conflict.baseContent && (
        <div className="p-3 border-b border-border bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Base
          </p>
          <pre className="text-xs font-mono whitespace-pre-wrap break-all max-h-40 overflow-y-auto p-2 bg-muted/50 rounded opacity-60">
            {conflict.baseContent}
          </pre>
        </div>
      )}

      {/* 2-pane comparison: Local vs Remote */}
      <div className="grid grid-cols-2 divide-x divide-border">
        {/* Local */}
        <div className="p-3">
          <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
            Local
          </p>
          {conflict.localContent ? (
            <pre className="text-xs font-mono whitespace-pre-wrap break-all max-h-48 overflow-y-auto p-2 bg-green-50/50 dark:bg-green-950/20 rounded border border-green-200/50 dark:border-green-800/50">
              {conflict.localContent}
            </pre>
          ) : (
            <div className="p-2 text-xs text-muted-foreground italic bg-muted/30 rounded">
              (삭제됨)
            </div>
          )}
        </div>

        {/* Remote */}
        <div className="p-3">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
            Remote
          </p>
          {conflict.remoteContent ? (
            <pre className="text-xs font-mono whitespace-pre-wrap break-all max-h-48 overflow-y-auto p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded border border-blue-200/50 dark:border-blue-800/50">
              {conflict.remoteContent}
            </pre>
          ) : (
            <div className="p-2 text-xs text-muted-foreground italic bg-muted/30 rounded">
              (삭제됨)
            </div>
          )}
        </div>
      </div>

      {/* Manual edit area */}
      {showManualEdit && (
        <div className="p-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            직접 편집
          </p>
          <textarea
            value={manualContent}
            onChange={(e) => setManualContent(e.target.value)}
            className="w-full h-32 text-xs font-mono p-2 border border-border rounded-md bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="병합할 내용을 직접 입력하세요..."
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 p-3 border-t border-border bg-muted/30">
        <button
          onClick={() => onResolve(conflict.id, "accept_local")}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          Local 선택
        </button>
        <button
          onClick={() => onResolve(conflict.id, "accept_remote")}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Remote 선택
        </button>
        <button
          onClick={() => {
            if (showManualEdit) {
              onResolve(conflict.id, "manual_edit", manualContent);
            } else {
              setShowManualEdit(true);
            }
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors"
        >
          {showManualEdit ? "편집 적용" : "직접 편집"}
        </button>
      </div>
    </div>
  );
}
