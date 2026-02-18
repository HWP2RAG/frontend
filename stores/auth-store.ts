import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API_BASE_URL } from "@/lib/env";
import type { components } from "@/api/types";

type AuthUser = components["schemas"]["AuthUser"];
type AuthResponse = components["schemas"]["AuthResponse"];

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      login: async (credential: string) => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential }),
          });

          if (!res.ok) throw new Error("Login failed");

          const data: AuthResponse = await res.json();
          set({
            user: data.user,
            token: data.token,
            isLoggedIn: true,
          });
        } catch {
          set({ user: null, token: null, isLoggedIn: false });
        }
      },

      logout: () => {
        set({ user: null, token: null, isLoggedIn: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
