// Mock Users
export const mockUsers = [
  { id: 'user-001', email: 'kim@example.com', name: '김철수', picture: null },
  { id: 'user-002', email: 'lee@example.com', name: '이영희', picture: null },
  { id: 'user-003', email: 'park@example.com', name: '박지민', picture: null },
];

// Mock Projects (2)
export const mockProjects = [
  {
    id: 'proj-001',
    name: '계약서 검토 TF',
    ownerId: 'user-001',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-06T12:00:00Z',
  },
  {
    id: 'proj-002',
    name: '사내 규정 개정',
    ownerId: 'user-002',
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-03-05T10:00:00Z',
  },
];

// Mock Project Members
export const mockProjectMembers: Record<
  string,
  Array<{
    id: string;
    projectId: string;
    userId: string;
    role: 'owner' | 'editor' | 'viewer';
    createdAt: string;
  }>
> = {
  'proj-001': [
    {
      id: 'pm-001',
      projectId: 'proj-001',
      userId: 'user-001',
      role: 'owner',
      createdAt: '2026-03-01T00:00:00Z',
    },
    {
      id: 'pm-002',
      projectId: 'proj-001',
      userId: 'user-002',
      role: 'editor',
      createdAt: '2026-03-02T00:00:00Z',
    },
    {
      id: 'pm-003',
      projectId: 'proj-001',
      userId: 'user-003',
      role: 'viewer',
      createdAt: '2026-03-03T00:00:00Z',
    },
  ],
  'proj-002': [
    {
      id: 'pm-004',
      projectId: 'proj-002',
      userId: 'user-002',
      role: 'owner',
      createdAt: '2026-02-15T00:00:00Z',
    },
    {
      id: 'pm-005',
      projectId: 'proj-002',
      userId: 'user-001',
      role: 'editor',
      createdAt: '2026-02-16T00:00:00Z',
    },
  ],
};

// Mock Documents (linked to projects)
export const mockCollabDocuments = [
  {
    id: 'doc-001',
    name: '용역계약서_v3',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-06T01:00:00Z',
  },
  {
    id: 'doc-002',
    name: '비밀유지계약서',
    createdAt: '2026-03-02T00:00:00Z',
    updatedAt: '2026-03-05T14:00:00Z',
  },
  {
    id: 'doc-003',
    name: '취업규칙_2026',
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-03-04T09:00:00Z',
  },
];

export const mockProjectDocuments: Record<string, string[]> = {
  'proj-001': ['doc-001', 'doc-002'],
  'proj-002': ['doc-003'],
};

// Mock Branches (per document)
export const mockBranches: Record<
  string,
  Array<{ name: string; commitSha256: string; isDefault: boolean }>
> = {
  'doc-001': [
    {
      name: 'main',
      commitSha256:
        'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      isDefault: true,
    },
    {
      name: 'feature/section2-edit',
      commitSha256:
        'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
      isDefault: false,
    },
  ],
  'doc-002': [
    {
      name: 'main',
      commitSha256:
        'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
      isDefault: true,
    },
  ],
  'doc-003': [
    {
      name: 'main',
      commitSha256:
        'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
      isDefault: true,
    },
    {
      name: 'feature/chapter3-rewrite',
      commitSha256:
        'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
      isDefault: false,
    },
  ],
};

// Mock Commits (per document per branch)
// Use realistic Korean commit messages
export const mockCommits: Record<
  string,
  Array<{
    sha256: string;
    message: string;
    authorId: string | null;
    blockCount: number;
    parentSha256: string | null;
    createdAt: string;
  }>
> = {
  'doc-001:main': [
    {
      sha256:
        'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      message: '제2조 위약금 비율 수정',
      authorId: 'user-001',
      blockCount: 6,
      parentSha256:
        'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
      createdAt: '2026-03-06T01:30:00Z',
    },
    {
      sha256:
        'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
      message: 'Initial commit',
      authorId: null,
      blockCount: 6,
      parentSha256: null,
      createdAt: '2026-03-01T00:00:00Z',
    },
  ],
  'doc-001:feature/section2-edit': [
    {
      sha256:
        'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
      message: '제2조의2 면책 조항 추가',
      authorId: 'user-002',
      blockCount: 7,
      parentSha256:
        'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      createdAt: '2026-03-06T02:00:00Z',
    },
    {
      sha256:
        'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      message: '제2조 위약금 비율 수정',
      authorId: 'user-001',
      blockCount: 6,
      parentSha256:
        'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
      createdAt: '2026-03-06T01:30:00Z',
    },
    {
      sha256:
        'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
      message: 'Initial commit',
      authorId: null,
      blockCount: 6,
      parentSha256: null,
      createdAt: '2026-03-01T00:00:00Z',
    },
  ],
};

