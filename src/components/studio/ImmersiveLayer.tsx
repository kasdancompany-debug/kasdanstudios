"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { detectCapabilities, type Tier } from "./store";

const Intro = dynamic(() => import("./Intro"), { ssr: false });

/**
 * Runs the "Enter the Studio" aperture intro on the homepage when the boot
 * script marked it pending (first visit this session, motion allowed). The
 * sitewide canvas (GLRoot) waits for it to finish so only one WebGL context
 * exists at a time.
 */
export function ImmersiveLayer() {
  const [tier, setTier] = useState<Tier | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.getAttribute("data-intro") !== "pending") return;
    const cap = detectCapabilities();
    let pref: string | null = null;
    try {
      pref = localStorage.getItem("ks-immersive");
    } catch {}
    if (!cap.webgl || cap.reducedMotion || cap.saveData || pref === "off") {
      html.removeAttribute("data-intro");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capability detection is client-only
    setTier(cap.tier);
  }, []);

  const done = useCallback(() => setTier(null), []);

  // Portalled to <body>: the intro makes <main> inert while it plays, so it
  // must not live inside <main> itself.
  return tier ? createPortal(<Intro tier={tier} onDone={done} />, document.body) : null;
}
