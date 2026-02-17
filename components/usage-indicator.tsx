"use client";

import { useEffect } from "react";
import { useUsageStore } from "@/stores/usage-store";

export function UsageIndicator() {
  const { used, limit, loading, fetchUsage } = useUsageStore();
  const isAtLimit = used >= limit;

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">오늘 변환 사용량</span>
        {!loading && (
          <span className={isAtLimit ? "text-red-500 font-medium" : "text-foreground font-medium"}>
            {used} / {limit}
          </span>
        )}
      </div>
      <div className="h-2 w-full rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isAtLimit ? "bg-red-500" : "bg-primary"}`}
          style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
        />
      </div>
      {isAtLimit && (
        <p className="text-xs text-red-500">일일 사용 한도에 도달했습니다</p>
      )}
    </div>
  );
}
