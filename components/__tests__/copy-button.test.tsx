import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CopyButton } from "@/components/copy-button";

describe("CopyButton", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders copy button", () => {
    render(<CopyButton text="hello" />);
    expect(screen.getByRole("button")).toBeTruthy();
  });

  it("copies text to clipboard on click", async () => {
    render(<CopyButton text="hello world" />);
    fireEvent.click(screen.getByRole("button"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello world");
  });

  it("shows check icon after copying", async () => {
    render(<CopyButton text="hello" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByTestId("copy-check")).toBeTruthy();
    });
  });
});
