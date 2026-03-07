/**
 * TipTap extension for HWPX paragraph node.
 *
 * Attrs mirror backend hwpxParagraphSpec exactly.
 */

import { Node } from '@tiptap/core';

export interface HwpxParagraphAttrs {
  hwpxId: string | null;
  paraPrIDRef: string;
  styleIDRef: string;
  blockUuid: string | null;
  paraMeta: Record<string, unknown> | null;
}

export const HwpxParagraph = Node.create({
  name: 'hwpxParagraph',
  group: 'block',
  content: '(text | hwpxInlineImage | hwpxInlineOpaque)*',

  addAttributes() {
    return {
      hwpxId: { default: null },
      paraPrIDRef: { default: '0' },
      styleIDRef: { default: '0' },
      blockUuid: { default: null },
      paraMeta: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'p[data-hwpx-paragraph]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', { ...HTMLAttributes, 'data-hwpx-paragraph': '' }, 0];
  },
});
