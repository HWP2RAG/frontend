"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function useAuthHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubFinish = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      useAuthStore.persist.rehydrate();
    }

    return () => {
      unsubFinish();
    };
  }, []);

  return hydrated;
}
