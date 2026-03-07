import { create } from "zustand";
import {
  fetchProjects,
  createProject as apiCreateProject,
  fetchProject,
  fetchProjectMembers,
  addProjectMember,
  removeProjectMember,
  fetchProjectDocuments,
  linkDocumentToProject,
} from "@/lib/collab-api";
import type {
  Project,
  ProjectMember,
  ProjectRole,
  DocumentListItem,
} from "@/lib/collab-api";

interface ProjectState {
  // Data
  projects: Project[];
  selectedProject: Project | null;
  members: ProjectMember[];
  documents: DocumentListItem[];

  // Loading states
  isLoading: boolean;
  isLoadingDetail: boolean;
  isLoadingMembers: boolean;
  isLoadingDocuments: boolean;
  error: string | null;

  // Actions
  loadProjects: () => Promise<void>;
  createProject: (name: string) => Promise<Project | null>;
  selectProject: (projectId: string) => Promise<void>;
  loadMembers: (projectId: string) => Promise<void>;
  addMember: (
    projectId: string,
    userId: string,
    role: ProjectRole
  ) => Promise<void>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
  loadDocuments: (projectId: string) => Promise<void>;
  linkDocument: (projectId: string, documentId: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  projects: [] as Project[],
  selectedProject: null as Project | null,
  members: [] as ProjectMember[],
  documents: [] as DocumentListItem[],
  isLoading: false,
  isLoadingDetail: false,
  isLoadingMembers: false,
  isLoadingDocuments: false,
  error: null as string | null,
};

export const useProjectStore = create<ProjectState>()((set, get) => ({
  ...initialState,

  loadProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await fetchProjects();
      set({ projects, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error:
          err instanceof Error
            ? err.message
            : "프로젝트 목록을 불러오는 중 오류가 발생했습니다",
      });
    }
  },

  createProject: async (name: string) => {
    set({ error: null });
    try {
      const project = await apiCreateProject(name);
      set((state) => ({ projects: [...state.projects, project] }));
      return project;
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "프로젝트 생성 중 오류가 발생했습니다",
      });
      return null;
    }
  },

  selectProject: async (projectId: string) => {
    set({
      isLoadingDetail: true,
      error: null,
      selectedProject: null,
      members: [],
      documents: [],
    });
    try {
      const project = await fetchProject(projectId);
      set({ selectedProject: project, isLoadingDetail: false });
      // Load members and documents in parallel
      await Promise.all([
        get().loadMembers(projectId),
        get().loadDocuments(projectId),
      ]);
    } catch (err) {
      set({
        isLoadingDetail: false,
        error:
          err instanceof Error
            ? err.message
            : "프로젝트를 불러오는 중 오류가 발생했습니다",
      });
    }
  },

  loadMembers: async (projectId: string) => {
    set({ isLoadingMembers: true });
    try {
      const members = await fetchProjectMembers(projectId);
      set({ members, isLoadingMembers: false });
    } catch (err) {
      set({
        isLoadingMembers: false,
        error:
          err instanceof Error
            ? err.message
            : "멤버 목록을 불러오는 중 오류가 발생했습니다",
      });
    }
  },

  addMember: async (projectId: string, userId: string, role: ProjectRole) => {
    set({ error: null });
    try {
      await addProjectMember(projectId, userId, role);
      await get().loadMembers(projectId);
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "멤버 추가 중 오류가 발생했습니다",
      });
    }
  },

  removeMember: async (projectId: string, userId: string) => {
    set({ error: null });
    try {
      await removeProjectMember(projectId, userId);
      await get().loadMembers(projectId);
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "멤버 삭제 중 오류가 발생했습니다",
      });
    }
  },

  loadDocuments: async (projectId: string) => {
    set({ isLoadingDocuments: true });
    try {
      const documents = await fetchProjectDocuments(projectId);
      set({ documents, isLoadingDocuments: false });
    } catch (err) {
      set({
        isLoadingDocuments: false,
        error:
          err instanceof Error
            ? err.message
            : "문서 목록을 불러오는 중 오류가 발생했습니다",
      });
    }
  },

  linkDocument: async (projectId: string, documentId: string) => {
    set({ error: null });
    try {
      await linkDocumentToProject(projectId, documentId);
      await get().loadDocuments(projectId);
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "문서 연결 중 오류가 발생했습니다",
      });
    }
  },

  reset: () => {
    set(initialState);
  },
}));
