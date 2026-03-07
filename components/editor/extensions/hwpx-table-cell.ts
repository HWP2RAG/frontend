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
});
