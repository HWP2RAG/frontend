/**
 * TipTap extension for HWPX block-level image node.
 *
 * Attrs mirror backend hwpxImageSpec exactly:
 * binaryItemIDRef, width, height, src, picMeta
 */

import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageNodeView } from '../node-views/ImageNodeView';

export interface HwpxImageAttrs {
  binaryItemIDRef: string;
  width: number;
  height: number;
  src: string;
  picMeta: Record<string, unknown>;
}

export const HwpxImage = Node.create({
  name: 'hwpxImage',
  group: 'block',
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
    return [{ tag: 'div[data-hwpx-image]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, 'data-hwpx-image': '' }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
