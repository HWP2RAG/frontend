"use client";

import { useState, useEffect, type ReactNode } from "react";

export function MSWProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_MODE !== "mock") {
      setReady(true);
      return;
    }

    const timeout = setTimeout(() => {
      console.warn("[MSW] Worker start timed out, rendering anyway");
      setReady(true);
    }, 3000);

    import("@/mocks/browser")
      .then(({ worker }) =>
        worker.start({ onUnhandledRequest: "bypass" })
      )
      .then(() => {
        clearTimeout(timeout);
        setReady(true);
      })
      .catch((err) => {
        console.warn("[MSW] Failed to start worker:", err);
        clearTimeout(timeout);
        setReady(true);
      });

    return () => clearTimeout(timeout);
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}
