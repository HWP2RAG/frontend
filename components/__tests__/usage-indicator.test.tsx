import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { UsageIndicator } from "@/components/usage-indicator";
import { useUsageStore } from "@/stores/usage-store";

describe("UsageIndicator", () => {
  beforeEach(() => {
    useUsageStore.getState().reset();
  });

  it("renders usage count", async () => {
    render(<UsageIndicator />);
    await waitFor(() => {
      expect(screen.getByText("3 / 5")).toBeTruthy();
    });
  });

  it("shows warning when limit is reached", () => {
    useUsageStore.setState({ used: 5, limit: 5 });
    render(<UsageIndicator />);
    expect(screen.getByText("일일 사용 한도에 도달했습니다")).toBeTruthy();
  });

  it("shows label text", async () => {
    await useUsageStore.getState().fetchUsage();
    render(<UsageIndicator />);
    expect(screen.getByText("오늘 변환 사용량")).toBeTruthy();
  });
});
