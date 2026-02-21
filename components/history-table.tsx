"use client";

import { useHistoryStore } from "@/stores/history-store";
import { useAuthStore } from "@/stores/auth-store";
import { API_BASE_URL } from "@/lib/env";

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: {
    label: "완료",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  failed: {
    label: "실패",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  parsing: {
    label: "파싱 중",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  converting: {
    label: "변환 중",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  uploaded: {
    label: "업로드됨",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  },
};

function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoDate;
  }
}

export function HistoryTable() {
  const {
    items,
    totalCount,
    page,
    totalPages,
    loading,
    error,
    statusFilter,
    fetchHistory,
    setPage,
    setStatusFilter,
  } = useHistoryStore();
  const token = useAuthStore((s) => s.token);

  const handleDownload = async (id: string) => {
    if (!token) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/conversions/${id}/download-url?source=history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("다운로드 URL 생성에 실패했습니다");
      }

      const data = await res.json();

      // Use <a> tag for CORS-safe download
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div aria-busy="true" className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 bg-muted animate-pulse rounded-md"
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={() => fetchHistory()}
          className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">변환 기록이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status filter */}
      <div className="flex items-center gap-2">
        <label htmlFor="status-filter" className="text-sm font-medium">
          상태:
        </label>
        <select
          id="status-filter"
          value={statusFilter ?? ""}
          onChange={(e) =>
            setStatusFilter(e.target.value || null)
          }
          className="text-sm border rounded-md px-2 py-1 bg-background"
        >
          <option value="">전체</option>
          <option value="completed">완료</option>
          <option value="failed">실패</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">파일명</th>
              <th className="text-left px-4 py-3 font-medium">포맷</th>
              <th className="text-left px-4 py-3 font-medium">상태</th>
              <th className="text-left px-4 py-3 font-medium">날짜</th>
              <th className="text-left px-4 py-3 font-medium">파일 크기</th>
              <th className="text-left px-4 py-3 font-medium">작업</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const statusInfo = statusConfig[item.status] ?? {
                label: item.status,
                className: "bg-gray-100 text-gray-800",
              };

              return (
                <tr key={item.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{item.filename}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.outputFormat}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}
                    >
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatFileSize(item.fileSize)}
                  </td>
                  <td className="px-4 py-3">
                    {item.status === "completed" ? (
                      <button
                        onClick={() => handleDownload(item.id)}
                        className="px-3 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        다운로드
                      </button>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          총 {totalCount}건
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            이전
          </button>
          <span className="text-muted-foreground">
            페이지 {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
