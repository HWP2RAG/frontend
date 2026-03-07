import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CommentThread, Comment } from "@/lib/collab-api";

// Mock the collab-api module
vi.mock("@/lib/collab-api", () => ({
  fetchComments: vi.fn(),
  createComment: vi.fn(),
  updateComment: vi.fn(),
  deleteComment: vi.fn(),
}));

import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
} from "@/lib/collab-api";
import { useCommentStore } from "../comment-store";

const mockFetchComments = vi.mocked(fetchComments);
const mockCreateComment = vi.mocked(createComment);
const mockUpdateComment = vi.mocked(updateComment);
const mockDeleteComment = vi.mocked(deleteComment);

// ─── Test Fixtures ──────────────────────────────────────────────────

const mockComment: Comment = {
  id: "comment-001",
  projectId: "proj-001",
  authorId: "user-001",
  targetType: "merge_request",
  targetId: "mr-001",
  parentId: null,
  body: "LGTM",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockReply: Comment = {
  id: "comment-002",
  projectId: "proj-001",
  authorId: "user-002",
  targetType: "merge_request",
  targetId: "mr-001",
  parentId: "comment-001",
  body: "감사합니다",
  createdAt: "2026-01-02T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
};

const mockThreads: CommentThread[] = [
  { comment: mockComment, replies: [mockReply] },
];

// ─── Tests ──────────────────────────────────────────────────────────

describe("useCommentStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCommentStore.getState().reset();
  });

  it("has correct initial state", () => {
    const state = useCommentStore.getState();
    expect(state.threads).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  // ─── loadComments ──────────────────────────────────────────────

  describe("loadComments", () => {
    it("should load comment threads", async () => {
      mockFetchComments.mockResolvedValue(mockThreads);

      const promise = useCommentStore
        .getState()
        .loadComments("proj-001", "merge_request", "mr-001");

      expect(useCommentStore.getState().isLoading).toBe(true);

      await promise;

      const state = useCommentStore.getState();
      expect(state.threads).toEqual(mockThreads);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockFetchComments).toHaveBeenCalledWith(
        "proj-001",
        "merge_request",
        "mr-001"
      );
    });

    it("should set error on failure", async () => {
      mockFetchComments.mockRejectedValue(new Error("댓글 조회 실패"));

      await useCommentStore
        .getState()
        .loadComments("proj-001", "merge_request", "mr-001");

      const state = useCommentStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("댓글 조회 실패");
    });
  });

  // ─── addComment ──────────────────────────────────────────────

  describe("addComment", () => {
    it("should create comment and re-fetch threads", async () => {
      mockCreateComment.mockResolvedValue(mockComment);
      mockFetchComments.mockResolvedValue(mockThreads);

      // First load to set target context
      await useCommentStore
        .getState()
        .loadComments("proj-001", "merge_request", "mr-001");
      vi.clearAllMocks();

      mockCreateComment.mockResolvedValue(mockComment);
      mockFetchComments.mockResolvedValue(mockThreads);

      await useCommentStore.getState().addComment("proj-001", {
        targetType: "merge_request",
        targetId: "mr-001",
        body: "LGTM",
      });

      expect(mockCreateComment).toHaveBeenCalledWith("proj-001", {
        targetType: "merge_request",
        targetId: "mr-001",
        body: "LGTM",
      });
      // Should re-fetch after adding
      expect(mockFetchComments).toHaveBeenCalledWith(
        "proj-001",
        "merge_request",
        "mr-001"
      );
    });

    it("should set error on failure", async () => {
      mockCreateComment.mockRejectedValue(new Error("댓글 작성 실패"));

      await useCommentStore.getState().addComment("proj-001", {
        targetType: "merge_request",
        targetId: "mr-001",
        body: "실패",
      });

      expect(useCommentStore.getState().error).toBe("댓글 작성 실패");
    });
  });

  // ─── editComment ──────────────────────────────────────────────

  describe("editComment", () => {
    it("should update comment and re-fetch threads", async () => {
      mockFetchComments.mockResolvedValue(mockThreads);
      await useCommentStore
        .getState()
        .loadComments("proj-001", "merge_request", "mr-001");
      vi.clearAllMocks();

      const updatedComment = { ...mockComment, body: "수정됨" };
      mockUpdateComment.mockResolvedValue(updatedComment);
      mockFetchComments.mockResolvedValue(mockThreads);

      await useCommentStore
        .getState()
        .editComment("proj-001", "comment-001", "수정됨");

      expect(mockUpdateComment).toHaveBeenCalledWith(
        "proj-001",
        "comment-001",
        "수정됨"
      );
      expect(mockFetchComments).toHaveBeenCalledWith(
        "proj-001",
        "merge_request",
        "mr-001"
      );
    });

    it("should set error on failure", async () => {
      mockUpdateComment.mockRejectedValue(new Error("댓글 수정 실패"));

      await useCommentStore
        .getState()
        .editComment("proj-001", "comment-001", "수정");

      expect(useCommentStore.getState().error).toBe("댓글 수정 실패");
    });
  });

  // ─── removeComment ────────────────────────────────────────────

  describe("removeComment", () => {
    it("should delete comment and re-fetch threads", async () => {
      mockFetchComments.mockResolvedValue(mockThreads);
      await useCommentStore
        .getState()
        .loadComments("proj-001", "merge_request", "mr-001");
      vi.clearAllMocks();

      mockDeleteComment.mockResolvedValue(undefined);
      mockFetchComments.mockResolvedValue([]);

      await useCommentStore
        .getState()
        .removeComment("proj-001", "comment-001");

      expect(mockDeleteComment).toHaveBeenCalledWith("proj-001", "comment-001");
      expect(mockFetchComments).toHaveBeenCalledWith(
        "proj-001",
        "merge_request",
        "mr-001"
      );
      expect(useCommentStore.getState().threads).toEqual([]);
    });

    it("should set error on failure", async () => {
      mockDeleteComment.mockRejectedValue(new Error("댓글 삭제 실패"));

      await useCommentStore
        .getState()
        .removeComment("proj-001", "comment-001");

      expect(useCommentStore.getState().error).toBe("댓글 삭제 실패");
    });
  });

  // ─── reset ─────────────────────────────────────────────────────

  describe("reset", () => {
    it("should reset to initial state", () => {
      useCommentStore.setState({
        threads: mockThreads,
        isLoading: true,
        error: "some error",
      });

      useCommentStore.getState().reset();

      const state = useCommentStore.getState();
      expect(state.threads).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
