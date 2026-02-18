import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginButton } from "@/components/login-button";
import { useAuthStore } from "@/stores/auth-store";

function toBase64(str: string) {
  return btoa(unescape(encodeURIComponent(str)));
}

const FAKE_JWT = [
  toBase64(JSON.stringify({ alg: "RS256" })),
  toBase64(JSON.stringify({ sub: "123", email: "test@example.com", name: "홍길동", picture: "https://example.com/photo.jpg" })),
  "sig",
].join(".");

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({ onSuccess }: { onSuccess: (res: { credential: string }) => void }) => (
    <button
      data-testid="google-login-btn"
      onClick={() => onSuccess({ credential: FAKE_JWT })}
    >
      Google 로그인
    </button>
  ),
}));

describe("LoginButton", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      isLoggedIn: false,
      hydrated: true,
    });
  });

  it("shows Google login button when not logged in", async () => {
    render(<LoginButton />);
    await waitFor(() => {
      expect(screen.getByTestId("google-login-btn")).toBeTruthy();
    });
  });

  it("shows user name and logout button when logged in", async () => {
    useAuthStore.setState({
      user: {
        id: "123",
        email: "test@example.com",
        name: "홍길동",
        picture: "https://example.com/photo.jpg",
      },
      token: "mock-token",
      isLoggedIn: true,
      hydrated: true,
    });

    render(<LoginButton />);
    await waitFor(() => {
      expect(screen.getByText("홍길동")).toBeTruthy();
    });
    expect(screen.getByRole("button", { name: "로그아웃" })).toBeTruthy();
  });

  it("calls login on Google login success", async () => {
    render(<LoginButton />);
    await waitFor(() => {
      expect(screen.getByTestId("google-login-btn")).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId("google-login-btn"));

    await waitFor(() => {
      expect(useAuthStore.getState().isLoggedIn).toBe(true);
      expect(useAuthStore.getState().user?.name).toBe("홍길동");
    });
  });

  it("calls logout when logout button is clicked", async () => {
    useAuthStore.setState({
      user: { id: "123", email: "test@example.com", name: "홍길동" },
      token: "mock-token",
      isLoggedIn: true,
      hydrated: true,
    });

    render(<LoginButton />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "로그아웃" })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));

    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });
});
