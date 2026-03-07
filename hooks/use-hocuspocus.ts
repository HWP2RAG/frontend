/**
 * HocuspocusProvider lifecycle management hook.
 *
 * Creates Y.Doc + HocuspocusProvider for a given documentId.
 * Manages connection lifecycle with JWT auth token refresh.
 * Wires awareness changes to useEditorStore for PresenceOverlay.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { useAuthStore } from '@/stores/auth-store';
import { useEditorStore, type ConnectedUser } from '@/stores/editor-store';

const WS_URL =
  process.env.NEXT_PUBLIC_COLLAB_WS_URL ||
  'wss://hwptorag-server-production.up.railway.app/collab';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseHocuspocusReturn {
  provider: HocuspocusProvider | null;
  ydoc: Y.Doc;
  status: ConnectionStatus;
  error: string | null;
}

export function useHocuspocus(documentId: string): UseHocuspocusReturn {
  const ydocRef = useRef(new Y.Doc());
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ydoc = ydocRef.current;
    const editorStore = useEditorStore.getState();
    editorStore.setStatus('connecting');

    const provider = new HocuspocusProvider({
      url: WS_URL,
      name: documentId,
      document: ydoc,
      token: async () => {
        const token = await useAuthStore.getState().ensureFreshToken();
        return token ?? '';
      },
      onSynced() {
        setStatus('connected');
        setError(null);
        useEditorStore.getState().setStatus('connected');
      },
      onDisconnect() {
        setStatus('disconnected');
        useEditorStore.getState().setStatus('disconnected');
      },
      onAuthenticationFailed({ reason }) {
        setStatus('error');
        const msg = reason || 'Authentication failed';
        setError(msg);
        useEditorStore.getState().setError(msg);
      },
    });

    // Wire awareness changes to editor store for PresenceOverlay
    const awareness = provider.awareness;
    if (awareness) {
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
      // Initial sync
      handleAwarenessChange();
    }

    providerRef.current = provider;

    return () => {
      provider.disconnect();
      provider.destroy();
      providerRef.current = null;
    };
  }, [documentId]);

  return {
    provider: providerRef.current,
    ydoc: ydocRef.current,
    status,
    error,
  };
}
