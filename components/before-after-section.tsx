export function BeforeAfterSection() {
  return (
    <section className="py-16 px-4 bg-primary-50/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            HWP에서 Markdown으로, 한 번에
          </h2>
          <p className="text-muted">
            복잡한 HWP 문서 구조를 깔끔한 Markdown으로 변환합니다
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-muted font-medium">document.hwp</span>
            </div>
            <div className="space-y-3">
              <div className="h-5 w-2/3 rounded bg-border" />
              <div className="h-3 w-full rounded bg-border/60" />
              <div className="h-3 w-5/6 rounded bg-border/60" />
              <div className="h-3 w-full rounded bg-border/60" />
              <div className="mt-4 border border-border rounded p-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-3 rounded bg-border/50" />
                  <div className="h-3 rounded bg-border/50" />
                  <div className="h-3 rounded bg-border/50" />
                  <div className="h-3 rounded bg-border/30" />
                  <div className="h-3 rounded bg-border/30" />
                  <div className="h-3 rounded bg-border/30" />
                </div>
              </div>
              <div className="h-3 w-4/5 rounded bg-border/60" />
            </div>
          </div>
          {/* After */}
          <div className="rounded-xl border border-primary/30 bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-muted font-medium">document.md</span>
            </div>
            <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed">
{`# 연구 보고서

## 1. 서론

본 연구는 자연어 처리 기술을
활용한 문서 분석 방법론을
제시합니다.

| 항목     | 정확도 | 속도  |
|----------|--------|-------|
| 모델 A   | 95.2%  | 120ms |
| 모델 B   | 97.8%  | 85ms  |

## 2. 결론

**HWP 문서 변환**의 정확도가
크게 향상되었습니다.`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
