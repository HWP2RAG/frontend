"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface PipelineStepData {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

interface PipelineStepProps {
  step: PipelineStepData;
  isActive: boolean;
  metric?: { time_ms: number; count?: number };
}

export function PipelineStep({ step, isActive, metric }: PipelineStepProps) {
  const Icon = step.icon;

  return (
    <motion.div
      animate={
        isActive
          ? { scale: 1.08, boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)" }
          : { scale: 1, boxShadow: "0 0 0px rgba(0,0,0,0)" }
      }
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`p-4 flex flex-col items-center gap-2 min-w-[120px] transition-colors ${
          isActive
            ? "border-primary bg-primary/5"
            : "border-border"
        }`}
      >
        <div
          className={`rounded-full p-2.5 ${
            isActive ? step.color : "bg-muted/30 text-muted"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-center">{step.label}</span>
        <p className="text-xs text-muted text-center leading-tight">
          {step.description}
        </p>
        {metric && (
          <div className="text-xs font-mono text-primary">
            {metric.time_ms}ms
            {metric.count !== undefined && ` | ${metric.count}개`}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
