import { create } from "zustand";
import { API_BASE_URL } from "@/lib/env";
import { useAuthStore } from "@/stores/auth-store";
import type { components } from "@/api/types";

type UsageInfo = components["schemas"]["UsageInfo"];

interface UsageStore {
  used: number;
  limit: number;
  resetAt: string | null;
  loading: boolean;
  fetchUsage: () => Promise<void>;
  reset: () => void;
}

export const useUsageStore = create<UsageStore>()((set) => ({
  used: 0,
  limit: 5,
  resetAt: null,
  loading: false,

  fetchUsage: async () => {
    set({ loading: true });
    try {
      const headers: Record<string, string> = {};
      const token = useAuthStore.getState().token;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/usage`, { headers });
      if (!res.ok) throw new Error("Failed to fetch usage");

      const data: UsageInfo = await res.json();
      set({
        used: data.used,
        limit: data.limit,
        resetAt: data.resetAt,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  reset: () => set({ used: 0, limit: 5, resetAt: null, loading: false }),
}));
