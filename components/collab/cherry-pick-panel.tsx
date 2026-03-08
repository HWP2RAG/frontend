"use client";

import { useCherryPickStore } from "@/stores/cherry-pick-store";
import { Button } from "@/components/ui/button";

interface CherryPickPanelProps {
  documentId: string;
  sourceBranch: string;
  targetBranch: string;
  totalDiffs: number;
}

export function CherryPickPanel({
  documentId,
  sourceBranch,
  targetBranch,
  totalDiffs,
}: CherryPickPanelProps) {
  const { selectedBlocks, isExecuting, error, result, execute, reset } =
    useCherryPickStore();

  const handleExecute = () => {
    execute(documentId, sourceBranch, targetBranch);
  };

  return (
    <div className="p-3 space-y-3">
      {/* Title + selection count */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Cherry-pick</h3>
        <span className="text-xs text-muted-foreground">
          {selectedBlocks.size} / {totalDiffs}
        </span>
      </div>

      {/* Branch direction */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <code className="bg-muted px-1.5 py-0.5 rounded font-mono truncate max-w-[90px]">
          {sourceBranch}
        </code>
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
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
        <code className="bg-muted px-1.5 py-0.5 rounded font-mono truncate max-w-[90px]">
          {targetBranch}
        </code>
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 rounded p-2">
          {error}
        </div>
      )}

      {/* Success result */}
      {result && (
        <div className="text-xs bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200 rounded p-2 space-y-1">
          <p className="font-medium">
            {result.cherryPickedCount}개 블록이 &apos;{targetBranch}&apos;에
            적용되었습니다
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">
            커밋: {result.commitSha256.slice(0, 8)}
          </p>
          {(result.styleDependencies.charPrIds.length > 0 ||
            result.styleDependencies.paraPrIds.length > 0) && (
            <p className="text-[10px] text-muted-foreground">
              스타일: charPr {result.styleDependencies.charPrIds.length}개,
              paraPr {result.styleDependencies.paraPrIds.length}개
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs mt-1"
            onClick={reset}
          >
            초기화
          </Button>
        </div>
      )}

      {/* Execute button */}
      {!result && (
        <Button
          onClick={handleExecute}
          disabled={selectedBlocks.size === 0 || isExecuting}
          className="w-full"
          size="sm"
        >
          {isExecuting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-3.5 w-3.5"
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
              적용 중...
            </span>
          ) : selectedBlocks.size === 0 ? (
            "블록을 선택하세요"
          ) : (
            `${selectedBlocks.size}개 블록 Cherry-pick`
          )}
        </Button>
      )}
    </div>
  );
}
