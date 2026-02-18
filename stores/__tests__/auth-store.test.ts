import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "@/stores/auth-store";

describe("auth-store", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it("has correct initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isLoggedIn).toBe(false);
  });

  it("login() calls POST /api/auth/google and stores user + token", async () => {
    await useAuthStore.getState().login("mock-credential");

    const state = useAuthStore.getState();
    expect(state.isLoggedIn).toBe(true);
    expect(state.user).toEqual({
      id: "user-001",
      email: "test@example.com",
      name: "홍길동",
      picture: "https://lh3.googleusercontent.com/a/default-user",
    });
    expect(state.token).toBe("mock-jwt-token-abc123");
  });

  it("logout() clears user and token", async () => {
    await useAuthStore.getState().login("mock-credential");
    expect(useAuthStore.getState().isLoggedIn).toBe(true);

    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isLoggedIn).toBe(false);
  });

  it("handles login failure gracefully", async () => {
    // Override fetch to simulate failure
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    await useAuthStore.getState().login("bad-credential");

    const state = useAuthStore.getState();
    expect(state.isLoggedIn).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();

    globalThis.fetch = originalFetch;
  });
});
