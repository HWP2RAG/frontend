"use client";

import type { DiffStatus } from "@/lib/collab-api";

interface BlockNavigatorProps {
  blocks: Array<{ blockUuid: string; html: string; position: number }>;
  diffMap: Map<string, DiffStatus>;
  selectedBlockUuid: string | null;
  onBlockClick: (blockUuid: string) => void;
}

const STATUS_DOT: Record<DiffStatus, string> = {
  added: "bg-green-500",
  modified: "bg-yellow-500",
  deleted: "bg-red-500",
  moved: "bg-blue-500",
};

function extractText(html: string): string {
  const text = html.replace(/<[^>]*>/g, "").trim();
  if (text.length === 0) return "(빈 블록)";
  return text.length > 30 ? text.slice(0, 30) + "..." : text;
}

export function BlockNavigator({
  blocks,
  diffMap,
  selectedBlockUuid,
  onBlockClick,
}: BlockNavigatorProps) {
  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
        블록이 없습니다
      </div>
    );
  }

  return (
    <nav
      className="overflow-y-auto h-full"
      aria-label="블록 네비게이터"
    >
      <ul className="space-y-0.5 p-2">
        {blocks.map((block) => {
          const status = diffMap.get(block.blockUuid);
          const isSelected = selectedBlockUuid === block.blockUuid;

          return (
            <li key={block.blockUuid}>
              <button
                type="button"
                onClick={() => onBlockClick(block.blockUuid)}
                className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors flex items-center gap-2 ${
                  isSelected
                    ? "bg-blue-100 dark:bg-blue-900/30 text-foreground font-medium"
                    : "hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                {status && (
                  <span
                    className={`inline-block w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[status]}`}
                    aria-label={status}
                  />
                )}
                <span className="truncate">{extractText(block.html)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
