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

/**
 * Initialize page pagination on a container element (e.g., paper-container).
 * Returns a cleanup function.
 */
export function initPagePagination(container: HTMLElement): () => void {
  let rafId: number | null = null;
  let updating = false; // Guard against MutationObserver re-entry

  function findPM(): Element | null {
    return container.querySelector('.ProseMirror');
  }

  function clearGaps(pm: Element) {
    const gaps = pm.querySelectorAll(`.${GAP_CLASS}`);
    gaps.forEach((el) => el.remove());
  }

  function insertGaps(pm: Element) {
    const children = Array.from(pm.children) as HTMLElement[];
    if (children.length === 0) return;

    let cumulativeHeight = 0;
    let pageNumber = 1;
    const insertPoints: HTMLElement[] = [];

    for (const child of children) {
      if (child.classList.contains(GAP_CLASS)) continue;

      const height = child.offsetHeight;
      if (height === 0) continue;

      // Check forced pageBreak
      const isForceBreak = child.getAttribute('data-page-break') === '1';

      if (isForceBreak && cumulativeHeight > 0) {
        insertPoints.push(child);
        cumulativeHeight = 0;
        pageNumber++;
      }

      if (cumulativeHeight + height > A4_CONTENT_HEIGHT_PX && cumulativeHeight > 0) {
        insertPoints.push(child);
        cumulativeHeight = height;
        pageNumber++;
      } else {
        cumulativeHeight += height;
      }
    }

    for (const el of insertPoints) {
      const gap = document.createElement('div');
      gap.className = GAP_CLASS;
      gap.contentEditable = 'false';
      gap.setAttribute('aria-hidden', 'true');
      el.parentNode?.insertBefore(gap, el);
    }
  }

  function recalculate() {
    const pm = findPM();
    if (!pm) return;

    // Guard: prevent MutationObserver re-entry
    updating = true;
    clearGaps(pm);
    insertGaps(pm);
    updating = false;
  }

  function scheduleUpdate() {
    if (updating) return; // Skip if we're the ones modifying
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = null;
      recalculate();
    });
  }

  // MutationObserver for content changes
  const mutObserver = new MutationObserver(() => {
    if (!updating) scheduleUpdate();
  });

  // ResizeObserver for layout changes
  const resizeObserver = new ResizeObserver(() => {
    if (!updating) scheduleUpdate();
  });

  // Wait for ProseMirror to mount, then start observing
  function tryInit() {
    const pm = findPM();
    if (!pm) {
      // Retry until ProseMirror mounts
      setTimeout(tryInit, 500);
      return;
    }

    mutObserver.observe(pm, { childList: true, subtree: true, characterData: true });
    resizeObserver.observe(pm);

    // Initial calculation
    setTimeout(recalculate, 300);
  }

  tryInit();

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    mutObserver.disconnect();
    resizeObserver.disconnect();
    const pm = findPM();
    if (pm) clearGaps(pm);
  };
}
