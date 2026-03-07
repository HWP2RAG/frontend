import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { mockCollabDocuments } from "@/mocks/collab-fixtures";

// ─── Mock next/navigation ───────────────────────────────────────────
vi.mock("next/navigation", () => ({
  useParams: () => ({ documentId: "doc-001" }),
}));

// ─── Mock DOMPurify ─────────────────────────────────────────────────
vi.mock("dompurify", () => ({
  default: {
    sanitize: (html: string) => html,
  },
}));

// ─── Mock collab-api ────────────────────────────────────────────────
vi.mock("@/lib/collab-api", () => ({
  fetchBranchDiff: vi.fn().mockResolvedValue({ diffs: [] }),
  createBranch: vi.fn(),
  createCommit: vi.fn(),
}));

// ─── Mock child components ──────────────────────────────────────────
vi.mock("@/components/collab/branch-selector", () => ({
  BranchSelector: () => <div data-testid="branch-selector" />,
}));
vi.mock("@/components/collab/export-button", () => ({
  ExportButton: () => <div data-testid="export-button" />,
}));
vi.mock("@/components/collab/block-navigator", () => ({
  BlockNavigator: () => <div data-testid="block-navigator" />,
}));
vi.mock("@/components/collab/create-branch-dialog", () => ({
  CreateBranchDialog: () => <div data-testid="create-branch-dialog" />,
}));
vi.mock("@/components/collab/block-editor-dialog", () => ({
  BlockEditorDialog: () => <div data-testid="block-editor-dialog" />,
}));

// ─── Mock collab store ──────────────────────────────────────────────
import type { DocumentListItem } from "@/lib/collab-api";

const mockStoreState = {
  documents: [] as DocumentListItem[],
  branches: [],
  selectedBranch: null as string | null,
  commits: [],
  previewBlocks: [],
  isLoadingBranches: false,
  isLoadingCommits: false,
  isLoadingPreview: false,
  error: null as string | null,
  loadBranches: vi.fn(),
  loadDocuments: vi.fn(),
  selectBranch: vi.fn(),
  loadPreview: vi.fn(),
};

vi.mock("@/stores/collab-store", () => ({
  useCollabStore: (selector: (s: typeof mockStoreState) => unknown) =>
    selector(mockStoreState),
}));

// ─── Import component after mocks ───────────────────────────────────
import DocumentFullViewPage from "@/app/collab/documents/[documentId]/page";

describe("Document Name in Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState.documents = [];
    mockStoreState.branches = [];
    mockStoreState.selectedBranch = null;
    mockStoreState.commits = [];
    mockStoreState.previewBlocks = [];
    mockStoreState.isLoadingBranches = false;
    mockStoreState.isLoadingCommits = false;
    mockStoreState.isLoadingPreview = false;
    mockStoreState.error = null;
  });

  it("shows actual document name when documents are loaded in the store", async () => {
    mockStoreState.documents = mockCollabDocuments;
    render(<DocumentFullViewPage />);

    await waitFor(() => {
      expect(screen.getByText("용역계약서_v3")).toBeInTheDocument();
    });
  });

  it('falls back to "문서 뷰" when document is not found in store', () => {
    mockStoreState.documents = [];
    render(<DocumentFullViewPage />);

    expect(screen.getByText("문서 뷰")).toBeInTheDocument();
  });
});
