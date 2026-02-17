"use client";

import { useUploadStore } from "@/stores/upload-store";
import { FileListItem } from "./file-list-item";

export function FileList() {
  const files = useUploadStore((s) => s.files);

  if (files.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-2" data-testid="file-list">
      {files.map((file) => (
        <FileListItem key={file.id} file={file} />
      ))}
    </div>
  );
}
