import { create } from "zustand";
import type { components } from "@/api/types";

type AuthUser = components["schemas"]["AuthUser"];

const STORAGE_KEY = "auth-storage";

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  hydrated: boolean;
  hydrate: () => void;
  login: (credential: string) => void;
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

  login: (credential: string) => {
    const user = decodeGoogleJwt(credential);
    if (!user) return;

    set({ user, token: credential, isLoggedIn: true });
    saveToStorage(user, credential);
  },

  logout: () => {
    set({ user: null, token: null, isLoggedIn: false });
    clearStorage();
  },
}));
