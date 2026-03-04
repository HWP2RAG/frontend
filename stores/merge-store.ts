import { create } from "zustand";
import {
  resolveConflict as apiResolveConflict,
  finalizeMerge as apiFinalizeMerge,
} from "@/lib/collab-api";
import type { MergeReport, ResolutionStrategy } from "@/lib/collab-api";

const COLLAB_API_URL =
  process.env.NEXT_PUBLIC_COLLAB_API_URL ?? "http://localhost:3001/api";

interface MergeState {
  // Data
  mergeReport: MergeReport | null;
  resolvedConflicts: Set<string>;

  // Loading states
  isLoading: boolean;
  isFinalizing: boolean;
  error: string | null;

  // Computed
  canFinalize: () => boolean;

  // Actions
  loadMergeReport: (
    documentId: string,
    mergeResultId: string
  ) => Promise<void>;
  resolveConflict: (
    documentId: string,
    mergeResultId: string,
    conflictId: string,
    resolution: ResolutionStrategy,
    manualContent?: string
  ) => Promise<void>;
  finalizeMerge: (
    documentId: string,
    mergeResultId: string
  ) => Promise<void>;
  reset: () => void;
}

const initialState = {
  mergeReport: null,
  resolvedConflicts: new Set<string>(),
  isLoading: false,
  isFinalizing: false,
  error: null,
};

export const useMergeStore = create<MergeState>()((set, get) => ({
  ...initialState,

  canFinalize: () => {
    const { mergeReport, resolvedConflicts } = get();
    if (!mergeReport) return false;
    if (mergeReport.conflicts.length === 0) return true;
    return mergeReport.conflicts.every((c) => resolvedConflicts.has(c.id));
  },

  loadMergeReport: async (documentId: string, mergeResultId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(
        `${COLLAB_API_URL}/v1/collab/documents/${documentId}/merges/${mergeResultId}`
      );
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
          `Failed to load merge report: ${res.status} ${body || res.statusText}`
        );
      }
      const mergeReport = (await res.json()) as MergeReport;

      // Pre-populate resolved set if report shows already-resolved conflicts
      const resolvedConflicts = new Set<string>();

      set({ mergeReport, resolvedConflicts, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error:
          err instanceof Error
            ? err.message
            : "병합 보고서를 불러오는 중 오류가 발생했습니다",
      });
    }
  },

  resolveConflict: async (
    documentId: string,
    mergeResultId: string,
    conflictId: string,
    resolution: ResolutionStrategy,
    manualContent?: string
  ) => {
    // Optimistic update
    set((state) => ({
      resolvedConflicts: new Set(state.resolvedConflicts).add(conflictId),
    }));

    try {
      await apiResolveConflict(
        documentId,
        mergeResultId,
        conflictId,
        resolution,
        manualContent
      );
    } catch (err) {
      // Rollback optimistic update
      set((state) => {
        const next = new Set(state.resolvedConflicts);
        next.delete(conflictId);
        return {
          resolvedConflicts: next,
          error:
            err instanceof Error
              ? err.message
              : "충돌 해결 중 오류가 발생했습니다",
        };
      });
    }
  },

  finalizeMerge: async (documentId: string, mergeResultId: string) => {
    set({ isFinalizing: true, error: null });
    try {
      const result = (await apiFinalizeMerge(documentId, mergeResultId)) as {
        resultCommitSha256?: string;
      };
      set((state) => ({
        isFinalizing: false,
        mergeReport: state.mergeReport
          ? {
              ...state.mergeReport,
              status: "completed" as const,
              resultCommitSha256: result.resultCommitSha256 ?? null,
            }
          : null,
      }));
    } catch (err) {
      set({
        isFinalizing: false,
        error:
          err instanceof Error
            ? err.message
            : "병합 완료 중 오류가 발생했습니다",
      });
    }
  },

  reset: () => {
    set(initialState);
  },
}));
