import { create } from "zustand";
import type { components } from "@/api/types";
import { API_BASE_URL } from "@/lib/env";

type AuthUser = components["schemas"]["AuthUser"];

const STORAGE_KEY = "auth-storage";

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  hydrated: boolean;
  hydrate: () => void;
  login: (credential: string) => Promise<void>;
  logout: () => void;
}

function decodeGoogleJwt(credential: string): AuthUser | null {
  try {
    const parts = credential.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1]))));
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch {
    return null;
  }
}

function saveToStorage(user: AuthUser, token: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
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

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  hydrated: false,

  hydrate: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { user, token } = JSON.parse(raw);
        set({ user, token, isLoggedIn: true, hydrated: true });
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
      const data: { user: AuthUser; token: string } = await res.json();
      set({ user: data.user, token: data.token, isLoggedIn: true });
      saveToStorage(data.user, data.token);
    } catch {
      // Network error — user stays logged out
    }
  },

  logout: () => {
    set({ user: null, token: null, isLoggedIn: false });
    clearStorage();
  },
}));
