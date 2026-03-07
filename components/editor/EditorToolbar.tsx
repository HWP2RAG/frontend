/**
 * Formatting toolbar for the HWPX TipTap editor.
 *
 * Provides bold/italic/underline/strike toggle buttons
 * with active state detection.
 */

'use client';

import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
}

interface ToolbarButton {
  icon: typeof Bold;
  label: string;
  action: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
}

const buttons: ToolbarButton[] = [
  {
    icon: Bold,
    label: 'Bold',
    action: (e) => e.chain().focus().toggleBold().run(),
    isActive: (e) => e.isActive('bold'),
  },
  {
    icon: Italic,
    label: 'Italic',
    action: (e) => e.chain().focus().toggleItalic().run(),
    isActive: (e) => e.isActive('italic'),
  },
  {
    icon: Underline,
    label: 'Underline',
    action: (e) => e.chain().focus().toggleUnderline().run(),
    isActive: (e) => e.isActive('underline'),
  },
  {
    icon: Strikethrough,
    label: 'Strikethrough',
    action: (e) => e.chain().focus().toggleStrike().run(),
    isActive: (e) => e.isActive('strike'),
  },
];

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 border-b p-2 bg-background">
      {buttons.map(({ icon: Icon, label, action, isActive }) => (
        <button
          key={label}
          type="button"
          onClick={() => action(editor)}
          disabled={!editor.isEditable}
          title={label}
          className={`
            inline-flex items-center justify-center
            h-8 w-8 rounded-md text-sm
            transition-colors
            hover:bg-accent hover:text-accent-foreground
            disabled:pointer-events-none disabled:opacity-50
            ${isActive(editor) ? 'bg-accent text-accent-foreground' : ''}
          `}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
