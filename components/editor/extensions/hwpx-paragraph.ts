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

  renderHTML({ HTMLAttributes, node }) {
    const style: string[] = [];
    const meta = node.attrs.paraMeta as Record<string, unknown> | null;
    if (meta?.align && meta.align !== 'left') {
      style.push(`text-align: ${meta.align}`);
    }
    if (meta?.lineSpacing) {
      style.push(`line-height: ${meta.lineSpacing}`);
    }
    if (meta?.indent) {
      const indentHwpunit = parseInt(String(meta.indent), 10);
      if (!isNaN(indentHwpunit) && indentHwpunit !== 0) {
        const indentPx = Math.round(indentHwpunit * 96 / 7200);
        style.push(`text-indent: ${indentPx}px`);
      }
    }
    // Section break marker: paragraph contains secPr → add page-break class
    const classes: string[] = [];
    if (meta?._hasSecPr) {
      classes.push('hwpx-section-break');
    }

    // Heading heuristic: styleIDRef 1-9 are typically heading styles in HWP/HWPX
    // This adds CSS margin/weight for visual hierarchy (fontSize already on text marks)
    const styleId = parseInt(String(node.attrs.styleIDRef || '0'), 10);
    if (styleId >= 1 && styleId <= 9) {
      classes.push('hwpx-heading');
      if (styleId <= 3) {
        classes.push('hwpx-heading-major');
      }
    }

    const attrs = {
      ...HTMLAttributes,
      'data-hwpx-paragraph': '',
      ...(classes.length > 0 ? { class: classes.join(' ') } : {}),
      ...(style.length > 0 ? { style: style.join('; ') } : {}),
    };
    return ['p', attrs, 0];
  },
});
