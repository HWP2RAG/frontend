import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PricingCard } from "@/components/pricing-card";
import type { PricingPlan } from "@/lib/pricing-data";

const basePlan: PricingPlan = {
  name: "Pro",
  price: "$14.99",
  period: "/월",
  description: "전문가를 위한 고급 변환",
  features: ["무제한 웹 변환", "표 심화 인식"],
  cta: "Pro 시작하기",
  ctaHref: "/convert",
};

describe("PricingCard", () => {
  it("renders plan name and price", () => {
    render(<PricingCard plan={basePlan} />);
    expect(screen.getByText("Pro")).toBeTruthy();
    expect(screen.getByText("$14.99")).toBeTruthy();
  });

  it("renders features list", () => {
    render(<PricingCard plan={basePlan} />);
    expect(screen.getByText("무제한 웹 변환")).toBeTruthy();
    expect(screen.getByText("표 심화 인식")).toBeTruthy();
  });

  it("renders CTA button", () => {
    render(<PricingCard plan={basePlan} />);
    expect(screen.getByText("Pro 시작하기")).toBeTruthy();
  });

  it("shows badge when highlighted", () => {
    const highlighted = { ...basePlan, highlighted: true, badge: "추천" };
    render(<PricingCard plan={highlighted} />);
    expect(screen.getByText("추천")).toBeTruthy();
  });
});
