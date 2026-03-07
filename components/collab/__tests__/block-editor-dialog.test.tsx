import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlockEditorDialog } from "../block-editor-dialog";

describe("BlockEditorDialog", () => {
  const mockBlock = {
    blockUuid: "block-123",
    html: "<p>원본 텍스트 내용</p>",
  };

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    block: mockBlock,
    onCommit: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when closed", () => {
    render(<BlockEditorDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("블록 편집")).not.toBeInTheDocument();
  });

  it("renders dialog when open", () => {
    render(<BlockEditorDialog {...defaultProps} />);
    expect(screen.getByText("블록 편집")).toBeInTheDocument();
    expect(screen.getByLabelText("내용")).toBeInTheDocument();
    expect(screen.getByLabelText("커밋 메시지")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "커밋" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
  });

  it("shows plain text extracted from HTML in textarea", () => {
    render(<BlockEditorDialog {...defaultProps} />);
    const textarea = screen.getByLabelText("내용") as HTMLTextAreaElement;
    expect(textarea.value).toBe("원본 텍스트 내용");
  });

  it("disables commit button when content is unchanged", () => {
    render(<BlockEditorDialog {...defaultProps} />);
    expect(screen.getByRole("button", { name: "커밋" })).toBeDisabled();
  });

  it("disables commit button when commit message is empty", async () => {
    const user = userEvent.setup();
    render(<BlockEditorDialog {...defaultProps} />);

    const textarea = screen.getByLabelText("내용");
    await user.clear(textarea);
    await user.type(textarea, "수정된 텍스트");

    // Content changed but no commit message
    expect(screen.getByRole("button", { name: "커밋" })).toBeDisabled();
  });

  it("enables commit button when content changed and message provided", async () => {
    const user = userEvent.setup();
    render(<BlockEditorDialog {...defaultProps} />);

    const textarea = screen.getByLabelText("내용");
    await user.clear(textarea);
    await user.type(textarea, "수정된 텍스트");
    await user.type(screen.getByLabelText("커밋 메시지"), "블록 내용 수정");

    expect(screen.getByRole("button", { name: "커밋" })).toBeEnabled();
  });

  it("calls onCommit with blockUuid, content, and message", async () => {
    const user = userEvent.setup();
    render(<BlockEditorDialog {...defaultProps} />);

    const textarea = screen.getByLabelText("내용");
    await user.clear(textarea);
    await user.type(textarea, "수정된 텍스트");
    await user.type(screen.getByLabelText("커밋 메시지"), "블록 내용 수정");
    await user.click(screen.getByRole("button", { name: "커밋" }));

    expect(defaultProps.onCommit).toHaveBeenCalledWith(
      "block-123",
      "수정된 텍스트",
      "블록 내용 수정"
    );
  });

  it("shows submitting state during commit", async () => {
    const user = userEvent.setup();
    let resolveCommit: () => void;
    const onCommit = vi.fn(
      () => new Promise<void>((resolve) => { resolveCommit = resolve; })
    );
    render(<BlockEditorDialog {...defaultProps} onCommit={onCommit} />);

    const textarea = screen.getByLabelText("내용");
    await user.clear(textarea);
    await user.type(textarea, "수정된 텍스트");
    await user.type(screen.getByLabelText("커밋 메시지"), "블록 내용 수정");
    await user.click(screen.getByRole("button", { name: "커밋" }));

    expect(screen.getByText("커밋 중...")).toBeInTheDocument();
    resolveCommit!();
  });

  it("closes dialog after successful commit", async () => {
    const user = userEvent.setup();
    render(<BlockEditorDialog {...defaultProps} />);

    const textarea = screen.getByLabelText("내용");
    await user.clear(textarea);
    await user.type(textarea, "수정된 텍스트");
    await user.type(screen.getByLabelText("커밋 메시지"), "블록 내용 수정");
    await user.click(screen.getByRole("button", { name: "커밋" }));

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes dialog on cancel click", async () => {
    const user = userEvent.setup();
    render(<BlockEditorDialog {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "취소" }));
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes dialog on backdrop click", async () => {
    const user = userEvent.setup();
    render(<BlockEditorDialog {...defaultProps} />);

    const backdrop = screen.getByTestId("dialog-backdrop");
    await user.click(backdrop);
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("handles HTML with nested tags", () => {
    const block = {
      blockUuid: "block-456",
      html: "<div><strong>굵은</strong> 텍스트와 <em>기울임</em></div>",
    };
    render(<BlockEditorDialog {...defaultProps} block={block} />);

    const textarea = screen.getByLabelText("내용") as HTMLTextAreaElement;
    expect(textarea.value).toBe("굵은 텍스트와 기울임");
  });
});
