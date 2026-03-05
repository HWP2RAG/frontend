"use client";

import { DemoUploadZone } from "@/components/demo/demo-upload-zone";
import { DemoResultView } from "@/components/demo/demo-result-view";
import { DemoPipelineSteps } from "@/components/demo/demo-pipeline-steps";
import { useDemoStore } from "@/stores/demo-store";

export default function DemoPage() {
  const status = useDemoStore((s) => s.status);

  return (
    <main className="flex flex-col items-center p-8 flex-1">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            HWP 문서를 바로 분석해보세요
          </h1>
          <p className="text-muted max-w-xl mx-auto">
            로그인 없이 HWP, HWPX, DOCX 파일을 업로드하면 파싱, 청킹, 임베딩
            결과를 즉시 확인할 수 있습니다.
          </p>
        </div>

        {/* Pipeline steps (always visible) */}
        <DemoPipelineSteps />

        {/* Main content area */}
        {status === "done" ? (
          <DemoResultView />
        ) : (
          <DemoUploadZone />
        )}

        {/* Rate limit note */}
        <p className="text-center text-xs text-muted">
          하루 5회 무료 분석 가능 | 최대 5MB | 분석 결과는 저장되지 않습니다
        </p>
      </div>
    </main>
  );
}
