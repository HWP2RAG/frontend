"use client";

import { useState, useRef } from "react";
import { uploadHwpx } from "@/lib/collab-api";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

interface UploadHwpxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  onUploadStart: (jobId: string) => void;
  progress?: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadHwpxDialog({
  open,
  onOpenChange,
  documentId,
  onUploadStart,
  progress,
}: UploadHwpxDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSizeError(null);
    const selected = e.target.files?.[0] ?? null;

    if (selected && selected.size > MAX_FILE_SIZE) {
      setSizeError("파일 크기가 100MB를 초과합니다.");
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadHwpx(documentId, file);
      onUploadStart(result.jobId);
      onOpenChange(false);
    } catch {
      setError("업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsUploading(false);
    }
  };

  const isUploadDisabled = !file || isUploading || !!sizeError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        data-testid="dialog-backdrop"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">HWP/HWPX 파일 업로드</h2>

        <div className="mb-4">
          <label
            htmlFor="hwpx-file-input"
            className="text-sm font-medium text-muted-foreground mb-1.5 block"
          >
            파일 선택
          </label>
          <input
            id="hwpx-file-input"
            ref={inputRef}
            type="file"
            accept=".hwp,.hwpx"
            onChange={handleFileChange}
            disabled={isUploading}
            className="w-full text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted"
          />
        </div>

        {file && !sizeError && (
          <div className="mb-4 rounded-md border border-border bg-background p-3">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
        )}

        {sizeError && (
          <div className="mb-4 rounded-md border border-destructive bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{sizeError}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md border border-destructive bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {progress != null && (
          <div className="mb-4">
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 w-full rounded-full bg-muted overflow-hidden"
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
            disabled={isUploading}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploadDisabled}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "업로드 중..." : "업로드"}
          </button>
        </div>
      </div>
    </div>
  );
}
