"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A quiet ring that accompanies — never replaces — the native
 * cursor. Fine pointers with motion allowed only. Grows over interactive
 * elements and shows a "View" label over [data-cursor="view"] targets.
 */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current!;
    const label = labelRef.current!;
    let x = -100,
      y = -100,
      scale = 1,
      targetScale = 1,
      raf = 0,
      last = performance.now(),
      visible = false;
    const ring = el.firstElementChild as HTMLElement;
    // Position is written straight from the pointer event so the ring sits on the cursor with no lag.
    const place = () => (el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      place();
      if (!visible) {
        visible = true;
        el.style.opacity = "1";
      }
      const t = e.target as HTMLElement;
      const view = t.closest?.("[data-cursor='view']");
      const interactive = t.closest?.("a, button, [role='button'], input, select, textarea, label");
      targetScale = view ? 3.2 : interactive ? 1.8 : 1;
      label.style.opacity = view ? "1" : "0";
    };
    const onLeave = () => {
      visible = false;
      el.style.opacity = "0";
    };

    // Only the grow/shrink over links is eased, at the same speed on any refresh rate.
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      scale += (targetScale - scale) * (1 - Math.exp(-18 * dt));
      ring.style.transform = `scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100] opacity-0 transition-opacity duration-300 mix-blend-difference"
    >
      <span className="block size-6 rounded-full border border-cream/70" />
      <span
        ref={labelRef}
        className="type-label absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[0.55rem] text-cream opacity-0 transition-opacity duration-300"
      >
        View
      </span>
    </div>
  );
}
