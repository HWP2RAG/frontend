"use client";

import { useState, useMemo } from "react";

interface BlockEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: { blockUuid: string; html: string };
  onCommit: (blockUuid: string, content: string, message: string) => Promise<void>;
}

function stripHtml(html: string): string {
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent ?? "";
  }
  // Fallback for SSR: strip tags via regex
  return html.replace(/<[^>]*>/g, "");
}

export function BlockEditorDialog({ open, onOpenChange, block, onCommit }: BlockEditorDialogProps) {
  const originalText = useMemo(() => stripHtml(block.html), [block.html]);
  const [content, setContent] = useState(originalText);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const isContentChanged = content !== originalText;
  const isDisabled = !isContentChanged || !message.trim() || isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;

    setIsSubmitting(true);
    try {
      await onCommit(block.blockUuid, content, message.trim());
      setMessage("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/80"
        data-testid="dialog-backdrop"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">블록 편집</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="block-content" className="text-sm font-medium text-muted-foreground mb-1.5 block">
              내용
            </label>
            <textarea
              id="block-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              autoFocus
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="commit-message" className="text-sm font-medium text-muted-foreground mb-1.5 block">
              커밋 메시지
            </label>
            <input
              id="commit-message"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="예: 문단 내용 수정"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isDisabled}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "커밋 중..." : "커밋"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
