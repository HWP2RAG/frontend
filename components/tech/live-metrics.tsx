"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, Layers, Cpu, Hash, Ruler } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DemoPipelineResult } from "@/stores/demo-store";

interface LiveMetricsProps {
  result: DemoPipelineResult | null;
}

const METRIC_DEFS = [
  { key: "parse_time_ms", label: "파싱 시간", icon: Clock, unit: "ms" },
  { key: "chunk_time_ms", label: "청킹 시간", icon: Layers, unit: "ms" },
  { key: "embed_time_ms", label: "임베딩 시간", icon: Cpu, unit: "ms" },
  { key: "total_chunks", label: "총 청크 수", icon: Hash, unit: "개" },
  { key: "embedding_dimension", label: "벡터 차원", icon: Ruler, unit: "D" },
] as const;

export function LiveMetrics({ result }: LiveMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {METRIC_DEFS.map((def) => {
        const Icon = def.icon;
        const value = result
          ? (result[def.key as keyof DemoPipelineResult] as number)
          : null;

        return (
          <Card key={def.key} className="p-4 text-center">
            <Icon className="h-5 w-5 mx-auto text-muted mb-2" />
            <p className="text-xs text-muted mb-1">{def.label}</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={value ?? "empty"}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xl font-bold"
              >
                {value !== null ? `${value}${def.unit}` : "--"}
              </motion.p>
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
}
