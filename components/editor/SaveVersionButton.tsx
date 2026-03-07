/**
 * SaveVersionButton -- triggers VCS snapshot via CommitBridge.
 *
 * Shows loading/success/error states with appropriate icons.
 * Calls snapshotDocument() from collab-api.ts.
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Save, Check, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useEditorStore } from '@/stores/editor-store';
import { snapshotDocument } from '@/lib/collab-api';

interface SaveVersionButtonProps {
  documentId: string;
  branch?: string;
}

export function SaveVersionButton({ documentId, branch = 'main' }: SaveVersionButtonProps) {
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus);
  const setLastSaved = useEditorStore((s) => s.setLastSaved);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear "saved" state after 3 seconds
  useEffect(() => {
    if (saveStatus === 'saved') {
      timerRef.current = setTimeout(() => {
        useEditorStore.getState().setSaveStatus('idle');
      }, 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [saveStatus]);

  const handleSave = useCallback(async () => {
    if (saveStatus === 'saving') return;

    setSaveStatus('saving');
    try {
      const result = await snapshotDocument(documentId, branch);
      if (result.commitSha256) {
        setLastSaved(result.commitSha256);
      } else {
        setSaveStatus('saved');
      }
    } catch (err) {
      setSaveStatus('error');
      const message = err instanceof Error ? err.message : 'Failed to save';
      toast.error(message);
    }
  }, [documentId, branch, saveStatus, setSaveStatus, setLastSaved]);

  const isSaving = saveStatus === 'saving';
  const isSaved = saveStatus === 'saved';
  const isError = saveStatus === 'error';

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={isSaving}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md
        transition-colors
        disabled:pointer-events-none disabled:opacity-60
        ${isSaved
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : isError
            ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }
      `}
    >
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>저장 중...</span>
        </>
      ) : isSaved ? (
        <>
          <Check className="h-4 w-4" />
          <span>저장됨</span>
        </>
      ) : isError ? (
        <>
          <AlertCircle className="h-4 w-4" />
          <span>버전 저장</span>
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          <span>버전 저장</span>
        </>
      )}
    </button>
  );
}
