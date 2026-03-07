/**
 * HocuspocusProvider lifecycle management hook.
 *
 * Creates Y.Doc + HocuspocusProvider synchronously so the provider
 * is available on first render (required by Collaboration extension).
 * Manages connection lifecycle with JWT auth token refresh.
 * Wires awareness changes to useEditorStore for PresenceOverlay.
 */

'use client';

import { useEffect, useMemo, useRef } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { useAuthStore } from '@/stores/auth-store';
import { useEditorStore, type ConnectedUser } from '@/stores/editor-store';

// Backend WebSocket path: /api/collab/ws/:documentId
// HocuspocusProvider appends /${name} to the URL automatically
const WS_URL =
  process.env.NEXT_PUBLIC_COLLAB_WS_URL ||
  'wss://hwptorag-server-production.up.railway.app/api/collab/ws';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseHocuspocusReturn {
  provider: HocuspocusProvider;
  ydoc: Y.Doc;
}

export function useHocuspocus(documentId: string): UseHocuspocusReturn {
  const ydocRef = useRef<Y.Doc | null>(null);
  if (!ydocRef.current) {
    ydocRef.current = new Y.Doc();
  }
  const ydoc = ydocRef.current;

  // Create provider synchronously via useMemo so it's available on first render.
  const provider = useMemo(() => {
    return new HocuspocusProvider({
      url: WS_URL,
      name: documentId,
      document: ydoc,
      token: async () => {
        const token = await useAuthStore.getState().ensureFreshToken();
        return token ?? '';
      },
      onSynced() {
        useEditorStore.getState().setStatus('connected');
      },
      onDisconnect() {
        useEditorStore.getState().setStatus('disconnected');
      },
      onAuthenticationFailed({ reason }) {
        const msg = reason || 'Authentication failed';
        useEditorStore.getState().setError(msg);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  // Set initial status via effect (not during render) to avoid setState-during-render warning
  useEffect(() => {
    useEditorStore.getState().setStatus('connecting');
  }, [provider]);

  // Wire awareness changes to editor store
  useEffect(() => {
    const awareness = provider.awareness;
    if (!awareness) return;

    const handleAwarenessChange = () => {
      const users: ConnectedUser[] = [];
      awareness.getStates().forEach((state, clientId) => {
        const user = state?.user as { name?: string; color?: string } | undefined;
        if (user?.name) {
          users.push({
            clientId,
            name: user.name,
            color: user.color || '#888888',
          });
        }
      });
      useEditorStore.getState().setConnectedUsers(users);
    };

    awareness.on('change', handleAwarenessChange);
    handleAwarenessChange();

    return () => {
      awareness.off('change', handleAwarenessChange);
    };
  }, [provider]);

  // Cleanup on unmount or documentId change
  useEffect(() => {
    return () => {
      provider.disconnect();
      provider.destroy();
    };
  }, [provider]);

  return { provider, ydoc };
}
