"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMRStore } from "@/stores/mr-store";
import type { MRStatus } from "@/lib/collab-api";

const STATUS_TABS: { label: string; value: string | undefined }[] = [
  { label: "전체", value: undefined },
  { label: "Open", value: "open" },
  { label: "Approved", value: "approved" },
  { label: "Merged", value: "merged" },
  { label: "Closed", value: "closed" },
];

const STATUS_BADGE: Record<
  MRStatus,
  { label: string; className: string }
> = {
  open: {
    label: "Open",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  approved: {
    label: "Approved",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  merge_pending: {
    label: "Merge Pending",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  merged: {
    label: "Merged",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  closed: {
    label: "Closed",
    className:
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
};

export default function MergeRequestListPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const { mergeRequests, isLoading, error, loadMergeRequests } = useMRStore();
  const [activeFilter, setActiveFilter] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    loadMergeRequests(params.projectId, activeFilter);
  }, [params.projectId, activeFilter, loadMergeRequests]);

  return (
    <main className="flex flex-col items-center p-8 flex-1">
      <div className="w-full max-w-4xl">
        {/* Breadcrumb */}
        <Link
          href={`/collab/projects/${params.projectId}`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 inline-flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          프로젝트
        </Link>

        <h1 className="text-2xl font-bold tracking-tight mt-1">
          Merge Requests
        </h1>

        {/* Status filter tabs */}
        <div className="flex gap-1 mt-4 border-b border-border">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeFilter === tab.value
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-4 space-y-3">
          {isLoading && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              불러오는 중...
            </div>
          )}

          {error && (
            <div className="py-4 px-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!isLoading && !error && mergeRequests.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              Merge Request가 없습니다
            </div>
          )}

          {!isLoading &&
            mergeRequests.map((mr) => {
              const badge = STATUS_BADGE[mr.status];
              return (
                <button
                  key={mr.id}
                  onClick={() =>
                    router.push(
                      `/collab/projects/${params.projectId}/mr/${mr.id}`
                    )
                  }
                  className="w-full text-left p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {mr.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{mr.authorId}</span>
                        <span className="font-mono">
                          {mr.sourceBranch} → {mr.targetBranch}
                        </span>
                      </div>
                      {mr.description && (
                        <p className="mt-1 text-xs text-muted-foreground truncate">
                          {mr.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(mr.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </main>
  );
}
