"use client";

import { FileUp, Code, Scissors, Cpu, Database, ArrowRight, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { PipelineStep } from "./pipeline-step";
import type { PipelineStepData } from "./pipeline-step";

export const PIPELINE_STEPS: PipelineStepData[] = [
  {
    id: "upload",
    label: "업로드",
    icon: FileUp,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    description: "HWP/HWPX/DOCX 파일 수신",
  },
  {
    id: "parse",
    label: "구조 파싱",
    icon: Code,
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    description: "Rust 엔진으로 구조 보존 파싱",
  },
  {
    id: "chunk",
    label: "시맨틱 청킹",
    icon: Scissors,
    color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    description: "표 원자성 보존 청킹",
  },
  {
    id: "embed",
    label: "임베딩",
    icon: Cpu,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    description: "bge-m3-korean 벡터 변환",
  },
  {
    id: "store",
    label: "벡터DB 저장",
    icon: Database,
    color: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
    description: "Qdrant/Pinecone/Weaviate/Milvus",
  },
];

interface PipelineDiagramProps {
  activeStep: string | null;
  metrics?: Record<string, { time_ms: number; count?: number }>;
}

export function PipelineDiagram({ activeStep, metrics }: PipelineDiagramProps) {
  return (
    <div className="w-full overflow-x-auto">
      {/* Desktop: horizontal */}
      <div className="hidden lg:flex items-center justify-center gap-0">
        {PIPELINE_STEPS.map((step, idx) => (
          <motion.div
            key={step.id}
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.12 }}
          >
            <PipelineStep
              step={step}
              isActive={activeStep === step.id}
              metric={metrics?.[step.id]}
            />
            {idx < PIPELINE_STEPS.length - 1 && (
              <ArrowRight className="h-5 w-5 text-muted mx-3 shrink-0" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="flex lg:hidden flex-col items-center gap-0">
        {PIPELINE_STEPS.map((step, idx) => (
          <motion.div
            key={step.id}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.12 }}
          >
            <PipelineStep
              step={step}
              isActive={activeStep === step.id}
              metric={metrics?.[step.id]}
            />
            {idx < PIPELINE_STEPS.length - 1 && (
              <ArrowDown className="h-5 w-5 text-muted my-2 shrink-0" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
