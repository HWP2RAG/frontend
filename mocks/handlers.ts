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

  // Demo pipeline endpoint (anonymous, no auth required)
  http.post("*/api/v1/demo/pipeline", async () => {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return HttpResponse.json({
      format: "markdown",
      filename: "sample_contract.hwp",
      parsed_content_preview:
        "# 계약서\n\n## 제1조 (목적)\n이 계약은 갑과 을 사이의 소프트웨어 개발 용역에 관한 사항을 정함을 목적으로 한다.\n\n## 제2조 (계약기간)\n계약기간은 2026년 1월 1일부터 2026년 12월 31일까지로 한다.\n\n| 항목 | 내용 |\n|------|------|\n| 계약금액 | 50,000,000원 |\n| 착수금 | 15,000,000원 |\n| 중도금 | 20,000,000원 |\n| 잔금 | 15,000,000원 |",
      parse_time_ms: 23,
      chunk_time_ms: 8,
      embed_time_ms: 142,
      total_chunks: 7,
      model: "bge-m3-korean",
      dimension: 1024,
      chunks_preview: [
        {
          text: "# 계약서\n\n## 제1조 (목적)\n이 계약은 갑과 을 사이의 소프트웨어 개발 용역에 관한 사항을 정함을 목적으로 한다.",
          chunk_index: 0,
          has_table: false,
          metadata: { section: "제1조" },
          embedding_preview: [0.0234, -0.0891, 0.1523, -0.0412, 0.0678],
        },
        {
          text: "## 제2조 (계약기간)\n계약기간은 2026년 1월 1일부터 2026년 12월 31일까지로 한다.",
          chunk_index: 1,
          has_table: false,
          metadata: { section: "제2조" },
          embedding_preview: [0.0156, -0.1034, 0.0892, -0.0567, 0.1123],
        },
        {
          text: "| 항목 | 내용 |\n|------|------|\n| 계약금액 | 50,000,000원 |\n| 착수금 | 15,000,000원 |\n| 중도금 | 20,000,000원 |\n| 잔금 | 15,000,000원 |",
          chunk_index: 2,
          has_table: true,
          metadata: { section: "계약금액 테이블", table_rows: 4, table_cols: 2 },
          embedding_preview: [-0.0345, 0.0789, 0.0234, -0.1156, 0.0501],
        },
        {
          text: "## 제3조 (대금 지급)\n갑은 을에게 다음과 같이 대금을 지급한다.\n1. 착수금: 계약 체결일로부터 7일 이내\n2. 중도금: 중간 검수 완료 후 14일 이내\n3. 잔금: 최종 납품 후 30일 이내",
          chunk_index: 3,
          has_table: false,
          metadata: { section: "제3조" },
          embedding_preview: [0.0891, -0.0234, 0.0678, -0.0912, 0.0345],
        },
        {
          text: "## 제4조 (지적재산권)\n본 계약에 의해 개발된 소프트웨어의 지적재산권은 갑에게 귀속된다.",
          chunk_index: 4,
          has_table: false,
          metadata: { section: "제4조" },
          embedding_preview: [0.0567, -0.0678, 0.1234, -0.0345, 0.0789],
        },
      ],
    });
  }),
];
