"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDemoStore } from "@/stores/demo-store";

const ACCEPTED_EXTENSIONS = [".hwp", ".hwpx", ".docx"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAcceptedFile(file: File): boolean {
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  return ACCEPTED_EXTENSIONS.includes(ext);
}

export function DemoUploadZone() {
  const { file, status, error, setFile, runDemo, reset } = useDemoStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (f: File) => {
      if (!isAcceptedFile(f)) {
        useDemoStore.setState({
          error: "지원하지 않는 파일 형식입니다. HWP, HWPX, DOCX 파일만 가능합니다.",
        });
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        useDemoStore.setState({
          error: `파일 크기가 ${formatFileSize(MAX_FILE_SIZE)}를 초과합니다.`,
        });
        return;
      }
      setFile(f);
    },
    [setFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const isProcessing = status === "uploading" || status === "processing";

  return (
    <Card className="p-8">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isProcessing && inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".hwp,.hwpx,.docx"
          onChange={handleInputChange}
          className="hidden"
        />

        {!file ? (
          <>
            <Upload className="h-10 w-10 text-muted" />
            <div className="text-center">
              <p className="font-medium">
                파일을 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-sm text-muted mt-1">
                HWP, HWPX, DOCX (최대 5MB)
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted">{formatFileSize(file.size)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
      )}

      {/* Action buttons */}
      <div className="mt-6 flex items-center justify-center gap-3">
        {file && !isProcessing && status !== "done" && (
          <>
            <Button onClick={runDemo} size="lg">
              분석 시작
            </Button>
            <Button variant="outline" size="lg" onClick={reset}>
              초기화
            </Button>
          </>
        )}
        {isProcessing && (
          <Button disabled size="lg">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            분석 중...
          </Button>
        )}
      </div>
    </Card>
  );
}
