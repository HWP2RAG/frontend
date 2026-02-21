import { http, HttpResponse } from "msw";
import {
  mockUploadResponse,
  mockConversionStatus,
  mockConversionResults,
  mockUsageInfo,
  mockUsageInfoLoggedIn,
  mockAuthResponse,
  mockInitUploadResponse,
  mockCompleteUploadResponse,
  mockHistoryResponse,
  mockDownloadUrlResponse,
} from "./data/fixtures";

export const handlers = [
  http.post("*/api/upload/init", () => {
    return HttpResponse.json(mockInitUploadResponse, { status: 201 });
  }),

  http.post("*/api/upload/:uploadId/chunk", async ({ request }) => {
    const formData = await request.formData();
    const chunkIndex = Number(formData.get("chunkIndex"));
    return HttpResponse.json({ chunkIndex, received: true });
  }),

  http.post("*/api/upload/:uploadId/complete", ({ params }) => {
    return HttpResponse.json({
      ...mockCompleteUploadResponse,
      uploadId: params.uploadId as string,
    });
  }),

  http.post("*/api/upload", () => {
    return HttpResponse.json(mockUploadResponse);
  }),

  // History list endpoint (must come BEFORE :id/* routes to avoid route shadowing)
  http.get("*/api/conversions", ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { code: "AUTH_REQUIRED", message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    if (status) {
      const filtered = mockHistoryResponse.items.filter(
        (item) => item.status === status
      );
      return HttpResponse.json({
        ...mockHistoryResponse,
        items: filtered,
        totalCount: filtered.length,
        totalPages: Math.ceil(filtered.length / 20),
      });
    }
    return HttpResponse.json(mockHistoryResponse);
  }),

  // Download URL endpoint (must come BEFORE :id/status and :id/download)
  http.get("*/api/conversions/:id/download-url", ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { code: "AUTH_REQUIRED", message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }
    return HttpResponse.json(mockDownloadUrlResponse);
  }),

  http.get("*/api/conversions/:id/status", () => {
    return HttpResponse.json(mockConversionStatus);
  }),

  http.get("*/api/conversions/:id/download", ({ request }) => {
    const url = new URL(request.url);
    const format = url.searchParams.get("format") || "markdown";
    const result =
      mockConversionResults[format] || mockConversionResults.markdown;
    return HttpResponse.json(result);
  }),

  http.get("*/api/usage", ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (authHeader) {
      return HttpResponse.json(mockUsageInfoLoggedIn);
    }
    return HttpResponse.json(mockUsageInfo);
  }),

  http.post("*/api/auth/google", async ({ request }) => {
    const body = (await request.json()) as { credential: string };

    // Decode the Google JWT to extract real user info
    try {
      const parts = body.credential.split(".");
      if (parts.length === 3) {
        // Use decodeURIComponent(escape()) for proper UTF-8 handling (Korean chars)
        const payload = JSON.parse(
          decodeURIComponent(escape(atob(parts[1])))
        );
        return HttpResponse.json({
          user: {
            id: payload.sub || "user-001",
            email: payload.email || "unknown@example.com",
            name: payload.name || "Unknown",
            picture: payload.picture,
          },
          token: `mock-jwt-${payload.sub || "anonymous"}`,
        });
      }
    } catch {
      // JWT decode failed, fall back to mock data
    }

    return HttpResponse.json(mockAuthResponse);
  }),
];
