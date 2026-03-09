/**
 * Page pagination via direct DOM manipulation.
 *
 * Scans ProseMirror block children, measures cumulative heights,
 * and inserts visual gap divs at A4 page boundaries.
 *
 * A4 content area = 297mm - 20mm top - 20mm bottom = 257mm ≈ 971px @96dpi
 */

const A4_CONTENT_HEIGHT_PX = Math.round(257 * 96 / 25.4); // ≈ 971px
const GAP_CLASS = 'hwpx-page-gap';

let rafId: number | null = null;

function clearExistingGaps(container: Element) {
  container.querySelectorAll(`.${GAP_CLASS}`).forEach((el) => el.remove());
}

function insertGaps(container: Element) {
  clearExistingGaps(container);

  const children = Array.from(container.children) as HTMLElement[];
  if (children.length === 0) return;

  let cumulativeHeight = 0;
  const insertPoints: HTMLElement[] = [];

  for (const child of children) {
    // Skip any gap elements we might have leftover
    if (child.classList.contains(GAP_CLASS)) continue;

    const height = child.offsetHeight;

    // Check forced pageBreak (data attribute from hwpx-paragraph renderHTML)
    const isForceBreak = child.getAttribute('data-page-break') === '1';

    if (isForceBreak && cumulativeHeight > 0) {
      insertPoints.push(child);
      cumulativeHeight = 0;
    }

    if (cumulativeHeight + height > A4_CONTENT_HEIGHT_PX && cumulativeHeight > 0) {
      insertPoints.push(child);
      cumulativeHeight = height;
    } else {
      cumulativeHeight += height;
    }
  }

  // Insert gap divs before the identified elements
  for (const el of insertPoints) {
    const gap = document.createElement('div');
    gap.className = GAP_CLASS;
    gap.contentEditable = 'false';
    gap.setAttribute('aria-hidden', 'true');
    el.parentNode?.insertBefore(gap, el);
  }
}

function scheduleUpdate(container: Element) {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    rafId = null;
    insertGaps(container);
  });
}

/**
 * Initialize page pagination on a ProseMirror editor DOM element.
 * Returns a cleanup function.
 */
export function initPagePagination(editorDom: HTMLElement): () => void {
  // Find .ProseMirror element
  const pm =
    editorDom.classList.contains('ProseMirror')
      ? editorDom
      : editorDom.querySelector('.ProseMirror');

  if (!pm) return () => {};

  // Initial render
  setTimeout(() => scheduleUpdate(pm), 300);

  // Watch for content changes
  const mutObserver = new MutationObserver(() => {
    scheduleUpdate(pm);
  });
  mutObserver.observe(pm, { childList: true, subtree: true, characterData: true });

  // Watch for size changes (images loading, etc.)
  const resizeObserver = new ResizeObserver(() => {
    scheduleUpdate(pm);
  });
  resizeObserver.observe(pm);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    mutObserver.disconnect();
    resizeObserver.disconnect();
    clearExistingGaps(pm);
  };
}
