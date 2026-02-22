import { create } from "zustand";
import { API_BASE_URL } from "@/lib/env";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

const MAX_BATCH_FILES = 20;
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export interface BatchFile {
  filename: string;
  fileSize: number;
  file: File;
  uploadId?: string;
  conversionId?: string;
  status: "pending" | "uploading" | "processing" | "completed" | "failed";
  progress: number;
  error?: string;
}

export interface BatchState {
  batchId: string | null;
  files: BatchFile[];
  overallStatus: "idle" | "uploading" | "processing" | "completed" | "failed";
  completedCount: number;
  failedCount: number;
  totalCount: number;
  selectedFormat: string;
  pollingTimer: ReturnType<typeof setInterval> | null;

  // Actions
  setSelectedFormat: (format: string) => void;
  addFiles: (files: File[]) => void;
  removeFile: (filename: string) => void;
  startBatch: () => Promise<void>;
  retryFile: (conversionId: string) => Promise<void>;
  reset: () => void;
}

/**
 * Upload chunks for a file using an existing uploadId (skip init step).
 * Used by batch flow where the backend already created upload sessions.
 */
async function uploadChunkedWithSession(
  file: File,
  uploadId: string,
  options?: { onProgress?: (p: number) => void; signal?: AbortSignal },
): Promise<void> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    if (options?.signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("chunkIndex", String(i));
    formData.append("totalChunks", String(totalChunks));

    const res = await fetch(`${API_BASE_URL}/api/upload/${uploadId}/chunk`, {
      method: "POST",
      body: formData,
      signal: options?.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Chunk ${i} failed (${res.status}): ${body}`);
    }

    options?.onProgress?.(Math.round(((i + 1) / totalChunks) * 100));
  }

  const completeRes = await fetch(`${API_BASE_URL}/api/upload/${uploadId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: options?.signal,
  });

  if (!completeRes.ok) {
    const body = await completeRes.text().catch(() => "");
    throw new Error(`Complete failed (${completeRes.status}): ${body}`);
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const useBatchStore = create<BatchState>()((set, get) => ({
  batchId: null,
  files: [],
  overallStatus: "idle",
  completedCount: 0,
  failedCount: 0,
  totalCount: 0,
  selectedFormat: "markdown",
  pollingTimer: null,

  setSelectedFormat: (format) => set({ selectedFormat: format }),

  addFiles: (files) => {
    const state = get();
    const total = state.files.length + files.length;
    if (total > MAX_BATCH_FILES) {
      toast.error("최대 20개의 파일만 일괄 변환할 수 있습니다");
      return;
    }

    const newFiles: BatchFile[] = files.map((f) => ({
      filename: f.name,
      fileSize: f.size,
      file: f,
      status: "pending" as const,
      progress: 0,
    }));

    set({ files: [...state.files, ...newFiles] });
  },

  removeFile: (filename) => {
    const state = get();
    if (state.overallStatus !== "idle") return;
    set({ files: state.files.filter((f) => f.filename !== filename) });
  },

  startBatch: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      toast.error("일괄 변환은 로그인이 필요합니다");
      return;
    }

    const state = get();
    const { files, selectedFormat } = state;

    // Build request body
    const requestBody = {
      files: files.map((f) => ({
        filename: f.filename,
        fileSize: f.fileSize,
        totalChunks: Math.ceil(f.fileSize / CHUNK_SIZE),
      })),
      outputFormat: selectedFormat,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/batch/init`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        toast.error(body.message || `일괄 변환 초기화 실패 (${res.status})`);
        return;
      }

      const data = await res.json();
      const batchId = data.batchId as string;

      // Update files with uploadId and conversionId from response
      const updatedFiles = state.files.map((f) => {
        const match = data.files.find(
          (rf: { filename: string; uploadId: string; conversionId: string }) =>
            rf.filename === f.filename,
        );
        if (match) {
          return {
            ...f,
            uploadId: match.uploadId,
            conversionId: match.conversionId,
          };
        }
        return f;
      });

      set({
        batchId,
        files: updatedFiles,
        overallStatus: "uploading",
        totalCount: updatedFiles.length,
      });

      // Upload files sequentially
      const currentFiles = get().files;
      for (const file of currentFiles) {
        if (!file.uploadId) continue;

        // Set file status to uploading
        set((s) => ({
          files: s.files.map((f) =>
            f.filename === file.filename ? { ...f, status: "uploading" as const } : f,
          ),
        }));

        try {
          await uploadChunkedWithSession(file.file, file.uploadId, {
            onProgress: (p) => {
              set((s) => ({
                files: s.files.map((f) =>
                  f.filename === file.filename ? { ...f, progress: p } : f,
                ),
              }));
            },
          });

          // Upload succeeded -> processing
          set((s) => ({
            files: s.files.map((f) =>
              f.filename === file.filename
                ? { ...f, status: "processing" as const, progress: 100 }
                : f,
            ),
          }));
        } catch (err) {
          const message = err instanceof Error ? err.message : "업로드 실패";
          set((s) => ({
            files: s.files.map((f) =>
              f.filename === file.filename
                ? { ...f, status: "failed" as const, error: message }
                : f,
            ),
          }));
        }
      }

      // All uploads done -> start polling
      set({ overallStatus: "processing" });
      startPolling();
    } catch (err) {
      const message = err instanceof Error ? err.message : "일괄 변환 초기화 실패";
      toast.error(message);
    }
  },

  retryFile: async (conversionId) => {
    const state = get();
    if (!state.batchId) return;

    const file = state.files.find((f) => f.conversionId === conversionId);
    if (!file) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/batch/${state.batchId}/retry/${conversionId}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        toast.error(body.message || "재시도 실패");
        return;
      }

      const data = await res.json();
      const newUploadId = data.uploadId as string;

      // Reset file status
      set((s) => ({
        files: s.files.map((f) =>
          f.conversionId === conversionId
            ? { ...f, status: "uploading" as const, progress: 0, error: undefined, uploadId: newUploadId }
            : f,
        ),
      }));

      // Re-upload the file
      await uploadChunkedWithSession(file.file, newUploadId, {
        onProgress: (p) => {
          set((s) => ({
            files: s.files.map((f) =>
              f.conversionId === conversionId ? { ...f, progress: p } : f,
            ),
          }));
        },
      });

      // Upload succeeded -> processing
      set((s) => ({
        files: s.files.map((f) =>
          f.conversionId === conversionId
            ? { ...f, status: "processing" as const, progress: 100 }
            : f,
        ),
        overallStatus: "processing",
      }));

      // Restart polling if not already polling
      if (!get().pollingTimer) {
        startPolling();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "재시도 실패";
      set((s) => ({
        files: s.files.map((f) =>
          f.conversionId === conversionId
            ? { ...f, status: "failed" as const, error: message }
            : f,
        ),
      }));
    }
  },

  reset: () => {
    const timer = get().pollingTimer;
    if (timer) clearInterval(timer);
    set({
      batchId: null,
      files: [],
      overallStatus: "idle",
      completedCount: 0,
      failedCount: 0,
      totalCount: 0,
      selectedFormat: "markdown",
      pollingTimer: null,
    });
  },
}));

/**
 * Start polling batch status. Called internally after uploads complete.
 */
function startPolling() {
  const state = useBatchStore.getState();
  if (state.pollingTimer) clearInterval(state.pollingTimer);

  let intervalMs = 2000;

  const poll = async () => {
    const { batchId } = useBatchStore.getState();
    if (!batchId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/batch/${batchId}/status`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) return;

      const data = await res.json();

      const completedCount = data.completedCount as number;
      const failedCount = data.failedCount as number;
      const totalCount = data.totalCount as number;

      // Update file statuses from polling response
      useBatchStore.setState((s) => {
        const updatedFiles = s.files.map((f) => {
          const match = (data.files as Array<{
            conversionId: string;
            status: string;
            progress: number;
            error?: string;
          }>).find((rf) => rf.conversionId === f.conversionId);

          if (match) {
            return {
              ...f,
              status: match.status as BatchFile["status"],
              progress: match.progress,
              error: match.error,
            };
          }
          return f;
        });

        // Derive overall status
        const allDone = completedCount + failedCount === totalCount && totalCount > 0;
        let overallStatus: BatchState["overallStatus"] = "processing";
        if (allDone) {
          overallStatus = failedCount === totalCount ? "failed" : "completed";
        }

        return {
          files: updatedFiles,
          completedCount,
          failedCount,
          totalCount,
          overallStatus,
        };
      });

      // Check terminal state
      const allDone = completedCount + failedCount === totalCount && totalCount > 0;
      if (allDone) {
        const timer = useBatchStore.getState().pollingTimer;
        if (timer) clearInterval(timer);
        useBatchStore.setState({ pollingTimer: null });
        return;
      }

      // Adaptive polling: back off when >80% done
      if (completedCount + failedCount > 0.8 * totalCount && intervalMs === 2000) {
        intervalMs = 5000;
        const oldTimer = useBatchStore.getState().pollingTimer;
        if (oldTimer) clearInterval(oldTimer);
        const newTimer = setInterval(poll, intervalMs);
        useBatchStore.setState({ pollingTimer: newTimer });
      }
    } catch {
      // Polling error - continue trying
    }
  };

  const timer = setInterval(poll, intervalMs);
  useBatchStore.setState({ pollingTimer: timer });

  // Run first poll immediately
  poll();
}
