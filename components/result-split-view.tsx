"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { markdownToHtml } from "@/lib/markdown-to-html";

interface ResultSplitViewProps {
  content: string;
  format: string;
  loading?: boolean;
}

export function ResultSplitView({ content, format, loading }: ResultSplitViewProps) {
  if (loading) {
    return (
      <div data-testid="split-view-loading" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  const renderPreview = () => {
    if (format === "markdown") {
      return (
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
        />
      );
    }
    if (format === "json" || format === "rag-json") {
      try {
        const formatted = JSON.stringify(JSON.parse(content), null, 2);
        return <pre className="text-sm whitespace-pre-wrap break-words">{formatted}</pre>;
      } catch {
        return <pre className="text-sm whitespace-pre-wrap break-words">{content}</pre>;
      }
    }
    return <pre className="text-sm whitespace-pre-wrap break-words">{content}</pre>;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        data-testid="code-panel"
        className="rounded-lg border border-border bg-surface p-4 overflow-auto max-h-[600px]"
      >
        <div className="text-xs text-muted mb-2 font-medium uppercase">원본</div>
        <pre className="text-sm whitespace-pre-wrap break-words font-mono">{content}</pre>
      </div>
      <div
        data-testid="preview-panel"
        className="rounded-lg border border-border bg-surface p-4 overflow-auto max-h-[600px]"
      >
        <div className="text-xs text-muted mb-2 font-medium uppercase">미리보기</div>
        {renderPreview()}
      </div>
    </div>
  );
}
