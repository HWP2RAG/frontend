"use client";

import { useState, useEffect, useRef } from "react";

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export function Typewriter({
  text,
  speed = 30,
  onComplete,
  className,
}: TypewriterProps) {
  const [charCount, setCharCount] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setCharCount(text.length);
      onCompleteRef.current?.();
      return;
    }

    setCharCount(0);
    let index = 0;

    const interval = setInterval(() => {
      index++;
      setCharCount(index);
      if (index >= text.length) {
        clearInterval(interval);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  const isTyping = charCount < text.length;

  return (
    <span className={className}>
      {text.slice(0, charCount)}
      {isTyping && <span className="animate-pulse">&#9612;</span>}
    </span>
  );
}
