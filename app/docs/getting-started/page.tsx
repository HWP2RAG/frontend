export default function GettingStartedPage() {
  return (
    <article className="max-w-none space-y-8">
      <h1 className="text-3xl font-bold">시작하기</h1>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">개요</h2>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">HWPtoRAG</strong>는 한글(HWP) 문서를
          RAG(Retrieval-Augmented Generation) 파이프라인에 적합한 형태로 변환하는
          서비스입니다. 웹 UI 또는 REST API를 통해 HWP 파일을 업로드하면 Markdown,
          JSON, 평문, RAG-JSON 등 다양한 포맷으로 변환된 결과를 받을 수 있습니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Quick Start — 웹 UI</h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>홈 페이지에서 <strong className="text-foreground">파일 업로드 영역</strong>에 HWP 파일을 드래그하거나 클릭하여 선택합니다.</li>
          <li>업로드가 시작되면 진행률이 표시됩니다.</li>
          <li>변환이 완료되면 결과 파일을 다운로드할 수 있습니다.</li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">API로 시작하기</h2>
        <p className="text-muted-foreground">REST API를 통해 프로그래밍 방식으로 파일을 변환할 수도 있습니다.</p>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">1. 청크 업로드 초기화</h3>
            <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm"><code>{`curl -X POST https://api.hwptorag.com/api/upload/init \\
  -H "Content-Type: application/json" \\
  -d '{
    "filename": "document.hwp",
    "fileSize": 1048576,
    "totalChunks": 4
  }'`}</code></pre>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">2. 청크 업로드</h3>
            <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm"><code>{`curl -X POST https://api.hwptorag.com/api/upload/{uploadId}/chunk \\
  -F "chunk=@chunk_0.bin" \\
  -F "chunkIndex=0" \\
  -F "totalChunks=4"`}</code></pre>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">3. 업로드 완료</h3>
            <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm"><code>{`curl -X POST https://api.hwptorag.com/api/upload/{uploadId}/complete`}</code></pre>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">4. 변환 상태 확인</h3>
            <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm"><code>{`curl https://api.hwptorag.com/api/conversions/{id}/status`}</code></pre>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">5. 결과 다운로드</h3>
            <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm"><code>{`curl https://api.hwptorag.com/api/conversions/{id}/download?format=markdown`}</code></pre>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">제한 사항</h2>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>파일 크기: 최대 <strong className="text-foreground">100MB</strong></li>
          <li>동시 처리: 최대 <strong className="text-foreground">3개</strong> 파일</li>
          <li>비로그인 사용이며, 일일 사용량 제한이 적용됩니다.</li>
          <li>지원 포맷: <code className="bg-muted px-1.5 py-0.5 rounded text-sm">.hwp</code> 파일만 업로드 가능</li>
        </ul>
      </section>
    </article>
  );
}
