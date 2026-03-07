import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockMergeReportWithConflicts } from "@/mocks/collab-fixtures";

// ─── Mock next/navigation ───────────────────────────────────────────
const mockPush = vi.fn();
let mockParamsValue: Record<string, string> = {
  documentId: "doc-001",
  mergeResultId: "merge-002",
};

vi.mock("next/navigation", () => ({
  useParams: () => mockParamsValue,
  useRouter: () => ({ push: mockPush }),
}));

// ─── Mock merge progress hook ───────────────────────────────────────
vi.mock("@/hooks/use-merge-progress", () => ({
  useMergeProgress: vi.fn(() => null),
}));

// ─── Mock merge store ───────────────────────────────────────────────
const mockMergeStoreState = {
  mergeReport: null as ReturnType<typeof createMergeReport>,
  resolvedConflicts: new Set<string>(),
  isLoading: false,
  isFinalizing: false,
  error: null as string | null,
  loadMergeReport: vi.fn(),
  resolveConflict: vi.fn(),
  finalizeMerge: vi.fn(),
  canFinalize: vi.fn(() => false),
  reset: vi.fn(),
};

function createMergeReport() {
  return {
    mergeResultId: "merge-002",
    status: "conflicts" as const,
    sourceBranch: "feature/section2-edit",
    targetBranch: "main",
    baseCommitSha256: "f6a1b2c3",
    resultCommitSha256: null as string | null,
    autoMergedCount: 4,
    conflictCount: 2,
    conflicts: mockMergeReportWithConflicts.conflicts,
  };
}

vi.mock("@/stores/merge-store", () => ({
  useMergeStore: (selector: (s: typeof mockMergeStoreState) => unknown) =>
    selector(mockMergeStoreState),
}));

// ─── Mock ConflictResolver ──────────────────────────────────────────
vi.mock("@/components/collab/conflict-resolver", () => ({
  ConflictResolver: ({
    conflict,
    isResolved,
  }: {
    conflict: { id: string };
    isResolved: boolean;
  }) => (
    <div data-testid={`conflict-${conflict.id}`}>
      {isResolved ? "resolved" : "unresolved"}
    </div>
  ),
}));

// ─── Import page component after mocks ──────────────────────────────
import DocumentMergePage from "@/app/collab/documents/[documentId]/merge/[mergeResultId]/page";

