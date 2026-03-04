import { create } from "zustand";
import {
  fetchDocuments,
  fetchBranches,
  fetchCommitHistory,
  fetchPreview,
} from "@/lib/collab-api";
import type {
  DocumentListItem,
  BranchListItem,
  CommitHistoryItem,
  HtmlBlock,
} from "@/lib/collab-api";

interface CollabState {
  // Data
  documents: DocumentListItem[];
  selectedDocumentId: string | null;
  branches: BranchListItem[];
  selectedBranch: string | null;
  commits: CommitHistoryItem[];
  previewBlocks: HtmlBlock[];

  // Loading states
  isLoading: boolean;
  isLoadingBranches: boolean;
  isLoadingCommits: boolean;
  isLoadingPreview: boolean;
  error: string | null;

  // Actions
  loadDocuments: () => Promise<void>;
  selectDocument: (documentId: string) => Promise<void>;
  loadBranches: (documentId: string) => Promise<void>;
  selectBranch: (branch: string) => Promise<void>;
  loadCommits: (documentId: string, branch: string) => Promise<void>;
  loadPreview: (documentId: string, commitSha: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  documents: [],
  selectedDocumentId: null,
  branches: [],
  selectedBranch: null,
  commits: [],
  previewBlocks: [],
  isLoading: false,
  isLoadingBranches: false,
  isLoadingCommits: false,
  isLoadingPreview: false,
  error: null,
};

export const useCollabStore = create<CollabState>()((set, get) => ({
  ...initialState,

  loadDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const documents = await fetchDocuments();
      set({ documents, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error:
          err instanceof Error
            ? err.message
            : "문서 목록을 불러오는 중 오류가 발생했습니다",
      });
    }
  },

  selectDocument: async (documentId: string) => {
    set({
      selectedDocumentId: documentId,
      branches: [],
      selectedBranch: null,
      commits: [],
      previewBlocks: [],
    });
    await get().loadBranches(documentId);
  },

  loadBranches: async (documentId: string) => {
    set({ isLoadingBranches: true, error: null });
    try {
      const branches = await fetchBranches(documentId);
      const defaultBranch = branches.find((b) => b.isDefault);
      set({
        branches,
        selectedBranch: defaultBranch?.name ?? branches[0]?.name ?? null,
        isLoadingBranches: false,
      });

      // Auto-load commits for the default branch
      const branchName = defaultBranch?.name ?? branches[0]?.name;
      if (branchName) {
        await get().loadCommits(documentId, branchName);
      }
    } catch (err) {
      set({
        isLoadingBranches: false,
        error:
          err instanceof Error
            ? err.message
            : "브랜치 목록을 불러오는 중 오류가 발생했습니다",
      });
    }
  },

  selectBranch: async (branch: string) => {
    const { selectedDocumentId } = get();
    set({ selectedBranch: branch, commits: [], previewBlocks: [] });
    if (selectedDocumentId) {
      await get().loadCommits(selectedDocumentId, branch);
    }
  },

  loadCommits: async (documentId: string, branch: string) => {
    set({ isLoadingCommits: true, error: null });
    try {
      const commits = await fetchCommitHistory(documentId, branch);
      set({ commits, isLoadingCommits: false });
    } catch (err) {
      set({
        isLoadingCommits: false,
        error:
          err instanceof Error
            ? err.message
            : "커밋 히스토리를 불러오는 중 오류가 발생했습니다",
      });
    }
  },

  loadPreview: async (documentId: string, commitSha: string) => {
    set({ isLoadingPreview: true, error: null });
    try {
      const response = await fetchPreview(documentId, commitSha);
      set({ previewBlocks: response.blocks, isLoadingPreview: false });
    } catch (err) {
      set({
        isLoadingPreview: false,
        error:
          err instanceof Error
            ? err.message
            : "미리보기를 불러오는 중 오류가 발생했습니다",
      });
    }
  },

  reset: () => {
    set(initialState);
  },
}));
