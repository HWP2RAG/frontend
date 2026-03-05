"use client";

import { Clock, Layers, Cpu, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoStore } from "@/stores/demo-store";

export function DemoResultView() {
  const { result, reset } = useDemoStore();

  if (!result) return null;

  const totalTime =
    result.parse_time_ms + result.chunk_time_ms + result.embed_time_ms;

  return (
    <div className="flex flex-col gap-6">
      {/* Timing stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="파싱"
          value={`${result.parse_time_ms}ms`}
        />
        <StatCard
          icon={<Layers className="h-4 w-4" />}
          label="청킹"
          value={`${result.chunk_time_ms}ms`}
        />
        <StatCard
          icon={<Cpu className="h-4 w-4" />}
          label="임베딩"
          value={`${result.embed_time_ms}ms`}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="총 소요"
          value={`${totalTime}ms`}
        />
      </div>

      {/* Parsed content preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">파싱 결과 미리보기</CardTitle>
          <p className="text-xs text-muted">
            {result.format} | {result.filename}
          </p>
        </CardHeader>
        <CardContent>
          <pre className="max-h-72 overflow-auto rounded-lg bg-muted/30 p-4 text-sm whitespace-pre-wrap break-words font-mono">
            {result.parsed_content_preview}
          </pre>
        </CardContent>
      </Card>

      {/* Chunks preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            청크 목록 ({result.total_chunks}개 중 {result.chunks_preview.length}개)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {result.chunks_preview.map((chunk) => (
            <div
              key={chunk.chunk_index}
              className="rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                  #{chunk.chunk_index}
                </span>
                {chunk.has_table && (
                  <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded">
                    표 포함
                  </span>
                )}
              </div>
              <p className="text-sm text-muted line-clamp-3">{chunk.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Embedding info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">임베딩 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted">모델:</span>{" "}
              <span className="font-medium">{result.embedding_model}</span>
            </div>
            <div>
              <span className="text-muted">차원:</span>{" "}
              <span className="font-medium">{result.embedding_dimension}D</span>
            </div>
          </div>
          {result.chunks_preview[0]?.embedding_preview && (
            <p className="mt-2 text-xs text-muted font-mono">
              [{result.chunks_preview[0].embedding_preview.map((v) => v.toFixed(4)).join(", ")}, ...]
            </p>
          )}
        </CardContent>
      </Card>

      {/* Retry button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={reset} size="lg">
          <RotateCcw className="mr-2 h-4 w-4" />
          다시 시도
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-lg font-bold">{value}</p>
    </Card>
  );
}
