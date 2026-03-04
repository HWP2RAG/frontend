"use client";

import { useState, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { downloadHwpx } from "@/lib/collab-api";

interface ExportButtonProps {
  documentId: string;
  commitSha: string;
  disabled?: boolean;
}

export function ExportButton({
  documentId,
  commitSha,
  disabled = false,
}: ExportButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      const blob = await downloadHwpx(documentId, commitSha);

      // Create download via browser API
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document_${commitSha.slice(0, 8)}.hwpx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("HWPX 파일이 다운로드되었습니다");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "다운로드 중 오류가 발생했습니다";
      toast.error(message);
    } finally {
      setIsDownloading(false);
    }
  }, [documentId, commitSha]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={disabled || isDownloading}
    >
      {isDownloading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
          다운로드 중...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-1" />
          HWPX 다운로드
        </>
      )}
    </Button>
  );
}
