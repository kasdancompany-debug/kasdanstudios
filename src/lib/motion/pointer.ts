/**
 * Where the pointer is about to be, in CSS px.
 *
 * The system cursor is drawn by the OS, while anything the page draws lands a
 * frame or two later. Chromium's predicted events extrapolate the pointer a
 * few milliseconds ahead, which closes most of that gap; other browsers fall
 * back to the event's own position.
 */
export function pointerXY(e: PointerEvent): [number, number] {
  const predicted = e.getPredictedEvents?.();
  const p = predicted && predicted.length ? predicted[predicted.length - 1] : e;
  return [p.clientX, p.clientY];
}

/**
 * Listens for pointer movement at the highest rate the browser offers:
 * `pointerrawupdate` (fires as soon as the mouse reports, not once per frame)
 * where supported, `pointermove` elsewhere.
 */
export function onPointerPosition(fn: (e: PointerEvent) => void) {
  const type = "onpointerrawupdate" in window ? "pointerrawupdate" : "pointermove";
  window.addEventListener(type, fn as EventListener, { passive: true });
  return () => window.removeEventListener(type, fn as EventListener);
}
