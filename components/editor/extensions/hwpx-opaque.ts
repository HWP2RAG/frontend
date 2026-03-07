/**
 * TipTap extension for HWPX block-level opaque node.
 *
 * Atom node for non-editable elements (equations, drawings, etc.).
 * Attrs mirror backend hwpxOpaqueSpec exactly:
 * elementType, rawXml, label
 */

import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { OpaqueNodeView } from '../node-views/OpaqueNodeView';

export type OpaqueElementType =
  | 'equation'
  | 'drawing'
  | 'header'
  | 'footer'
  | 'field'
  | 'sectionProperty'
  | 'unknown';

export const HwpxOpaque = Node.create({
  name: 'hwpxOpaque',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      elementType: { default: 'unknown' as OpaqueElementType },
      rawXml: { default: '' },
      label: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-hwpx-opaque]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, 'data-hwpx-opaque': '' }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(OpaqueNodeView);
  },
});
