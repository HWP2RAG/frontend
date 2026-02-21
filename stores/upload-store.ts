import { create } from "zustand";
import { validateFile } from "@/lib/validate-hwp";
import { uploadChunked } from "@/lib/upload-chunked";
import { useConversionStore } from "@/stores/conversion-store";
import { toast } from "sonner";

export type FileStatus = "pending" | "validating" | "uploading" | "success" | "error";

export interface UploadFile {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
  uploadId?: string;
  conversionId?: string;
}

const MAX_FILES = 3;

interface UploadStore {
  files: UploadFile[];
  lastError: string | null;
  selectedFormat: string;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  setFileStatus: (id: string, status: FileStatus, error?: string) => void;
  setSelectedFormat: (format: string) => void;
  startUpload: () => void;
  retryFile: (id: string) => void;
  reset: () => void;
}

async function processFile(id: string, file: File) {
  const { setFileStatus, updateProgress } = useUploadStore.getState();

  setFileStatus(id, "validating");
  const result = await validateFile(file);

  if (!result.valid) {
    setFileStatus(id, "error", result.error);
    toast.error(result.error!);
    return;
  }

  setFileStatus(id, "uploading");
  try {
    const { selectedFormat } = useUploadStore.getState();
    const response = await uploadChunked(file, {
      onProgress: (p) => updateProgress(id, p),
      outputFormat: selectedFormat,
    });
    const conversionId = response.conversionId;
    useUploadStore.getState().setFileStatus(id, "success");
    useUploadStore.setState((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, uploadId: response.uploadId, conversionId } : f
      ),
    }));
    useConversionStore.getState().startPolling(conversionId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "업로드 실패";
    setFileStatus(id, "error", message);
  }
}

export const useUploadStore = create<UploadStore>()((set) => ({
  files: [],
  lastError: null,
  selectedFormat: "markdown",

  addFiles: (files) =>
    set((state) => {
      if (state.files.length + files.length > MAX_FILES) {
        return { lastError: "최대 3개의 파일만 업로드할 수 있습니다" };
      }
      const newFiles: UploadFile[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: "pending" as const,
        progress: 0,
      }));
      return { files: [...state.files, ...newFiles], lastError: null };
    }),

  removeFile: (id) =>
    set((state) => ({ files: state.files.filter((f) => f.id !== id) })),

  updateProgress: (id, progress) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, progress: Math.max(0, Math.min(100, progress)) } : f
      ),
    })),

  setFileStatus: (id, status, error?) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, status, error } : f
      ),
    })),

  setSelectedFormat: (format) => set({ selectedFormat: format }),

  startUpload: () => {
    const { files } = useUploadStore.getState();
    const pending = files.filter((f) => f.status === "pending");
    pending.forEach((f) => processFile(f.id, f.file));
  },

  retryFile: (id) => {
    const file = useUploadStore.getState().files.find((f) => f.id === id);
    if (!file || file.status !== "error") return;
    useUploadStore.getState().updateProgress(id, 0);
    useUploadStore.getState().setFileStatus(id, "validating");
    processFile(id, file.file);
  },

  reset: () => set({ files: [], lastError: null, selectedFormat: "markdown" }),
}));
