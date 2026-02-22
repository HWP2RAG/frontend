"use client";

interface BatchSummaryProps {
  totalCount: number;
  completedCount: number;
  failedCount: number;
  overallStatus: string;
}

const STATUS_LABELS: Record<string, string> = {
  uploading: "파일 업로드 중...",
  processing: "변환 처리 중...",
  completed: "일괄 변환 완료",
  failed: "모든 변환 실패",
};

export function BatchSummary({
  totalCount,
  completedCount,
  failedCount,
  overallStatus,
}: BatchSummaryProps) {
  const doneCount = completedCount + failedCount;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const completedPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const failedPercent = totalCount > 0 ? Math.round((failedCount / totalCount) * 100) : 0;

  return (
    <div className="border rounded-lg p-5 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          {STATUS_LABELS[overallStatus] || overallStatus}
        </h2>
        <span className="text-sm text-muted">
          {completedCount}/{totalCount} 완료
          {failedCount > 0 && (
            <span className="text-destructive ml-1">, {failedCount} 실패</span>
          )}
        </span>
      </div>

      {/* Segmented progress bar */}
      <div className="w-full h-3 bg-secondary rounded-full overflow-hidden flex">
        {completedPercent > 0 && (
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${completedPercent}%` }}
          />
        )}
        {failedPercent > 0 && (
          <div
            className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${failedPercent}%` }}
          />
        )}
      </div>

      <p className="text-xs text-muted text-center">{progressPercent}% 처리됨</p>
    </div>
  );
}
