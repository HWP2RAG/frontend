import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConflictResolver } from "../conflict-resolver";
import { mockMergeReportWithConflicts } from "@/mocks/collab-fixtures";
import type { ResolutionStrategy } from "@/lib/collab-api";

// ─── Test Data ──────────────────────────────────────────────────────

const valueConflict = mockMergeReportWithConflicts.conflicts[0]; // VALUE type
const deleteModifyConflict = mockMergeReportWithConflicts.conflicts[1]; // DELETE_MODIFY type

type OnResolveFn = (
  conflictId: string,
  resolution: ResolutionStrategy,
  manualContent?: string
) => void;

// ─── Tests ──────────────────────────────────────────────────────────

describe("ConflictResolver", () => {
  let onResolve: ReturnType<typeof vi.fn<OnResolveFn>>;

  beforeEach(() => {
    vi.clearAllMocks();
    onResolve = vi.fn<OnResolveFn>();
  });

  it("renders conflict type badge with correct label for VALUE", () => {
    render(
      <ConflictResolver
        conflict={valueConflict}
        isResolved={false}
        onResolve={onResolve}
      />
    );

    expect(screen.getByText("값 충돌")).toBeInTheDocument();
  });

  it("renders conflict type badge with correct label for DELETE_MODIFY", () => {
    render(
      <ConflictResolver
        conflict={deleteModifyConflict}
        isResolved={false}
        onResolve={onResolve}
      />
    );

    expect(screen.getByText("삭제/수정 충돌")).toBeInTheDocument();
  });

  it("renders truncated blockUuid in header", () => {
    render(
      <ConflictResolver
        conflict={valueConflict}
        isResolved={false}
        onResolve={onResolve}
      />
    );

    // blockUuid is "block-005", first 8 chars = "block-00"
    expect(screen.getByText("block-00")).toBeInTheDocument();
  });

  it("renders Local and Remote content panes side by side", () => {
    render(
      <ConflictResolver
        conflict={valueConflict}
        isResolved={false}
        onResolve={onResolve}
      />
    );

    expect(screen.getByText("Local")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
    expect(
      screen.getByText(valueConflict.localContent!)
    ).toBeInTheDocument();
    expect(
      screen.getByText(valueConflict.remoteContent!)
    ).toBeInTheDocument();
  });

  it('shows "(삭제됨)" when localContent is null (DELETE_MODIFY case)', () => {
    render(
      <ConflictResolver
        conflict={deleteModifyConflict}
        isResolved={false}
        onResolve={onResolve}
      />
    );

    expect(screen.getByText("(삭제됨)")).toBeInTheDocument();
  });

  it('"Local 선택" button calls onResolve with accept_local', async () => {
    const user = userEvent.setup();

    render(
      <ConflictResolver
        conflict={valueConflict}
        isResolved={false}
        onResolve={onResolve}
      />
    );

    await user.click(screen.getByText("Local 선택"));

    expect(onResolve).toHaveBeenCalledWith("conflict-001", "accept_local");
  });

  it('"Remote 선택" button calls onResolve with accept_remote', async () => {
    const user = userEvent.setup();

    render(
      <ConflictResolver
        conflict={valueConflict}
        isResolved={false}
        onResolve={onResolve}
      />
    );

    await user.click(screen.getByText("Remote 선택"));

    expect(onResolve).toHaveBeenCalledWith("conflict-001", "accept_remote");
  });

  it('"직접 편집" button reveals textarea, then "편집 적용" calls onResolve with manual_edit', async () => {
    const user = userEvent.setup();

    render(
      <ConflictResolver
        conflict={valueConflict}
        isResolved={false}
        onResolve={onResolve}
      />
    );

    // First click shows the textarea
    await user.click(screen.getByText("직접 편집"));

    // Textarea should be visible now
    const textarea = screen.getByPlaceholderText(
      "병합할 내용을 직접 입력하세요..."
    );
    expect(textarea).toBeInTheDocument();

    // Clear and type new content
    await user.clear(textarea);
    await user.type(textarea, "수정된 내용");

    // Button should now say "편집 적용"
    await user.click(screen.getByText("편집 적용"));

    expect(onResolve).toHaveBeenCalledWith(
      "conflict-001",
      "manual_edit",
      expect.any(String)
    );
  });

  it('"Base 보기" button toggles base content pane visibility', async () => {
    const user = userEvent.setup();

    render(
      <ConflictResolver
        conflict={valueConflict}
        isResolved={false}
        onResolve={onResolve}
      />
    );

    // Base content should NOT be visible initially
    expect(
      screen.queryByText(valueConflict.baseContent!)
    ).not.toBeInTheDocument();

    // Click "Base 보기" to show
    await user.click(screen.getByText("Base 보기"));
    expect(
      screen.getByText(valueConflict.baseContent!)
    ).toBeInTheDocument();

    // Click again to hide (button text changes to "Base 숨기기")
    await user.click(screen.getByText("Base 숨기기"));
    expect(
      screen.queryByText(valueConflict.baseContent!)
    ).not.toBeInTheDocument();
  });

  it('renders resolved state with "해결됨" text when isResolved=true', () => {
    render(
      <ConflictResolver
        conflict={valueConflict}
        isResolved={true}
        onResolve={onResolve}
      />
    );

    expect(screen.getByText("해결됨")).toBeInTheDocument();

    // Action buttons should NOT be present
    expect(screen.queryByText("Local 선택")).not.toBeInTheDocument();
    expect(screen.queryByText("Remote 선택")).not.toBeInTheDocument();
    expect(screen.queryByText("직접 편집")).not.toBeInTheDocument();
  });
});
