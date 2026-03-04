"use client";

import dynamic from "next/dynamic";

const DiffViewerInner = dynamic(
  () =>
    import("./diff-viewer-inner").then((mod) => ({
      default: mod.DiffViewerInner,
    })),
  {
    ssr: false,
    loading: () => <div className="animate-pulse h-64 bg-muted rounded" />,
  }
);

interface DiffViewerProps {
  originalXml: string;
  modifiedXml: string;
  mode: "side-by-side" | "unified";
}

export function DiffViewer({ originalXml, modifiedXml, mode }: DiffViewerProps) {
  return (
    <DiffViewerInner
      originalXml={originalXml}
      modifiedXml={modifiedXml}
      mode={mode}
    />
  );
}
