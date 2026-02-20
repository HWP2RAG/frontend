import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage from "@/app/about/page";

describe("AboutPage", () => {
  it("renders hero title", () => {
    render(<AboutPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("HWPtoRAG");
    expect(heading.textContent).toContain("소개");
  });

  it("renders team member GitHub handles", () => {
    render(<AboutPage />);
    expect(screen.getByText(/@ahwlsqja/)).toBeTruthy();
    expect(screen.getByText(/@HoonilP/)).toBeTruthy();
  });

  it("renders GitHub link", () => {
    render(<AboutPage />);
    const githubLink = screen.getByRole("link", { name: /GitHub/ });
    expect(githubLink.getAttribute("href")).toBe(
      "https://github.com/HWP2RAG"
    );
  });

  it("renders key section titles", () => {
    render(<AboutPage />);
    expect(screen.getAllByText(/문제/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/해결/).length).toBeGreaterThan(0);
    expect(screen.getByText(/주요 기능/)).toBeTruthy();
    expect(screen.getByText(/타겟 고객/)).toBeTruthy();
    expect(screen.getByText(/개발 방법론/)).toBeTruthy();
    expect(screen.getByText(/팀 소개/)).toBeTruthy();
    expect(screen.getByText(/글로벌 확장/)).toBeTruthy();
  });
});
