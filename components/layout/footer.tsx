export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary-dark text-white text-xs font-bold">
              H
            </div>
            <span className="text-sm font-semibold">
              HWPto<span className="text-primary">RAG</span>
            </span>
          </div>
          <p className="text-sm text-muted">
            HWP 문서를 RAG 파이프라인에 적합한 형태로 변환
          </p>
          <div className="flex items-center gap-4 text-sm text-muted">
            <span>&copy; 2025 HWPtoRAG</span>
            <a
              href="https://github.com/anthropics/hwptorag"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
