/**
 * TipTap extension for HWPX inline image node.
 *
 * Attrs mirror backend hwpxInlineImageSpec exactly:
 * binaryItemIDRef, width, height, src, picMeta
 */

import { Node } from '@tiptap/core';

export const HwpxInlineImage = Node.create({
  name: 'hwpxInlineImage',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      binaryItemIDRef: { default: '' },
      width: { default: 0 },
      height: { default: 0 },
      src: { default: '' },
      picMeta: { default: {} },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-hwpx-inline-image]' }];
  },

  renderHTML({ node }) {
    const { src, width, height } = node.attrs;
    return [
      'span',
      { 'data-hwpx-inline-image': '', style: 'display:inline-block' },
      ['img', { src, width, height, style: 'vertical-align:middle' }],
    ];
  },
});
