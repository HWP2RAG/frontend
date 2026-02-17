export default function ApiDocsPage() {
  return (
    <article className="max-w-none space-y-8">
      <h1 className="text-3xl font-bold">API Reference</h1>
      <p className="text-muted-foreground">
        HWPtoRAG REST API 명세입니다. 모든 요청은{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm">https://api.hwptorag.com</code> 기반입니다.
      </p>

      {/* Upload Init */}
      <section id="upload-init" className="space-y-3">
        <h2 className="text-2xl font-semibold">POST /api/upload/init</h2>
        <p className="text-muted-foreground">청크 업로드 세션을 초기화합니다.</p>

        <h3 className="text-lg font-medium">Request Body</h3>
        <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm"><code>{`{
  "filename": "document.hwp",
  "fileSize": 1048576,
  "totalChunks": 4
}`}</code></pre>

        <h3 className="text-lg font-medium">Response — 201</h3>
        <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm"><code>{`{
  "uploadId": "abc-123",
  "chunkSize": 262144
}`}</code></pre>

        <h3 className="text-lg font-medium">에러 코드</h3>
        <ul className="list-disc list-inside text-muted-foreground">
          <li><code className="bg-muted px-1 rounded text-sm">400</code> — 잘못된 요청 (필수 필드 누락 등)</li>
        </ul>
      </section>

      <hr className="border-border" />

      {/* Upload Chunk */}
      <section id="upload-chunk" className="space-y-3">
        <h2 className="text-2xl font-semibold">POST /api/upload/&#123;uploadId&#125;/chunk</h2>
        <p className="text-muted-foreground">단일 청크를 업로드합니다. <code className="bg-muted px-1 rounded text-sm">multipart/form-data</code>로 전송합니다.</p>

        <h3 className="text-lg font-medium">Path Parameters</h3>
        <ul className="list-disc list-inside text-muted-foreground">
          <li><code className="bg-muted px-1 rounded text-sm">uploadId</code> — 업로드 세션 ID</li>
        </ul>

        <h3 className="text-lg font-medium">Form Fields</h3>
        <ul className="list-disc list-inside text-muted-foreground">
          <li><code className="bg-muted px-1 rounded text-sm">chunk</code> — 바이너리 청크 데이터</li>
          <li><code className="bg-muted px-1 rounded text-sm">chunkIndex</code> — 청크 인덱스 (0부터)</li>
          <li><code className="bg-muted px-1 rounded text-sm">totalChunks</code> — 전체 청크 수</li>
        </ul>

        <h3 className="text-lg font-medium">Response — 200</h3>
        <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm"><code>{`{
  "chunkIndex": 0,
  "received": true
}`}</code></pre>
      </section>

      <hr className="border-border" />

      {/* Upload Complete */}
      <section id="upload-complete" className="space-y-3">
        <h2 className="text-2xl font-semibold">POST /api/upload/&#123;uploadId&#125;/complete</h2>
        <p className="text-muted-foreground">청크 업로드를 완료하고 변환을 시작합니다.</p>

        <h3 className="text-lg font-medium">Response — 200</h3>
        <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm"><code>{`{
  "uploadId": "abc-123",
  "filename": "document.hwp",
  "status": "uploaded"
}`}</code></pre>
      </section>

      <hr className="border-border" />

      {/* Conversion Status */}
      <section id="conversion-status" className="space-y-3">
        <h2 className="text-2xl font-semibold">GET /api/conversions/&#123;id&#125;/status</h2>
        <p className="text-muted-foreground">변환 진행 상태를 조회합니다.</p>

        <h3 className="text-lg font-medium">Response — 200</h3>
        <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm"><code>{`{
  "id": "conv-456",
  "status": "converting",
  "progress": 65,
  "stages": [
    { "name": "parsing", "status": "completed" },
    { "name": "converting", "status": "in_progress" }
  ]
}`}</code></pre>

        <h3 className="text-lg font-medium">Status 값</h3>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li><code className="bg-muted px-1 rounded text-sm">uploaded</code> — 업로드 완료, 변환 대기</li>
          <li><code className="bg-muted px-1 rounded text-sm">parsing</code> — HWP 파싱 중</li>
          <li><code className="bg-muted px-1 rounded text-sm">converting</code> — 포맷 변환 중</li>
          <li><code className="bg-muted px-1 rounded text-sm">completed</code> — 변환 완료</li>
          <li><code className="bg-muted px-1 rounded text-sm">failed</code> — 변환 실패</li>
        </ul>
      </section>

      <hr className="border-border" />

      {/* Download */}
      <section id="conversion-download" className="space-y-3">
        <h2 className="text-2xl font-semibold">GET /api/conversions/&#123;id&#125;/download</h2>
        <p className="text-muted-foreground">변환 결과를 다운로드합니다.</p>

        <h3 className="text-lg font-medium">Query Parameters</h3>
        <ul className="list-disc list-inside text-muted-foreground">
          <li>
            <code className="bg-muted px-1 rounded text-sm">format</code> — 출력 포맷 (기본: <code className="bg-muted px-1 rounded text-sm">markdown</code>)
            <br />
            <span className="text-sm">markdown | json | plaintext | rag-json</span>
          </li>
        </ul>

        <h3 className="text-lg font-medium">Response — 200</h3>
        <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm"><code>{`{
  "content": "# 제목\\n\\n본문 내용...",
  "format": "markdown",
  "metadata": {
    "title": "문서 제목",
    "pageCount": 5,
    "wordCount": 1200
  }
}`}</code></pre>
      </section>

      <hr className="border-border" />

      {/* Usage */}
      <section id="usage" className="space-y-3">
        <h2 className="text-2xl font-semibold">GET /api/usage</h2>
        <p className="text-muted-foreground">일일 사용량 정보를 조회합니다.</p>

        <h3 className="text-lg font-medium">Response — 200</h3>
        <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm"><code>{`{
  "used": 3,
  "limit": 10,
  "resetAt": "2025-01-02T00:00:00Z"
}`}</code></pre>
      </section>

      <hr className="border-border" />

      {/* Common Errors */}
      <section id="errors" className="space-y-3">
        <h2 className="text-2xl font-semibold">공통 에러 응답</h2>
        <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm"><code>{`{
  "code": "FILE_TOO_LARGE",
  "message": "파일 크기가 100MB를 초과합니다."
}`}</code></pre>

        <h3 className="text-lg font-medium">주요 에러 코드</h3>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li><code className="bg-muted px-1 rounded text-sm">400</code> — 잘못된 요청</li>
          <li><code className="bg-muted px-1 rounded text-sm">404</code> — 리소스를 찾을 수 없음</li>
          <li><code className="bg-muted px-1 rounded text-sm">413</code> — 파일 크기 초과 (100MB)</li>
          <li><code className="bg-muted px-1 rounded text-sm">429</code> — 일일 사용량 초과</li>
          <li><code className="bg-muted px-1 rounded text-sm">500</code> — 서버 내부 오류</li>
        </ul>
      </section>
    </article>
  );
}
