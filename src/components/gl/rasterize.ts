/**
 * Draws an element's text onto a canvas exactly where the browser laid it
 * out (same font, size, colour and line breaks), so WebGL can take over the
 * visuals while the real text stays in the DOM for search and screen readers.
 */
export function rasterizeText(el: HTMLElement, pad: number, maxDpr = 2) {
  const rect = el.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const w = Math.max(1, Math.ceil(rect.width + pad * 2));
  const h = Math.max(1, Math.ceil(rect.height + pad * 2));
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(w * dpr);
  canvas.height = Math.ceil(h * dpr);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.textBaseline = "alphabetic";

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let node: Node | null;

  while ((node = walker.nextNode())) {
    const text = node.textContent ?? "";
    if (!text.trim()) continue;
    const parent = node.parentElement!;
    const cs = getComputedStyle(parent);
    // GL-ready elements are made transparent; read the colour we stored instead.
    const color = parent.closest<HTMLElement>("[data-gl-color]")?.dataset.glColor ?? cs.color;
    const size = parseFloat(cs.fontSize);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.fontVariantCaps = "normal";
    ctx.fillStyle = parent.dataset.glColor ?? color;
    const upper = cs.textTransform === "uppercase";

    // Canvas can't apply font-variation-settings, so its advances differ from
    // the browser's. Placing every character at its own measured DOM box keeps
    // spacing and line breaks identical.
    const probe = ctx.measureText("Hg");
    const ascent = probe.fontBoundingBoxAscent ?? size * 0.8;
    const descent = probe.fontBoundingBoxDescent ?? size * 0.2;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (/\s/.test(ch)) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const r = range.getClientRects()[0];
      if (!r) continue;
      // Centre the glyph box vertically in the line box, then sit on the baseline.
      const y = r.top - rect.top + pad + (r.height - (ascent + descent)) / 2 + ascent;
      ctx.fillText(upper ? ch.toUpperCase() : ch, r.left - rect.left + pad, y);
    }
  }

  return { canvas, width: w, height: h };
}

/** Reads a CSS variable that holds a font-family list (from next/font). */
export function cssFont(varName: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}
