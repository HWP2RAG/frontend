/**
 * TipTap mark for HWPX character metadata (charPrIDRef).
 *
 * Transparent metadata mark: renders as invisible <span> with data attrs.
 * Always coexists with other marks (excludes: '').
 * Carries original charPrIDRef for round-trip reconstruction.
 */

import { Mark } from '@tiptap/core';

export const HwpxCharMeta = Mark.create({
  name: 'hwpxCharMeta',
  excludes: '',

  addAttributes() {
    return {
      charPrIDRef: {
        default: '0',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-charpr') ?? '0',
        renderHTML: (attrs: Record<string, unknown>) => ({ 'data-charpr': attrs.charPrIDRef }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },

  parseHTML() {
    return [{ tag: 'span[data-charpr]' }];
  },
});
