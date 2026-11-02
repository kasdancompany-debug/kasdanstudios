"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A quiet trailing ring that accompanies — never replaces — the native
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
      cx = -100,
      cy = -100,
      scale = 1,
      targetScale = 1,
      raf = 0,
      visible = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        cx = x;
        cy = y;
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

    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      scale += (targetScale - scale) * 0.16;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      (el.firstElementChild as HTMLElement).style.transform = `scale(${scale})`;
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
