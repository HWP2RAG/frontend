"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";

const FORMAT_EXTENSIONS: Record<string, string> = {
  markdown: ".md",
  json: ".json",
  plaintext: ".txt",
  "rag-json": ".json",
};

interface DownloadButtonProps {
  content: string;
  format: string;
  filename?: string;
}

export function DownloadButton({ content, format, filename = "converted" }: DownloadButtonProps) {
  const handleDownload = useCallback(() => {
    const ext = FORMAT_EXTENSIONS[format] || ".txt";
    const mimeType = format.includes("json") ? "application/json" : "text/plain";
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content, format, filename]);

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} title="다운로드">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
      <span className="ml-1">다운로드</span>
    </Button>
  );
}
