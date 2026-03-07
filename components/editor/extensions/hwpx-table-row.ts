/**
 * TipTap extension for HWPX table row node.
 *
 * Extends @tiptap/extension-table-row with HWPX-specific attrs.
 */

import TableRow from '@tiptap/extension-table-row';

export interface HwpxTableRowAttrs {
  rowMeta: Record<string, unknown> | null;
}

export const HwpxTableRow = TableRow.extend({
  name: 'hwpxTableRow',
  content: '(hwpxTableCell | hwpxTableHeaderCell)+',

  addAttributes() {
    return {
      ...this.parent?.(),
      rowMeta: { default: null },
    };
  },
});
