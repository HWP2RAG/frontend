import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginButton } from "@/components/login-button";
import { useAuthStore } from "@/stores/auth-store";

// Mock @react-oauth/google
vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({ onSuccess }: { onSuccess: (res: { credential: string }) => void }) => (
    <button
      data-testid="google-login-btn"
      onClick={() => onSuccess({ credential: "mock-credential" })}
    >
      Google 로그인
    </button>
  ),
}));

describe("LoginButton", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it("shows Google login button when not logged in", () => {
    render(<LoginButton />);
    expect(screen.getByTestId("google-login-btn")).toBeTruthy();
    expect(screen.getByText("Google 로그인")).toBeTruthy();
  });

  it("shows user name and logout button when logged in", () => {
    useAuthStore.setState({
      user: {
        id: "user-001",
        email: "test@example.com",
        name: "홍길동",
        picture: "https://example.com/photo.jpg",
      },
      token: "mock-token",
      isLoggedIn: true,
    });

    render(<LoginButton />);
    expect(screen.getByText("홍길동")).toBeTruthy();
    expect(screen.getByRole("button", { name: "로그아웃" })).toBeTruthy();
  });

  it("calls login on Google login success", async () => {
    render(<LoginButton />);
    fireEvent.click(screen.getByTestId("google-login-btn"));

    await waitFor(() => {
      expect(useAuthStore.getState().isLoggedIn).toBe(true);
    });
  });

  it("calls logout when logout button is clicked", () => {
    useAuthStore.setState({
      user: {
        id: "user-001",
        email: "test@example.com",
        name: "홍길동",
      },
      token: "mock-token",
      isLoggedIn: true,
    });

    render(<LoginButton />);
    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));

    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });
});
