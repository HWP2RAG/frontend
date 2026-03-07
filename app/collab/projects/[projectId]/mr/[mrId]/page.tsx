"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMRStore } from "@/stores/mr-store";
import { useCommentStore } from "@/stores/comment-store";
import { useAuthStore } from "@/stores/auth-store";
import { CommentThread } from "@/components/collab/comment-thread";
import type { MRStatus, DiffStatus } from "@/lib/collab-api";

const STATUS_BADGE: Record<MRStatus, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  approved: {
    label: "Approved",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  merge_pending: {
    label: "Merge Pending",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  merged: {
    label: "Merged",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  closed: {
    label: "Closed",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
};

const DIFF_STATUS_CONFIG: Record<DiffStatus, { label: string; color: string }> = {
  added: { label: "추가", color: "text-green-600 dark:text-green-400" },
  deleted: { label: "삭제", color: "text-red-600 dark:text-red-400" },
  modified: { label: "수정", color: "text-yellow-600 dark:text-yellow-400" },
  moved: { label: "이동", color: "text-blue-600 dark:text-blue-400" },
};

function getAvailableActions(status: MRStatus): { action: string; label: string; variant: string }[] {
  switch (status) {
    case "open":
      return [
        { action: "approve", label: "승인", variant: "primary" },
        { action: "reject", label: "반려", variant: "destructive" },
        { action: "close", label: "닫기", variant: "outline" },
      ];
    case "approved":
      return [
        { action: "merge", label: "병합", variant: "primary" },
        { action: "close", label: "닫기", variant: "outline" },
      ];
    case "rejected":
      return [
        { action: "reopen", label: "다시 열기", variant: "outline" },
      ];
    case "closed":
      return [
        { action: "reopen", label: "다시 열기", variant: "outline" },
      ];
    default:
      return [];
  }
}

function actionButtonClass(variant: string): string {
  switch (variant) {
    case "primary":
      return "bg-primary text-primary-foreground hover:bg-primary/90";
    case "destructive":
      return "bg-red-600 text-white hover:bg-red-700";
    default:
      return "border border-input hover:bg-muted";
  }
}

export default function MergeRequestDetailPage() {
  const params = useParams<{ projectId: string; mrId: string }>();
  const {
    selectedMR,
    mrDiff,
    isLoadingDetail,
    error: mrError,
    selectMR,
    performAction,
  } = useMRStore();
  const {
    threads,
    isLoading: isLoadingComments,
    error: commentError,
    loadComments,
    addComment,
    editComment,
    removeComment,
  } = useCommentStore();
  const user = useAuthStore((s) => s.user);
  const [newComment, setNewComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    selectMR(params.projectId, params.mrId);
    loadComments(params.projectId, "merge_request", params.mrId);
  }, [params.projectId, params.mrId, selectMR, loadComments]);

  async function handleAction(action: string) {
    setActionLoading(true);
    await performAction(params.projectId, params.mrId, action);
    setActionLoading(false);
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    await addComment(params.projectId, {
      targetType: "merge_request",
      targetId: params.mrId,
      body: newComment.trim(),
    });
    setNewComment("");
  }

  function handleReply(parentId: string, body: string) {
    addComment(params.projectId, {
      targetType: "merge_request",
      targetId: params.mrId,
      parentId,
      body,
    });
  }

  function handleEdit(commentId: string, body: string) {
    editComment(params.projectId, commentId, body);
  }

  function handleDelete(commentId: string) {
    removeComment(params.projectId, commentId);
  }

  const currentUserId = user?.id ?? null;

  return (
    <main className="flex flex-col items-center p-8 flex-1">
      <div className="w-full max-w-4xl">
        {/* Breadcrumb */}
        <Link
          href={`/collab/projects/${params.projectId}/mr`}
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
          MR 목록
        </Link>

        {/* Loading */}
        {isLoadingDetail && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            불러오는 중...
          </div>
        )}

        {/* Error */}
        {mrError && (
          <div className="py-4 px-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 text-sm text-red-600 dark:text-red-400">
            {mrError}
          </div>
        )}

        {/* MR Detail */}
        {selectedMR && (
          <>
            {/* Header */}
            <div className="mt-1">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">
                  {selectedMR.title}
                </h1>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                    STATUS_BADGE[selectedMR.status].className
                  }`}
                >
                  {STATUS_BADGE[selectedMR.status].label}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span>{selectedMR.authorId}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted">
                  {selectedMR.sourceBranch} → {selectedMR.targetBranch}
                </span>
              </div>
              {selectedMR.description && (
                <p className="mt-3 text-sm text-foreground whitespace-pre-wrap">
                  {selectedMR.description}
                </p>
              )}
            </div>

            {/* Action buttons */}
            {getAvailableActions(selectedMR.status).length > 0 && (
              <div className="flex gap-2 mt-4">
                {getAvailableActions(selectedMR.status).map(
                  ({ action, label, variant }) => (
                    <button
                      key={action}
                      onClick={() => handleAction(action)}
                      disabled={actionLoading}
                      className={`text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50 ${actionButtonClass(
                        variant
                      )}`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            )}

            {/* Diff summary */}
            {mrDiff && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-3">변경 사항</h2>

                {/* Summary counts */}
                <div className="flex gap-4 p-3 rounded-lg border border-border bg-muted/30 mb-4">
                  <span className="text-sm">
                    총{" "}
                    <strong>
                      {mrDiff.summary.added +
                        mrDiff.summary.deleted +
                        mrDiff.summary.modified +
                        mrDiff.summary.moved}
                    </strong>
                    건 변경
                  </span>
                  {mrDiff.summary.added > 0 && (
                    <span className="text-sm text-green-600 dark:text-green-400">
                      추가 {mrDiff.summary.added}
                    </span>
                  )}
                  {mrDiff.summary.modified > 0 && (
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">
                      수정 {mrDiff.summary.modified}
                    </span>
                  )}
                  {mrDiff.summary.deleted > 0 && (
                    <span className="text-sm text-red-600 dark:text-red-400">
                      삭제 {mrDiff.summary.deleted}
                    </span>
                  )}
                  {mrDiff.summary.moved > 0 && (
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      이동 {mrDiff.summary.moved}
                    </span>
                  )}
                </div>

                {/* Changed blocks list */}
                {mrDiff.diffs.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                    변경된 블록이 없습니다
                  </div>
                ) : (
                  <ul className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                    {mrDiff.diffs.map((diff) => {
                      const config = DIFF_STATUS_CONFIG[diff.status];
                      return (
                        <li
                          key={diff.blockUuid}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm"
                        >
                          <code className="text-xs font-mono text-muted-foreground w-20 shrink-0 truncate">
                            {diff.blockUuid.slice(0, 8)}
                          </code>
                          <span className={`text-xs font-medium ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            {diff.elementTag}
                          </span>
                          {diff.sectionPath && (
                            <span className="text-xs text-muted-foreground truncate">
                              {diff.sectionPath}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* Comments section */}
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="text-lg font-semibold mb-4">댓글</h2>

              {commentError && (
                <div className="mb-4 py-2 px-3 rounded border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 text-sm text-red-600 dark:text-red-400">
                  {commentError}
                </div>
              )}

              {isLoadingComments && (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  댓글 불러오는 중...
                </div>
              )}

              {/* Thread list */}
              {!isLoadingComments && threads.length > 0 && (
                <div className="border border-border rounded-lg divide-y divide-border mb-4">
                  {threads.map((thread) => (
                    <CommentThread
                      key={thread.comment.id}
                      thread={thread}
                      currentUserId={currentUserId}
                      onReply={handleReply}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}

              {!isLoadingComments && threads.length === 0 && (
                <div className="py-4 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg mb-4">
                  아직 댓글이 없습니다
                </div>
              )}

              {/* New comment form */}
              <div className="space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  댓글 작성
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
