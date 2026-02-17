import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConversionStatusCard } from "@/components/conversion-status-card";
import type { ConversionEntry } from "@/stores/conversion-store";

const baseEntry: ConversionEntry = {
  id: "conv-001",
  status: "polling",
  progress: 30,
  stages: [
    { name: "parsing", status: "in_progress", startedAt: "2026-01-31T00:00:00Z" },
    { name: "converting", status: "pending" },
  ],
};

describe("ConversionStatusCard", () => {
  it("renders progress bar with correct value", () => {
    render(<ConversionStatusCard entry={baseEntry} />);
    const progress = screen.getByRole("progressbar");
    expect(progress).toBeTruthy();
  });

  it("shows stage names", () => {
    render(<ConversionStatusCard entry={baseEntry} />);
    expect(screen.getByText("HWP 파싱")).toBeTruthy();
    expect(screen.getByText("포맷 변환")).toBeTruthy();
  });

  it("shows result button when completed", () => {
    const completed: ConversionEntry = {
      ...baseEntry,
      status: "completed",
      progress: 100,
      stages: [
        { name: "parsing", status: "completed", startedAt: "2026-01-31T00:00:00Z", completedAt: "2026-01-31T00:00:05Z" },
        { name: "converting", status: "completed", startedAt: "2026-01-31T00:00:05Z", completedAt: "2026-01-31T00:00:10Z" },
      ],
    };
    render(<ConversionStatusCard entry={completed} />);
    expect(screen.getByText("결과 보기")).toBeTruthy();
  });

  it("shows error state", () => {
    const failed: ConversionEntry = {
      ...baseEntry,
      status: "failed",
      error: "서버 오류로 변환에 실패했습니다",
    };
    render(<ConversionStatusCard entry={failed} />);
    expect(screen.getByText("서버 오류로 변환에 실패했습니다")).toBeTruthy();
  });
});
