/**
 * TipTap mark for HWPX character metadata (charPrIDRef).
 *
 * Metadata-only mark: NO parseHTML/renderHTML.
 * Always coexists with other marks (excludes: '').
 * Carries original charPrIDRef for round-trip reconstruction.
 */

import { Mark } from '@tiptap/core';

export const HwpxCharMeta = Mark.create({
  name: 'hwpxCharMeta',
  excludes: '',

  addAttributes() {
    return {
      charPrIDRef: { default: '0' },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { 'data-charpr': HTMLAttributes.charPrIDRef }, 0];
  },

  parseHTML() {
    return [{ tag: 'span[data-charpr]' }];
  },
});
