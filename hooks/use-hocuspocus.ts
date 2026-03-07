/**
 * HocuspocusProvider lifecycle management hook.
 *
 * Creates Y.Doc + HocuspocusProvider per documentId.
 * When documentId changes, both Y.Doc and provider are destroyed and recreated
 * to prevent cross-document state contamination.
 */

'use client';

import { useEffect, useMemo } from 'react';
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
  // Create fresh Y.Doc + provider per documentId.
  // useMemo ensures same instance for same documentId; new documentId = new pair.
  const { provider, ydoc } = useMemo(() => {
    const doc = new Y.Doc();

    const prov = new HocuspocusProvider({
      url: WS_URL,
      name: documentId,
      document: doc,
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

    return { provider: prov, ydoc: doc };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  // Set initial status + local awareness state via effect (not during render)
  useEffect(() => {
    useEditorStore.getState().setStatus('connecting');

    // Fix 3: Set local user awareness so other clients can see us in PresenceOverlay
    const awareness = provider.awareness;
    if (awareness) {
      const authState = useAuthStore.getState();
      const name = authState.user?.name || 'Anonymous';
      const color = '#' + (authState.user?.id || 'anon').slice(0, 6).padEnd(6, '0');
      awareness.setLocalStateField('user', { name, color });
    }
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

  // Cleanup on unmount or documentId change — destroy both provider and Y.Doc
  useEffect(() => {
    return () => {
      provider.disconnect();
      provider.destroy();
      ydoc.destroy();
    };
  }, [provider, ydoc]);

  return { provider, ydoc };
}
