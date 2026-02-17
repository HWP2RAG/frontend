import { create } from "zustand";
import { API_BASE_URL } from "@/lib/env";
import type { components } from "@/api/types";

type ConversionStatus = components["schemas"]["ConversionStatus"];
type ConversionResult = components["schemas"]["ConversionResult"];
type ConversionStage = components["schemas"]["ConversionStage"];

export interface ConversionEntry {
  id: string;
  status: "polling" | "completed" | "failed";
  progress: number;
  stages?: ConversionStage[];
  result?: ConversionResult;
  error?: string;
}

interface ConversionStore {
  conversions: Record<string, ConversionEntry>;
  _timers: Record<string, ReturnType<typeof setInterval>>;
  startPolling: (id: string) => void;
  stopPolling: (id: string) => void;
  fetchResult: (id: string, format: string) => Promise<void>;
  reset: () => void;
}

export const useConversionStore = create<ConversionStore>()((set, get) => ({
  conversions: {},
  _timers: {},

  startPolling: (id) => {
    set((state) => ({
      conversions: {
        ...state.conversions,
        [id]: { id, status: "polling", progress: 0 },
      },
    }));

    const poll = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/conversions/${id}/status`
        );
        if (!res.ok) throw new Error("Poll failed");

        const data: ConversionStatus = await res.json();

        set((state) => ({
          conversions: {
            ...state.conversions,
            [id]: {
              ...state.conversions[id],
              progress: data.progress,
              stages: data.stages,
              status:
                data.status === "completed"
                  ? "completed"
                  : data.status === "failed"
                    ? "failed"
                    : "polling",
              error: data.error,
            },
          },
        }));

        if (data.status === "completed" || data.status === "failed") {
          get().stopPolling(id);
        }
      } catch {
        set((state) => ({
          conversions: {
            ...state.conversions,
            [id]: {
              ...state.conversions[id],
              status: "failed",
              error: "폴링 중 오류가 발생했습니다",
            },
          },
        }));
        get().stopPolling(id);
      }
    };

    const timer = setInterval(poll, 2000);
    set((state) => ({ _timers: { ...state._timers, [id]: timer } }));

    // Run first poll immediately
    poll();
  },

  stopPolling: (id) => {
    const timer = get()._timers[id];
    if (timer) {
      clearInterval(timer);
      set((state) => {
        const newTimers = { ...state._timers };
        delete newTimers[id];
        return { _timers: newTimers };
      });
    }
  },

  fetchResult: async (id, format) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/conversions/${id}/download?format=${format}`
      );
      if (!res.ok) throw new Error("Download failed");

      const data: ConversionResult = await res.json();

      set((state) => ({
        conversions: {
          ...state.conversions,
          [id]: {
            ...state.conversions[id],
            result: data,
          },
        },
      }));
    } catch {
      set((state) => ({
        conversions: {
          ...state.conversions,
          [id]: {
            ...state.conversions[id],
            error: "결과를 가져오는 중 오류가 발생했습니다",
          },
        },
      }));
    }
  },

  reset: () => {
    // Clear all timers
    const timers = get()._timers;
    Object.values(timers).forEach(clearInterval);
    set({ conversions: {}, _timers: {} });
  },
}));
