/**
 * ProseMirror plugin that inserts visual page-break gaps at A4 boundaries.
 *
 * How it works:
 * 1. After each DOM update, measure cumulative block heights
 * 2. When cumulative height exceeds A4 content area, insert a widget decoration
 * 3. Also insert gap before paragraphs with pageBreak="1" in paraMeta
 * 4. Uses requestAnimationFrame + debounce to avoid layout thrashing
 *
 * A4 content area = 297mm - 20mm top padding - 20mm bottom padding ≈ 257mm ≈ 971px @96dpi
 * (paper-container has padding: 20mm 15mm)
 */

import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorState, Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { EditorView } from '@tiptap/pm/view';
import { Extension } from '@tiptap/core';

const PAGE_PAGINATION_KEY = new PluginKey('pagePagination');

/** A4 content height in px (257mm at 96dpi) */
const A4_CONTENT_HEIGHT_PX = Math.round(257 * 96 / 25.4); // ≈ 971px

function createPageGapWidget(): HTMLElement {
  const gap = document.createElement('div');
  gap.className = 'hwpx-page-gap';
  gap.contentEditable = 'false';
  gap.setAttribute('aria-hidden', 'true');
  return gap;
}

function computePageBreaks(view: EditorView): DecorationSet {
  const { doc } = view.state;
  const decorations: Decoration[] = [];
  const domAtPos = view.domAtPos.bind(view);

  if (!view.dom || !view.dom.parentElement) {
    return DecorationSet.empty;
  }

  let cumulativeHeight = 0;
  let pageNumber = 1;

  doc.forEach((node, offset) => {
    const meta = node.attrs?.paraMeta as Record<string, unknown> | null;
    const hasForceBreak = meta?.pageBreak === '1' || meta?.pageBreak === 1;

    let blockDom: HTMLElement | null = null;
    try {
      const domInfo = domAtPos(offset);
      if (domInfo.node instanceof HTMLElement) {
        if (domInfo.node === view.dom) {
          blockDom = domInfo.node.children[domInfo.offset] as HTMLElement | null;
        } else {
          blockDom = domInfo.node as HTMLElement;
        }
      }
    } catch {
      return;
    }

    if (!blockDom) return;

    const blockHeight = blockDom.getBoundingClientRect().height;

    // Force page break
    if (hasForceBreak && offset > 0) {
      decorations.push(
        Decoration.widget(offset, createPageGapWidget, {
          side: -1,
          key: `page-force-${offset}`,
        }),
      );
      cumulativeHeight = 0;
      pageNumber++;
    }

    // Natural page break
    if (cumulativeHeight + blockHeight > A4_CONTENT_HEIGHT_PX && cumulativeHeight > 0) {
      decorations.push(
        Decoration.widget(offset, createPageGapWidget, {
          side: -1,
          key: `page-${pageNumber}-${offset}`,
        }),
      );
      cumulativeHeight = blockHeight;
      pageNumber++;
    } else {
      cumulativeHeight += blockHeight;
    }
  });

  return DecorationSet.create(doc, decorations);
}

/**
 * TipTap extension that adds visual page pagination.
 */
export const PagePagination = Extension.create({
  name: 'pagePagination',

  addProseMirrorPlugins() {
    let pendingUpdate: number | null = null;
    let currentDecos = DecorationSet.empty;

    return [
      new Plugin({
        key: PAGE_PAGINATION_KEY,

        state: {
          init(): DecorationSet {
            return DecorationSet.empty;
          },
          apply(tr: Transaction, old: DecorationSet): DecorationSet {
            const metaDecos = tr.getMeta(PAGE_PAGINATION_KEY) as DecorationSet | undefined;
            if (metaDecos) return metaDecos;
            if (tr.docChanged) {
              return old.map(tr.mapping, tr.doc);
            }
            return old;
          },
        },

        props: {
          decorations(state: EditorState): DecorationSet {
            return PAGE_PAGINATION_KEY.getState(state) as DecorationSet;
          },
        },

        view(editorView: EditorView) {
          function scheduleUpdate() {
            if (pendingUpdate) cancelAnimationFrame(pendingUpdate);
            pendingUpdate = requestAnimationFrame(() => {
              pendingUpdate = null;
              const decos = computePageBreaks(editorView);
              const tr = editorView.state.tr.setMeta(PAGE_PAGINATION_KEY, decos);
              tr.setMeta('addToHistory', false);
              editorView.dispatch(tr);
            });
          }

          // Initial computation after mount
          setTimeout(scheduleUpdate, 200);

          const resizeObserver = new ResizeObserver(() => {
            scheduleUpdate();
          });
          resizeObserver.observe(editorView.dom);

          return {
            update(view: EditorView, prevState: EditorState) {
              if (view.state.doc !== prevState.doc) {
                scheduleUpdate();
              }
            },
            destroy() {
              if (pendingUpdate) cancelAnimationFrame(pendingUpdate);
              resizeObserver.disconnect();
            },
          };
        },
      }),
    ];
  },
});
