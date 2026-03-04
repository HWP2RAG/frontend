"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCollabStore } from "@/stores/collab-store";
import { BranchSelector } from "@/components/collab/branch-selector";
import { CommitList } from "@/components/collab/commit-list";

export default function DocumentDetailPage() {
  const params = useParams<{ documentId: string }>();
  const router = useRouter();
  const documentId = params.documentId;

  const branches = useCollabStore((s) => s.branches);
  const selectedBranch = useCollabStore((s) => s.selectedBranch);
  const commits = useCollabStore((s) => s.commits);
  const isLoadingBranches = useCollabStore((s) => s.isLoadingBranches);
  const isLoadingCommits = useCollabStore((s) => s.isLoadingCommits);
  const error = useCollabStore((s) => s.error);
  const selectDocument = useCollabStore((s) => s.selectDocument);
  const selectBranch = useCollabStore((s) => s.selectBranch);

  useEffect(() => {
    if (documentId) {
      selectDocument(documentId);
    }
  }, [documentId, selectDocument]);

  const headCommit = commits[0] ?? null;

  return (
    <main className="flex flex-col items-center p-8 flex-1">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => router.push("/collab")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-1 flex items-center gap-1"
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
              문서 목록
            </button>
            <h1 className="text-2xl font-bold tracking-tight">문서 상세</h1>
          </div>

          {headCommit && (
            <button
              onClick={() =>
                router.push(
                  `/collab/${documentId}/preview?commit=${headCommit.sha256}`
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
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
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              미리보기
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {/* Branch Selector */}
        <div className="mb-6 p-4 rounded-lg border border-border bg-card">
          {isLoadingBranches ? (
            <div className="h-9 bg-muted animate-pulse rounded-md" />
          ) : (
            <BranchSelector
              branches={branches}
              selectedBranch={selectedBranch}
              onBranchChange={selectBranch}
            />
          )}
        </div>

        {/* Commit History */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            커밋 히스토리
            {selectedBranch && (
              <span className="ml-2 font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                {selectedBranch}
              </span>
            )}
          </h2>

          <CommitList
            commits={commits}
            isLoading={isLoadingCommits}
            onCommitSelect={(sha) =>
              router.push(`/collab/${documentId}/preview?commit=${sha}`)
            }
          />
        </div>
      </div>
    </main>
  );
}
