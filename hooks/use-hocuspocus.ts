/**
 * HocuspocusProvider lifecycle management hook.
 *
 * Creates Y.Doc + HocuspocusProvider for a given documentId.
 * Manages connection lifecycle with JWT auth token refresh.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { useAuthStore } from '@/stores/auth-store';

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
      },
      onDisconnect() {
        setStatus('disconnected');
      },
      onAuthenticationFailed({ reason }) {
        setStatus('error');
        setError(reason || 'Authentication failed');
      },
    });

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