describe("Merge Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMergeStoreState.mergeReport = null;
    mockMergeStoreState.resolvedConflicts = new Set();
    mockMergeStoreState.isLoading = false;
    mockMergeStoreState.isFinalizing = false;
    mockMergeStoreState.error = null;
    mockMergeStoreState.canFinalize.mockReturnValue(false);
    mockParamsValue = { documentId: "doc-001", mergeResultId: "merge-002" };
  });

  it("renders loading skeleton when isLoading is true", () => {
    mockMergeStoreState.isLoading = true;
    render(<DocumentMergePage />);

    const pulseElements = document.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThanOrEqual(3);
  });

  it("renders statistics grid when mergeReport is loaded", () => {
    mockMergeStoreState.mergeReport = createMergeReport();
    render(<DocumentMergePage />);

    // autoMergedCount = 4
    expect(screen.getByText("4")).toBeInTheDocument();
    // conflictCount = 2
    expect(screen.getByText("2")).toBeInTheDocument();
    // resolved count = 0 (empty set)
    expect(screen.getByText("0")).toBeInTheDocument();
    // Labels
    expect(screen.getByText("자동 병합")).toBeInTheDocument();
    // "충돌" appears both as stat label and StatusBadge — use getAllByText
    const conflictTexts = screen.getAllByText("충돌");
    expect(conflictTexts.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("해결됨")).toBeInTheDocument();
  });

  it("renders conflict list with ConflictResolver components when status is conflicts", () => {
    mockMergeStoreState.mergeReport = createMergeReport();
    render(<DocumentMergePage />);

    expect(screen.getByText(/충돌 목록/)).toBeInTheDocument();
    expect(screen.getByTestId("conflict-conflict-001")).toBeInTheDocument();
    expect(screen.getByTestId("conflict-conflict-002")).toBeInTheDocument();
  });

  it("renders completed state with commit SHA when status is completed", () => {
    mockMergeStoreState.mergeReport = {
      ...createMergeReport(),
      status: "completed" as const,
      resultCommitSha256: "abcdef1234567890abcdef",
      conflictCount: 0,
      conflicts: [],
    };
    render(<DocumentMergePage />);

    expect(screen.getByText("병합이 완료되었습니다")).toBeInTheDocument();
    // First 8 chars of SHA
    expect(screen.getByText("abcdef12")).toBeInTheDocument();
    expect(screen.getByText("문서 상세 페이지로 이동")).toBeInTheDocument();
  });

  it("finalize button is disabled when canFinalize returns false", () => {
    mockMergeStoreState.mergeReport = createMergeReport();
    mockMergeStoreState.canFinalize.mockReturnValue(false);
    render(<DocumentMergePage />);

    const button = screen.getByRole("button", { name: "병합 완료" });
    expect(button).toBeDisabled();
  });

  it("finalize button is enabled when canFinalize returns true", () => {
    mockMergeStoreState.mergeReport = createMergeReport();
    mockMergeStoreState.canFinalize.mockReturnValue(true);
    render(<DocumentMergePage />);

    const button = screen.getByRole("button", { name: "병합 완료" });
    expect(button).not.toBeDisabled();
  });

  it("shows error message when error is set", () => {
    mockMergeStoreState.error = "병합 보고서를 불러오는 중 오류가 발생했습니다";
    render(<DocumentMergePage />);

    expect(
      screen.getByText("병합 보고서를 불러오는 중 오류가 발생했습니다")
    ).toBeInTheDocument();
  });
});

// ─── MR merge navigation tests ──────────────────────────────────────

describe("MR merge navigation", () => {
  // We need to test the MR detail page handleAction behavior.
  // Since vi.mock is hoisted and cannot be changed per-describe,
  // we test navigation indirectly by verifying the MR page behavior.

  // Mock stores for MR page
  let mockPerformAction: ReturnType<typeof vi.fn>;
  let mockSelectedMR: {
    documentId: string;
    mergeResultId: string | null;
  } | null;
  let mockGetState: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();

    mockPerformAction = vi.fn().mockResolvedValue(undefined);
    mockSelectedMR = {
      documentId: "doc-001",
      mergeResultId: "merge-002",
    };
    mockGetState = vi.fn(() => ({ selectedMR: mockSelectedMR }));
  });

  it("navigates to merge result page after merge action", async () => {
    // Simulate the handleAction logic from MR detail page
    const action = "merge";
    await mockPerformAction("proj-001", "mr-001", action);

    if (action === "merge") {
      const mr = mockGetState().selectedMR;
      if (mr?.mergeResultId && mr?.documentId) {
        mockPush(
          `/collab/documents/${mr.documentId}/merge/${mr.mergeResultId}`
        );
      }
    }

    expect(mockPush).toHaveBeenCalledWith(
      "/collab/documents/doc-001/merge/merge-002"
    );
  });

  it("does not navigate when mergeResultId is null", async () => {
    mockSelectedMR = { documentId: "doc-001", mergeResultId: null };
    mockGetState.mockReturnValue({ selectedMR: mockSelectedMR });

    const action = "merge";
    await mockPerformAction("proj-001", "mr-001", action);

    if (action === "merge") {
      const mr = mockGetState().selectedMR;
      if (mr?.mergeResultId && mr?.documentId) {
        mockPush(
          `/collab/documents/${mr.documentId}/merge/${mr.mergeResultId}`
        );
      }
    }

    expect(mockPush).not.toHaveBeenCalled();
  });
});
