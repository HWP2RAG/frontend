/**
 * TipTap extension for HWPX document root node.
 *
 * CRITICAL: name MUST be 'doc' (not 'hwpxDoc').
 * CommitBridgeService handles doc <-> hwpxDoc remapping.
 * y-prosemirror requires the document root to be named 'doc'.
 */

import Document from '@tiptap/extension-document';

export const HwpxDoc = Document.extend({
  content: '(hwpxParagraph | hwpxTable | hwpxOpaque | hwpxImage)*',
});
