import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  Project,
  ProjectMember,
  DocumentListItem,
} from "@/lib/collab-api";

// Mock the collab-api module
vi.mock("@/lib/collab-api", () => ({
  fetchProjects: vi.fn(),
  createProject: vi.fn(),
  fetchProject: vi.fn(),
  fetchProjectMembers: vi.fn(),
  addProjectMember: vi.fn(),
  removeProjectMember: vi.fn(),
  fetchProjectDocuments: vi.fn(),
  linkDocumentToProject: vi.fn(),
}));

// Import mocked functions after vi.mock
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
import { useProjectStore } from "../project-store";

// Cast mocked functions for type-safe expectations
const mockFetchProjects = vi.mocked(fetchProjects);
const mockCreateProject = vi.mocked(apiCreateProject);
const mockFetchProject = vi.mocked(fetchProject);
const mockFetchProjectMembers = vi.mocked(fetchProjectMembers);
const mockAddProjectMember = vi.mocked(addProjectMember);
const mockRemoveProjectMember = vi.mocked(removeProjectMember);
const mockFetchProjectDocuments = vi.mocked(fetchProjectDocuments);
const mockLinkDocumentToProject = vi.mocked(linkDocumentToProject);

// ─── Test Fixtures ──────────────────────────────────────────────────

