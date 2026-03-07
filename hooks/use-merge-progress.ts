"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";

const COLLAB_API_URL =
  process.env.NEXT_PUBLIC_COLLAB_API_URL ?? "https://hwptorag-server-production.up.railway.app/api";

interface SSEProgress {
  progress: number;
  stage: string;
}

function useSSEProgress(
  documentId: string | null,
  eventName: string
): SSEProgress | null {
  const [progress, setProgress] = useState<SSEProgress | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const connect = useCallback(async () => {
    if (!documentId) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const token = await useAuthStore.getState().ensureFreshToken();
    const headers: Record<string, string> = { Accept: "text/event-stream" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const res = await fetch(
        `${COLLAB_API_URL}/v1/collab/documents/${documentId}/events`,
        { headers, signal: controller.signal }
      );

      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ") && currentEvent === eventName) {
            try {
              const data = JSON.parse(line.slice(6)) as SSEProgress;
              setProgress(data);
            } catch {
              // ignore malformed data
            }
          } else if (line === "") {
            currentEvent = "";
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Connection lost — retry after delay
      if (!controller.signal.aborted) {
        setTimeout(() => connect(), 3000);
      }
    }
  }, [documentId, eventName]);

  useEffect(() => {
    connect();
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
      setProgress(null);
    };
  }, [connect]);

  return progress;
}

export function useMergeProgress(documentId: string | null): SSEProgress | null {
  return useSSEProgress(documentId, "merge-progress");
}

export function useIngestProgress(documentId: string | null): SSEProgress | null {
  return useSSEProgress(documentId, "ingest-progress");
}

export function useGovernanceProgress(documentId: string | null): SSEProgress | null {
  return useSSEProgress(documentId, "governance-progress");
}
