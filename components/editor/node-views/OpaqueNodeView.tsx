/**
 * React NodeView for HWPX opaque block nodes.
 *
 * Displays a non-editable placeholder with icon + label.
 * Icons from lucide-react based on elementType.
 */

'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import {
  Calculator,
  Paintbrush,
  FileText,
  FileQuestion,
} from 'lucide-react';

const iconMap: Record<string, typeof Calculator> = {
  equation: Calculator,
  drawing: Paintbrush,
  header: FileText,
  footer: FileText,
  field: FileText,
  sectionProperty: FileText,
};

export function OpaqueNodeView({ node, selected }: NodeViewProps) {
  const { elementType, label } = node.attrs;
  const Icon = iconMap[elementType] ?? FileQuestion;

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
        <span className="text-sm text-muted-foreground">
          {label || `[${elementType}]`}
        </span>
      </div>
    </NodeViewWrapper>
  );
}
