"use client";

import { useState } from "react";
import type { ProjectRole } from "@/lib/collab-api";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (userId: string, role: ProjectRole) => Promise<void>;
}

export function AddMemberDialog({ open, onOpenChange, onSubmit }: AddMemberDialogProps) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<ProjectRole>("editor");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;
    setIsSubmitting(true);
    await onSubmit(userId.trim(), role);
    setUserId("");
    setRole("editor");
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">멤버 추가</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="member-user-id" className="text-sm font-medium text-muted-foreground mb-1.5 block">
              사용자 ID
            </label>
            <input
              id="member-user-id"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="사용자 UUID 입력"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="member-role" className="text-sm font-medium text-muted-foreground mb-1.5 block">
              역할
            </label>
            <select
              id="member-role"
              value={role}
              onChange={(e) => setRole(e.target.value as ProjectRole)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isSubmitting}
            >
              <option value="editor">Editor (편집자)</option>
              <option value="viewer">Viewer (조회자)</option>
            </select>
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
              disabled={!userId.trim() || isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "추가 중..." : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
