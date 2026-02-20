"use client";

import { useRef, useState, useCallback } from "react";
import { useUploadStore } from "@/stores/upload-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function UploadZone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const files = useUploadStore((s) => s.files);
  const hasPending = files.some((f) => f.status === "pending");
  const isCompact = files.length > 0;

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const arr = Array.from(fileList);
      const store = useUploadStore.getState();
      store.addFiles(arr);
      const { lastError } = useUploadStore.getState();
      if (lastError) {
        toast.error(lastError);
      }
    },
    []
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
    [handleFiles]
  );

  const onClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      if (inputRef.current) inputRef.current.value = "";
    },
    [handleFiles]
  );

  const onUploadClick = useCallback(() => {
    useUploadStore.getState().startUpload();
  }, []);

  return (
    <div className="flex flex-col gap-4">
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
          ${isCompact ? "py-4 px-4" : "py-16 px-8"}
        `}
        data-testid="upload-zone"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".hwp,.hwpx"
          multiple
          className="hidden"
          onChange={onInputChange}
          data-testid="file-input"
        />
        {isCompact ? (
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
      {hasPending && (
        <Button onClick={onUploadClick} className="w-full bg-primary hover:bg-primary-dark text-white shadow-sm">
          변환하기
        </Button>
      )}
    </div>
  );
}
