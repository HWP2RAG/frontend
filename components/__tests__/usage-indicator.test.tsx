import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { UsageIndicator } from "@/components/usage-indicator";
import { useUsageStore } from "@/stores/usage-store";
import { useAuthStore } from "@/stores/auth-store";

describe("UsageIndicator", () => {
  beforeEach(async () => {
    useUsageStore.getState().reset();
    useAuthStore.getState().logout();
    localStorage.clear();
    await useAuthStore.persist.rehydrate();
  });

  it("renders usage count", async () => {
    render(<UsageIndicator />);
    await waitFor(() => {
      expect(screen.getByText("3 / 5")).toBeTruthy();
    });
  });

  it("shows warning when limit is reached", async () => {
    useUsageStore.setState({ used: 5, limit: 5 });
    render(<UsageIndicator />);
    expect(screen.getByText("일일 사용 한도에 도달했습니다")).toBeTruthy();
  });

  it("shows label text", async () => {
    await useUsageStore.getState().fetchUsage();
    render(<UsageIndicator />);
    expect(screen.getByText("오늘 변환 사용량")).toBeTruthy();
  });

  it("shows login prompt when not logged in", async () => {
    render(<UsageIndicator />);
    await waitFor(() => {
      expect(screen.getByText("로그인하면 10회까지 사용 가능")).toBeTruthy();
    });
  });

  it("does not show login prompt when logged in", async () => {
    useAuthStore.setState({
      user: { id: "user-001", email: "test@example.com", name: "홍길동" },
      token: "mock-token",
      isLoggedIn: true,
    });

    render(<UsageIndicator />);
    await waitFor(() => {
      expect(screen.queryByText("로그인하면 10회까지 사용 가능")).toBeNull();
    });
  });
});
