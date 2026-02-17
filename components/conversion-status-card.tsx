"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { StageList } from "@/components/stage-list";
import type { ConversionEntry } from "@/stores/conversion-store";

interface ConversionStatusCardProps {
  entry: ConversionEntry;
}

export function ConversionStatusCard({ entry }: ConversionStatusCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {entry.status === "completed"
            ? "변환 완료"
            : entry.status === "failed"
              ? "변환 실패"
              : "변환 중..."}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Progress value={entry.progress} />
        {entry.stages && <StageList stages={entry.stages} />}
        {entry.status === "failed" && entry.error && (
          <p className="text-sm text-red-500">{entry.error}</p>
        )}
        {entry.status === "completed" && (
          <Button asChild className="w-full bg-primary hover:bg-primary-dark text-white">
            <Link href={`/convert/${entry.id}`}>결과 보기</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
