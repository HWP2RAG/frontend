import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MergeReport } from "@/lib/collab-api";
import { mockMergeReportWithConflicts } from "@/mocks/collab-fixtures";

// Mock the collab-api module
vi.mock("@/lib/collab-api", () => ({
  resolveConflict: vi.fn(),
  finalizeMerge: vi.fn(),
}));

// Import mocked functions after vi.mock
import {
  resolveConflict as apiResolveConflict,
  finalizeMerge as apiFinalizeMerge,
} from "@/lib/collab-api";
import { useMergeStore } from "../merge-store";

const mockApiResolveConflict = vi.mocked(apiResolveConflict);
const mockApiFinalizeMerge = vi.mocked(apiFinalizeMerge);

// ─── Tests ──────────────────────────────────────────────────────────

describe("useMergeStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMergeStore.getState().reset();
  });

  // ─── loadMergeReport ──────────────────────────────────────────

  describe("loadMergeReport", () => {
    it("should set isLoading=true during fetch", async () => {
      const mockReport: MergeReport = {
        ...mockMergeReportWithConflicts,
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockReport), { status: 200 })
      );

      const promise = useMergeStore
        .getState()
        .loadMergeReport("doc-001", "merge-002");

      expect(useMergeStore.getState().isLoading).toBe(true);
      expect(useMergeStore.getState().error).toBeNull();

      await promise;

      expect(useMergeStore.getState().isLoading).toBe(false);
      vi.restoreAllMocks();
    });

    it("should store mergeReport on success", async () => {
      const mockReport: MergeReport = {
        ...mockMergeReportWithConflicts,
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockReport), { status: 200 })
      );

      await useMergeStore.getState().loadMergeReport("doc-001", "merge-002");

      const state = useMergeStore.getState();
      expect(state.mergeReport).toEqual(mockReport);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      vi.restoreAllMocks();
    });

    it("should fetch from correct URL with documentId and mergeResultId", async () => {
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockMergeReportWithConflicts), {
          status: 200,
        })
      );

      await useMergeStore.getState().loadMergeReport("doc-001", "merge-002");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const calledUrl = fetchSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain("/v1/collab/documents/doc-001/merges/merge-002");
      vi.restoreAllMocks();
    });

    it("should set error on failure", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        new Response("Not Found", { status: 404, statusText: "Not Found" })
      );

      await useMergeStore.getState().loadMergeReport("doc-001", "invalid-id");

      const state = useMergeStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeTruthy();
      expect(state.mergeReport).toBeNull();
      vi.restoreAllMocks();
    });
  });

  // ─── resolveConflict ──────────────────────────────────────────

  describe("resolveConflict", () => {
    it("should optimistically add conflictId to resolvedConflicts", async () => {
      useMergeStore.setState({
        mergeReport: { ...mockMergeReportWithConflicts },
        resolvedConflicts: new Set(),
      });

      mockApiResolveConflict.mockResolvedValue({ ok: true });

      await useMergeStore
        .getState()
        .resolveConflict(
          "doc-001",
          "merge-002",
          "conflict-001",
          "accept_local"
        );

      expect(
        useMergeStore.getState().resolvedConflicts.has("conflict-001")
      ).toBe(true);
    });

    it("should call apiResolveConflict with correct params", async () => {
      useMergeStore.setState({
        mergeReport: { ...mockMergeReportWithConflicts },
        resolvedConflicts: new Set(),
      });

      mockApiResolveConflict.mockResolvedValue({ ok: true });

      await useMergeStore
        .getState()
        .resolveConflict(
          "doc-001",
          "merge-002",
          "conflict-001",
          "manual_edit",
          "custom content"
        );

      expect(mockApiResolveConflict).toHaveBeenCalledWith(
        "doc-001",
        "merge-002",
        "conflict-001",
        "manual_edit",
        "custom content"
      );
    });

    it("should rollback on API error", async () => {
      useMergeStore.setState({
        mergeReport: { ...mockMergeReportWithConflicts },
        resolvedConflicts: new Set(),
      });

      mockApiResolveConflict.mockRejectedValue(new Error("서버 오류"));

      await useMergeStore
        .getState()
        .resolveConflict(
          "doc-001",
          "merge-002",
          "conflict-001",
          "accept_local"
        );

      const state = useMergeStore.getState();
      expect(state.resolvedConflicts.has("conflict-001")).toBe(false);
      expect(state.error).toBe("서버 오류");
    });
  });

  // ─── canFinalize ──────────────────────────────────────────────

  describe("canFinalize", () => {
    it("should return false when mergeReport is null", () => {
      expect(useMergeStore.getState().canFinalize()).toBe(false);
    });

    it("should return true when no conflicts exist", () => {
      useMergeStore.setState({
        mergeReport: {
          mergeResultId: "merge-001",
          status: "completed",
          sourceBranch: "feature/x",
          targetBranch: "main",
          baseCommitSha256: null,
          resultCommitSha256: "sha-final",
          autoMergedCount: 5,
          conflictCount: 0,
          conflicts: [],
        },
        resolvedConflicts: new Set(),
      });

      expect(useMergeStore.getState().canFinalize()).toBe(true);
    });

    it("should return false when conflicts exist but not all resolved", () => {
      useMergeStore.setState({
        mergeReport: { ...mockMergeReportWithConflicts },
        resolvedConflicts: new Set(["conflict-001"]),
      });

      expect(useMergeStore.getState().canFinalize()).toBe(false);
    });

    it("should return true when all conflicts are resolved", () => {
      useMergeStore.setState({
        mergeReport: { ...mockMergeReportWithConflicts },
        resolvedConflicts: new Set(["conflict-001", "conflict-002"]),
      });

      expect(useMergeStore.getState().canFinalize()).toBe(true);
    });
  });

  // ─── finalizeMerge ───────────────────────────────────────────

  describe("finalizeMerge", () => {
    it("should set isFinalizing=true during request", async () => {
      useMergeStore.setState({
        mergeReport: { ...mockMergeReportWithConflicts },
      });

      let resolvePromise!: (value: unknown) => void;
      mockApiFinalizeMerge.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );

      const promise = useMergeStore
        .getState()
        .finalizeMerge("doc-001", "merge-002");

      expect(useMergeStore.getState().isFinalizing).toBe(true);

      resolvePromise({ resultCommitSha256: "final-sha" });
      await promise;

      expect(useMergeStore.getState().isFinalizing).toBe(false);
    });

    it("should set status to completed on success", async () => {
      useMergeStore.setState({
        mergeReport: { ...mockMergeReportWithConflicts },
      });

      mockApiFinalizeMerge.mockResolvedValue({
        resultCommitSha256: "final-sha",
      });

      await useMergeStore
        .getState()
        .finalizeMerge("doc-001", "merge-002");

      const state = useMergeStore.getState();
      expect(state.mergeReport?.status).toBe("completed");
      expect(state.mergeReport?.resultCommitSha256).toBe("final-sha");
      expect(state.isFinalizing).toBe(false);
    });

    it("should set error on failure", async () => {
      useMergeStore.setState({
        mergeReport: { ...mockMergeReportWithConflicts },
      });

      mockApiFinalizeMerge.mockRejectedValue(new Error("병합 확정 실패"));

      await useMergeStore
        .getState()
        .finalizeMerge("doc-001", "merge-002");

      const state = useMergeStore.getState();
      expect(state.isFinalizing).toBe(false);
      expect(state.error).toBe("병합 확정 실패");
    });
  });

  // ─── reset ────────────────────────────────────────────────────

  describe("reset", () => {
    it("should clear all state back to initial values", () => {
      useMergeStore.setState({
        mergeReport: { ...mockMergeReportWithConflicts },
        resolvedConflicts: new Set(["conflict-001"]),
        isLoading: true,
        isFinalizing: true,
        error: "some error",
      });

      useMergeStore.getState().reset();

      const state = useMergeStore.getState();
      expect(state.mergeReport).toBeNull();
      expect(state.resolvedConflicts.size).toBe(0);
      expect(state.isLoading).toBe(false);
      expect(state.isFinalizing).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
