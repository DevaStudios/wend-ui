import { computePosition, offset, flip, shift, autoUpdate } from '@floating-ui/dom';

export interface FloatingPanelOptions {
  /** Gap between the reference element and the floating panel, in pixels. Default 4. */
  offsetPx?: number;
  /** Minimum distance the panel keeps from the viewport edge when it has to shift. Default 8. */
  shiftPadding?: number;
}

/**
 * Positions `floatingEl` (expects `position: fixed` in CSS) below `referenceEl`, flipping to
 * the other side and shifting sideways as needed to stay in the viewport, and sets the
 * panel's min-width to match the reference element's width. This is the exact middleware
 * stack/style application every wend-ui component with a Floating UI-positioned panel needs
 * (wend-select, wend-combo-box, and future ones) — previously hand-copied per component.
 */
export async function positionFloatingPanel(
  referenceEl: HTMLElement,
  floatingEl: HTMLElement,
  { offsetPx = 4, shiftPadding = 8 }: FloatingPanelOptions = {}
): Promise<void> {
  const { x, y } = await computePosition(referenceEl, floatingEl, {
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset(offsetPx), flip(), shift({ padding: shiftPadding })]
  });
  Object.assign(floatingEl.style, {
    left: `${x}px`,
    top: `${y}px`,
    minWidth: `${referenceEl.offsetWidth}px`
  });
}

/**
 * Starts Floating UI's `autoUpdate` loop, keeping `floatingEl` positioned via `reposition`
 * for as long as it stays mounted (scroll, resize, content changes, etc.). Returns the stop
 * function directly — call it once, typically when the panel closes and again defensively in
 * `disconnectedCallback`. Unlike a naive wrapper, this does NOT invoke the returned cleanup
 * itself; doing that would stop the update loop immediately after starting it.
 */
export function startFloatingPanelAutoUpdate(
  referenceEl: HTMLElement,
  floatingEl: HTMLElement,
  reposition: () => void
): () => void {
  return autoUpdate(referenceEl, floatingEl, reposition);
}

/**
 * Caps a scrollable panel's rendered height at exactly `maxVisible` rows' worth of its
 * actual children — measured from the real rendered elements, not a hardcoded pixel guess,
 * so it stays correct regardless of font metrics or row content. Clears any inline
 * `max-height` when there aren't enough rows to need capping. Shared by wend-select's and
 * wend-combo-box's option panels (both cap at 5 visible options before scrolling).
 */
export function capPanelRows(panelEl: HTMLElement, rows: HTMLElement[], maxVisible: number): void {
  if (rows.length <= maxVisible) {
    panelEl.style.maxHeight = '';
    return;
  }
  const lastVisible = rows[maxVisible - 1];
  panelEl.style.maxHeight = `${lastVisible.offsetTop + lastVisible.offsetHeight}px`;
}

/**
 * Invokes `onOutside` on the first `mousedown` (capture phase, so it fires before any click
 * handler on the target itself) whose target falls outside `containerEl` — the standard
 * "close this open panel when the user clicks elsewhere" pattern. Returns a cleanup function
 * that removes the listener; call it once the panel closes, and again defensively in
 * `disconnectedCallback`.
 */
export function onOutsideMouseDown(containerEl: HTMLElement, onOutside: (event: MouseEvent) => void): () => void {
  const handler = (event: MouseEvent) => {
    if (!containerEl.contains(event.target as Node)) {
      onOutside(event);
    }
  };
  document.addEventListener('mousedown', handler, true);
  return () => document.removeEventListener('mousedown', handler, true);
}
