import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MergeRequest, DiffResult } from "@/lib/collab-api";

// Mock the collab-api module
vi.mock("@/lib/collab-api", () => ({
  fetchMergeRequests: vi.fn(),
  createMergeRequest: vi.fn(),
  fetchMergeRequest: vi.fn(),
  fetchMergeRequestDiff: vi.fn(),
  performMRAction: vi.fn(),
}));

// Import mocked functions after vi.mock
import {
  fetchMergeRequests,
  createMergeRequest,
  fetchMergeRequest,
  fetchMergeRequestDiff,
  performMRAction,
} from "@/lib/collab-api";
import { useMRStore } from "../mr-store";

// Cast mocked functions for type-safe expectations
const mockFetchMergeRequests = vi.mocked(fetchMergeRequests);
const mockCreateMergeRequest = vi.mocked(createMergeRequest);
const mockFetchMergeRequest = vi.mocked(fetchMergeRequest);
const mockFetchMergeRequestDiff = vi.mocked(fetchMergeRequestDiff);
const mockPerformMRAction = vi.mocked(performMRAction);

// ─── Test Fixtures ──────────────────────────────────────────────────

const mockMR: MergeRequest = {
  id: "mr-001",
  projectId: "proj-001",
  documentId: "doc-001",
  title: "기능 브랜치 병합",
  description: "새로운 기능 추가",
  authorId: "user-001",
  sourceBranch: "feature/new",
  targetBranch: "main",
  status: "open",
  mergeResultId: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockMR2: MergeRequest = {
  id: "mr-002",
  projectId: "proj-001",
  documentId: "doc-001",
  title: "버그 수정",
  description: null,
  authorId: "user-002",
  sourceBranch: "fix/bug",
  targetBranch: "main",
  status: "approved",
  mergeResultId: null,
  createdAt: "2026-02-01T00:00:00Z",
  updatedAt: "2026-02-01T00:00:00Z",
};

const mockDiff: DiffResult = {
  baseCommitSha256: "abc123",
  targetCommitSha256: "def456",
  summary: { added: 2, deleted: 1, modified: 3, moved: 0, unchanged: 10 },
  diffs: [],
  computedInMs: 42,
};

// ─── Tests ──────────────────────────────────────────────────────────

describe("useMRStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMRStore.getState().reset();
  });

  it("has correct initial state", () => {
    const state = useMRStore.getState();
    expect(state.mergeRequests).toEqual([]);
    expect(state.selectedMR).toBeNull();
    expect(state.mrDiff).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isLoadingDetail).toBe(false);
    expect(state.error).toBeNull();
  });

  // ─── loadMergeRequests ──────────────────────────────────────────

  describe("loadMergeRequests", () => {
    it("should load merge requests and set isLoading states", async () => {
      mockFetchMergeRequests.mockResolvedValue([mockMR, mockMR2]);

      const promise = useMRStore.getState().loadMergeRequests("proj-001");

      expect(useMRStore.getState().isLoading).toBe(true);
      expect(useMRStore.getState().error).toBeNull();

      await promise;

      const state = useMRStore.getState();
      expect(state.mergeRequests).toEqual([mockMR, mockMR2]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockFetchMergeRequests).toHaveBeenCalledWith("proj-001", undefined);
    });

    it("should pass status filter to API", async () => {
      mockFetchMergeRequests.mockResolvedValue([mockMR]);

      await useMRStore.getState().loadMergeRequests("proj-001", "open");

      expect(mockFetchMergeRequests).toHaveBeenCalledWith("proj-001", "open");
    });

    it("should set error on failure", async () => {
      mockFetchMergeRequests.mockRejectedValue(new Error("네트워크 오류"));

      await useMRStore.getState().loadMergeRequests("proj-001");

      const state = useMRStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("네트워크 오류");
      expect(state.mergeRequests).toEqual([]);
    });
  });

  // ─── createMR ─────────────────────────────────────────────────

  describe("createMR", () => {
    it("should create a merge request and add it to the list", async () => {
      mockCreateMergeRequest.mockResolvedValue(mockMR);

      const result = await useMRStore.getState().createMR("proj-001", {
        documentId: "doc-001",
        title: "기능 브랜치 병합",
        sourceBranch: "feature/new",
      });

      expect(result).toEqual(mockMR);
      expect(useMRStore.getState().mergeRequests).toEqual([mockMR]);
      expect(useMRStore.getState().error).toBeNull();
      expect(mockCreateMergeRequest).toHaveBeenCalledWith("proj-001", {
        documentId: "doc-001",
        title: "기능 브랜치 병합",
        sourceBranch: "feature/new",
      });
    });

    it("should append to existing merge requests list", async () => {
      useMRStore.setState({ mergeRequests: [mockMR] });
      mockCreateMergeRequest.mockResolvedValue(mockMR2);

      await useMRStore.getState().createMR("proj-001", {
        documentId: "doc-001",
        title: "버그 수정",
        sourceBranch: "fix/bug",
      });

      expect(useMRStore.getState().mergeRequests).toEqual([mockMR, mockMR2]);
    });

    it("should set error on failure and return null", async () => {
      mockCreateMergeRequest.mockRejectedValue(
        new Error("MR 생성 실패")
      );

      const result = await useMRStore.getState().createMR("proj-001", {
        documentId: "doc-001",
        title: "실패할 MR",
        sourceBranch: "fail",
      });

      expect(result).toBeNull();
      expect(useMRStore.getState().error).toBe("MR 생성 실패");
    });
  });

  // ─── selectMR ──────────────────────────────────────────────────

  describe("selectMR", () => {
    it("should load MR detail and diff", async () => {
      mockFetchMergeRequest.mockResolvedValue(mockMR);
      mockFetchMergeRequestDiff.mockResolvedValue(mockDiff);

      await useMRStore.getState().selectMR("proj-001", "mr-001");

      const state = useMRStore.getState();
      expect(state.selectedMR).toEqual(mockMR);
      expect(state.mrDiff).toEqual(mockDiff);
      expect(state.isLoadingDetail).toBe(false);
      expect(state.error).toBeNull();

      expect(mockFetchMergeRequest).toHaveBeenCalledWith("proj-001", "mr-001");
      expect(mockFetchMergeRequestDiff).toHaveBeenCalledWith("proj-001", "mr-001");
    });

    it("should clear previous selection before loading", async () => {
      useMRStore.setState({
        selectedMR: mockMR2,
        mrDiff: mockDiff,
      });

      mockFetchMergeRequest.mockResolvedValue(mockMR);
      mockFetchMergeRequestDiff.mockResolvedValue(mockDiff);

      await useMRStore.getState().selectMR("proj-001", "mr-001");

      expect(useMRStore.getState().selectedMR).toEqual(mockMR);
    });

    it("should set error when fetchMergeRequest fails", async () => {
      mockFetchMergeRequest.mockRejectedValue(
        new Error("MR을 찾을 수 없습니다")
      );

      await useMRStore.getState().selectMR("proj-001", "invalid-id");

      const state = useMRStore.getState();
      expect(state.isLoadingDetail).toBe(false);
      expect(state.error).toBe("MR을 찾을 수 없습니다");
      expect(state.selectedMR).toBeNull();
    });
  });

  // ─── loadMRDiff ────────────────────────────────────────────────

  describe("loadMRDiff", () => {
    it("should load MR diff", async () => {
      mockFetchMergeRequestDiff.mockResolvedValue(mockDiff);

      await useMRStore.getState().loadMRDiff("proj-001", "mr-001");

      expect(useMRStore.getState().mrDiff).toEqual(mockDiff);
      expect(mockFetchMergeRequestDiff).toHaveBeenCalledWith("proj-001", "mr-001");
    });
  });

  // ─── performAction ────────────────────────────────────────────

  describe("performAction", () => {
    it("should perform action and refresh MR", async () => {
      const approvedMR = { ...mockMR, status: "approved" as const };
      mockPerformMRAction.mockResolvedValue(undefined);
      mockFetchMergeRequest.mockResolvedValue(approvedMR);
      mockFetchMergeRequestDiff.mockResolvedValue(mockDiff);

      await useMRStore.getState().performAction("proj-001", "mr-001", "approve");

      expect(mockPerformMRAction).toHaveBeenCalledWith("proj-001", "mr-001", "approve");
      // Should refresh the MR after action
      expect(mockFetchMergeRequest).toHaveBeenCalledWith("proj-001", "mr-001");
      expect(useMRStore.getState().selectedMR).toEqual(approvedMR);
    });

    it("should set error on failure", async () => {
      mockPerformMRAction.mockRejectedValue(
        new Error("작업 수행 실패")
      );

      await useMRStore.getState().performAction("proj-001", "mr-001", "approve");

      expect(useMRStore.getState().error).toBe("작업 수행 실패");
    });
  });

  // ─── reset ─────────────────────────────────────────────────────

  describe("reset", () => {
    it("should reset to initial state", () => {
      useMRStore.setState({
        mergeRequests: [mockMR],
        selectedMR: mockMR,
        mrDiff: mockDiff,
        isLoading: true,
        isLoadingDetail: true,
        error: "some error",
      });

      useMRStore.getState().reset();

      const state = useMRStore.getState();
      expect(state.mergeRequests).toEqual([]);
      expect(state.selectedMR).toBeNull();
      expect(state.mrDiff).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isLoadingDetail).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
