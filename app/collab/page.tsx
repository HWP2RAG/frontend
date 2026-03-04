"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCollabStore } from "@/stores/collab-store";

export default function CollabPage() {
  const router = useRouter();
  const documents = useCollabStore((s) => s.documents);
  const isLoading = useCollabStore((s) => s.isLoading);
  const error = useCollabStore((s) => s.error);
  const loadDocuments = useCollabStore((s) => s.loadDocuments);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <main className="flex flex-col items-center p-8 flex-1">
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">HWPX 협업</h1>
          <p className="text-sm text-muted-foreground mt-1">
            HWPX 문서의 버전 관리, 비교, 병합을 수행합니다
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-4 opacity-50"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-sm">아직 문서가 없습니다</p>
            <p className="text-xs mt-1">HWPX 파일을 업로드하여 시작하세요</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => router.push(`/collab/${doc.id}`)}
                className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-medium">{doc.name}</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      생성: {new Date(doc.createdAt).toLocaleDateString("ko-KR")}
                      {" | "}
                      수정: {new Date(doc.updatedAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
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
                    className="text-muted-foreground"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
