import { create } from "zustand";
import {
  fetchMergeRequests,
  createMergeRequest,
  fetchMergeRequest,
  fetchMergeRequestDiff,
  performMRAction,
} from "@/lib/collab-api";
import type { MergeRequest, DiffResult, MRAction } from "@/lib/collab-api";

interface MRState {
  // Data
  mergeRequests: MergeRequest[];
  selectedMR: MergeRequest | null;
  mrDiff: DiffResult | null;

  // Loading states
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;

  // Actions
  loadMergeRequests: (projectId: string, status?: string) => Promise<void>;
  createMR: (
    projectId: string,
    req: {
      documentId: string;
      title: string;
      sourceBranch: string;
      targetBranch?: string;
      description?: string;
    }
  ) => Promise<MergeRequest | null>;
  selectMR: (projectId: string, mrId: string) => Promise<void>;
  loadMRDiff: (projectId: string, mrId: string) => Promise<void>;
  performAction: (
    projectId: string,
    mrId: string,
    action: string
  ) => Promise<void>;
  reset: () => void;
}

const initialState = {
  mergeRequests: [] as MergeRequest[],
  selectedMR: null as MergeRequest | null,
  mrDiff: null as DiffResult | null,
  isLoading: false,
  isLoadingDetail: false,
  error: null as string | null,
};

export const useMRStore = create<MRState>()((set, get) => ({
  ...initialState,

  loadMergeRequests: async (projectId: string, status?: string) => {
    set({ isLoading: true, error: null });
    try {
      const mergeRequests = await fetchMergeRequests(projectId, status);
      set({ mergeRequests, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error:
          err instanceof Error
            ? err.message
            : "MR 목록을 불러오는 중 오류가 발생했습니다",
      });
    }
  },

  createMR: async (projectId, req) => {
    set({ error: null });
    try {
      const mr = await createMergeRequest(projectId, req);
      set((state) => ({ mergeRequests: [...state.mergeRequests, mr] }));
      return mr;
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "MR 생성 중 오류가 발생했습니다",
      });
      return null;
    }
  },

  selectMR: async (projectId: string, mrId: string) => {
    set({
      isLoadingDetail: true,
      error: null,
      selectedMR: null,
      mrDiff: null,
    });
    try {
      const [mr, diff] = await Promise.all([
        fetchMergeRequest(projectId, mrId),
        fetchMergeRequestDiff(projectId, mrId),
      ]);
      set({ selectedMR: mr, mrDiff: diff, isLoadingDetail: false });
    } catch (err) {
      set({
        isLoadingDetail: false,
        error:
          err instanceof Error
            ? err.message
            : "MR을 불러오는 중 오류가 발생했습니다",
      });
    }
  },

  loadMRDiff: async (projectId: string, mrId: string) => {
    try {
      const diff = await fetchMergeRequestDiff(projectId, mrId);
      set({ mrDiff: diff });
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "MR diff를 불러오는 중 오류가 발생했습니다",
      });
    }
  },

  performAction: async (projectId: string, mrId: string, action: string) => {
    set({ error: null });
    try {
      await performMRAction(projectId, mrId, action as MRAction);
      // Refresh the MR after action
      const [mr, diff] = await Promise.all([
        fetchMergeRequest(projectId, mrId),
        fetchMergeRequestDiff(projectId, mrId),
      ]);
      set({ selectedMR: mr, mrDiff: diff });
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "작업 수행 중 오류가 발생했습니다",
      });
    }
  },

  reset: () => {
    set(initialState);
  },
}));
