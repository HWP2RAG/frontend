import { create } from "zustand";
import { fetchDiff } from "@/lib/collab-api";
import type { DiffResult, BlockDiff } from "@/lib/collab-api";

type ViewMode = "side-by-side" | "unified";

interface DiffState {
  // Data
  diffResult: DiffResult | null;
  selectedBlockDiff: BlockDiff | null;
  viewMode: ViewMode;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  loadDiff: (
    documentId: string,
    base: string,
    target: string
  ) => Promise<void>;
  selectBlock: (blockDiff: BlockDiff | null) => void;
  toggleViewMode: () => void;
  clearDiff: () => void;
}

const initialState = {
  diffResult: null,
  selectedBlockDiff: null,
  viewMode: "side-by-side" as ViewMode,
  isLoading: false,
  error: null,
};

export const useDiffStore = create<DiffState>()((set) => ({
  ...initialState,

  loadDiff: async (documentId: string, base: string, target: string) => {
    set({ isLoading: true, error: null, diffResult: null, selectedBlockDiff: null });
    try {
      const diffResult = await fetchDiff(documentId, base, target);
      set({ diffResult, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error:
          err instanceof Error
            ? err.message
            : "Diff를 불러오는 중 오류가 발생했습니다",
      });
    }
  },

  selectBlock: (blockDiff: BlockDiff | null) => {
    set({ selectedBlockDiff: blockDiff });
  },

  toggleViewMode: () => {
    set((state) => ({
      viewMode: state.viewMode === "side-by-side" ? "unified" : "side-by-side",
    }));
  },

  clearDiff: () => {
    set(initialState);
  },
}));
