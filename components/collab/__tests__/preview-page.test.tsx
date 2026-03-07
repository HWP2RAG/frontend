import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { mockPreviewBlocks } from "@/mocks/collab-fixtures";

// ─── Mock next/navigation ───────────────────────────────────────────
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useParams: () => ({ documentId: "doc-001" }),
  useSearchParams: () => mockSearchParams,
}));

// ─── Mock DOMPurify ─────────────────────────────────────────────────
vi.mock("dompurify", () => ({
  default: {
    sanitize: (html: string) => html,
  },
}));

// ─── Mock fetchPreview ──────────────────────────────────────────────
const mockFetchPreview = vi.fn<
  (documentId: string, commitSha: string) => Promise<{
    commitSha: string;
    blockCount: number;
    blocks: typeof mockPreviewBlocks;
  }>
>();

vi.mock("@/lib/collab-api", () => ({
  fetchPreview: (...args: Parameters<typeof mockFetchPreview>) =>
    mockFetchPreview(...args),
}));

// ─── Import component after mocks ───────────────────────────────────
import DocumentPreviewPage from "@/app/collab/documents/[documentId]/preview/page";

describe("Preview Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockFetchPreview.mockResolvedValue({
      commitSha: "abc12345deadbeef",
      blockCount: mockPreviewBlocks.length,
      blocks: mockPreviewBlocks,
    });
  });

  it("renders preview blocks when commit query param is provided", async () => {
    mockSearchParams = new URLSearchParams({ commit: "abc12345deadbeef" });
    render(<DocumentPreviewPage />);

    await waitFor(() => {
      // Verify block HTML content is rendered
      expect(screen.getByText(/제1장 총칙/)).toBeInTheDocument();
      expect(screen.getByText(/제1조 \(목적\)/)).toBeInTheDocument();
      expect(screen.getByText(/제2조 \(위약금\)/)).toBeInTheDocument();
    });

    expect(mockFetchPreview).toHaveBeenCalledWith("doc-001", "abc12345deadbeef");
  });

  it('shows "commit 파라미터가 필요합니다" when commit query param is missing', () => {
    mockSearchParams = new URLSearchParams();
    render(<DocumentPreviewPage />);

    expect(screen.getByText(/commit 파라미터가 필요합니다/)).toBeInTheDocument();
  });

  it("shows loading state while fetching preview", async () => {
    mockSearchParams = new URLSearchParams({ commit: "abc12345deadbeef" });
    // Never resolve to keep loading state
    mockFetchPreview.mockReturnValue(new Promise(() => {}));

    render(<DocumentPreviewPage />);

    // Loading skeleton should be visible
    const pulseElements = document.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThanOrEqual(1);
  });

  it("shows error message when fetchPreview fails", async () => {
    mockSearchParams = new URLSearchParams({ commit: "abc12345deadbeef" });
    mockFetchPreview.mockRejectedValue(new Error("Network error"));

    render(<DocumentPreviewPage />);

    await waitFor(() => {
      expect(screen.getByText(/미리보기 로딩 실패/)).toBeInTheDocument();
    });
  });

  it("renders back to document link pointing to /collab/documents/{documentId}", () => {
    mockSearchParams = new URLSearchParams({ commit: "abc12345deadbeef" });
    render(<DocumentPreviewPage />);

    const backLink = screen.getByRole("link", { name: /문서/ });
    expect(backLink).toHaveAttribute("href", "/collab/documents/doc-001");
  });
});
