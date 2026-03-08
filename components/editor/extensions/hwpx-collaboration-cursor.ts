/**
 * Custom CollaborationCursor extension for HWPX editor.
 *
 * CRITICAL: Imports yCursorPlugin from '@tiptap/y-tiptap' (NOT 'y-prosemirror').
 * This ensures the cursor plugin uses the SAME ySyncPluginKey instance as
 * the Collaboration extension's ySyncPlugin, preventing the crash where
 * ySyncPluginKey.getState() returns undefined during EditorState.reconfigure.
 *
 * Root cause of the original crash:
 * - @tiptap/extension-collaboration uses @tiptap/y-tiptap's ySyncPlugin (key: 'y-sync$')
 * - @tiptap/extension-collaboration-cursor imports from y-prosemirror (key: 'y-sync$1')
 * - Separate PluginKey instances => lookup returns undefined => crash
 */

import { Extension } from '@tiptap/core';
import {
  yCursorPlugin,
  defaultSelectionBuilder,
} from '@tiptap/y-tiptap';
import type { Awareness } from 'y-protocols/awareness';

interface CursorUser {
  name: string | null;
  color: string | null;
}

export interface HwpxCollaborationCursorOptions {
  provider: { awareness: Awareness | null } | null;
  user: CursorUser;
  render: (user: CursorUser) => HTMLElement;
  selectionRender: typeof defaultSelectionBuilder;
}

function defaultCursorRender(user: CursorUser): HTMLElement {
  const caret = document.createElement('span');
  caret.classList.add('collaboration-cursor__caret');
  caret.style.borderColor = user.color || '#888888';

  const label = document.createElement('div');
  label.classList.add('collaboration-cursor__label');
  label.style.backgroundColor = user.color || '#888888';
  label.textContent = user.name || 'Anonymous';

  caret.appendChild(label);
  return caret;
}

export const HwpxCollaborationCursor = Extension.create<HwpxCollaborationCursorOptions>({
  name: 'hwpxCollaborationCursor',

  addOptions() {
    return {
      provider: null,
      user: { name: null, color: null },
      render: defaultCursorRender,
      selectionRender: defaultSelectionBuilder,
    };
  },

  addStorage() {
    return {
      users: [] as Array<{ clientId: number; user: CursorUser }>,
      _awarenessHandler: null as (() => void) | null,
      _awareness: null as Awareness | null,
    };
  },

  /**
   * Update user attributes and propagate to awareness.
   * Called via: editor.chain().focus().command(({ editor }) => { ... }).run()
   * or directly via this.options mutation.
   */
  onBeforeCreate() {
    // Allow runtime user updates by mutating options + awareness
    const ext = this;
    (this as any).updateUser = (attributes: Partial<CursorUser>) => {
      ext.options.user = { ...ext.options.user, ...attributes };
      const awareness = ext.options.provider?.awareness;
      if (awareness) {
        awareness.setLocalStateField('user', ext.options.user);
      }
    };
  },

  onDestroy() {
    const { _awareness, _awarenessHandler } = this.storage;
    if (_awareness && _awarenessHandler) {
      _awareness.off('change', _awarenessHandler);
      this.storage._awarenessHandler = null;
      this.storage._awareness = null;
    }
  },

  addProseMirrorPlugins() {
    const awareness = this.options.provider?.awareness;

    // Defensive guard: if provider/awareness is not yet available, skip cursor plugin
    if (!awareness) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[HwpxCollaborationCursor] Provider not available, cursor plugin skipped');
      }
      return [];
    }

    // Set local user state so remote clients can render our cursor
    awareness.setLocalStateField('user', this.options.user);

    // Track remote users in storage (with cleanup ref for onDestroy)
    const storage = this.storage;
    const updateUsers = () => {
      const users: Array<{ clientId: number; user: CursorUser }> = [];
      awareness.getStates().forEach((state, clientId) => {
        const user = state?.user as CursorUser | undefined;
        if (user?.name) {
          users.push({ clientId, user });
        }
      });
      storage.users = users;
    };
    awareness.on('change', updateUsers);
    storage._awarenessHandler = updateUsers;
    storage._awareness = awareness;
    updateUsers();

    return [
      yCursorPlugin(awareness, {
        cursorBuilder: this.options.render,
        selectionBuilder: this.options.selectionRender,
      }),
    ];
  },
});
