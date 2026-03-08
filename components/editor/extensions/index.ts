/**
 * Barrel export for all HWPX TipTap extensions.
 *
 * Includes custom HWPX nodes/marks + standard TipTap text formatting marks.
 * Does NOT include Collaboration or CollaborationCursor -- those are
 * configured per-editor instance with Y.Doc/provider.
 */

import { HwpxDoc } from './hwpx-doc';
import { HwpxParagraph } from './hwpx-paragraph';
import { HwpxTable } from './hwpx-table';
import { HwpxTableRow } from './hwpx-table-row';
import { HwpxTableCell, HwpxTableHeaderCell } from './hwpx-table-cell';
import { HwpxImage } from './hwpx-image';
import { HwpxInlineImage } from './hwpx-inline-image';
import { HwpxOpaque } from './hwpx-opaque';
import { HwpxInlineOpaque } from './hwpx-inline-opaque';
import { HwpxCharMeta } from './hwpx-char-meta';
import { RunMeta } from './run-meta';
import { HwpxCollaborationCursor } from './hwpx-collaboration-cursor';

import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import { TextStyle } from '@tiptap/extension-text-style';

export {
  HwpxDoc,
  HwpxParagraph,
  HwpxTable,
  HwpxTableRow,
  HwpxTableCell,
  HwpxTableHeaderCell,
  HwpxImage,
  HwpxInlineImage,
  HwpxOpaque,
  HwpxInlineOpaque,
  HwpxCharMeta,
  RunMeta,
  HwpxCollaborationCursor,
};

/**
 * All HWPX extensions for TipTap editor configuration.
 * Use with useEditor({ extensions: [...allHwpxExtensions, Collaboration.configure(...)] })
 */
export const allHwpxExtensions = [
  HwpxDoc,
  HwpxParagraph,
  HwpxTable,
  HwpxTableRow,
  HwpxTableCell,
  HwpxTableHeaderCell,
  HwpxImage,
  HwpxInlineImage,
  HwpxOpaque,
  HwpxInlineOpaque,
  HwpxCharMeta,
  RunMeta,
  Text,
  Bold,
  Italic,
  Underline,
  Strike,
  TextStyle,
];
