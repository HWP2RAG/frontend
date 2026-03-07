/**
 * React NodeView for HWPX block-level image nodes.
 *
 * Displays the image from src attr, with width/height constraints.
 * Shows alt text placeholder if no src available.
 */

'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { ImageIcon } from 'lucide-react';

export function ImageNodeView({ node, selected }: NodeViewProps) {
  const { src, width, height, binaryItemIDRef } = node.attrs;

  return (
    <NodeViewWrapper>
      <div
        contentEditable={false}
        className={`
          inline-block my-1
          ${selected ? 'ring-2 ring-primary rounded' : ''}
        `}
      >
        {src ? (
          <img
            src={src}
            width={width || undefined}
            height={height || undefined}
            alt={binaryItemIDRef || 'HWPX Image'}
            className="max-w-full h-auto"
            draggable={false}
          />
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md border border-dashed">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              [Image: {binaryItemIDRef || 'unknown'}]
            </span>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
