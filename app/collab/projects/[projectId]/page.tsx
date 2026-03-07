"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectStore } from "@/stores/project-store";
import { useAuthStore } from "@/stores/auth-store";
import { MemberList } from "@/components/collab/member-list";
import { AddMemberDialog } from "@/components/collab/add-member-dialog";
import { CreateDocumentDialog } from "@/components/collab/create-document-dialog";
import { UploadHwpxDialog } from "@/components/collab/upload-hwpx-dialog";
import type { ProjectRole } from "@/lib/collab-api";

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = params.projectId;

  const selectedProject = useProjectStore((s) => s.selectedProject);
  const members = useProjectStore((s) => s.members);
  const documents = useProjectStore((s) => s.documents);
  const isLoadingDetail = useProjectStore((s) => s.isLoadingDetail);
  const isLoadingMembers = useProjectStore((s) => s.isLoadingMembers);
  const isLoadingDocuments = useProjectStore((s) => s.isLoadingDocuments);
  const error = useProjectStore((s) => s.error);
  const selectProject = useProjectStore((s) => s.selectProject);
  const addMember = useProjectStore((s) => s.addMember);
  const removeMember = useProjectStore((s) => s.removeMember);

  const currentUser = useAuthStore((s) => s.user);

  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateDoc, setShowCreateDoc] = useState(false);
  const [uploadDocId, setUploadDocId] = useState<string | null>(null);

  const linkDocument = useProjectStore((s) => s.linkDocument);

  useEffect(() => {
    if (projectId) {
      selectProject(projectId);
    }
  }, [projectId, selectProject]);

  const handleAddMember = async (userId: string, role: ProjectRole) => {
    await addMember(projectId, userId, role);
  };

  const handleRemoveMember = (userId: string) => {
    removeMember(projectId, userId);
  };

  if (isLoadingDetail) {
    return (
      <main className="flex flex-col items-center p-8 flex-1">
        <div className="w-full max-w-4xl space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="md:col-span-2 h-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center p-8 flex-1">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/collab")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            프로젝트 목록
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {selectedProject?.name ?? "프로젝트"}
              </h1>
              {selectedProject && (
                <p className="text-xs text-muted-foreground mt-1">
                  생성: {new Date(selectedProject.createdAt).toLocaleDateString("ko-KR")}
                </p>
              )}
            </div>
            <button
              onClick={() => router.push(`/collab/projects/${projectId}/mr`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="18" r="3" />
                <circle cx="6" cy="6" r="3" />
                <path d="M6 21V9a9 9 0 0 0 9 9" />
              </svg>
              Merge Requests
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {/* Main content: Documents + Members */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Documents (2/3 width) */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                문서 ({documents.length})
              </h2>
              <button
                onClick={() => setShowCreateDoc(true)}
                className="text-xs text-primary hover:underline"
              >
                + 문서 추가
              </button>
            </div>

            {isLoadingDocuments ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-50">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <p className="text-sm">연결된 문서가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => {
                  const hasContent = !!doc.updatedAt && !isNaN(new Date(doc.updatedAt).getTime());
                  return (
                    <div
                      key={doc.id}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${hasContent ? "border-border hover:bg-accent/50 cursor-pointer" : "border-dashed border-yellow-400/50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={hasContent ? "cursor-pointer flex-1" : "flex-1"} onClick={() => hasContent && router.push(`/collab/documents/${doc.id}`)}>
                          <h3 className="text-sm font-medium">{doc.name}</h3>
                          {hasContent ? (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              수정: {new Date(doc.updatedAt).toLocaleDateString("ko-KR")}
                            </p>
                          ) : (
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
                              파일 없음 — 업로드 후 문서를 볼 수 있습니다
                            </p>
                          )}
                        </div>
                        {hasContent ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground cursor-pointer" onClick={() => router.push(`/collab/documents/${doc.id}`)}>
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setUploadDocId(doc.id); }}
                            className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          >
                            문서 업로드
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Members sidebar (1/3 width) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                멤버 ({members.length})
              </h2>
              {currentUser?.id === selectedProject?.ownerId && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="text-xs text-primary hover:underline"
                >
                  + 멤버 추가
                </button>
              )}
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <MemberList
                members={members}
                currentUserId={currentUser?.id ?? null}
                projectOwnerId={selectedProject?.ownerId ?? ""}
                isLoading={isLoadingMembers}
                onRemove={handleRemoveMember}
              />
            </div>
          </div>
        </div>
      </div>

      <AddMemberDialog
        open={showAddMember}
        onOpenChange={setShowAddMember}
        onSubmit={handleAddMember}
      />
      <CreateDocumentDialog
        open={showCreateDoc}
        onOpenChange={setShowCreateDoc}
        projectId={projectId}
        onCreated={async (docId) => {
          await linkDocument(projectId, docId);
          await selectProject(projectId);
        }}
      />
      {uploadDocId && (
        <UploadHwpxDialog
          open={!!uploadDocId}
          onOpenChange={(open) => { if (!open) setUploadDocId(null); }}
          documentId={uploadDocId}
          onUploadStart={() => {
            setUploadDocId(null);
            selectProject(projectId);
          }}
        />
      )}
    </main>
  );
}
