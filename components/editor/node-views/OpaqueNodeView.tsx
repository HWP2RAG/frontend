/**
 * React NodeView for HWPX opaque block nodes.
 *
 * - equation/drawing: show icon + label placeholder
 * - sectionProperty/header/footer/field/unknown: hidden (no visual output)
 *   (sectionProperty gap is handled by hwpx-section-break CSS on the paragraph)
 */

'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Calculator, Paintbrush } from 'lucide-react';

/** Types that render as visible placeholder with icon */
const visibleTypes: Record<string, typeof Calculator> = {
  equation: Calculator,
  drawing: Paintbrush,
};

/** Types that are completely hidden (sectionProperty gap handled by hwpx-section-break CSS on paragraph) */
const hiddenTypes = new Set(['header', 'footer', 'field', 'unknown', 'sectionProperty']);

export function OpaqueNodeView({ node, selected }: NodeViewProps) {
  const { elementType, label } = node.attrs;

  // Hidden: no visual output at all
  if (hiddenTypes.has(elementType) || !visibleTypes[elementType]) {
    return (
      <NodeViewWrapper>
        <div
          contentEditable={false}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
      </NodeViewWrapper>
    );
  }

  // Visible: equation, drawing — show icon placeholder (no label text to avoid garbage)
  const Icon = visibleTypes[elementType];
  const cleanLabel = elementType === 'equation' ? '[수식]' : elementType === 'drawing' ? '[그림]' : `[${elementType}]`;

  return (
    <NodeViewWrapper>
      <div
        contentEditable={false}
        className={`
          flex items-center gap-2 px-3 py-2 my-1
          bg-muted rounded-md border border-dashed
          select-none cursor-default
          ${selected ? 'ring-2 ring-primary' : ''}
        `}
      >
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground">{cleanLabel}</span>
      </div>
    </NodeViewWrapper>
  );
}
