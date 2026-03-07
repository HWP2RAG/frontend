/**
 * TipTap extension for HWPX table node.
 *
 * Extends @tiptap/extension-table with HWPX-specific attrs.
 * Content matches backend hwpxTableSpec: 'hwpxTableRow+'.
 */

import { Table } from '@tiptap/extension-table';

export interface HwpxTableAttrs {
  rowCnt: number;
  colCnt: number;
  borderFillIDRef: string;
  tblMeta: Record<string, unknown>;
}

export const HwpxTable = Table.extend({
  name: 'hwpxTable',
  content: 'hwpxTableRow+',

  addAttributes() {
    return {
      ...this.parent?.(),
      rowCnt: { default: 0 },
      colCnt: { default: 0 },
      borderFillIDRef: { default: '0' },
      tblMeta: { default: {} },
    };
  },
});
