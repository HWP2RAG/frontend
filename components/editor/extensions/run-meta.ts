/**
 * TipTap mark for preserving HWPX run boundaries during round-trip.
 *
 * Metadata-only mark: NO parseHTML/renderHTML.
 * Always coexists with other marks (excludes: '').
 * Used solely by hwpx-schema.service for reconstructing original
 * <hp:run> structure on PM -> HWPX conversion.
 *
 * CRITICAL for HWPX round-trip fidelity.
 */

import { Mark } from '@tiptap/core';

export const RunMeta = Mark.create({
  name: '_runMeta',
  excludes: '',

  addAttributes() {
    return {
      _runIndex: { default: 0 },
      _runCharPrIDRef: { default: '0' },
      _runExtraAttrs: { default: null },
    };
  },
});
