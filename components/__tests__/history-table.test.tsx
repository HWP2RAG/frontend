import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HistoryTable } from "../history-table";
import { useHistoryStore } from "@/stores/history-store";
import { useAuthStore } from "@/stores/auth-store";

describe("HistoryTable", () => {
  beforeEach(() => {
    useHistoryStore.setState({
      items: [
        {
          id: "conv-001",
          filename: "document1.hwp",
          outputFormat: "markdown",
          status: "completed",
          fileSize: 1048576,
          createdAt: "2026-02-20T10:00:00Z",
          completedAt: "2026-02-20T10:00:30Z",
          hasImages: false,
        },
        {
          id: "conv-002",
          filename: "document2.hwp",
          outputFormat: "json",
          status: "failed",
          fileSize: 2097152,
          createdAt: "2026-02-19T14:00:00Z",
          completedAt: null,
          hasImages: false,
        },
      ],
      totalCount: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
      loading: false,
      error: null,
      statusFilter: null,
      fetchHistory: vi.fn(),
      setPage: vi.fn(),
      setStatusFilter: vi.fn(),
      reset: vi.fn(),
    });
    useAuthStore.setState({
      token: "mock-jwt-token-abc123",
      user: { id: "user-001", email: "test@example.com", name: "홍길동" },
      isLoggedIn: true,
      hydrated: true,
    });
  });

  it("renders filenames in the table", () => {
    render(<HistoryTable />);
    expect(screen.getByText("document1.hwp")).toBeTruthy();
    expect(screen.getByText("document2.hwp")).toBeTruthy();
  });

  it("shows download button only for completed items", () => {
    render(<HistoryTable />);
    const downloadButtons = screen.getAllByRole("button", { name: /다운로드/i });
    expect(downloadButtons).toHaveLength(1); // Only conv-001 is completed
  });

  it("shows empty state when no items", () => {
    useHistoryStore.setState({ items: [], totalCount: 0, totalPages: 0 });
    render(<HistoryTable />);
    expect(screen.getByText(/변환 기록이 없습니다/)).toBeTruthy();
  });

  it("shows loading state", () => {
    useHistoryStore.setState({ loading: true });
    render(<HistoryTable />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it("download button calls download-url API with source=history", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<HistoryTable />);
    const downloadBtn = screen.getByRole("button", { name: /다운로드/i });
    await user.click(downloadBtn);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("download-url?source=history"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringContaining("Bearer"),
        }),
      })
    );
    fetchSpy.mockRestore();
  });
});
