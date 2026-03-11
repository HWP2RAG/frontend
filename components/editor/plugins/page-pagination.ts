/**
 * Page pagination overlay.
 *
 * Places absolute-positioned page boundary lines on the paper-container,
 * OUTSIDE ProseMirror's managed DOM (so PM doesn't remove them).
 *
 * A4 content area = 297mm - 20mm top padding - 20mm bottom padding = 257mm
 * At 96dpi: 257mm ≈ 971px
 */

/** A4 content height in px */
const A4_CONTENT_PX = Math.round(257 * 96 / 25.4); // ≈ 971

const LINE_CLASS = 'hwpx-page-line';

export function initPagePagination(container: HTMLElement): () => void {
  let rafId: number | null = null;
  const lines: HTMLElement[] = [];

  function getContentHeight(): number {
    const pm = container.querySelector('.ProseMirror');
    if (!pm) return 0;
    return pm.scrollHeight;
  }

  function update() {
    const contentHeight = getContentHeight();
    if (contentHeight <= A4_CONTENT_PX) {
      // Single page — remove all lines
      for (const l of lines) l.remove();
      lines.length = 0;
      return;
    }

    // Calculate how many page breaks we need
    const pageCount = Math.ceil(contentHeight / A4_CONTENT_PX);
    const neededLines = pageCount - 1;

    // Reuse or create line elements
    while (lines.length > neededLines) {
      lines.pop()!.remove();
    }
    while (lines.length < neededLines) {
      const line = document.createElement('div');
      line.className = LINE_CLASS;
      line.setAttribute('aria-hidden', 'true');
      container.appendChild(line);
      lines.push(line);
    }

    // Position each line
    // paper-container padding-top is 20mm ≈ 75.6px
    const paddingTopPx = 20 * 96 / 25.4; // ≈ 75.6
    for (let i = 0; i < neededLines; i++) {
      const topPx = paddingTopPx + A4_CONTENT_PX * (i + 1);
      lines[i].style.top = `${Math.round(topPx)}px`;
      lines[i].setAttribute('data-page', `${i + 2}`);
    }
  }

  function scheduleUpdate() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = null;
      update();
    });
  }

  // Wait for ProseMirror to mount
  function tryInit() {
    const pm = container.querySelector('.ProseMirror');
    if (!pm) {
      setTimeout(tryInit, 300);
      return;
    }

    // Observe size changes on the ProseMirror element
    const resizeObserver = new ResizeObserver(() => scheduleUpdate());
    resizeObserver.observe(pm);

    // Also observe child changes (content edits)
    const mutObserver = new MutationObserver(() => scheduleUpdate());
    mutObserver.observe(pm, { childList: true, subtree: true, characterData: true });

    // Initial
    scheduleUpdate();

    // Store for cleanup
    (container as any).__pgCleanup = () => {
      resizeObserver.disconnect();
      mutObserver.disconnect();
    };
  }

  tryInit();

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    for (const l of lines) l.remove();
    lines.length = 0;
    (container as any).__pgCleanup?.();
  };
}
