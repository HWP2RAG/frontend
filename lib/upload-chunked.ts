import { API_BASE_URL } from "@/lib/env";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadResult {
  uploadId: string;
  filename: string;
  status: string;
}

export async function uploadChunked(
  file: File,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<UploadResult> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  // 1. Init upload
  const initRes = await fetch(`${API_BASE_URL}/api/upload/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      fileSize: file.size,
      totalChunks,
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
