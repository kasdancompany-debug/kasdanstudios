import * as THREE from "three";

/**
 * Procedural textures drawn on 2D canvases — no image downloads.
 * Every texture returned here must be disposed by its owner.
 */

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

/** Seeded PRNG so strips look varied but stable between renders. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * A length of 35mm film: sprocket holes along both edges (cut out with alpha)
 * and exposed frames that read as warm, under-developed images.
 */
export function filmStripTexture(seed = 1): THREE.CanvasTexture {
  const W = 256;
  const H = 1536;
  const [c, ctx] = canvas(W, H);
  const rand = rng(seed);

  // Film base
  ctx.fillStyle = "#0b0a09";
  ctx.fillRect(0, 0, W, H);

  // Frames
  const frameH = 168;
  const gap = 24;
  const frameX = 38;
  const frameW = W - frameX * 2;
  for (let y = gap / 2, i = 0; y < H; y += frameH + gap, i++) {
    const warm = 0.35 + rand() * 0.5;
    const g = ctx.createLinearGradient(frameX, y, frameX + frameW, y + frameH);
    g.addColorStop(0, `rgba(${120 * warm + 40}, ${92 * warm + 28}, ${58 * warm + 18}, 1)`);
    g.addColorStop(0.55 + rand() * 0.3, `rgba(${40 * warm + 14}, ${32 * warm + 12}, ${24 * warm + 10}, 1)`);
    g.addColorStop(1, "rgba(12, 11, 9, 1)");
    ctx.fillStyle = g;
    ctx.fillRect(frameX, y, frameW, frameH);

    // A soft "light source" in each frame — suggests a shot without inventing one
    const lx = frameX + frameW * (0.2 + rand() * 0.6);
    const ly = y + frameH * (0.25 + rand() * 0.5);
    const rg = ctx.createRadialGradient(lx, ly, 0, lx, ly, frameW * (0.3 + rand() * 0.3));
    rg.addColorStop(0, `rgba(238, 222, 190, ${0.28 + rand() * 0.25})`);
    rg.addColorStop(1, "rgba(238, 222, 190, 0)");
    ctx.fillStyle = rg;
    ctx.fillRect(frameX, y, frameW, frameH);

    // Frame numbers along the edge, like edge codes
    ctx.fillStyle = "rgba(199, 170, 118, 0.55)";
    ctx.font = "10px monospace";
    ctx.save();
    ctx.translate(frameX - 8, y + frameH - 6);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`KS ${String(seed).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`, 0, 0);
    ctx.restore();
  }

  // Sprocket holes (alpha cut-outs)
  ctx.globalCompositeOperation = "destination-out";
  const holeW = 14;
  const holeH = 20;
  for (let y = 10; y < H; y += 32) {
    for (const x of [10, W - 10 - holeW]) {
      ctx.beginPath();
      ctx.roundRect(x, y, holeW, holeH, 3);
      ctx.fill();
    }
  }
  ctx.globalCompositeOperation = "source-over";

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Screen content for a project slot with no supplied footage. It reads as a
 * production slate so it can never be mistaken for real work.
 */
export function slateTexture(index: number, title: string, subtitle: string): THREE.CanvasTexture {
  const W = 1280;
  const H = 720;
  const [c, ctx] = canvas(W, H);

  ctx.fillStyle = "#141210";
  ctx.fillRect(0, 0, W, H);
  const rg = ctx.createRadialGradient(W * 0.3, H * 0.25, 0, W * 0.3, H * 0.25, W * 0.8);
  rg.addColorStop(0, "rgba(199,170,118,0.16)");
  rg.addColorStop(1, "rgba(199,170,118,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, W, H);

  // Crop marks
  ctx.strokeStyle = "rgba(207,198,182,0.35)";
  ctx.lineWidth = 2;
  const m = 48;
  const L = 36;
  for (const [x, y, dx, dy] of [
    [m, m, 1, 1],
    [W - m, m, -1, 1],
    [m, H - m, 1, -1],
    [W - m, H - m, -1, -1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * L);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * L, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#c7aa76";
  ctx.font = "500 22px monospace";
  ctx.fillText(`(${String(index + 1).padStart(2, "0")})  ${subtitle.toUpperCase()}`, 96, 120);

  ctx.fillStyle = "#eee7da";
  ctx.font = "italic 72px Georgia, 'Times New Roman', serif";
  ctx.fillText(title, 96, H - 150);

  ctx.fillStyle = "#756e63";
  ctx.font = "500 20px monospace";
  ctx.fillText("ASSET PLACEHOLDER — AWAITING FOOTAGE", 96, H - 96);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Engraved lens-barrel markings, drawn radially for a RingGeometry's planar UVs. */
export function engravingTexture(): THREE.CanvasTexture {
  const S = 1024;
  const [c, ctx] = canvas(S, S);
  ctx.clearRect(0, 0, S, S);
  ctx.translate(S / 2, S / 2);

  const text = "KASDAN STUDIOS · CINE 35mm · 1:1.4 · ∞ · IDEAS WORTH WATCHING · ";
  ctx.fillStyle = "rgba(238,231,218,0.85)";
  ctx.font = "600 26px monospace";
  const radius = S * 0.405;
  const chars = [...text];
  const step = (Math.PI * 2) / chars.length;
  chars.forEach((ch, i) => {
    ctx.save();
    ctx.rotate(i * step);
    ctx.translate(0, -radius);
    ctx.fillText(ch, -8, 0);
    ctx.restore();
  });

  // Fine graduation ticks
  ctx.strokeStyle = "rgba(199,170,118,0.6)";
  for (let i = 0; i < 120; i++) {
    ctx.save();
    ctx.rotate((i / 120) * Math.PI * 2);
    ctx.beginPath();
    ctx.lineWidth = i % 10 === 0 ? 2.5 : 1;
    ctx.moveTo(0, -S * 0.455);
    ctx.lineTo(0, -S * (i % 10 === 0 ? 0.475 : 0.466));
    ctx.stroke();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
