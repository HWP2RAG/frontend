"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useCollabStore } from "@/stores/collab-store";
import { HwpxPreview } from "@/components/collab/hwpx-preview";

export default function PreviewPage() {
  const params = useParams<{ documentId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const documentId = params.documentId;
  const commitSha = searchParams.get("commit");

  const previewBlocks = useCollabStore((s) => s.previewBlocks);
  const isLoadingPreview = useCollabStore((s) => s.isLoadingPreview);
  const error = useCollabStore((s) => s.error);
  const loadPreview = useCollabStore((s) => s.loadPreview);

  const [selectedBlockUuid, setSelectedBlockUuid] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (documentId && commitSha) {
      loadPreview(documentId, commitSha);
    }
  }, [documentId, commitSha, loadPreview]);

  const handleBlockClick = useCallback((blockUuid: string) => {
    setSelectedBlockUuid((prev) => (prev === blockUuid ? null : blockUuid));
  }, []);

  return (
    <main className="flex flex-col items-center p-8 flex-1">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => router.push(`/collab/${documentId}`)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-1 flex items-center gap-1"
            >
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
                <path d="m15 18-6-6 6-6" />
              </svg>
              문서 상세
            </button>
            <h1 className="text-2xl font-bold tracking-tight">문서 미리보기</h1>
            {commitSha && (
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Commit: {commitSha.slice(0, 8)}
              </p>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {previewBlocks.length > 0 && !isLoadingPreview && (
              <span>{previewBlocks.length} blocks</span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {/* Preview Content */}
        <div className="rounded-lg border border-border bg-card p-6">
          {isLoadingPreview ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-muted animate-pulse rounded"
                  style={{ height: `${20 + Math.random() * 40}px` }}
                />
              ))}
            </div>
          ) : !commitSha ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              커밋을 선택해주세요
            </div>
          ) : (
            <HwpxPreview
              blocks={previewBlocks}
              onBlockClick={handleBlockClick}
              selectedBlockUuid={selectedBlockUuid}
            />
          )}
        </div>
      </div>
    </main>
  );
}
