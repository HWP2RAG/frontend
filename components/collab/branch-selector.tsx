"use client";

import type { BranchListItem } from "@/lib/collab-api";

interface BranchSelectorProps {
  branches: BranchListItem[];
  selectedBranch: string | null;
  onBranchChange: (branch: string) => void;
  disabled?: boolean;
}

export function BranchSelector({
  branches,
  selectedBranch,
  onBranchChange,
  disabled = false,
}: BranchSelectorProps) {
  if (branches.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        브랜치가 없습니다
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="branch-select"
        className="text-sm font-medium text-muted-foreground whitespace-nowrap"
      >
        브랜치
      </label>
      <select
        id="branch-select"
        value={selectedBranch ?? ""}
        onChange={(e) => onBranchChange(e.target.value)}
        disabled={disabled}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {branches.map((branch) => (
          <option key={branch.name} value={branch.name}>
            {branch.isDefault ? `${branch.name} *` : branch.name}
          </option>
        ))}
      </select>
    </div>
  );
}
