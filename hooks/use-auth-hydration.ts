"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function useAuthHydration(): boolean {
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) {
      useAuthStore.getState().hydrate();
    }
  }, [hydrated]);

  return hydrated;
}
