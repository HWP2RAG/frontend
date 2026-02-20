"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Typewriter } from "./typewriter";

interface OutputFormat {
  label: string;
  content: string;
}

const OUTPUT_FORMATS: OutputFormat[] = [
  {
    label: "Markdown",
    content: `# 연구 보고서

본 연구는 자연어 처리 기술을
활용한 문서 분석 방법론을
제시합니다.

| 항목 | 정확도 | 속도  |
|------|--------|-------|
| 모델 A | 95.2% | 120ms |
| 모델 B | 97.8% | 85ms  |`,
  },
  {
    label: "JSON",
    content: `{
  "title": "연구 보고서",
  "content": "본 연구는 자연어 처리 기술을 활용한 문서 분석 방법론을 제시합니다.",
  "metadata": {
    "accuracy": "97.8%",
    "speed": "85ms"
  }
}`,
  },
  {
    label: "Plain Text",
    content: `연구 보고서

본 연구는 자연어 처리 기술을 활용한 문서 분석 방법론을 제시합니다.

정확도: 97.8% | 속도: 85ms`,
  },
  {
    label: "RAG-JSON",
    content: `[
  {
    "chunk_id": 1,
    "text": "본 연구는 자연어 처리 기술을 활용한 문서 분석 방법론을 제시합니다.",
    "metadata": {
      "source": "연구 보고서"
    }
  }
]`,
  },
];

const HOLD_DURATION = 3000;

interface OutputDisplayProps {
  onCycleComplete?: () => void;
}

export function OutputDisplay({ onCycleComplete }: OutputDisplayProps) {
  const [formatIndex, setFormatIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCycleCompleteRef = useRef(onCycleComplete);

  useEffect(() => {
    onCycleCompleteRef.current = onCycleComplete;
  }, [onCycleComplete]);

  const handleTypingComplete = useCallback(() => {
    setTypingDone(true);
  }, []);

  useEffect(() => {
    if (!typingDone) return;

    holdTimerRef.current = setTimeout(() => {
      const nextIndex = (formatIndex + 1) % OUTPUT_FORMATS.length;

      if (nextIndex === 0) {
        onCycleCompleteRef.current?.();
      }

      setFormatIndex(nextIndex);
      setTypingDone(false);
    }, HOLD_DURATION);

    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, [typingDone, formatIndex]);

  const current = OUTPUT_FORMATS[formatIndex];

  return (
    <div className="rounded-lg bg-surface border border-border p-4 text-left min-h-[200px]">
      <div className="text-xs text-muted mb-2 font-medium">
        OUTPUT: {current.label}
      </div>
      <AnimatePresence mode="wait">
        <motion.pre
          key={formatIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xs text-foreground/80 font-mono whitespace-pre-wrap"
        >
          <Typewriter
            text={current.content}
            speed={15}
            onComplete={handleTypingComplete}
          />
        </motion.pre>
      </AnimatePresence>
    </div>
  );
}

export { OUTPUT_FORMATS };
