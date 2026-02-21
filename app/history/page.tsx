"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydration } from "@/hooks/use-auth-hydration";
import { useHistoryStore } from "@/stores/history-store";
import { HistoryTable } from "@/components/history-table";

export default function HistoryPage() {
  const hydrated = useAuthHydration();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const fetchHistory = useHistoryStore((s) => s.fetchHistory);

  useEffect(() => {
    if (hydrated && isLoggedIn) {
      fetchHistory();
    }
  }, [hydrated, isLoggedIn, fetchHistory]);

  // Not yet hydrated — show loading skeleton
  if (!hydrated) {
    return (
      <main className="flex flex-col p-8 flex-1">
        <div className="w-full max-w-6xl mx-auto space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-12 bg-muted animate-pulse rounded-md" />
          <div className="h-12 bg-muted animate-pulse rounded-md" />
          <div className="h-12 bg-muted animate-pulse rounded-md" />
        </div>
      </main>
    );
  }

  // Not logged in — show login prompt
  if (!isLoggedIn) {
    return (
      <main className="flex flex-col p-8 flex-1 items-center justify-center">
        <div className="text-center max-w-md space-y-4 p-8 border rounded-lg bg-card">
          <div className="text-4xl">🔒</div>
          <h1 className="text-xl font-bold">로그인이 필요합니다</h1>
          <p className="text-muted-foreground">
            변환 히스토리를 조회하려면 로그인해 주세요.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            홈으로 이동
          </a>
        </div>
      </main>
    );
  }

  // Logged in — show history
  return (
    <main className="flex flex-col p-8 flex-1">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">변환 히스토리</h1>
        <HistoryTable />
      </div>
    </main>
  );
}
