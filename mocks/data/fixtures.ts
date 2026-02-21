import type { components } from "@/api/types";

type Schemas = components["schemas"];

export const mockUploadResponse: Schemas["UploadResponse"] = {
  id: "conv-001",
  status: "uploaded",
  filename: "sample.hwp",
  createdAt: "2026-01-31T00:00:00Z",
};

export const mockConversionStages: Record<string, Schemas["ConversionStatus"]> = {
  parsing: {
    id: "conv-001",
    status: "parsing",
    progress: 30,
    stages: [
      {
        name: "parsing",
        status: "in_progress",
        startedAt: "2026-01-31T00:00:00Z",
      },
      {
        name: "converting",
        status: "pending",
      },
    ],
  },
  converting: {
    id: "conv-001",
    status: "converting",
    progress: 70,
    stages: [
      {
        name: "parsing",
        status: "completed",
        startedAt: "2026-01-31T00:00:00Z",
        completedAt: "2026-01-31T00:00:05Z",
      },
      {
        name: "converting",
        status: "in_progress",
        startedAt: "2026-01-31T00:00:05Z",
      },
    ],
  },
  completed: {
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
  },
};

// Default status returned by the handler (completed)
export const mockConversionStatus: Schemas["ConversionStatus"] =
  mockConversionStages.completed;

export const mockConversionResults: Record<string, Schemas["ConversionResult"]> = {
  markdown: {
    content:
      "# Sample Document\n\nThis is a converted HWP document.\n\n## Section 1\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n### Subsection\n\n- Item 1\n- Item 2\n- Item 3\n\n## Section 2\n\n**Bold text** and *italic text* example.\n\n```python\nprint('Hello, World!')\n```\n\n| Column A | Column B |\n|----------|----------|\n| Data 1   | Data 2   |",
    format: "markdown",
    metadata: {
      title: "Sample Document",
      pageCount: 5,
      wordCount: 1200,
    },
  },
  json: {
    content: JSON.stringify(
      {
        title: "Sample Document",
        sections: [
          {
            heading: "Section 1",
            level: 2,
            content: "Lorem ipsum dolor sit amet.",
            children: [
              {
                heading: "Subsection",
                level: 3,
                content: "Item 1, Item 2, Item 3",
              },
            ],
          },
          {
            heading: "Section 2",
            level: 2,
            content: "Bold text and italic text example.",
          },
        ],
      },
      null,
      2
    ),
    format: "json",
    metadata: {
      title: "Sample Document",
      pageCount: 5,
      wordCount: 1200,
    },
  },
  plaintext: {
    content:
      "Sample Document\n\nThis is a converted HWP document.\n\nSection 1\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\nSubsection\n\n- Item 1\n- Item 2\n- Item 3\n\nSection 2\n\nBold text and italic text example.",
    format: "plaintext",
    metadata: {
      title: "Sample Document",
      pageCount: 5,
      wordCount: 1200,
    },
  },
  "rag-json": {
    content: JSON.stringify(
      {
        chunks: [
          {
            id: "chunk-001",
            text: "This is a converted HWP document.",
            metadata: { section: "intro", page: 1 },
          },
          {
            id: "chunk-002",
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            metadata: { section: "Section 1", page: 2 },
          },
        ],
      },
      null,
      2
    ),
    format: "rag-json",
    metadata: {
      title: "Sample Document",
      pageCount: 5,
      wordCount: 1200,
    },
  },
  csv: {
    content:
      "\uFEFF이름,나이,직업\r\n김철수,30,개발자\r\n이영희,28,디자이너\r\n",
    format: "csv",
    metadata: {
      title: "Sample Document",
      pageCount: 5,
      wordCount: 1200,
    },
  },
  html: {
    content:
      '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>hwptorag</title></head><body><main><h1>Sample Document</h1><p>This is a converted document.</p><table><thead><tr><th>Name</th><th>Age</th></tr></thead><tbody><tr><td>Alice</td><td>30</td></tr></tbody></table></main></body></html>',
    format: "html",
    metadata: {
      title: "Sample Document",
      pageCount: 5,
      wordCount: 1200,
    },
  },
};

export const mockConversionResult: Schemas["ConversionResult"] =
  mockConversionResults.markdown;

export const mockUsageInfo: Schemas["UsageInfo"] = {
  used: 3,
  limit: 5,
  resetAt: "2026-02-01T00:00:00Z",
};

export const mockUsageInfoLoggedIn: Schemas["UsageInfo"] = {
  used: 3,
  limit: 10,
  resetAt: "2026-02-01T00:00:00Z",
};

export const mockUser: Schemas["AuthUser"] = {
  id: "user-001",
  email: "test@example.com",
  name: "홍길동",
  picture: "https://lh3.googleusercontent.com/a/default-user",
};

export const mockAuthResponse: Schemas["AuthResponse"] = {
  user: mockUser,
  token: "mock-jwt-token-abc123",
};

// --- History fixtures ---

export const mockHistoryItems: Schemas["HistoryItem"][] = [
  { id: 'conv-001', filename: 'document1.hwp', outputFormat: 'markdown', status: 'completed', fileSize: 1048576, createdAt: '2026-02-20T10:00:00Z', completedAt: '2026-02-20T10:00:30Z', hasImages: false },
  { id: 'conv-002', filename: 'document2.hwp', outputFormat: 'json', status: 'failed', fileSize: 2097152, createdAt: '2026-02-19T14:00:00Z', completedAt: null, hasImages: false },
  { id: 'conv-003', filename: 'report.hwp', outputFormat: 'markdown', status: 'parsing', fileSize: 524288, createdAt: '2026-02-21T09:00:00Z', completedAt: null, hasImages: true },
];

export const mockHistoryResponse: Schemas["HistoryResponse"] = {
  items: mockHistoryItems,
  totalCount: 3,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

export const mockDownloadUrlResponse: Schemas["DownloadUrlResponse"] = {
  downloadUrl: 'https://mock-storage.supabase.co/signed/conversion-results/conv-001.md?token=mock',
  expiresIn: 900,
  filename: 'document1.md',
  format: 'markdown',
};

export const mockInitUploadResponse: Schemas["InitUploadResponse"] = {
  uploadId: "upload-abc-123",
  chunkSize: 5242880,
};

export const mockCompleteUploadResponse: Schemas["CompleteUploadResponse"] = {
  uploadId: "upload-abc-123",
  filename: "document.hwp",
  status: "uploaded",
  conversionId: "conv-001",
};
