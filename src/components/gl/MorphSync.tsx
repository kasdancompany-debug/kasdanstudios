"use client";

import { useEffect } from "react";
import { morph } from "./morphStore";

/** Points the morphing object at whichever [data-morph] section is mid-screen. */
export function MorphSync() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-morph]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) morph.active = (e.target as HTMLElement).dataset.morph ?? "";
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return null;
}
