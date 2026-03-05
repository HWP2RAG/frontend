import { create } from "zustand";
import { API_BASE_URL } from "@/lib/env";

export interface DemoChunkItem {
  text: string;
  chunk_index: number;
  has_table: boolean;
  metadata: Record<string, unknown>;
  embedding_preview: number[];
}

export interface DemoPipelineResult {
  format: string;
  filename: string;
  parsed_content_preview: string;
  parse_time_ms: number;
  chunk_time_ms: number;
  embed_time_ms: number;
  total_chunks: number;
  embedding_model: string;
  embedding_dimension: number;
  chunks_preview: DemoChunkItem[];
}

export type DemoStatus = "idle" | "uploading" | "processing" | "done" | "error";

interface DemoState {
  file: File | null;
  status: DemoStatus;
  result: DemoPipelineResult | null;
  error: string | null;
  setFile: (file: File | null) => void;
  reset: () => void;
  runDemo: () => Promise<void>;
}

export const useDemoStore = create<DemoState>((set, get) => ({
  file: null,
  status: "idle",
  result: null,
  error: null,

  setFile: (file) => set({ file, error: null }),

  reset: () =>
    set({ file: null, status: "idle", result: null, error: null }),

  runDemo: async () => {
    const { file } = get();
    if (!file) return;

    set({ status: "uploading", error: null, result: null });

    try {
      const formData = new FormData();
      formData.append("file", file);

      set({ status: "processing" });

      const res = await fetch(
        `${API_BASE_URL}/api/v1/demo/pipeline?output_format=markdown&chunking_strategy=structure_preserving`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.status === 429) {
        set({
          status: "error",
          error: "일일 무료 분석 횟수를 초과했습니다. 내일 다시 시도해주세요.",
        });
        return;
      }

      if (res.status === 413) {
        set({
          status: "error",
          error: "파일 크기가 5MB를 초과합니다. 더 작은 파일로 시도해주세요.",
        });
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        set({
          status: "error",
          error:
            body?.detail ||
            body?.message ||
            `분석 중 오류가 발생했습니다 (${res.status})`,
        });
        return;
      }

      const data: DemoPipelineResult = await res.json();
      set({ status: "done", result: data });
    } catch (err) {
      set({
        status: "error",
        error:
          err instanceof Error
            ? err.message
            : "네트워크 오류가 발생했습니다.",
      });
    }
  },
}));
