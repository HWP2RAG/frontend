import { create } from "zustand";
import {
  startGovernance,
  fetchGovernanceResult,
  fetchGovernanceHistory,
} from "@/lib/collab-api";
import type { GovernanceResult } from "@/lib/collab-api";

interface GovernanceState {
  results: GovernanceResult[];
  currentResult: GovernanceResult | null;
  isLoading: boolean;
  isRunning: boolean;
  error: string | null;

  loadHistory: (projectId: string, documentId: string) => Promise<void>;
  startCheck: (
    projectId: string,
    documentId: string,
    commitSha256: string
  ) => Promise<void>;
  fetchResult: (projectId: string, resultId: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  results: [] as GovernanceResult[],
  currentResult: null as GovernanceResult | null,
  isLoading: false,
  isRunning: false,
  error: null as string | null,
};

export const useGovernanceStore = create<GovernanceState>()((set) => ({
  ...initialState,

  loadHistory: async (projectId, documentId) => {
    set({ isLoading: true, error: null });
    try {
      const results = await fetchGovernanceHistory(projectId, documentId);
      set({ results, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "검사 이력 로딩 실패",
      });
    }
  },

  startCheck: async (projectId, documentId, commitSha256) => {
    set({ isRunning: true, error: null });
    try {
      const result = await startGovernance(projectId, {
        documentId,
        commitSha256,
      });
      set({ currentResult: result, isRunning: true });
    } catch (err) {
      set({
        isRunning: false,
        error: err instanceof Error ? err.message : "검사 시작 실패",
      });
    }
  },

  fetchResult: async (projectId, resultId) => {
    set({ error: null });
    try {
      const result = await fetchGovernanceResult(projectId, resultId);
      const isRunning = result.status !== "completed" && result.status !== "failed";
      set({ currentResult: result, isRunning });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "결과 조회 실패",
      });
    }
  },

  reset: () => set(initialState),
}));
