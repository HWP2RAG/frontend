/**
 * Zustand store for editor lifecycle state.
 *
 * Manages connection status, save status, error state,
 * and connected users for the collaborative editor.
 *
 * NO persist middleware — all transient state (avoids SSR hydration issues).
 */

import { create } from 'zustand';

export type EditorStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface ConnectedUser {
  clientId: number;
  name: string;
  color: string;
}

interface EditorState {
  status: EditorStatus;
  saveStatus: SaveStatus;
  error: string | null;
  lastSavedAt: string | null;
  commitSha: string | null;
  connectedUsers: ConnectedUser[];
}

interface EditorActions {
  setStatus: (status: EditorStatus) => void;
  setSaveStatus: (saveStatus: SaveStatus) => void;
  setError: (error: string | null) => void;
  setLastSaved: (sha: string) => void;
  setConnectedUsers: (users: ConnectedUser[]) => void;
  reset: () => void;
}

const initialState: EditorState = {
  status: 'idle',
  saveStatus: 'idle',
  error: null,
  lastSavedAt: null,
  commitSha: null,
  connectedUsers: [],
};

export const useEditorStore = create<EditorState & EditorActions>()((set) => ({
  ...initialState,

  setStatus: (status) =>
    set({ status, ...(status === 'error' ? {} : { error: null }) }),

  setSaveStatus: (saveStatus) => set({ saveStatus }),

  setError: (error) =>
    set({ error, status: error ? 'error' : 'idle' }),

  setLastSaved: (sha) =>
    set({
      commitSha: sha,
      lastSavedAt: new Date().toISOString(),
      saveStatus: 'saved',
    }),

  setConnectedUsers: (users) => set({ connectedUsers: users }),

  reset: () => set(initialState),
}));
