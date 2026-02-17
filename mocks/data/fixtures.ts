import type { components } from "@/api/types";

type Schemas = components["schemas"];

export const mockUploadResponse: Schemas["UploadResponse"] = {
  id: "conv-001",
  status: "uploaded",
  filename: "sample.hwp",
  createdAt: "2026-01-31T00:00:00Z",
};

export const mockConversionStatus: Schemas["ConversionStatus"] = {
  id: "conv-001",
  status: "completed",
  progress: 100,
  stages: [
    {
      name: "parsing",
      status: "completed",
      startedAt: "2026-01-31T00:00:00Z",
      completedAt: "2026-01-31T00:00:05Z",
    },
    {
      name: "converting",
      status: "completed",
      startedAt: "2026-01-31T00:00:05Z",
      completedAt: "2026-01-31T00:00:10Z",
    },
  ],
};

export const mockConversionResult: Schemas["ConversionResult"] = {
  content: "# Sample Document\n\nThis is a converted HWP document.",
  format: "markdown",
  metadata: {
    title: "Sample Document",
    pageCount: 3,
    wordCount: 150,
  },
};

export const mockUsageInfo: Schemas["UsageInfo"] = {
  used: 3,
  limit: 5,
  resetAt: "2026-02-01T00:00:00Z",
};

export const mockInitUploadResponse: Schemas["InitUploadResponse"] = {
  uploadId: "upload-abc-123",
  chunkSize: 5242880,
};

export const mockCompleteUploadResponse: Schemas["CompleteUploadResponse"] = {
  uploadId: "upload-abc-123",
  filename: "document.hwp",
  status: "uploaded",
};
