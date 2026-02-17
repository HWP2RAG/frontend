"use client";

import { useUploadStore, type UploadFile } from "@/stores/upload-store";
import { ProgressRing } from "./progress-ring";
import { Button } from "@/components/ui/button";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileListItemProps {
  file: UploadFile;
}

export function FileListItem({ file }: FileListItemProps) {
  const removeFile = useUploadStore((s) => s.removeFile);
  const retryFile = useUploadStore((s) => s.retryFile);

  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm"
      data-testid="file-list-item"
    >
      <ProgressRing progress={file.progress} status={file.status} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium" title={file.file.name}>
          {file.file.name}
        </span>
        <span className="text-xs text-muted">
          {formatFileSize(file.file.size)}
          {file.error && (
            <span className="ml-2 text-red-500">{file.error}</span>
          )}
        </span>
      </div>
      <div className="flex gap-1">
        {file.status === "error" && retryFile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => retryFile(file.id)}
            title="재시도"
          >
            ↻
          </Button>
        )}
        {(file.status === "pending" || file.status === "error") && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFile(file.id)}
            title="제거"
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  );
}
