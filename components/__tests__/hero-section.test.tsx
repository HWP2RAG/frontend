import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "@/components/hero-section";

describe("HeroSection", () => {
  it("renders headline", () => {
    render(<HeroSection />);
    expect(screen.getByText(/AI에 최적화된 형태로/)).toBeTruthy();
  });

  it("renders CTA link to /convert", () => {
    render(<HeroSection />);
    const cta = screen.getByText("지금 변환하기");
    expect(cta.closest("a")?.getAttribute("href")).toBe("/convert");
  });

  it("renders free badge", () => {
    render(<HeroSection />);
    expect(screen.getByText("무료로 시작하기")).toBeTruthy();
  });

  it("renders INPUT: HWP label in initial phase", () => {
    render(<HeroSection />);
    expect(screen.getByText("INPUT: HWP")).toBeTruthy();
  });

  it("renders demo container", () => {
    render(<HeroSection />);
    // The demo renders inside a bordered container
    const container = document.querySelector(".rounded-xl.border");
    expect(container).toBeTruthy();
  });
});
