import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="flex flex-col items-center text-center gap-6 py-20 px-4">
      <Badge variant="secondary" className="text-sm px-4 py-1">
        무료로 시작하기
      </Badge>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-3xl leading-tight">
        HWP 문서를{" "}
        <span className="text-primary">AI에 최적화된 형태로</span>
      </h1>
      <p className="text-lg text-muted max-w-xl">
        HWP/HWPX 파일을 Markdown, JSON, RAG-JSON으로 변환하세요.
        표, 이미지, 복잡한 레이아웃도 정확하게 처리합니다.
      </p>
      <div className="flex items-center gap-3">
        <Button asChild size="lg" className="bg-primary hover:bg-primary-dark text-white shadow-md">
          <Link href="/convert">지금 변환하기</Link>
        </Button>
        {/* MVP hidden: API 문서 보기 버튼
        <Button asChild variant="outline" size="lg">
          <Link href="/docs/getting-started">API 문서 보기</Link>
        </Button>
        */}
      </div>

      {/* Hero Demo */}
      <div className="mt-8 w-full max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-primary-50 p-4 text-left">
            <div className="text-xs text-muted mb-2 font-medium">INPUT: HWP</div>
            <div className="space-y-2 text-sm">
              <div className="h-4 w-3/4 rounded bg-primary/20" />
              <div className="h-3 w-full rounded bg-primary/10" />
              <div className="h-3 w-5/6 rounded bg-primary/10" />
              <div className="h-3 w-full rounded bg-primary/10" />
              <div className="mt-3 h-12 w-full rounded bg-primary/10" />
            </div>
          </div>
          <div className="rounded-lg bg-surface border border-border p-4 text-left">
            <div className="text-xs text-muted mb-2 font-medium">OUTPUT: Markdown</div>
            <pre className="text-xs text-foreground/80 font-mono whitespace-pre-wrap">
{`# 제목

본문 텍스트가 **정확하게**
변환됩니다.

| 항목 | 값 |
|------|-----|
| A    | 100 |`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
