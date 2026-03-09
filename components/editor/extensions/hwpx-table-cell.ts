/**
 * TipTap extension for HWPX table cell and header cell nodes.
 *
 * Attrs mirror backend hwpxTableCellSpec exactly:
 * colspan, rowspan, header, colWidth, cellMeta
 */

import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

export interface HwpxTableCellAttrs {
  colspan: number;
  rowspan: number;
  header: boolean;
  colWidth: number | null;
  cellMeta: Record<string, unknown>;
}

const hwpxCellAttrs = {
  colspan: { default: 1 },
  rowspan: { default: 1 },
  header: { default: false },
  colWidth: { default: null },
  cellMeta: { default: {} },
};

export const HwpxTableCell = TableCell.extend({
  name: 'hwpxTableCell',
  content: '(hwpxParagraph | hwpxTable | hwpxOpaque)*',

  addAttributes() {
    return {
      ...this.parent?.(),
      ...hwpxCellAttrs,
    };
  },

  renderHTML({ HTMLAttributes, node }) {
    const style: string[] = [];
    const meta = node.attrs.cellMeta as Record<string, unknown> | undefined;
    if (meta?.bgColor) {
      style.push(`background-color: ${meta.bgColor}`);
    }
    const colWidth = node.attrs.colWidth as number | null;
    if (colWidth && colWidth > 0) {
      const widthPx = Math.round(colWidth * 96 / 7200);
      style.push(`width: ${widthPx}px`);
    }
    return ['td', {
      ...HTMLAttributes,
      ...(style.length ? { style: style.join('; ') } : {}),
    }, 0];
  },
});

export const HwpxTableHeaderCell = TableHeader.extend({
  name: 'hwpxTableHeaderCell',
  content: '(hwpxParagraph | hwpxTable | hwpxOpaque)*',

  addAttributes() {
    return {
      ...this.parent?.(),
      ...hwpxCellAttrs,
    };
  },

  renderHTML({ HTMLAttributes, node }) {
    const style: string[] = [];
    const meta = node.attrs.cellMeta as Record<string, unknown> | undefined;
    if (meta?.bgColor) {
      style.push(`background-color: ${meta.bgColor}`);
    }
    const colWidth = node.attrs.colWidth as number | null;
    if (colWidth && colWidth > 0) {
      const widthPx = Math.round(colWidth * 96 / 7200);
      style.push(`width: ${widthPx}px`);
    }
    return ['th', {
      ...HTMLAttributes,
      ...(style.length ? { style: style.join('; ') } : {}),
    }, 0];
  },
});
