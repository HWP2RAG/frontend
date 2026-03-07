"use client";

import { useState, useRef } from "react";
import { createDocument, uploadHwpx } from "@/lib/collab-api";
import { useIngestProgress } from "@/hooks/use-merge-progress";

interface CreateDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onCreated: (documentId: string) => Promise<void>;
}

type Step = "name" | "upload" | "progress" | "done";

export function CreateDocumentDialog({
  open,
  onOpenChange,
  projectId,
  onCreated,
}: CreateDocumentDialogProps) {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const ingestProgress = useIngestProgress(step === "progress" ? documentId : null);

  if (!open) return null;

  const handleClose = () => {
    setStep("name");
    setName("");
    setDocumentId(null);
    setFile(null);
    setError(null);
    onOpenChange(false);
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const doc = await createDocument({ name: name.trim() });
      setDocumentId(doc.id);
      setStep("upload");
    } catch (err) {
      setError(err instanceof Error ? err.message : "문서 생성 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !documentId) return;
    if (file.size > 100 * 1024 * 1024) {
      setError("파일 크기가 100MB를 초과합니다");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await uploadHwpx(documentId, file);
      setStep("progress");
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipUpload = async () => {
    if (!documentId) return;
    await onCreated(documentId);
    handleClose();
  };

  const handleDone = async () => {
    if (!documentId) return;
    await onCreated(documentId);
    handleClose();
  };

  // Auto-transition to done when progress reaches 100
  if (step === "progress" && ingestProgress?.progress === 100) {
    setTimeout(() => setStep("done"), 500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-50 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        {/* Step 1: Document Name */}
        {step === "name" && (
          <>
            <h2 className="text-lg font-semibold mb-4">새 문서 생성</h2>
            <form onSubmit={handleCreateDocument}>
              <div className="mb-4">
                <label htmlFor="doc-name" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  문서 이름
                </label>
                <input
                  id="doc-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 용역계약서_v3"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                  disabled={isSubmitting}
                />
              </div>
              {error && <p className="text-xs text-destructive mb-3">{error}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={handleClose} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors" disabled={isSubmitting}>
                  취소
                </button>
                <button type="submit" disabled={!name.trim() || isSubmitting} className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? "생성 중..." : "다음"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 2: Upload HWPX */}
        {step === "upload" && (
          <>
            <h2 className="text-lg font-semibold mb-1">HWP/HWPX 파일 업로드</h2>
            <p className="text-sm text-muted-foreground mb-4">
              문서 &quot;{name}&quot;에 HWP 또는 HWPX 파일을 업로드하세요.
            </p>
            <div className="mb-4">
              <input
                ref={fileRef}
                type="file"
                accept=".hwp,.hwpx"
                onChange={(e) => { setFile(e.target.files?.[0] ?? null); setError(null); }}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {file && (
                <p className="text-xs text-muted-foreground mt-1">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            {error && <p className="text-xs text-destructive mb-3">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={handleSkipUpload} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors" disabled={isSubmitting}>
                건너뛰기
              </button>
              <button onClick={handleUpload} disabled={!file || isSubmitting} className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? "업로드 중..." : "업로드"}
              </button>
            </div>
          </>
        )}

        {/* Step 3: Progress */}
        {step === "progress" && (
          <>
            <h2 className="text-lg font-semibold mb-4">처리 중...</h2>
            <div className="mb-4">
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${ingestProgress?.progress ?? 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {ingestProgress?.stage ?? "대기 중"} ({ingestProgress?.progress ?? 0}%)
              </p>
            </div>
          </>
        )}

        {/* Step 4: Done */}
        {step === "done" && (
          <>
            <h2 className="text-lg font-semibold mb-2">완료!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              문서가 성공적으로 생성되었습니다.
            </p>
            <div className="flex justify-end">
              <button onClick={handleDone} className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                확인
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
