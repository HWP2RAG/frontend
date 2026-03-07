"use client";

import type { ProjectMember, ProjectRole } from "@/lib/collab-api";

interface MemberListProps {
  members: ProjectMember[];
  currentUserId: string | null;
  projectOwnerId: string;
  isLoading: boolean;
  onRemove?: (userId: string) => void;
}

const roleBadge: Record<ProjectRole, { label: string; classes: string }> = {
  owner: { label: "Owner", classes: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  editor: { label: "Editor", classes: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  viewer: { label: "Viewer", classes: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
};

export function MemberList({ members, currentUserId, projectOwnerId, isLoading, onRemove }: MemberListProps) {
  const isOwner = currentUserId === projectOwnerId;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">멤버가 없습니다</p>;
  }

  return (
    <div className="space-y-1">
      {members.map((member) => {
        const badge = roleBadge[member.role];
        return (
          <div key={member.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {member.userId.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{member.userId}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${badge.classes}`}>
                  {badge.label}
                </span>
              </div>
            </div>
            {isOwner && member.role !== "owner" && onRemove && (
              <button
                onClick={() => onRemove(member.userId)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                삭제
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
