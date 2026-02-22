"use client";

import { useEffect, use } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ResultSplitView } from "@/components/result-split-view";
import { CopyButton } from "@/components/copy-button";
import { DownloadButton } from "@/components/download-button";
import { useConversionStore } from "@/stores/conversion-store";

const FORMAT_LABELS: Record<string, string> = {
  markdown: "Markdown",
  json: "JSON",
  plaintext: "Plain Text",
  "rag-json": "RAG-JSON",
  csv: "CSV",
  html: "HTML",
};

interface ResultPageProps {
  params: Promise<{ id: string }>;
}

export default function ResultPage({ params }: ResultPageProps) {
  const { id } = use(params);
  const conversion = useConversionStore((s) => s.conversions[id]);
  const fetchResult = useConversionStore((s) => s.fetchResult);

  useEffect(() => {
    fetchResult(id);
  }, [id, fetchResult]);

  const result = conversion?.result;
  const metadata = result?.metadata;
  const format = result?.format || "markdown";

  return (
    <main className="flex flex-col p-8 flex-1">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-bold tracking-tight">변환 결과</h1>
              {metadata ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-semibold">
                    {FORMAT_LABELS[format] || format}
                  </Badge>
                  <Badge variant="secondary">{metadata.pageCount} 페이지</Badge>
                  <Badge variant="secondary">{metadata.wordCount.toLocaleString()} 단어</Badge>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {result && (
                <>
                  <CopyButton text={result.content} />
                  <DownloadButton
                    content={result.content}
                    format={format}
                    filename={metadata?.title}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Content */}
        <ResultSplitView
          content={result?.content || ""}
          format={format}
          loading={!result}
        />
      </div>
    </main>
  );
}
