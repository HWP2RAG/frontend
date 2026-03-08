import { create } from "zustand";
import { executeCherryPick } from "@/lib/collab-api";
import type { CherryPickResultResponse } from "@/lib/collab-api";

interface CherryPickState {
  // Selection state
  selectedBlocks: Set<string>;

  // Execution state
  isExecuting: boolean;
  error: string | null;
  result: CherryPickResultResponse | null;

  // Actions
  toggleBlock: (blockUuid: string) => void;
  selectAll: (blockUuids: string[]) => void;
  clearSelection: () => void;
  execute: (
    documentId: string,
    sourceBranch: string,
    targetBranch: string,
  ) => Promise<void>;
  reset: () => void;
}

const initialState = {
  selectedBlocks: new Set<string>(),
  isExecuting: false,
  error: null as string | null,
  result: null as CherryPickResultResponse | null,
};

export const useCherryPickStore = create<CherryPickState>()((set, get) => ({
  ...initialState,

  toggleBlock: (blockUuid: string) => {
    set((state) => {
      const next = new Set(state.selectedBlocks);
      if (next.has(blockUuid)) {
        next.delete(blockUuid);
      } else {
        next.add(blockUuid);
      }
      return { selectedBlocks: next };
    });
  },

  selectAll: (blockUuids: string[]) => {
    set({ selectedBlocks: new Set(blockUuids) });
  },

  clearSelection: () => {
    set({ selectedBlocks: new Set<string>() });
  },

  execute: async (
    documentId: string,
    sourceBranch: string,
    targetBranch: string,
  ) => {
    set({ isExecuting: true, error: null, result: null });
    try {
      const selectedBlockUuids = [...get().selectedBlocks];
      const result = await executeCherryPick(
        documentId,
        sourceBranch,
        targetBranch,
        selectedBlockUuids,
      );
      set({ isExecuting: false, result });
    } catch (err) {
      set({
        isExecuting: false,
        error:
          err instanceof Error
            ? err.message
            : "Cherry-pick 실행 중 오류가 발생했습니다",
      });
    }
  },

  reset: () => {
    set({
      selectedBlocks: new Set<string>(),
      isExecuting: false,
      error: null,
      result: null,
    });
  },
}));
