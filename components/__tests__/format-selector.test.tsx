import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormatSelector } from "@/components/format-selector";

describe("FormatSelector", () => {
  it("renders 6 format tabs", () => {
    render(<FormatSelector value="markdown" onChange={() => {}} />);
    expect(screen.getByText("Markdown")).toBeTruthy();
    expect(screen.getByText("JSON")).toBeTruthy();
    expect(screen.getByText("Plain Text")).toBeTruthy();
    expect(screen.getByText("RAG-JSON")).toBeTruthy();
    expect(screen.getByText("CSV")).toBeTruthy();
    expect(screen.getByText("HTML")).toBeTruthy();
  });

  it("renders all tabs as role=tab", () => {
    render(<FormatSelector value="markdown" onChange={() => {}} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(6);
  });

  it("highlights active tab", () => {
    render(<FormatSelector value="json" onChange={() => {}} />);
    const jsonTab = screen.getByText("JSON").closest("[role='tab']");
    expect(jsonTab?.getAttribute("data-state")).toBe("active");
  });
});