// Mock Preview Blocks (for doc-001)
export const mockPreviewBlocks = [
  {
    blockUuid: 'block-001',
    html: '<p data-block-uuid="block-001" class="hwpx-paragraph"><span class="hwpx-run" style="font-size:18pt;font-weight:bold">제1장 총칙</span></p>',
    sectionPath: 'Contents/section0.xml',
    position: 0,
  },
  {
    blockUuid: 'block-002',
    html: '<p data-block-uuid="block-002" class="hwpx-paragraph"><span class="hwpx-run" style="font-weight:bold">제1조 (목적)</span></p>',
    sectionPath: 'Contents/section0.xml',
    position: 1,
  },
  {
    blockUuid: 'block-003',
    html: '<p data-block-uuid="block-003" class="hwpx-paragraph"><span class="hwpx-run">이 계약은 갑(이하 "위탁자")과 을(이하 "수탁자") 사이의 소프트웨어 개발 용역에 관한 사항을 정함을 목적으로 한다.</span></p>',
    sectionPath: 'Contents/section0.xml',
    position: 2,
  },
  {
    blockUuid: 'block-004',
    html: '<p data-block-uuid="block-004" class="hwpx-paragraph"><span class="hwpx-run" style="font-weight:bold">제2조 (위약금)</span></p>',
    sectionPath: 'Contents/section0.xml',
    position: 3,
  },
  {
    blockUuid: 'block-005',
    html: '<p data-block-uuid="block-005" class="hwpx-paragraph"><span class="hwpx-run">위약금은 계약 금액의 10%로 한다. 단, 천재지변 등 불가항력의 사유가 있는 경우에는 이를 감면할 수 있다.</span></p>',
    sectionPath: 'Contents/section0.xml',
    position: 4,
  },
  {
    blockUuid: 'block-006',
    html: '<table data-block-uuid="block-006" class="hwpx-table"><tr><td>구분</td><td>금액</td><td>비율</td></tr><tr><td>위약금</td><td>5,000만원</td><td>10%</td></tr><tr><td>지연배상금</td><td>일 0.1%</td><td>-</td></tr></table>',
    sectionPath: 'Contents/section0.xml',
    position: 5,
  },
];

// Mock Diff Result
export const mockDiffResult = {
  baseCommitSha256:
    'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
  targetCommitSha256:
    'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
  summary: { added: 1, deleted: 0, modified: 1, moved: 0, unchanged: 4 },
  diffs: [
    {
      blockUuid: 'block-005',
      status: 'modified' as const,
      sectionPath: 'Contents/section0.xml',
      elementTag: 'hp:p',
      textPatches: [{ offset: 12, deleteCount: 2, insertText: '10' }],
      attributeChanges: [],
      oldBlobSha256: 'blob-old-005',
      newBlobSha256: 'blob-new-005',
    },
    {
      blockUuid: 'block-007',
      status: 'added' as const,
      sectionPath: 'Contents/section0.xml',
      elementTag: 'hp:p',
    },
  ],
  computedInMs: 12,
};

// Mock Merge Requests
export const mockMergeRequests = [
  {
    id: 'mr-001',
    projectId: 'proj-001',
    documentId: 'doc-001',
    title: '제2조 수정안',
    description: '제2조 위약금 조항 수정 및 면책 조항 추가',
    authorId: 'user-002',
    sourceBranch: 'feature/section2-edit',
    targetBranch: 'main',
    status: 'open' as const,
    mergeResultId: null,
    createdAt: '2026-03-06T03:00:00Z',
    updatedAt: '2026-03-06T03:00:00Z',
  },
];

