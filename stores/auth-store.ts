import { create } from "zustand";
import type { components } from "@/api/types";
import { API_BASE_URL } from "@/lib/env";

type AuthUser = components["schemas"]["AuthUser"];

const STORAGE_KEY = "auth-storage";
// Refresh 5 minutes before expiry
const REFRESH_BUFFER_SEC = 300;

interface StoredAuth {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isLoggedIn: boolean;
  hydrated: boolean;
  hydrate: () => void;
  login: (credential: string) => Promise<void>;
  logout: () => void;
  ensureFreshToken: () => Promise<string | null>;
}

function saveToStorage(data: StoredAuth) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable
  }
}

function isTokenExpired(expiresAt: number | null): boolean {
  if (!expiresAt) return true;
  return Date.now() / 1000 > expiresAt - REFRESH_BUFFER_SEC;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  expiresAt: null,
  isLoggedIn: false,
  hydrated: false,

  hydrate: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: StoredAuth = JSON.parse(raw);
        set({
          user: stored.user,
          token: stored.token,
          refreshToken: stored.refreshToken,
          expiresAt: stored.expiresAt,
          isLoggedIn: true,
          hydrated: true,
        });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },

  login: async (credential: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      if (!res.ok) return;
      const data: {
        user: AuthUser;
        token: string;
        refreshToken: string;
        expiresAt: number;
      } = await res.json();
      set({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        isLoggedIn: true,
      });
      saveToStorage({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      });
    } catch {
      // Network error — user stays logged out
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      refreshToken: null,
      expiresAt: null,
      isLoggedIn: false,
    });
    clearStorage();
  },

  ensureFreshToken: async () => {
    const { token, refreshToken, expiresAt, logout } = get();
    if (!token || !refreshToken) return token;

    // Token still valid — return as-is
    if (!isTokenExpired(expiresAt)) return token;

    // Token expired — try refresh
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        // Refresh failed — force logout
        logout();
        return null;
      }

      const data: {
        token: string;
        refreshToken: string;
        expiresAt: number;
      } = await res.json();

      const currentUser = get().user;
      set({
        token: data.token,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      });
      if (currentUser) {
        saveToStorage({
          user: currentUser,
          token: data.token,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
        });
      }
      return data.token;
    } catch {
      // Network error — return existing token (might still work)
      return token;
    }
  },
}));
