"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/stores/project-store";
import { useAuthStore } from "@/stores/auth-store";
import { CreateProjectDialog } from "@/components/collab/create-project-dialog";

export default function CollabPage() {
  const router = useRouter();
  const projects = useProjectStore((s) => s.projects);
  const isLoading = useProjectStore((s) => s.isLoading);
  const error = useProjectStore((s) => s.error);
  const loadProjects = useProjectStore((s) => s.loadProjects);
  const createProject = useProjectStore((s) => s.createProject);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      loadProjects();
    }
  }, [isLoggedIn, loadProjects]);

  const handleCreate = async (name: string) => {
    const project = await createProject(name);
    if (project) {
      router.push(`/collab/projects/${project.id}`);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="flex flex-col items-center justify-center p-8 flex-1">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-muted-foreground/50">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h2 className="text-lg font-semibold mb-1">로그인이 필요합니다</h2>
          <p className="text-sm text-muted-foreground">HWPX 협업 기능을 사용하려면 먼저 로그인해주세요</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center p-8 flex-1">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">프로젝트</h1>
            <p className="text-sm text-muted-foreground mt-1">
              HWPX 문서 협업 프로젝트를 관리합니다
            </p>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            새 프로젝트
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50">
              <path d="M20 17a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.9a2 2 0 0 1-1.69-.9l-.81-1.2a2 2 0 0 0-1.67-.9H8a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2Z" />
              <path d="M2 8v11a2 2 0 0 0 2 2h14" />
            </svg>
            <p className="text-sm">아직 프로젝트가 없습니다</p>
            <p className="text-xs mt-1">새 프로젝트를 생성하여 협업을 시작하세요</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => router.push(`/collab/projects/${project.id}`)}
                className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-medium">{project.name}</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      생성: {new Date(project.createdAt).toLocaleDateString("ko-KR")}
                      {" | "}
                      수정: {new Date(project.updatedAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreate}
      />
    </main>
  );
}
