"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { detectCapabilities, glStore, scroll, studio } from "@/components/studio/store";
import { onPointerPosition, pointerXY } from "@/lib/motion/pointer";

const GLCanvas = dynamic(() => import("./GLCanvas"), { ssr: false });

const PREF_KEY = "ks-immersive";

/**
 * Decides whether the sitewide WebGL canvas runs, and feeds it pointer and
 * scroll data. Every GL element on the site has a DOM fallback, so when this
 * stays off (no WebGL, reduced motion, data saver, or the visitor turned it
 * off) the site is complete without it.
 */
export function GLRoot() {
  const [mount, setMount] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    let pref: string | null = null;
    try {
      pref = localStorage.getItem(PREF_KEY);
    } catch {}
    const cap = detectCapabilities();
    if (!cap.webgl || cap.reducedMotion || cap.saveData || pref === "off") {
      // The boot script guessed WebGL would run; it won't, so show the DOM headings.
      html.removeAttribute("data-gl");
      return;
    }

    // Wait for the intro (if any) so only one WebGL context runs at a time.
    const start = () => {
      html.setAttribute("data-gl", "on");
      glStore.set({ enabled: true, tier: cap.tier });
      setMount(true);
    };
    if (html.getAttribute("data-intro")) {
      const mo = new MutationObserver(() => {
        if (!html.getAttribute("data-intro")) {
          mo.disconnect();
          start();
        }
      });
      mo.observe(html, { attributes: true, attributeFilter: ["data-intro"] });
      return () => mo.disconnect();
    }
    start();
  }, []);

  // Pointer + scroll velocity, shared with every shader
  useEffect(() => {
    if (!mount) return;
    let lastY = window.scrollY;
    let lastT = performance.now();
    const onMove = (e: PointerEvent) => {
      const [x, y] = pointerXY(e);
      studio.pointer.x = (x / window.innerWidth) * 2 - 1;
      studio.pointer.y = -((y / window.innerHeight) * 2 - 1);
      mouse.x = x;
      mouse.y = y;
    };
    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(16, now - lastT);
      const v = ((window.scrollY - lastY) / dt) * 1000; // px/s
      scroll.velocity = scroll.velocity * 0.7 + v * 0.3;
      scroll.y = window.scrollY;
      lastY = window.scrollY;
      lastT = now;
    };
    const offMove = onPointerPosition(onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      offMove();
      window.removeEventListener("scroll", onScroll);
    };
  }, [mount]);

  return mount ? <GLCanvas /> : null;
}

/** Last pointer position in CSS px (top-left origin). */
export const mouse = { x: -9999, y: -9999 };
