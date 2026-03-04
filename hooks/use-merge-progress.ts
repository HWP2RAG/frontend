"use client";

import { useState, useEffect, useRef } from "react";

const COLLAB_API_URL =
  process.env.NEXT_PUBLIC_COLLAB_API_URL ?? "http://localhost:3001/api";

interface MergeProgress {
  progress: number; // 0-100
  stage: string;
}

export function useMergeProgress(documentId: string | null): MergeProgress | null {
  const [mergeProgress, setMergeProgress] = useState<MergeProgress | null>(
    null
  );
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!documentId) return;

    const url = `${COLLAB_API_URL}/v1/collab/documents/${documentId}/events`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("merge-progress", (event) => {
      try {
        const data = JSON.parse(event.data) as MergeProgress;
        setMergeProgress(data);
      } catch {
        // Ignore malformed events
      }
    });

    eventSource.onerror = () => {
      // SSE connection lost; will auto-reconnect per spec
      // No action needed
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      setMergeProgress(null);
    };
  }, [documentId]);

  return mergeProgress;
}
