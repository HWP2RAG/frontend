import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadHwpxDialog } from "../upload-hwpx-dialog";

vi.mock("@/lib/collab-api", () => ({
  uploadHwpx: vi.fn(),
}));

import { uploadHwpx } from "@/lib/collab-api";

const mockedUploadHwpx = vi.mocked(uploadHwpx);

function createFile(name: string, sizeBytes: number, type = "application/octet-stream"): File {
  const buffer = new ArrayBuffer(sizeBytes);
  return new File([buffer], name, { type });
}

describe("UploadHwpxDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    documentId: "doc-123",
    onUploadStart: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when closed", () => {
    render(<UploadHwpxDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("HWPX 파일 업로드")).not.toBeInTheDocument();
  });

  it("renders dialog when open", () => {
    render(<UploadHwpxDialog {...defaultProps} />);
    expect(screen.getByText("HWPX 파일 업로드")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "업로드" })).toBeInTheDocument();
  });

  it("has file input that accepts only .hwpx files", () => {
    render(<UploadHwpxDialog {...defaultProps} />);
    const input = screen.getByLabelText("파일 선택") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.accept).toBe(".hwpx");
  });

  it("upload button is disabled when no file is selected", () => {
    render(<UploadHwpxDialog {...defaultProps} />);
    expect(screen.getByRole("button", { name: "업로드" })).toBeDisabled();
  });

  it("shows selected file name and size after selection", async () => {
    const user = userEvent.setup();
    render(<UploadHwpxDialog {...defaultProps} />);

    const file = createFile("test.hwpx", 1024);
    const input = screen.getByLabelText("파일 선택") as HTMLInputElement;
    await user.upload(input, file);

    expect(screen.getByText("test.hwpx")).toBeInTheDocument();
    expect(screen.getByText(/1\.0 KB/)).toBeInTheDocument();
  });

  it("enables upload button when file is selected", async () => {
    const user = userEvent.setup();
    render(<UploadHwpxDialog {...defaultProps} />);

    const file = createFile("test.hwpx", 1024);
    const input = screen.getByLabelText("파일 선택") as HTMLInputElement;
    await user.upload(input, file);

    expect(screen.getByRole("button", { name: "업로드" })).toBeEnabled();
  });

  it("calls uploadHwpx and onUploadStart on successful upload", async () => {
    const user = userEvent.setup();
    mockedUploadHwpx.mockResolvedValue({
      jobId: "job-456",
      documentId: "doc-123",
      status: "processing",
    });

    render(<UploadHwpxDialog {...defaultProps} />);

    const file = createFile("test.hwpx", 1024);
    const input = screen.getByLabelText("파일 선택") as HTMLInputElement;
    await user.upload(input, file);
    await user.click(screen.getByRole("button", { name: "업로드" }));

    await waitFor(() => {
      expect(mockedUploadHwpx).toHaveBeenCalledWith("doc-123", file);
    });

    await waitFor(() => {
      expect(defaultProps.onUploadStart).toHaveBeenCalledWith("job-456");
    });
  });

  it("disables upload button during upload", async () => {
    const user = userEvent.setup();
    let resolveUpload: (value: { jobId: string; documentId: string; status: string }) => void;
    mockedUploadHwpx.mockImplementation(
      () => new Promise((resolve) => { resolveUpload = resolve; })
    );

    render(<UploadHwpxDialog {...defaultProps} />);

    const file = createFile("test.hwpx", 1024);
    const input = screen.getByLabelText("파일 선택") as HTMLInputElement;
    await user.upload(input, file);
    await user.click(screen.getByRole("button", { name: "업로드" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "업로드 중..." })).toBeDisabled();
    });

    resolveUpload!({ jobId: "job-456", documentId: "doc-123", status: "processing" });
  });

  it("shows error message when upload fails", async () => {
    const user = userEvent.setup();
    mockedUploadHwpx.mockRejectedValue(new Error("Collab API error 500: Internal Server Error"));

    render(<UploadHwpxDialog {...defaultProps} />);

    const file = createFile("test.hwpx", 1024);
    const input = screen.getByLabelText("파일 선택") as HTMLInputElement;
    await user.upload(input, file);
    await user.click(screen.getByRole("button", { name: "업로드" }));

    await waitFor(() => {
      expect(screen.getByText(/업로드에 실패했습니다/)).toBeInTheDocument();
    });

    expect(defaultProps.onUploadStart).not.toHaveBeenCalled();
  });

  it("rejects files larger than 100MB", async () => {
    const user = userEvent.setup();
    render(<UploadHwpxDialog {...defaultProps} />);

    const largeFile = createFile("large.hwpx", 101 * 1024 * 1024);
    const input = screen.getByLabelText("파일 선택") as HTMLInputElement;
    await user.upload(input, largeFile);

    expect(screen.getByText(/100MB/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "업로드" })).toBeDisabled();
  });

  it("closes dialog on cancel click", async () => {
    const user = userEvent.setup();
    render(<UploadHwpxDialog {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "취소" }));
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes dialog on backdrop click", async () => {
    const user = userEvent.setup();
    render(<UploadHwpxDialog {...defaultProps} />);

    const backdrop = screen.getByTestId("dialog-backdrop");
    await user.click(backdrop);
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows progress bar when progress prop is provided", () => {
    render(<UploadHwpxDialog {...defaultProps} progress={45} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "45");
  });

  it("does not show progress bar when progress is not provided", () => {
    render(<UploadHwpxDialog {...defaultProps} />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
