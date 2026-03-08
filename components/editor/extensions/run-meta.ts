/**
 * TipTap mark for preserving HWPX run boundaries during round-trip.
 *
 * Transparent metadata mark: renders as invisible <span> with data attrs.
 * Always coexists with other marks (excludes: '').
 * Used solely by hwpx-schema.service for reconstructing original
 * <hp:run> structure on PM -> HWPX conversion.
 *
 * CRITICAL for HWPX round-trip fidelity.
 */

import { Mark } from '@tiptap/core';

export const RunMeta = Mark.create({
  name: '_runMeta',
  excludes: '',

  addAttributes() {
    return {
      _runIndex: {
        default: 0,
        parseHTML: (el: HTMLElement) => parseInt(el.getAttribute('data-run-index') ?? '0', 10),
        renderHTML: (attrs: Record<string, unknown>) => ({ 'data-run-index': String(attrs._runIndex) }),
      },
      _runCharPrIDRef: {
        default: '0',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-run-charpr') ?? '0',
        renderHTML: (attrs: Record<string, unknown>) => ({ 'data-run-charpr': attrs._runCharPrIDRef }),
      },
      _runExtraAttrs: {
        default: null,
        parseHTML: (el: HTMLElement) => {
          const raw = el.getAttribute('data-run-extra');
          return raw ? JSON.parse(raw) : null;
        },
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs._runExtraAttrs ? { 'data-run-extra': JSON.stringify(attrs._runExtraAttrs) } : {},
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },

  parseHTML() {
    return [{ tag: 'span[data-run-index]' }];
  },
});
