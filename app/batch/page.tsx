"use client";

import { useRef, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydration } from "@/hooks/use-auth-hydration";
import { useBatchStore } from "@/stores/batch-store";
import { FormatSelector } from "@/components/format-selector";
import { BatchFileCard } from "@/components/batch-file-card";
import { BatchSummary } from "@/components/batch-summary";
import { BatchDownloadButton } from "@/components/batch-download-button";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BatchPage() {
  const hydrated = useAuthHydration();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const batchId = useBatchStore((s) => s.batchId);
  const files = useBatchStore((s) => s.files);
  const overallStatus = useBatchStore((s) => s.overallStatus);
  const selectedFormat = useBatchStore((s) => s.selectedFormat);
  const completedCount = useBatchStore((s) => s.completedCount);
  const failedCount = useBatchStore((s) => s.failedCount);
  const totalCount = useBatchStore((s) => s.totalCount);
  const setSelectedFormat = useBatchStore((s) => s.setSelectedFormat);
  const addFiles = useBatchStore((s) => s.addFiles);
  const removeFile = useBatchStore((s) => s.removeFile);
  const startBatch = useBatchStore((s) => s.startBatch);
  const retryFile = useBatchStore((s) => s.retryFile);
  const reset = useBatchStore((s) => s.reset);

  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const arr = Array.from(fileList);
      addFiles(arr);
    },
    [addFiles],
  );

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragOver(true);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const onClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      if (inputRef.current) inputRef.current.value = "";
    },
    [handleFiles],
  );

  // Not yet hydrated -- loading skeleton
  if (!hydrated) {
    return (
      <main className="flex flex-col p-8 flex-1">
        <div className="w-full max-w-3xl mx-auto space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-12 bg-muted animate-pulse rounded-md" />
          <div className="h-32 bg-muted animate-pulse rounded-md" />
        </div>
      </main>
    );
  }

  // Not logged in -- login prompt
  if (!isLoggedIn) {
    return (
      <main className="flex flex-col p-8 flex-1 items-center justify-center">
        <div className="text-center max-w-md space-y-4 p-8 border rounded-lg bg-card">
          <h1 className="text-xl font-bold">로그인이 필요합니다</h1>
          <p className="text-muted-foreground">
            일괄 변환 기능을 사용하려면 로그인해 주세요.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            홈으로 이동
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center p-8 flex-1">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight mb-1">일괄 변환</h1>
          <p className="text-sm text-muted">
            최대 20개의 HWP 파일을 한번에 변환합니다
          </p>
        </div>

        {overallStatus === "idle" && (
          <>
            <FormatSelector value={selectedFormat} onChange={setSelectedFormat} />

            {/* Upload zone */}
            <div
              role="button"
              tabIndex={0}
              onClick={onClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onClick();
              }}
              onDragEnter={onDragEnter}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`
                flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all
                ${isDragOver ? "border-primary bg-primary-50 scale-[1.01]" : "border-border hover:border-primary-light hover:bg-primary-50/50"}
                ${files.length > 0 ? "py-4 px-4" : "py-16 px-8"}
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".hwp,.hwpx"
                multiple
                className="hidden"
                onChange={onInputChange}
              />
              {files.length > 0 ? (
                <span className="text-sm text-muted">+ 파일 추가</span>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary-light"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="text-muted">
                    HWP 파일을 드래그하거나 클릭하여 선택하세요
                  </p>
                </div>
              )}
            </div>

            {/* File count */}
            {files.length > 0 && (
              <p className="text-sm text-muted text-center">
                {files.length}/20 파일 선택됨
              </p>
            )}

            {/* Selected file list */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f) => (
                  <div
                    key={f.filename}
                    className="flex items-center justify-between px-4 py-2 border rounded-lg bg-card"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">
                        {f.filename}
                      </span>
                      <span className="text-xs text-muted">
                        {formatFileSize(f.fileSize)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(f.filename);
                      }}
                      className="ml-2 text-muted hover:text-foreground transition-colors p-1"
                      aria-label={`${f.filename} 제거`}
                    >
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
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Start button */}
            <Button
              onClick={startBatch}
              disabled={files.length < 2}
              className="w-full bg-primary hover:bg-primary-dark text-white shadow-sm"
            >
              일괄 변환 시작
            </Button>
          </>
        )}

        {overallStatus !== "idle" && (
          <>
            <BatchSummary
              totalCount={totalCount}
              completedCount={completedCount}
              failedCount={failedCount}
              overallStatus={overallStatus}
            />

            <div className="space-y-3">
              {files.map((f) => (
                <BatchFileCard
                  key={f.conversionId || f.filename}
                  filename={f.filename}
                  fileSize={f.fileSize}
                  status={f.status}
                  progress={f.progress}
                  error={f.error}
                  conversionId={f.conversionId}
                  onRetry={retryFile}
                />
              ))}
            </div>

            {(overallStatus === "completed" ||
              (overallStatus === "failed" && completedCount > 0)) &&
              batchId && (
                <BatchDownloadButton
                  batchId={batchId}
                  completedCount={completedCount}
                />
              )}

            {(overallStatus === "completed" || overallStatus === "failed") && (
              <Button variant="outline" onClick={reset} className="w-full">
                새 일괄 변환
              </Button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
