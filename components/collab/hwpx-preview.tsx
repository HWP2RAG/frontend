"use client";

import type { HtmlBlock } from "@/lib/collab-api";

interface HwpxPreviewProps {
  blocks: HtmlBlock[];
  onBlockClick?: (blockUuid: string) => void;
  selectedBlockUuid?: string | null;
}

export function HwpxPreview({
  blocks,
  onBlockClick,
  selectedBlockUuid,
}: HwpxPreviewProps) {
  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        표시할 블록이 없습니다
      </div>
    );
  }

  return (
    <div className="hwpx-preview space-y-0">
      {blocks.map((block) => (
        <div
          key={block.blockUuid}
          data-block-uuid={block.blockUuid}
          className={`hwpx-block cursor-pointer transition-colors rounded px-2 py-0.5 ${
            selectedBlockUuid === block.blockUuid
              ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
              : "hover:bg-muted/50"
          }`}
          onClick={() => onBlockClick?.(block.blockUuid)}
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      ))}

      <style jsx global>{`
        .hwpx-preview .hwpx-paragraph {
          margin: 0.25rem 0;
          line-height: 1.7;
        }
        .hwpx-preview .hwpx-run {
          /* Inherits parent styles */
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
  );
}
