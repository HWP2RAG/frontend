"use client";

import { useState, useEffect, useCallback } from "react";
import { Code, Scissors, Cpu, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineDiagram, PIPELINE_STEPS } from "@/components/tech/pipeline-diagram";
import { LiveMetrics } from "@/components/tech/live-metrics";
import { useDemoStore } from "@/stores/demo-store";

const TECH_CARDS = [
  {
    title: "HWP 5.0 바이너리 파싱",
    icon: Code,
    description: "Rust + PyO3 기반 고성능 파서. OLE2 컨테이너 → 구조 보존 Semantic IR 변환.",
    tags: ["Rust", "PyO3", "OLE2"],
  },
  {
    title: "구조 보존 청킹",
    icon: Scissors,
    description: "표 원자성 보존. rowspan/colspan 포함 복합 테이블도 단일 청크로 유지.",
    tags: ["Table Atomicity", "Semantic Boundary"],
  },
  {
    title: "한국어 특화 임베딩",
    icon: Cpu,
    description: "bge-m3-korean 모델로 한국어 법률/행정 문서에 최적화된 벡터 생성.",
    tags: ["bge-m3-korean", "1024D"],
  },
  {
    title: "멀티 벡터DB",
    icon: Database,
    description: "Qdrant, Pinecone, Weaviate, Milvus 동시 지원. 요청별 DB 선택 가능.",
    tags: ["Qdrant", "Pinecone", "Weaviate", "Milvus"],
  },
];

const EVAL_METRICS = [
  { label: "TEDS-S", value: "1.0", sub: "32,727 grids" },
  { label: "Table F1", value: "1.0", sub: "100% Perfect" },
  { label: "Content Fidelity", value: "1.0", sub: "1,287,613 cells" },
  { label: "KV F1", value: "1.0", sub: "3,392 KV tables" },
  { label: "Documents", value: "38,652", sub: "legal corpus" },
];

export default function TechPage() {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const result = useDemoStore((s) => s.result);

  // Auto-advance pipeline animation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepIdx((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const activeStepId = PIPELINE_STEPS[activeStepIdx]?.id ?? null;

  // Build metrics from demo result if available
  const getMetrics = useCallback(() => {
    if (!result) return undefined;
    return {
      parse: { time_ms: result.parse_time_ms },
      chunk: { time_ms: result.chunk_time_ms, count: result.total_chunks },
      embed: { time_ms: result.embed_time_ms },
    };
  }, [result]);

  return (
    <main className="flex flex-col items-center p-8 flex-1">
      <div className="w-full max-w-6xl flex flex-col gap-16">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            hwptorag 파이프라인 아키텍처
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            HWP 바이너리부터 벡터DB 저장까지 — 구조를 보존하는 엔드투엔드 문서 처리 파이프라인
          </p>
        </div>

        {/* Section 1: Interactive Pipeline Diagram */}
        <section>
          <h2 className="text-xl font-bold tracking-tight mb-6 text-center">
            처리 파이프라인
          </h2>
          <PipelineDiagram activeStep={activeStepId} metrics={getMetrics()} />
        </section>

        {/* Section 2: Technology Cards */}
        <section>
          <h2 className="text-xl font-bold tracking-tight mb-6 text-center">
            핵심 기술
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TECH_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{card.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted mb-3">
                      {card.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-muted/50 text-muted px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Section 3: Live Metrics */}
        <section>
          <h2 className="text-xl font-bold tracking-tight mb-2 text-center">
            실시간 분석 메트릭
          </h2>
          <p className="text-sm text-muted text-center mb-6">
            /demo 페이지에서 파일을 분석하면 여기에 실시간 메트릭이 표시됩니다
          </p>
          <LiveMetrics result={result} />
        </section>

        {/* Section 4: Evaluation Results */}
        <section>
          <h2 className="text-xl font-bold tracking-tight mb-6 text-center">
            대규모 평가 결과
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {EVAL_METRICS.map((metric) => (
              <Card key={metric.label} className="p-4 text-center">
                <p className="text-xs text-muted mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-primary">
                  {metric.value}
                </p>
                <p className="text-xs text-muted mt-1">{metric.sub}</p>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted text-center mt-4">
            38,652건 법률문서 전수 평가 (2026-03-02) | 최대 148,920셀, 6,735병합, rowspan 275
          </p>
        </section>
      </div>
    </main>
  );
}
