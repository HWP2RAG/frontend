import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/auth-store";

// Create a fake Google JWT (header.payload.signature)
function toBase64(str: string) {
  return btoa(unescape(encodeURIComponent(str)));
}

function fakeGoogleJwt(payload: Record<string, string>) {
  const header = toBase64(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = toBase64(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

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
  });

  it("login() decodes Google JWT and stores user info", () => {
    const credential = fakeGoogleJwt({
      sub: "123",
      email: "test@example.com",
      name: "홍길동",
      picture: "https://example.com/photo.jpg",
    });

    useAuthStore.getState().login(credential);

    const state = useAuthStore.getState();
    expect(state.isLoggedIn).toBe(true);
    expect(state.user).toEqual({
      id: "123",
      email: "test@example.com",
      name: "홍길동",
      picture: "https://example.com/photo.jpg",
    });
    expect(state.token).toBe(credential);
  });

  it("login() saves to localStorage", () => {
    const credential = fakeGoogleJwt({
      sub: "123",
      email: "test@example.com",
      name: "홍길동",
    });

    useAuthStore.getState().login(credential);

    const raw = localStorage.getItem("auth-storage");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.user.name).toBe("홍길동");
    expect(parsed.token).toBe(credential);
  });

  it("login() does nothing with invalid credential", () => {
    useAuthStore.getState().login("not-a-jwt");

    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("logout() clears user, token, and localStorage", () => {
    const credential = fakeGoogleJwt({
      sub: "123",
      email: "test@example.com",
      name: "홍길동",
    });
    useAuthStore.getState().login(credential);
    expect(useAuthStore.getState().isLoggedIn).toBe(true);

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
  });

  it("hydrate() sets hydrated=true even with empty localStorage", () => {
    useAuthStore.getState().hydrate();
    expect(useAuthStore.getState().hydrated).toBe(true);
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });
});
