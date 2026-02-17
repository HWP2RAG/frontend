import { http, HttpResponse } from "msw";
import {
  mockUploadResponse,
  mockConversionStatus,
  mockConversionResults,
  mockUsageInfo,
  mockInitUploadResponse,
  mockCompleteUploadResponse,
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

  http.get("*/api/usage", () => {
    return HttpResponse.json(mockUsageInfo);
  }),
];
