import { create } from "zustand";
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
} from "@/lib/collab-api";
import type { CommentThread } from "@/lib/collab-api";

interface CommentState {
  // Data
  threads: CommentThread[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Internal: track current target for re-fetching
  _targetType: string | null;
  _targetId: string | null;

  // Actions
  loadComments: (
    projectId: string,
    targetType: string,
    targetId: string
  ) => Promise<void>;
  addComment: (
    projectId: string,
    req: {
      targetType: string;
      targetId: string;
      documentId?: string;
      commitSha256?: string;
      parentId?: string;
      body: string;
    }
  ) => Promise<void>;
  editComment: (
    projectId: string,
    commentId: string,
    body: string
  ) => Promise<void>;
  removeComment: (projectId: string, commentId: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  threads: [] as CommentThread[],
  isLoading: false,
  error: null as string | null,
  _targetType: null as string | null,
  _targetId: null as string | null,
};

export const useCommentStore = create<CommentState>()((set, get) => ({
  ...initialState,

  loadComments: async (
    projectId: string,
    targetType: string,
    targetId: string
  ) => {
    set({ isLoading: true, error: null, _targetType: targetType, _targetId: targetId });
    try {
      const threads = await fetchComments(projectId, targetType, targetId);
      set({ threads, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error:
          err instanceof Error
            ? err.message
            : "댓글 목록을 불러오는 중 오류가 발생했습니다",
      });
    }
  },

  addComment: async (projectId, req) => {
    set({ error: null });
    try {
      await createComment(projectId, req);
      // Re-fetch threads to stay in sync
      const { _targetType, _targetId } = get();
      const targetType = _targetType ?? req.targetType;
      const targetId = _targetId ?? req.targetId;
      const threads = await fetchComments(projectId, targetType, targetId);
      set({ threads });
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "댓글 작성 중 오류가 발생했습니다",
      });
    }
  },

  editComment: async (projectId: string, commentId: string, body: string) => {
    set({ error: null });
    try {
      await updateComment(projectId, commentId, body);
      // Re-fetch threads to stay in sync
      const { _targetType, _targetId } = get();
      if (_targetType && _targetId) {
        const threads = await fetchComments(projectId, _targetType, _targetId);
        set({ threads });
      }
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "댓글 수정 중 오류가 발생했습니다",
      });
    }
  },

  removeComment: async (projectId: string, commentId: string) => {
    set({ error: null });
    try {
      await deleteComment(projectId, commentId);
      // Re-fetch threads to stay in sync
      const { _targetType, _targetId } = get();
      if (_targetType && _targetId) {
        const threads = await fetchComments(projectId, _targetType, _targetId);
        set({ threads });
      }
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "댓글 삭제 중 오류가 발생했습니다",
      });
    }
  },

  reset: () => {
    set(initialState);
  },
}));
