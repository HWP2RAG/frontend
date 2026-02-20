"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { InputDisplay, INPUT_TEXT } from "./hero-demo/input-display";
import { OutputDisplay } from "./hero-demo/output-display";

type Phase = "input" | "convert" | "split";

const INPUT_TO_CONVERT_DELAY = 1000;
const BUTTON_CLICK_DELAY = 1500;
const CLICK_TO_SPLIT_DELAY = 600;
const CYCLE_RESET_DELAY = 2000;

export function HeroDemo() {
  const [phase, setPhase] = useState<Phase>("input");
  const [buttonClicked, setButtonClicked] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addTimer = useCallback((id: ReturnType<typeof setTimeout>) => {
    timersRef.current.push(id);
    return id;
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  const handleTypingComplete = useCallback(() => {
    addTimer(
      setTimeout(() => {
        setPhase("convert");
      }, INPUT_TO_CONVERT_DELAY)
    );
  }, [addTimer]);

  const handleCycleComplete = useCallback(() => {
    addTimer(
      setTimeout(() => {
        clearAllTimers();
        setPhase("input");
        setButtonClicked(false);
      }, CYCLE_RESET_DELAY)
    );
  }, [addTimer, clearAllTimers]);

  // Auto-click the convert button
  useEffect(() => {
    if (phase !== "convert") return;

    const clickTimer = addTimer(
      setTimeout(() => {
        setButtonClicked(true);

        addTimer(
          setTimeout(() => {
            setPhase("split");
          }, CLICK_TO_SPLIT_DELAY)
        );
      }, BUTTON_CLICK_DELAY)
    );

    return () => clearTimeout(clickTimer);
  }, [phase, addTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  return (
    <div className="mt-8 w-full max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-sm">
      <AnimatePresence mode="wait">
        {/* Phase 1: Input — full width centered */}
        {phase === "input" && (
          <motion.div
            key="input-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <InputDisplay onTypingComplete={handleTypingComplete} />
          </motion.div>
        )}

        {/* Phase 2: Convert button — centered */}
        {phase === "convert" && (
          <motion.div
            key="convert-phase"
            className="flex items-center justify-center min-h-[200px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className={`
                px-6 py-3 rounded-lg text-base font-medium
                bg-primary text-white
                flex items-center gap-2
                transition-shadow duration-200
                ${buttonClicked ? "ring-4 ring-primary/40 shadow-lg shadow-primary/25" : ""}
              `}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={
                buttonClicked
                  ? { opacity: 1, scale: [1, 0.95, 1] }
                  : { opacity: 1, scale: 1 }
              }
              transition={{ duration: 0.3 }}
            >
              변환하기
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {/* Phase 3: Split — input left, output right */}
        {phase === "split" && (
          <motion.div
            key="split-phase"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Static input */}
            <div className="rounded-lg bg-primary-50 p-4 text-left min-h-[200px]">
              <div className="text-xs text-muted mb-2 font-medium">
                INPUT: HWP
              </div>
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {INPUT_TEXT}
              </pre>
            </div>

            {/* Cycling output */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <OutputDisplay onCycleComplete={handleCycleComplete} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
