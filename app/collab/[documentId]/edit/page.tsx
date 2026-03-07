/**
 * Editor page route: /collab/[documentId]/edit
 *
 * Full WYSIWYG editor with status bar, presence overlay, and save button.
 * HwpxEditor loaded via next/dynamic (ssr: false) for SSR safety.
 */

'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ChevronLeft } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';

const HwpxEditor = dynamic(
  () => import('@/components/editor/HwpxEditor'),
  { ssr: false },
);

const STATUS_CONFIG = {
  idle: { dot: 'bg-gray-400', text: '대기' },
  connecting: { dot: 'bg-yellow-400 animate-pulse', text: '연결 중...' },
  connected: { dot: 'bg-green-500', text: '연결됨' },
  disconnected: { dot: 'bg-red-500', text: '연결 끊김' },
  error: { dot: 'bg-red-500', text: '오류' },
} as const;

export default function EditorPage() {
  const params = useParams<{ documentId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const documentId = params.documentId;
  const branch = searchParams.get('branch') || 'main';

  const status = useEditorStore((s) => s.status);
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const commitSha = useEditorStore((s) => s.commitSha);
  const error = useEditorStore((s) => s.error);
  const connectedUsers = useEditorStore((s) => s.connectedUsers);

  const statusCfg = STATUS_CONFIG[status];

  return (
    <main className="flex flex-col h-full min-h-screen">
      {/* Top status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background text-sm">
        <div className="flex items-center gap-3">
          {/* Back navigation */}
          <button
            onClick={() => router.push(`/collab/${documentId}`)}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>문서 상세</span>
          </button>

          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${statusCfg.dot}`} />
            <span className="text-muted-foreground">
              {status === 'error' && error ? error : statusCfg.text}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status */}
          {saveStatus === 'saving' && (
            <span className="text-muted-foreground text-xs">저장 중...</span>
          )}
          {saveStatus === 'saved' && commitSha && (
            <span className="text-muted-foreground text-xs">
              저장됨 ({commitSha.slice(0, 7)})
            </span>
          )}

          {/* Connected user count */}
          {connectedUsers.length > 0 && (
            <span className="text-muted-foreground text-xs">
              {connectedUsers.length}명 접속
            </span>
          )}
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex justify-center p-4">
        <div className="w-full max-w-4xl">
          <HwpxEditor documentId={documentId} branch={branch} />
        </div>
      </div>
    </main>
  );
}
