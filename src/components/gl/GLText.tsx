"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { useGL } from "./useGL";

const TextView = dynamic(() => import("./views/TextView"), { ssr: false });

/**
 * A heading whose letters are redrawn in WebGL (dissolve-in, cursor lens,
 * gate jitter). The real heading stays in the DOM — selectable, indexable
 * and announced normally — and only its colour is hidden once the GL copy
 * has drawn. Without WebGL it is simply the heading.
 */
export function GLText({
  as: Tag = "h2",
  className,
  id,
  children,
}: {
  as?: ElementType;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  const { enabled } = useGL();
  const ref = useRef<HTMLElement>(null);
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [pad, setPad] = useState(0);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    const node = ref.current;
    // The GL dissolve replaces the CSS mask reveal: settle those spans now so
    // words are measured at their final positions.
    node.querySelectorAll<HTMLElement>("[data-reveal]").forEach((c) => {
      c.style.transition = "none";
      c.classList.add("is-in");
    });
    // Remember each span's colour before we make the DOM text transparent.
    node.querySelectorAll<HTMLElement>("*").forEach((c) => {
      c.dataset.glColor = getComputedStyle(c).color;
    });
    node.dataset.glColor = getComputedStyle(node).color;
    setPad(Math.round(parseFloat(getComputedStyle(node).fontSize) * 0.25));
    setEl(node);
  }, [enabled]);

  const onReady = useCallback(() => {
    ref.current?.setAttribute("data-gl-ready", "");
  }, []);

  useEffect(() => () => ref.current?.removeAttribute("data-gl-ready"), []);

  // The heading is held hidden while its GL copy loads (see globals.css). If
  // that takes too long, give up and show the real text.
  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    const t = window.setTimeout(() => {
      if (node && !node.hasAttribute("data-gl-ready")) node.setAttribute("data-gl-fail", "");
    }, 3500);
    return () => window.clearTimeout(t);
  }, [enabled]);

  return (
    <Tag ref={ref} id={id} data-gl-text="" className={`relative ${className ?? ""}`}>
      {children}
      {enabled && el && <TextView target={el} pad={pad} onReady={onReady} />}
    </Tag>
  );
}