// Mock Comments
export const mockCommentThreads = [
  {
    comment: {
      id: 'comment-001',
      projectId: 'proj-001',
      authorId: 'user-001',
      targetType: 'block' as const,
      targetId: 'block-005',
      documentId: 'doc-001',
      commitSha256:
        'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      parentId: null,
      body: '위약금 비율을 10%에서 15%로 상향 조정 검토 필요',
      createdAt: '2026-03-06T04:00:00Z',
      updatedAt: '2026-03-06T04:00:00Z',
    },
    replies: [
      {
        id: 'comment-002',
        projectId: 'proj-001',
        authorId: 'user-002',
        targetType: 'block' as const,
        targetId: 'block-005',
        documentId: 'doc-001',
        commitSha256: null,
        parentId: 'comment-001',
        body: '10%가 업계 표준이라 현행 유지가 좋을 것 같습니다',
        createdAt: '2026-03-06T04:30:00Z',
        updatedAt: '2026-03-06T04:30:00Z',
      },
    ],
  },
];

// Mock Merge Report
export const mockMergeReport = {
  mergeResultId: 'merge-001',
  status: 'completed' as const,
  sourceBranch: 'feature/section2-edit',
  targetBranch: 'main',
  baseCommitSha256:
    'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
  resultCommitSha256:
    'z1y2x3w4v5u6z1y2x3w4v5u6z1y2x3w4v5u6z1y2x3w4v5u6z1y2x3w4v5u6z1y2',
  autoMergedCount: 5,
  conflictCount: 0,
  conflicts: [],
};

// Mock Merge Report with Conflicts
export const mockMergeReportWithConflicts = {
  mergeResultId: 'merge-002',
  status: 'conflicts' as const,
  sourceBranch: 'feature/section2-edit',
  targetBranch: 'main',
  baseCommitSha256:
    'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
  resultCommitSha256: null,
  autoMergedCount: 4,
  conflictCount: 2,
  conflicts: [
    {
      id: 'conflict-001',
      blockUuid: 'block-005',
      conflictType: 'VALUE' as const,
      sectionPath: 'Contents/section0.xml',
      localContent:
        '<hp:p>위약금은 계약 금액의 10%로 한다.</hp:p>',
      remoteContent:
        '<hp:p>위약금은 계약 금액의 15%로 한다.</hp:p>',
      baseContent:
        '<hp:p>위약금은 계약 금액의 5%로 한다.</hp:p>',
    },
    {
      id: 'conflict-002',
      blockUuid: 'block-003',
      conflictType: 'DELETE_MODIFY' as const,
      sectionPath: 'Contents/section0.xml',
      localContent: null,
      remoteContent:
        '<hp:p>이 계약은 수정된 조항입니다.</hp:p>',
      baseContent:
        '<hp:p>이 계약은 원본 조항입니다.</hp:p>',
    },
  ],
};

// Mock Blob Content
export const mockBlobContents: Record<string, string> = {
  'blob-old-005':
    '<hp:p hwptorag:block-id="block-005"><hp:run><hp:t>위약금은 계약 금액의 5%로 한다.</hp:t></hp:run></hp:p>',
  'blob-new-005':
    '<hp:p hwptorag:block-id="block-005"><hp:run><hp:t>위약금은 계약 금액의 10%로 한다. 단, 천재지변 등 불가항력의 사유가 있는 경우에는 이를 감면할 수 있다.</hp:t></hp:run></hp:p>',
};

// Mock Governance Result
export const mockGovernanceResult = {
  id: 'gov-001',
  documentId: 'doc-001',
  commitSha256:
    'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
  status: 'completed' as const,
  results: [
    {
      checker: 'speech_level',
      severity: 'warning',
      blockUuid: 'block-003',
      message: '경어체와 평어체가 혼용되어 있습니다',
      suggestion: "'합니다'체로 통일하세요",
    },
    {
      checker: 'spelling',
      severity: 'error',
      blockUuid: 'block-005',
      message: "'됬다' -> '됐다'",
      suggestion: '됐다',
    },
  ],
  jobId: 'job-001',
  createdAt: '2026-03-06T01:30:00Z',
  completedAt: '2026-03-06T01:35:00Z',
};