const mockProject: Project = {
  id: "proj-001",
  name: "테스트 프로젝트",
  ownerId: "user-001",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockProject2: Project = {
  id: "proj-002",
  name: "두번째 프로젝트",
  ownerId: "user-001",
  createdAt: "2026-02-01T00:00:00Z",
  updatedAt: "2026-02-01T00:00:00Z",
};

const mockMembers: ProjectMember[] = [
  {
    id: "member-001",
    projectId: "proj-001",
    userId: "user-001",
    role: "owner",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "member-002",
    projectId: "proj-001",
    userId: "user-002",
    role: "editor",
    createdAt: "2026-01-02T00:00:00Z",
  },
];

const mockDocuments: DocumentListItem[] = [
  {
    id: "doc-001",
    name: "테스트 문서.hwp",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

// ─── Tests ──────────────────────────────────────────────────────────

describe("useProjectStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProjectStore.getState().reset();
  });

  it("has correct initial state", () => {
    const state = useProjectStore.getState();
    expect(state.projects).toEqual([]);
    expect(state.selectedProject).toBeNull();
    expect(state.members).toEqual([]);
    expect(state.documents).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.isLoadingDetail).toBe(false);
    expect(state.isLoadingMembers).toBe(false);
    expect(state.isLoadingDocuments).toBe(false);
    expect(state.error).toBeNull();
  });

  // ─── loadProjects ───────────────────────────────────────────────

  describe("loadProjects", () => {
    it("should load projects and set isLoading states", async () => {
      mockFetchProjects.mockResolvedValue([mockProject, mockProject2]);

      const promise = useProjectStore.getState().loadProjects();

      // isLoading should be true while fetching
      expect(useProjectStore.getState().isLoading).toBe(true);
      expect(useProjectStore.getState().error).toBeNull();

      await promise;

      const state = useProjectStore.getState();
      expect(state.projects).toEqual([mockProject, mockProject2]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockFetchProjects).toHaveBeenCalledOnce();
    });

    it("should set error on failure", async () => {
      mockFetchProjects.mockRejectedValue(
        new Error("네트워크 오류")
      );

      await useProjectStore.getState().loadProjects();

      const state = useProjectStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("네트워크 오류");
      expect(state.projects).toEqual([]);
    });
  });

  // ─── createProject ──────────────────────────────────────────────

  describe("createProject", () => {
    it("should create a project and add it to the list", async () => {
      mockCreateProject.mockResolvedValue(mockProject);

      const result = await useProjectStore
        .getState()
        .createProject("테스트 프로젝트");

      expect(result).toEqual(mockProject);
      expect(useProjectStore.getState().projects).toEqual([mockProject]);
      expect(useProjectStore.getState().error).toBeNull();
      expect(mockCreateProject).toHaveBeenCalledWith("테스트 프로젝트");
    });

    it("should append to existing projects list", async () => {
      // Pre-populate projects
      useProjectStore.setState({ projects: [mockProject] });
      mockCreateProject.mockResolvedValue(mockProject2);

      await useProjectStore.getState().createProject("두번째 프로젝트");

      expect(useProjectStore.getState().projects).toEqual([
        mockProject,
        mockProject2,
      ]);
    });

    it("should set error on failure and return null", async () => {
      mockCreateProject.mockRejectedValue(
        new Error("프로젝트 생성 실패")
      );

      const result = await useProjectStore
        .getState()
        .createProject("실패할 프로젝트");

      expect(result).toBeNull();
      expect(useProjectStore.getState().error).toBe("프로젝트 생성 실패");
      expect(useProjectStore.getState().projects).toEqual([]);
    });
  });

  // ─── selectProject ──────────────────────────────────────────────

  describe("selectProject", () => {
    it("should load project detail, members, and documents", async () => {
      mockFetchProject.mockResolvedValue(mockProject);
      mockFetchProjectMembers.mockResolvedValue(mockMembers);
      mockFetchProjectDocuments.mockResolvedValue(mockDocuments);

      await useProjectStore.getState().selectProject("proj-001");

      const state = useProjectStore.getState();
      expect(state.selectedProject).toEqual(mockProject);
      expect(state.members).toEqual(mockMembers);
      expect(state.documents).toEqual(mockDocuments);
      expect(state.isLoadingDetail).toBe(false);
      expect(state.error).toBeNull();

      expect(mockFetchProject).toHaveBeenCalledWith("proj-001");
      expect(mockFetchProjectMembers).toHaveBeenCalledWith("proj-001");
      expect(mockFetchProjectDocuments).toHaveBeenCalledWith("proj-001");
    });

    it("should clear previous selection before loading", async () => {
      // Pre-populate with old data
      useProjectStore.setState({
        selectedProject: mockProject2,
        members: mockMembers,
        documents: mockDocuments,
      });

      mockFetchProject.mockResolvedValue(mockProject);
      mockFetchProjectMembers.mockResolvedValue([]);
      mockFetchProjectDocuments.mockResolvedValue([]);

      await useProjectStore.getState().selectProject("proj-001");

      const state = useProjectStore.getState();
      expect(state.selectedProject).toEqual(mockProject);
      expect(state.members).toEqual([]);
      expect(state.documents).toEqual([]);
    });

    it("should set error when fetchProject fails", async () => {
      mockFetchProject.mockRejectedValue(
        new Error("프로젝트를 찾을 수 없습니다")
      );

      await useProjectStore.getState().selectProject("invalid-id");

      const state = useProjectStore.getState();
      expect(state.isLoadingDetail).toBe(false);
      expect(state.error).toBe("프로젝트를 찾을 수 없습니다");
      expect(state.selectedProject).toBeNull();
    });
  });

  // ─── loadMembers ────────────────────────────────────────────────

  describe("loadMembers", () => {
    it("should load project members", async () => {
      mockFetchProjectMembers.mockResolvedValue(mockMembers);

      const promise = useProjectStore.getState().loadMembers("proj-001");
      expect(useProjectStore.getState().isLoadingMembers).toBe(true);

      await promise;

      const state = useProjectStore.getState();
      expect(state.members).toEqual(mockMembers);
      expect(state.isLoadingMembers).toBe(false);
      expect(mockFetchProjectMembers).toHaveBeenCalledWith("proj-001");
    });

    it("should set error on failure", async () => {
      mockFetchProjectMembers.mockRejectedValue(
        new Error("멤버 조회 실패")
      );

      await useProjectStore.getState().loadMembers("proj-001");

      const state = useProjectStore.getState();
      expect(state.isLoadingMembers).toBe(false);
      expect(state.error).toBe("멤버 조회 실패");
    });
  });

  // ─── addMember ──────────────────────────────────────────────────

  describe("addMember", () => {
    it("should add a member and refresh member list", async () => {
      const newMember: ProjectMember = {
        id: "member-003",
        projectId: "proj-001",
        userId: "user-003",
        role: "viewer",
        createdAt: "2026-03-01T00:00:00Z",
      };
      mockAddProjectMember.mockResolvedValue(newMember);
      mockFetchProjectMembers.mockResolvedValue([...mockMembers, newMember]);

      await useProjectStore
        .getState()
        .addMember("proj-001", "user-003", "viewer");

      expect(mockAddProjectMember).toHaveBeenCalledWith(
        "proj-001",
        "user-003",
        "viewer"
      );
      // Should refresh members after adding
      expect(mockFetchProjectMembers).toHaveBeenCalledWith("proj-001");
      expect(useProjectStore.getState().members).toHaveLength(3);
    });

    it("should set error on failure", async () => {
      mockAddProjectMember.mockRejectedValue(
        new Error("멤버 추가 실패")
      );

      await useProjectStore
        .getState()
        .addMember("proj-001", "user-003", "editor");

      expect(useProjectStore.getState().error).toBe("멤버 추가 실패");
    });
  });

  // ─── removeMember ───────────────────────────────────────────────

  describe("removeMember", () => {
    it("should remove a member and refresh member list", async () => {
      mockRemoveProjectMember.mockResolvedValue(undefined);
      mockFetchProjectMembers.mockResolvedValue([mockMembers[0]]);

      await useProjectStore
        .getState()
        .removeMember("proj-001", "user-002");

      expect(mockRemoveProjectMember).toHaveBeenCalledWith(
        "proj-001",
        "user-002"
      );
      // Should refresh members after removing
      expect(mockFetchProjectMembers).toHaveBeenCalledWith("proj-001");
      expect(useProjectStore.getState().members).toHaveLength(1);
    });

    it("should set error on failure", async () => {
      mockRemoveProjectMember.mockRejectedValue(
        new Error("멤버 삭제 실패")
      );

      await useProjectStore
        .getState()
        .removeMember("proj-001", "user-002");

      expect(useProjectStore.getState().error).toBe("멤버 삭제 실패");
    });
  });

  // ─── loadDocuments ──────────────────────────────────────────────

  describe("loadDocuments", () => {
    it("should load project documents", async () => {
      mockFetchProjectDocuments.mockResolvedValue(mockDocuments);

      const promise = useProjectStore.getState().loadDocuments("proj-001");
      expect(useProjectStore.getState().isLoadingDocuments).toBe(true);

      await promise;

      const state = useProjectStore.getState();
      expect(state.documents).toEqual(mockDocuments);
      expect(state.isLoadingDocuments).toBe(false);
      expect(mockFetchProjectDocuments).toHaveBeenCalledWith("proj-001");
    });

    it("should set error on failure", async () => {
      mockFetchProjectDocuments.mockRejectedValue(
        new Error("문서 조회 실패")
      );

      await useProjectStore.getState().loadDocuments("proj-001");

      const state = useProjectStore.getState();
      expect(state.isLoadingDocuments).toBe(false);
      expect(state.error).toBe("문서 조회 실패");
    });
  });

  // ─── linkDocument ───────────────────────────────────────────────

  describe("linkDocument", () => {
    it("should link a document and refresh document list", async () => {
      mockLinkDocumentToProject.mockResolvedValue(undefined);
      const updatedDocs: DocumentListItem[] = [
        ...mockDocuments,
        {
          id: "doc-002",
          name: "새 문서.hwp",
          createdAt: "2026-03-01T00:00:00Z",
          updatedAt: "2026-03-01T00:00:00Z",
        },
      ];
      mockFetchProjectDocuments.mockResolvedValue(updatedDocs);

      await useProjectStore
        .getState()
        .linkDocument("proj-001", "doc-002");

      expect(mockLinkDocumentToProject).toHaveBeenCalledWith(
        "proj-001",
        "doc-002"
      );
      // Should refresh documents after linking
      expect(mockFetchProjectDocuments).toHaveBeenCalledWith("proj-001");
      expect(useProjectStore.getState().documents).toHaveLength(2);
    });

    it("should set error on failure", async () => {
      mockLinkDocumentToProject.mockRejectedValue(
        new Error("문서 연결 실패")
      );

      await useProjectStore
        .getState()
        .linkDocument("proj-001", "doc-002");

      expect(useProjectStore.getState().error).toBe("문서 연결 실패");
    });
  });

  // ─── reset ──────────────────────────────────────────────────────

  describe("reset", () => {
    it("should reset to initial state", () => {
      // Set some state
      useProjectStore.setState({
        projects: [mockProject],
        selectedProject: mockProject,
        members: mockMembers,
        documents: mockDocuments,
        isLoading: true,
        isLoadingDetail: true,
        isLoadingMembers: true,
        isLoadingDocuments: true,
        error: "some error",
      });

      useProjectStore.getState().reset();

      const state = useProjectStore.getState();
      expect(state.projects).toEqual([]);
      expect(state.selectedProject).toBeNull();
      expect(state.members).toEqual([]);
      expect(state.documents).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.isLoadingDetail).toBe(false);
      expect(state.isLoadingMembers).toBe(false);
      expect(state.isLoadingDocuments).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
