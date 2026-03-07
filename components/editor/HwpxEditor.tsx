/**
 * Main HWPX TipTap WYSIWYG editor component.
 *
 * Uses Yjs Collaboration + CollaborationCursor for real-time editing.
 * SSR-safe: exported via next/dynamic with ssr: false.
 *
 * Integrates PresenceOverlay, SaveVersionButton, and EditorToolbar
 * in a unified layout with status indicators.
 *
 * CRITICAL: Collaboration field MUST be 'default' to match backend Hocuspocus config.
 */

'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { allHwpxExtensions } from './extensions';
import { EditorToolbar } from './EditorToolbar';
import { PresenceOverlay } from './PresenceOverlay';
import { SaveVersionButton } from './SaveVersionButton';
import { useHocuspocus } from '@/hooks/use-hocuspocus';
import { useAuthStore } from '@/stores/auth-store';
import { useEditorStore } from '@/stores/editor-store';
import '@/styles/editor.css';

interface HwpxEditorProps {
  documentId: string;
  branch?: string;
}

/** 8-color palette for collaboration cursors */
const CURSOR_COLORS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#009688', '#4caf50',
];

function hashToIndex(str: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % mod;
}

function HwpxEditorInner({ documentId, branch = 'main' }: HwpxEditorProps) {
  const { provider, ydoc, status, error } = useHocuspocus(documentId);
  const user = useAuthStore((s) => s.user);
  const editorStatus = useEditorStore((s) => s.status);

  const userName = user?.name || 'Anonymous';
  const userId = user?.id || 'anon';
  const cursorColor = CURSOR_COLORS[hashToIndex(userId, CURSOR_COLORS.length)];

  const editor = useEditor(
    {
      extensions: [
        ...allHwpxExtensions,
        Collaboration.configure({
          document: ydoc,
          field: 'default',
        }),
        ...(provider
          ? [
              CollaborationCursor.configure({
                provider,
                user: { name: userName, color: cursorColor },
              }),
            ]
          : []),
      ],
      editorProps: {
        attributes: {
          class:
            'prose prose-sm dark:prose-invert max-w-none min-h-[500px] p-4 focus:outline-none',
        },
      },
      immediatelyRender: false,
    },
    [provider],
  );

  // Cleanup: reset editor store on unmount
  useEffect(() => {
    return () => {
      useEditorStore.getState().reset();
    };
  }, []);

  if (error || editorStatus === 'error') {
    return (
      <div className="rounded-md border border-destructive p-4 text-destructive">
        <p className="font-medium">Connection Error</p>
        <p className="text-sm">{error || 'Unknown error'}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (status === 'connecting' || editorStatus === 'connecting') {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Connecting to document...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      {/* Top bar: toolbar + presence + save */}
      <div className="flex items-center justify-between border-b">
        <EditorToolbar editor={editor} />
        <div className="flex items-center gap-2 px-2">
          <PresenceOverlay provider={provider} />
          <SaveVersionButton documentId={documentId} branch={branch} />
        </div>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}

export default HwpxEditorInner;
