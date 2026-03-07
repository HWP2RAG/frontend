import { http, HttpResponse } from "msw";
import {
  mockUsers,
  mockProjects,
  mockProjectMembers,
  mockCollabDocuments,
  mockProjectDocuments,
  mockBranches,
  mockCommits,
  mockPreviewBlocks,
  mockDiffResult,
  mockMergeRequests,
  mockCommentThreads,
  mockMergeReport,
  mockMergeReportWithConflicts,
  mockBlobContents,
  mockGovernanceResult,
} from "./collab-fixtures";

export const collabHandlers = [
  // ── Documents ──
  http.get("*/api/v1/collab/documents", () => {
    return HttpResponse.json(mockCollabDocuments);
  }),
  http.post("*/api/v1/collab/documents", async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json(
      { id: `doc-${Date.now()}`, name: body.name },
      { status: 201 }
    );
  }),
  http.post("*/api/v1/collab/documents/:documentId/upload", () => {
    return HttpResponse.json(
      { jobId: "1", documentId: "doc-001", status: "queued" },
      { status: 202 }
    );
  }),

  // ── Branches ──
  http.get(
    "*/api/v1/collab/documents/:documentId/branches",
    ({ params }) => {
      const docId = params.documentId as string;
      return HttpResponse.json(mockBranches[docId] ?? []);
    }
  ),
  http.post(
    "*/api/v1/collab/documents/:documentId/branches",
    async ({ request }) => {
      const body = (await request.json()) as { name: string };
      return HttpResponse.json(
        {
          name: body.name,
          commitSha256: "new-branch-sha...",
          isDefault: false,
        },
        { status: 201 }
      );
    }
  ),

  // ── Commits ──
  http.get(
    "*/api/v1/collab/documents/:documentId/commits",
    ({ params, request }) => {
      const docId = params.documentId as string;
      const url = new URL(request.url);
      const branch = url.searchParams.get("branch") ?? "main";
      const key = `${docId}:${branch}`;
      return HttpResponse.json(mockCommits[key] ?? []);
    }
  ),
  http.post("*/api/v1/collab/documents/:documentId/commits", async () => {
    return HttpResponse.json(
      {
        commitSha256: `commit-${Date.now()}`,
        treeSha256: `tree-${Date.now()}`,
        parentSha256: "parent-sha...",
        branch: "feature/section2-edit",
        blockCount: 7,
        changedBlocks: 1,
      },
      { status: 201 }
    );
  }),

  // ── Preview ──
  http.get(
    "*/api/v1/collab/documents/:documentId/preview/:commitSha",
    () => {
      return HttpResponse.json({
        commitSha: "abc123...",
        blockCount: mockPreviewBlocks.length,
        blocks: mockPreviewBlocks,
      });
    }
  ),

  // ── Checkout ──
  http.get(
    "*/api/v1/collab/documents/:documentId/checkout/:commitSha",
    () => {
      return HttpResponse.json({
        commit: {
          sha256: "abc123...",
          message: "Initial commit",
          authorId: null,
          blockCount: 6,
          createdAt: "2026-03-01T00:00:00Z",
        },
        blockCount: 6,
        blocks: mockPreviewBlocks.map((b, i) => ({
          blockUuid: b.blockUuid,
          sectionPath: b.sectionPath,
          elementTag: i === 5 ? "hp:tbl" : "hp:p",
          position: b.position,
          contentSha256: `content-sha-${b.blockUuid}`,
        })),
      });
    }
  ),

  // ── Diff ──
  http.get("*/api/v1/collab/documents/:documentId/diff", () => {
    return HttpResponse.json(mockDiffResult);
  }),
  http.get("*/api/v1/collab/documents/:documentId/diff/branches", () => {
    return HttpResponse.json(mockDiffResult);
  }),

  // ── Merge ──
  http.post("*/api/v1/collab/documents/:documentId/merge", ({ params }) => {
    return HttpResponse.json(
      {
        jobId: "5",
        documentId: params.documentId,
        mergeResultId: "merge-002",
        status: "queued",
      },
      { status: 202 }
    );
  }),
  http.get(
    "*/api/v1/collab/documents/:documentId/merges/:mergeResultId",
    ({ params }) => {
      if (params.mergeResultId === "merge-002") {
        return HttpResponse.json(mockMergeReportWithConflicts);
      }
      return HttpResponse.json(mockMergeReport);
    }
  ),
  http.post(
    "*/api/v1/collab/documents/:documentId/merges/:mergeResultId/resolve",
    () => {
      return HttpResponse.json({ ok: true });
    }
  ),
  http.post(
    "*/api/v1/collab/documents/:documentId/merges/:mergeResultId/finalize",
    () => {
      return HttpResponse.json({ resultCommitSha256: "finalized-sha..." });
    }
  ),

  // ── Export ──
  http.get(
    "*/api/v1/collab/documents/:documentId/export/:commitSha",
    () => {
      return new HttpResponse(new Blob(["mock hwpx content"]), {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition":
            'attachment; filename="document.hwpx"',
        },
      });
    }
  ),

  // ── Blobs ──
  http.get("*/api/v1/collab/blobs/:sha256", ({ params }) => {
    const sha = params.sha256 as string;
    const content =
      mockBlobContents[sha] ??
      "<hp:p><hp:run><hp:t>Mock blob content</hp:t></hp:run></hp:p>";
    return new HttpResponse(content, {
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }),

  // ── Projects ──
  http.get("*/api/v1/collab/projects", () => {
    return HttpResponse.json(mockProjects);
  }),
  http.post("*/api/v1/collab/projects", async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json(
      {
        id: `proj-${Date.now()}`,
        name: body.name,
        ownerId: "user-001",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),
  http.get("*/api/v1/collab/projects/:projectId", ({ params }) => {
    const project = mockProjects.find((p) => p.id === params.projectId);
    if (!project)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(project);
  }),
  http.get(
    "*/api/v1/collab/projects/:projectId/members",
    ({ params }) => {
      const members =
        mockProjectMembers[params.projectId as string] ?? [];
      return HttpResponse.json(members);
    }
  ),
  http.post(
    "*/api/v1/collab/projects/:projectId/members",
    async ({ request, params }) => {
      const body = (await request.json()) as {
        userId: string;
        role: string;
      };
      return HttpResponse.json(
        {
          id: `pm-${Date.now()}`,
          projectId: params.projectId,
          userId: body.userId,
          role: body.role,
          createdAt: new Date().toISOString(),
        },
        { status: 201 }
      );
    }
  ),
  http.delete(
    "*/api/v1/collab/projects/:projectId/members/:userId",
    () => {
      return new HttpResponse(null, { status: 204 });
    }
  ),
  http.post(
    "*/api/v1/collab/projects/:projectId/documents",
    () => {
      return HttpResponse.json({ ok: true }, { status: 201 });
    }
  ),
  http.get(
    "*/api/v1/collab/projects/:projectId/documents",
    ({ params }) => {
      const docIds =
        mockProjectDocuments[params.projectId as string] ?? [];
      const docs = mockCollabDocuments.filter((d) =>
        docIds.includes(d.id)
      );
      return HttpResponse.json(docs);
    }
  ),

  // ── Merge Requests ──
  http.get(
    "*/api/v1/collab/projects/:projectId/merge-requests",
    () => {
      return HttpResponse.json(mockMergeRequests);
    }
  ),
  http.post(
    "*/api/v1/collab/projects/:projectId/merge-requests",
    async ({ request }) => {
      const body = (await request.json()) as {
        title: string;
        documentId: string;
        sourceBranch: string;
        targetBranch?: string;
        description?: string;
      };
      return HttpResponse.json(
        {
          id: `mr-${Date.now()}`,
          projectId: "proj-001",
          documentId: body.documentId,
          title: body.title,
          authorId: "user-001",
          sourceBranch: body.sourceBranch,
          targetBranch: body.targetBranch ?? "main",
          status: "open",
          mergeResultId: null,
          description: body.description ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { status: 201 }
      );
    }
  ),
  http.get(
    "*/api/v1/collab/projects/:projectId/merge-requests/:mrId",
    () => {
      return HttpResponse.json(mockMergeRequests[0]);
    }
  ),
  http.get(
    "*/api/v1/collab/projects/:projectId/merge-requests/:mrId/diff",
    () => {
      return HttpResponse.json(mockDiffResult);
    }
  ),
  http.post(
    "*/api/v1/collab/projects/:projectId/merge-requests/:mrId/actions",
    async ({ request }) => {
      const body = (await request.json()) as { action: string };
      if (body.action === "merge") {
        return HttpResponse.json({
          ...mockMergeRequests[0],
          status: "merged",
          mergeResultId: "merge-002",
        });
      }
      return HttpResponse.json({ ok: true });
    }
  ),

  // ── Comments ──
  http.get("*/api/v1/collab/projects/:projectId/comments", () => {
    return HttpResponse.json(mockCommentThreads);
  }),
  http.post(
    "*/api/v1/collab/projects/:projectId/comments",
    async ({ request }) => {
      const body = (await request.json()) as {
        body: string;
        targetType: string;
        targetId: string;
      };
      return HttpResponse.json(
        {
          id: `comment-${Date.now()}`,
          projectId: "proj-001",
          authorId: "user-001",
          targetType: body.targetType,
          targetId: body.targetId,
          body: body.body,
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { status: 201 }
      );
    }
  ),
  http.patch(
    "*/api/v1/collab/projects/:projectId/comments/:commentId",
    async ({ request }) => {
      const body = (await request.json()) as { body: string };
      return HttpResponse.json({
        ...mockCommentThreads[0].comment,
        body: body.body,
        updatedAt: new Date().toISOString(),
      });
    }
  ),
  http.delete(
    "*/api/v1/collab/projects/:projectId/comments/:commentId",
    () => {
      return new HttpResponse(null, { status: 204 });
    }
  ),

  // ── Governance ──
  http.post(
    "*/api/v1/collab/projects/:projectId/governance",
    () => {
      return HttpResponse.json(
        { ...mockGovernanceResult, status: "pending" },
        { status: 202 }
      );
    }
  ),
  http.get(
    "*/api/v1/collab/projects/:projectId/governance/:resultId",
    () => {
      return HttpResponse.json(mockGovernanceResult);
    }
  ),
  http.get(
    "*/api/v1/collab/projects/:projectId/governance",
    () => {
      return HttpResponse.json([mockGovernanceResult]);
    }
  ),

  // ── SSE Events (mock) ──
  http.get(
    "*/api/v1/collab/documents/:documentId/events",
    () => {
      // Return a simple SSE stream that completes immediately
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              'event: ingest-progress\ndata: {"documentId":"doc-001","progress":100,"stage":"complete"}\n\n'
            )
          );
          controller.close();
        },
      });
      return new HttpResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }
  ),
];
