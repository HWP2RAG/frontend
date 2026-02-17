"use client";

import { useEffect } from "react";
import { UploadZone } from "@/components/upload-zone";
import { FileList } from "@/components/file-list";
import { UsageIndicator } from "@/components/usage-indicator";
import { ConversionStatusCard } from "@/components/conversion-status-card";
import { useUploadStore } from "@/stores/upload-store";
import { useConversionStore } from "@/stores/conversion-store";

export default function ConvertPage() {
  const files = useUploadStore((s) => s.files);
  const conversions = useConversionStore((s) => s.conversions);

  const completedFiles = files.filter((f) => f.status === "success" && f.conversionId);
  const conversionEntries = completedFiles
    .map((f) => conversions[f.conversionId!])
    .filter(Boolean);

  useEffect(() => {
    return () => {
      useConversionStore.getState().reset();
    };
  }, []);

  return (
    <main className="flex flex-col items-center justify-center p-8 flex-1">
      <div className="w-full max-w-xl flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            HWP 문서 변환
          </h1>
          <p className="text-sm text-muted">
            HWP 파일을 업로드하면 AI/RAG에 최적화된 형태로 변환합니다
          </p>
        </div>

        <UsageIndicator />

        <UploadZone />
        <FileList />

        {conversionEntries.map((entry) => (
          <ConversionStatusCard key={entry.id} entry={entry} />
        ))}
      </div>
    </main>
  );
}
