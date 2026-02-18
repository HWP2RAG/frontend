import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "@/stores/auth-store";

describe("auth-store", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      isLoggedIn: false,
      hydrated: false,
    });
  });

  it("has correct initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isLoggedIn).toBe(false);
    expect(state.hydrated).toBe(false);
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

  it("login() saves to localStorage", async () => {
    await useAuthStore.getState().login("mock-credential");

    const raw = localStorage.getItem("auth-storage");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.user.name).toBe("홍길동");
    expect(parsed.token).toBe("mock-jwt-token-abc123");
  });

  it("logout() clears user, token, and localStorage", async () => {
    await useAuthStore.getState().login("mock-credential");
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
    expect(localStorage.getItem("auth-storage")).not.toBeNull();

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem("auth-storage")).toBeNull();
  });

  it("hydrate() restores state from localStorage", () => {
    localStorage.setItem(
      "auth-storage",
      JSON.stringify({
        user: { id: "u1", email: "a@b.com", name: "TestUser" },
        token: "tok-123",
      })
    );

    useAuthStore.getState().hydrate();

    const state = useAuthStore.getState();
    expect(state.hydrated).toBe(true);
    expect(state.isLoggedIn).toBe(true);
    expect(state.user?.name).toBe("TestUser");
    expect(state.token).toBe("tok-123");
  });

  it("hydrate() sets hydrated=true even with empty localStorage", () => {
    useAuthStore.getState().hydrate();

    const state = useAuthStore.getState();
    expect(state.hydrated).toBe(true);
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

    globalThis.fetch = originalFetch;
  });
});
