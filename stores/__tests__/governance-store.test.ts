import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGovernanceStore } from "../governance-store";

vi.mock("@/lib/collab-api", () => ({
  startGovernance: vi.fn(),
  fetchGovernanceResult: vi.fn(),
  fetchGovernanceHistory: vi.fn(),
}));

import {
  startGovernance,
  fetchGovernanceResult,
  fetchGovernanceHistory,
} from "@/lib/collab-api";

const mockedStartGovernance = vi.mocked(startGovernance);
const mockedFetchResult = vi.mocked(fetchGovernanceResult);
const mockedFetchHistory = vi.mocked(fetchGovernanceHistory);

const mockResult = {
  id: "gov-001",
  documentId: "doc-001",
  commitSha256: "abc123",
  status: "completed" as const,
  results: [
    {
      checker: "spelling",
      severity: "error",
      blockUuid: "block-005",
      message: "'됬다' -> '됐다'",
      suggestion: "됐다",
    },
    {
      checker: "speech_level",
      severity: "warning",
      blockUuid: "block-003",
      message: "경어체와 평어체가 혼용되어 있습니다",
      suggestion: "'합니다'체로 통일하세요",
    },
  ],
  jobId: "job-001",
  createdAt: "2026-03-06T01:30:00Z",
  completedAt: "2026-03-06T01:35:00Z",
};

describe("GovernanceStore", () => {
  beforeEach(() => {
    useGovernanceStore.getState().reset();
    vi.clearAllMocks();
  });

  it("has correct initial state", () => {
    const state = useGovernanceStore.getState();
    expect(state.results).toEqual([]);
    expect(state.currentResult).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isRunning).toBe(false);
    expect(state.error).toBeNull();
  });

  it("loads governance history", async () => {
    mockedFetchHistory.mockResolvedValueOnce([mockResult]);
    await useGovernanceStore.getState().loadHistory("proj-001", "doc-001");

    const state = useGovernanceStore.getState();
    expect(state.results).toHaveLength(1);
    expect(state.results[0].id).toBe("gov-001");
    expect(state.isLoading).toBe(false);
  });

  it("sets loading state during loadHistory", async () => {
    mockedFetchHistory.mockResolvedValueOnce([]);
    const promise = useGovernanceStore.getState().loadHistory("proj-001", "doc-001");
    expect(useGovernanceStore.getState().isLoading).toBe(true);
    await promise;
    expect(useGovernanceStore.getState().isLoading).toBe(false);
  });

  it("handles loadHistory error", async () => {
    mockedFetchHistory.mockRejectedValueOnce(new Error("Network error"));
    await useGovernanceStore.getState().loadHistory("proj-001", "doc-001");

    const state = useGovernanceStore.getState();
    expect(state.error).toBe("Network error");
    expect(state.isLoading).toBe(false);
  });

  it("starts governance check", async () => {
    mockedStartGovernance.mockResolvedValueOnce({ ...mockResult, status: "pending" });
    await useGovernanceStore.getState().startCheck("proj-001", "doc-001", "abc123");

    const state = useGovernanceStore.getState();
    expect(state.currentResult).not.toBeNull();
    expect(state.currentResult?.status).toBe("pending");
    expect(state.isRunning).toBe(true);
    expect(mockedStartGovernance).toHaveBeenCalledWith("proj-001", {
      documentId: "doc-001",
      commitSha256: "abc123",
    });
  });

  it("handles startCheck error", async () => {
    mockedStartGovernance.mockRejectedValueOnce(new Error("Forbidden"));
    await useGovernanceStore.getState().startCheck("proj-001", "doc-001", "abc123");

    const state = useGovernanceStore.getState();
    expect(state.error).toBe("Forbidden");
    expect(state.isRunning).toBe(false);
  });

  it("fetches single result by id", async () => {
    mockedFetchResult.mockResolvedValueOnce(mockResult);
    await useGovernanceStore.getState().fetchResult("proj-001", "gov-001");

    const state = useGovernanceStore.getState();
    expect(state.currentResult).not.toBeNull();
    expect(state.currentResult?.id).toBe("gov-001");
    expect(state.currentResult?.status).toBe("completed");
    expect(state.isRunning).toBe(false);
  });

  it("sets isRunning=true if fetched result is not completed", async () => {
    mockedFetchResult.mockResolvedValueOnce({ ...mockResult, status: "running" });
    await useGovernanceStore.getState().fetchResult("proj-001", "gov-001");

    expect(useGovernanceStore.getState().isRunning).toBe(true);
  });

  it("handles fetchResult error", async () => {
    mockedFetchResult.mockRejectedValueOnce(new Error("Not found"));
    await useGovernanceStore.getState().fetchResult("proj-001", "gov-001");

    const state = useGovernanceStore.getState();
    expect(state.error).toBe("Not found");
  });

  it("resets state", () => {
    useGovernanceStore.setState({
      results: [mockResult],
      currentResult: mockResult,
      isLoading: true,
      isRunning: true,
      error: "some error",
    });

    useGovernanceStore.getState().reset();
    const state = useGovernanceStore.getState();
    expect(state.results).toEqual([]);
    expect(state.currentResult).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isRunning).toBe(false);
    expect(state.error).toBeNull();
  });
});
