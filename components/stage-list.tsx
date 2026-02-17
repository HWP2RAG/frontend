import type { components } from "@/api/types";

type ConversionStage = components["schemas"]["ConversionStage"];

const STAGE_LABELS: Record<string, string> = {
  parsing: "HWP 파싱",
  converting: "포맷 변환",
};

interface StageListProps {
  stages: ConversionStage[];
}

export function StageList({ stages }: StageListProps) {
  return (
    <div className="flex flex-col gap-2">
      {stages.map((stage, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                stage.status === "completed"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : stage.status === "in_progress"
                    ? "bg-primary-50 text-primary animate-pulse"
                    : stage.status === "failed"
                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      : "bg-border text-muted"
              }`}
            >
              {stage.status === "completed" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              ) : stage.status === "in_progress" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
              ) : stage.status === "failed" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              ) : (
                <span className="h-2 w-2 rounded-full bg-muted" />
              )}
            </div>
            {i < stages.length - 1 && (
              <div className={`w-0.5 h-4 ${stage.status === "completed" ? "bg-green-300 dark:bg-green-700" : "bg-border"}`} />
            )}
          </div>
          <span
            className={`text-sm ${
              stage.status === "completed"
                ? "text-foreground"
                : stage.status === "in_progress"
                  ? "text-primary font-medium"
                  : "text-muted"
            }`}
          >
            {STAGE_LABELS[stage.name] || stage.name}
          </span>
        </div>
      ))}
    </div>
  );
}
