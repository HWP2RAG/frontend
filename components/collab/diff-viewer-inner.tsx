"use client";

import { useRef, useEffect, useState } from "react";
import { MergeView } from "@codemirror/merge";
import { xml } from "@codemirror/lang-xml";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { useTheme } from "next-themes";

interface DiffViewerInnerProps {
  originalXml: string;
  modifiedXml: string;
  mode: "side-by-side" | "unified";
}

export function DiffViewerInner({
  originalXml,
  modifiedXml,
  mode,
}: DiffViewerInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MergeView | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    // Destroy previous instance
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    const isDark = resolvedTheme === "dark";

    const darkTheme = EditorView.theme(
      {
        "&": { backgroundColor: "hsl(var(--card))" },
        ".cm-content": { color: "hsl(var(--card-foreground))" },
        ".cm-gutters": {
          backgroundColor: "hsl(var(--muted))",
          color: "hsl(var(--muted-foreground))",
          borderRight: "1px solid hsl(var(--border))",
        },
        ".cm-mergeView .cm-changedLine": {
          backgroundColor: "rgba(234, 179, 8, 0.15)",
        },
        ".cm-mergeView .cm-insertedLine": {
          backgroundColor: "rgba(34, 197, 94, 0.15)",
        },
        ".cm-mergeView .cm-deletedLine": {
          backgroundColor: "rgba(239, 68, 68, 0.15)",
        },
        ".cm-mergeView .cm-changedText": {
          backgroundColor: "rgba(234, 179, 8, 0.3)",
        },
        ".cm-mergeView .cm-insertedText": {
          backgroundColor: "rgba(34, 197, 94, 0.3)",
        },
        ".cm-mergeView .cm-deletedText": {
          backgroundColor: "rgba(239, 68, 68, 0.3)",
        },
      },
      { dark: true }
    );

    const lightTheme = EditorView.theme({
      ".cm-mergeView .cm-changedLine": {
        backgroundColor: "rgba(234, 179, 8, 0.1)",
      },
      ".cm-mergeView .cm-insertedLine": {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
      },
      ".cm-mergeView .cm-deletedLine": {
        backgroundColor: "rgba(239, 68, 68, 0.1)",
      },
      ".cm-mergeView .cm-changedText": {
        backgroundColor: "rgba(234, 179, 8, 0.25)",
      },
      ".cm-mergeView .cm-insertedText": {
        backgroundColor: "rgba(34, 197, 94, 0.25)",
      },
      ".cm-mergeView .cm-deletedText": {
        backgroundColor: "rgba(239, 68, 68, 0.25)",
      },
    });

    const sharedExtensions = [
      xml(),
      EditorView.editable.of(false),
      EditorState.readOnly.of(true),
      EditorView.lineWrapping,
      isDark ? darkTheme : lightTheme,
    ];

    const mergeView = new MergeView({
      parent: containerRef.current,
      a: {
        doc: originalXml,
        extensions: sharedExtensions,
      },
      b: {
        doc: modifiedXml,
        extensions: sharedExtensions,
      },
      collapseUnchanged: { margin: 3, minSize: 4 },
      orientation: mode === "unified" ? undefined : undefined,
      revertControls: mode === "unified" ? "a-to-b" : undefined,
    });

    viewRef.current = mergeView;

    return () => {
      mergeView.destroy();
      viewRef.current = null;
    };
  }, [originalXml, modifiedXml, mode, resolvedTheme, mounted]);

  if (!mounted) {
    return <div className="animate-pulse h-[500px] bg-muted rounded" />;
  }

  return (
    <div
      ref={containerRef}
      className="diff-viewer-container border border-border rounded-md overflow-hidden max-h-[500px] overflow-y-auto"
    />
  );
}
