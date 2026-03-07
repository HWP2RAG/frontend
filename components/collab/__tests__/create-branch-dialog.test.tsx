import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateBranchDialog } from "../create-branch-dialog";

describe("CreateBranchDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when closed", () => {
    render(<CreateBranchDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("새 브랜치 생성")).not.toBeInTheDocument();
  });

  it("renders dialog when open", () => {
    render(<CreateBranchDialog {...defaultProps} />);
    expect(screen.getByText("새 브랜치 생성")).toBeInTheDocument();
    expect(screen.getByLabelText("브랜치 이름")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "생성" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
  });

  it("disables submit when name is empty", () => {
    render(<CreateBranchDialog {...defaultProps} />);
    expect(screen.getByRole("button", { name: "생성" })).toBeDisabled();
  });

  it("calls onSubmit with trimmed name", async () => {
    const user = userEvent.setup();
    render(<CreateBranchDialog {...defaultProps} />);

    await user.type(screen.getByLabelText("브랜치 이름"), "  feature/new-edit  ");
    await user.click(screen.getByRole("button", { name: "생성" }));

    expect(defaultProps.onSubmit).toHaveBeenCalledWith("feature/new-edit");
  });

  it("closes dialog after successful submit", async () => {
    const user = userEvent.setup();
    render(<CreateBranchDialog {...defaultProps} />);

    await user.type(screen.getByLabelText("브랜치 이름"), "feature/test");
    await user.click(screen.getByRole("button", { name: "생성" }));

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes dialog on cancel click", async () => {
    const user = userEvent.setup();
    render(<CreateBranchDialog {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "취소" }));
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows submitting state", async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void;
    const onSubmit = vi.fn(
      () => new Promise<void>((resolve) => { resolveSubmit = resolve; })
    );
    render(<CreateBranchDialog {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("브랜치 이름"), "feature/test");
    await user.click(screen.getByRole("button", { name: "생성" }));

    expect(screen.getByText("생성 중...")).toBeInTheDocument();
    resolveSubmit!();
  });

  it("validates branch name format (no spaces)", async () => {
    const user = userEvent.setup();
    render(<CreateBranchDialog {...defaultProps} />);

    await user.type(screen.getByLabelText("브랜치 이름"), "invalid name");
    await user.click(screen.getByRole("button", { name: "생성" }));

    expect(screen.getByText(/브랜치 이름에 공백/)).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });
});
