"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/env";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

interface BatchDownloadButtonProps {
  batchId: string;
  completedCount: number;
  disabled?: boolean;
}

export function BatchDownloadButton({
  batchId,
  completedCount,
  disabled,
}: BatchDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (completedCount === 0) return;

    setLoading(true);
    try {
      const token = useAuthStore.getState().token;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/batch/${batchId}/download-url`,
        { headers },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(body.message || "다운로드 URL 생성 실패");
      }

      const data = await res.json();
      const downloadUrl = data.downloadUrl as string;

      // Trigger download via <a> element (same pattern as existing DownloadButton)
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = data.filename || `batch_${batchId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      const message = err instanceof Error ? err.message : "다운로드 실패";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || completedCount === 0 || loading}
      className="w-full bg-green-600 hover:bg-green-700 text-white"
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>ZIP 생성 중...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>전체 다운로드 (ZIP)</span>
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded">
            {completedCount}
          </span>
        </div>
      )}
    </Button>
  );
}
