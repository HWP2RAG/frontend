import { API_BASE_URL } from "@/lib/env";
import { useAuthStore } from "@/stores/auth-store";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadResult {
  uploadId: string;
  filename: string;
  status: string;
  conversionId: string;
}

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
  outputFormat?: string;
}

export async function uploadChunked(
  file: File,
  options?: UploadOptions
): Promise<UploadResult> {
  const { onProgress, signal, outputFormat } = options ?? {};
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  // Get auth token
  const token = useAuthStore.getState().token;
  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    authHeaders["Authorization"] = `Bearer ${token}`;
  }

  // 1. Init upload
  const initRes = await fetch(`${API_BASE_URL}/api/upload/init`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      filename: file.name,
      fileSize: file.size,
      totalChunks,
      outputFormat: outputFormat ?? "markdown",
    }),
    signal,
  });

  if (!initRes.ok) throw new Error("Upload init failed");
  const { uploadId } = await initRes.json();

  // 2. Upload chunks
  for (let i = 0; i < totalChunks; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("chunkIndex", String(i));

    // Use fetch for chunk upload (XHR progress not reliable in jsdom/SSR)
    const chunkRes = await fetch(
      `${API_BASE_URL}/api/upload/${uploadId}/chunk`,
      {
        method: "POST",
        body: formData,
        signal,
      }
    );

    if (!chunkRes.ok) throw new Error(`Chunk ${i} upload failed`);

    // Report progress after each chunk
    const progress = Math.round(((i + 1) / totalChunks) * 100);
    onProgress?.(progress);
  }

  // 3. Complete upload
  const completeRes = await fetch(
    `${API_BASE_URL}/api/upload/${uploadId}/complete`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
    }
  );

  if (!completeRes.ok) throw new Error("Upload complete failed");
  return completeRes.json();
}
