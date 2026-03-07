"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import DOMPurify from "dompurify";
import { fetchPreview } from "@/lib/collab-api";
import type { HtmlBlock } from "@/lib/collab-api";

export default function DocumentPreviewPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const searchParams = useSearchParams();
  const commitSha = searchParams.get("commit");

  const [blocks, setBlocks] = useState<HtmlBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId || !commitSha) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchPreview(documentId, commitSha)
      .then((response) => {
        if (cancelled) return;
        setBlocks(response.blocks);
      })
      .catch(() => {
        if (!cancelled) {
          setError("미리보기 로딩 실패");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [documentId, commitSha]);

  return (
    <main className="flex flex-col items-center p-8 flex-1">
      <div className="w-full max-w-4xl">
        <Link
          href={`/collab/documents/${documentId}`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 inline-flex items-center gap-1"
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
          문서
        </Link>

        <h1 className="text-2xl font-bold tracking-tight mt-1">
          문서 미리보기
        </h1>

        {commitSha && (
          <p className="text-sm text-muted-foreground mt-1 font-mono">
            커밋: {commitSha.slice(0, 8)}
          </p>
        )}

        {/* Missing commit param */}
        {!commitSha && (
          <div className="mt-8 p-8 rounded-lg border border-dashed border-border text-center text-muted-foreground">
            commit 파라미터가 필요합니다
          </div>
        )}

        {/* Loading */}
        {commitSha && isLoading && (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-6 bg-muted animate-pulse rounded"
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            ))}
          </div>
        )}

        {/* Error */}
        {commitSha && error && (
          <div className="mt-8 p-4 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {/* Blocks */}
        {commitSha && !isLoading && !error && blocks.length > 0 && (
          <div className="hwpx-preview space-y-0 mt-8">
            {blocks.map((block) => (
              <div
                key={block.blockUuid}
                id={block.blockUuid}
                className="rounded px-2 py-0.5"
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(block.html),
                  }}
                />
              </div>
            ))}

            <style jsx global>{`
              .hwpx-preview .hwpx-paragraph {
                margin: 0.25rem 0;
                line-height: 1.7;
              }
              .hwpx-preview .hwpx-table {
                border-collapse: collapse;
                width: 100%;
                margin: 0.5rem 0;
              }
              .hwpx-preview .hwpx-table td {
                border: 1px solid hsl(var(--border));
                padding: 0.5rem;
                vertical-align: top;
              }
              .hwpx-preview .hwpx-image {
                margin: 0.5rem 0;
              }
              .hwpx-preview .hwpx-image .placeholder {
                background: hsl(var(--muted));
                color: hsl(var(--muted-foreground));
                padding: 2rem;
                text-align: center;
                border-radius: 0.375rem;
                font-size: 0.875rem;
              }
              .hwpx-preview .hwpx-error {
                color: hsl(var(--destructive));
                padding: 0.5rem;
                background: hsl(var(--destructive) / 0.1);
                border-radius: 0.375rem;
                font-size: 0.875rem;
              }
            `}</style>
          </div>
        )}
      </div>
    </main>
  );
}
