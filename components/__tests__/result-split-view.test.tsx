import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultSplitView } from "@/components/result-split-view";

describe("ResultSplitView", () => {
  it("renders code panel with raw content", () => {
    render(<ResultSplitView content="# Hello" format="markdown" />);
    expect(screen.getByTestId("code-panel")).toBeTruthy();
    expect(screen.getByText("# Hello")).toBeTruthy();
  });

  it("renders preview panel", () => {
    render(<ResultSplitView content="# Hello" format="markdown" />);
    expect(screen.getByTestId("preview-panel")).toBeTruthy();
  });

  it("renders JSON content formatted", () => {
    const json = JSON.stringify({ key: "value" });
    render(<ResultSplitView content={json} format="json" />);
    expect(screen.getByTestId("code-panel")).toBeTruthy();
  });

  it("renders loading skeleton when loading", () => {
    render(<ResultSplitView content="" format="markdown" loading />);
    expect(screen.getByTestId("split-view-loading")).toBeTruthy();
  });
});
