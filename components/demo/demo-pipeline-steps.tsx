"use client";

import { Upload, Code, Scissors, Cpu, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { DemoStatus } from "@/stores/demo-store";
import { useDemoStore } from "@/stores/demo-store";

const STEPS = [
  { id: "upload", label: "업로드", icon: Upload, activeOn: ["uploading"] },
  { id: "parse", label: "파싱", icon: Code, activeOn: ["processing"] },
  { id: "chunk", label: "청킹", icon: Scissors, activeOn: ["processing"] },
  { id: "embed", label: "임베딩", icon: Cpu, activeOn: ["processing"] },
] as const;

function getStepState(
  step: (typeof STEPS)[number],
  status: DemoStatus,
  idx: number
): "idle" | "active" | "done" {
  if (status === "done") return "done";
  if (status === "idle" || status === "error") return "idle";

  // uploading: step 0 active
  if (status === "uploading") {
    return idx === 0 ? "active" : "idle";
  }

  // processing: step 1-3 active sequentially (simplified: all show active)
  if (status === "processing") {
    if (idx === 0) return "done";
    return "active";
  }

  return "idle";
}

export function DemoPipelineSteps() {
  const status = useDemoStore((s) => s.status);
  const result = useDemoStore((s) => s.result);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-0">
      {STEPS.map((step, idx) => {
        const state = getStepState(step, status, idx);
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center gap-2 lg:gap-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
                state === "active"
                  ? "bg-primary/10 text-primary scale-105 shadow-sm"
                  : state === "done"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-muted/30 text-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium whitespace-nowrap">
                {step.label}
              </span>
              {state === "done" && result && idx === 1 && (
                <span className="text-xs">{result.parse_time_ms}ms</span>
              )}
              {state === "done" && result && idx === 2 && (
                <span className="text-xs">{result.chunk_time_ms}ms</span>
              )}
              {state === "done" && result && idx === 3 && (
                <span className="text-xs">{result.embed_time_ms}ms</span>
              )}
              {state === "active" && (
                <motion.div
                  className="h-2 w-2 rounded-full bg-primary"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>

            {idx < STEPS.length - 1 && (
              <ArrowRight className="hidden lg:block h-4 w-4 text-muted mx-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}
