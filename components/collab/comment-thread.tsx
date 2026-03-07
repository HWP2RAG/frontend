"use client";

import { useState } from "react";
import type { CommentThread as CommentThreadType } from "@/lib/collab-api";

interface CommentThreadProps {
  thread: CommentThreadType;
  currentUserId: string | null;
  onReply: (parentId: string, body: string) => void;
  onEdit: (commentId: string, body: string) => void;
  onDelete: (commentId: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 30) return `${diffDay}일 전`;
  return date.toLocaleDateString("ko-KR");
}

function CommentItem({
  comment,
  currentUserId,
  onEdit,
  onDelete,
  isReply = false,
}: {
  comment: CommentThreadType["comment"];
  currentUserId: string | null;
  onEdit: (commentId: string, body: string) => void;
  onDelete: (commentId: string) => void;
  isReply?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const isOwner = currentUserId != null && comment.authorId === currentUserId;

  function handleEditSubmit() {
    if (editBody.trim() && editBody !== comment.body) {
      onEdit(comment.id, editBody.trim());
    }
    setIsEditing(false);
  }

  function handleEditCancel() {
    setEditBody(comment.body);
    setIsEditing(false);
  }

  return (
    <div className={`py-3 ${isReply ? "pl-8 border-l-2 border-muted ml-4" : ""}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-foreground">
          {comment.authorId}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(comment.createdAt)}
        </span>
        {isOwner && !isEditing && (
          <div className="ml-auto flex gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              수정
            </button>
            <button
              onClick={() => onDelete(comment.id)}
              className="text-xs text-muted-foreground hover:text-red-600 transition-colors"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleEditSubmit}
              className="text-xs px-3 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              저장
            </button>
            <button
              onClick={handleEditCancel}
              className="text-xs px-3 py-1 rounded-md border border-input hover:bg-muted transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-foreground whitespace-pre-wrap">
          {comment.body}
        </p>
      )}
    </div>
  );
}

export function CommentThread({
  thread,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
}: CommentThreadProps) {
  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState("");

  function handleReplySubmit() {
    if (replyBody.trim()) {
      onReply(thread.comment.id, replyBody.trim());
      setReplyBody("");
      setShowReply(false);
    }
  }

  return (
    <div className="border-b border-border last:border-b-0">
      <CommentItem
        comment={thread.comment}
        currentUserId={currentUserId}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Replies */}
      {thread.replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
          isReply
        />
      ))}

      {/* Reply form */}
      <div className="pl-4 pb-3">
        {showReply ? (
          <div className="space-y-2 pl-8">
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="답글을 입력하세요..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleReplySubmit}
                disabled={!replyBody.trim()}
                className="text-xs px-3 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                답글 작성
              </button>
              <button
                onClick={() => {
                  setShowReply(false);
                  setReplyBody("");
                }}
                className="text-xs px-3 py-1 rounded-md border border-input hover:bg-muted transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowReply(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            답글
          </button>
        )}
      </div>
    </div>
  );
}
