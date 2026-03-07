/**
 * TipTap extension for HWPX inline opaque node.
 *
 * Inline atom for non-editable elements inside paragraphs (secPr, ctrl, etc.).
 * Attrs mirror backend hwpxInlineOpaqueSpec exactly:
 * elementType, rawXml, label
 */

import { Node } from '@tiptap/core';

export const HwpxInlineOpaque = Node.create({
  name: 'hwpxInlineOpaque',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      elementType: { default: 'unknown' },
      rawXml: { default: '' },
      label: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-hwpx-inline-opaque]' }];
  },

  renderHTML({ node }) {
    return [
      'span',
      {
        'data-hwpx-inline-opaque': '',
        class: 'hwpx-opaque-inline',
        contenteditable: 'false',
      },
      node.attrs.label || '[Opaque]',
    ];
  },
});
