import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "@/stores/auth-store";

describe("auth-store", () => {
  beforeEach(async () => {
    useAuthStore.getState().logout();
    localStorage.clear();
    await useAuthStore.persist.rehydrate();
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

  it("restores login state from localStorage on rehydrate", async () => {
    // Pre-populate localStorage (simulates prior login session)
    const saved = {
      state: {
        user: { id: "user-001", email: "test@example.com", name: "홍길동" },
        token: "mock-jwt-token-abc123",
        isLoggedIn: true,
      },
      version: 0,
    };
    localStorage.setItem("auth-storage", JSON.stringify(saved));

    // Store starts with defaults
    expect(useAuthStore.getState().isLoggedIn).toBe(false);

    // Rehydrate from localStorage (simulates page load)
    await useAuthStore.persist.rehydrate();

    expect(useAuthStore.getState().isLoggedIn).toBe(true);
    expect(useAuthStore.getState().user?.name).toBe("홍길동");
    expect(useAuthStore.getState().token).toBe("mock-jwt-token-abc123");
  });
});
