"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface BatchFileCardProps {
  filename: string;
  fileSize: number;
  status: string;
  progress: number;
  error?: string;
  conversionId?: string;
  onRetry?: (conversionId: string) => void;
}

export function BatchFileCard({
  filename,
  fileSize,
  status,
  progress,
  error,
  conversionId,
  onRetry,
}: BatchFileCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{filename}</p>
          <p className="text-xs text-muted">{formatFileSize(fileSize)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {status === "pending" && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              대기중
            </Badge>
          )}
          {status === "completed" && (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800">
              완료
            </Badge>
          )}
          {status === "failed" && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive">실패</Badge>
              {conversionId && onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetry(conversionId)}
                  className="text-xs h-7"
                >
                  재시도
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar for uploading */}
      {status === "uploading" && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted mb-1">
            <span>업로드 중...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {status === "processing" && (
        <div className="mt-3">
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <span>변환중...</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {status === "failed" && error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
