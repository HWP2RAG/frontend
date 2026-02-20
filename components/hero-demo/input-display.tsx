"use client";

import { Typewriter } from "./typewriter";

const INPUT_TEXT = `연구 보고서
본 연구는 자연어 처리 기술을
활용한 문서 분석 방법론을
제시합니다.
항목    정확도   속도
모델 A  95.2%  120ms
모델 B  97.8%   85ms`;

interface InputDisplayProps {
  onTypingComplete: () => void;
}

export function InputDisplay({ onTypingComplete }: InputDisplayProps) {
  return (
    <div className="rounded-lg bg-primary-50 p-4 text-left min-h-[200px]">
      <div className="text-xs text-muted mb-2 font-medium">INPUT: HWP</div>
      <pre className="text-sm font-mono whitespace-pre-wrap">
        <Typewriter
          text={INPUT_TEXT}
          speed={20}
          onComplete={onTypingComplete}
        />
      </pre>
    </div>
  );
}

export { INPUT_TEXT };
