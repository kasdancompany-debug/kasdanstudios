"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, View } from "@react-three/drei";
import * as THREE from "three";
import { noise } from "../shaders";
import { cssFont } from "../rasterize";
import { frame, studio } from "@/components/studio/store";

export type MediaInput = { hover: number; px: number; py: number };

const vertex = /* glsl */ `
varying vec2 vUv;
// Clip-space quad: the view's viewport is already this element's rect.
void main() { vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }
`;

/**
 * Image as projected light:
 * - film-burn reveal on first view (noise front with a hot safelight edge)
 * - hover: ripple from the cursor, slow push-in, chromatic split
 * - scroll velocity: vertical smear + horizontal shear
 * - object-fit: cover maths so any image fills any card
 */
const fragment = /* glsl */ `
${noise}
uniform sampler2D uTex;
uniform vec2 uPlane;
uniform vec2 uImage;
uniform vec2 uFocus;     // focal point, 0..1, y up (matches CSS object-position)
uniform float uTime;
uniform float uHover;
uniform vec2 uPointer;
uniform float uVel;
uniform float uReveal;
varying vec2 vUv;

vec2 cover(vec2 uv) {
  float rp = uPlane.x / uPlane.y;
  float ri = uImage.x / uImage.y;
  vec2 s = rp > ri ? vec2(1.0, ri / rp) : vec2(rp / ri, 1.0);
  // Crop towards the focal point instead of always from the centre
  return (uv - 0.5) * s + 0.5 + (uFocus - 0.5) * (1.0 - s);
}

void main() {
  vec2 uv = vUv;
  float aspect = uPlane.x / uPlane.y;

  // Ripple from the cursor
  vec2 d = (uv - uPointer) * vec2(aspect, 1.0);
  float dist = length(d);
  float wave = sin(dist * 34.0 - uTime * 5.0) * exp(-dist * 5.0) * 0.008 * uHover;
  uv += normalize(d + 1e-5) * wave;

  // Scroll shear
  uv.x += sin(uv.y * 3.14159) * uVel * 0.02;

  // Push in on hover
  uv = (uv - 0.5) * (1.0 - 0.05 * uHover) + 0.5;
  vec2 tuv = cover(uv);

  float split = 0.0025 * uHover + abs(uVel) * 0.006;
  vec3 col;
  col.r = texture2D(uTex, tuv + vec2(split, 0.0)).r;
  col.g = texture2D(uTex, tuv + vec2(0.0, uVel * 0.01)).g;
  col.b = texture2D(uTex, tuv - vec2(split, 0.0)).b;

  // Halation: warm the highlights a touch
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col += vec3(0.25, 0.08, 0.02) * smoothstep(0.65, 1.0, lum) * 0.5;

  // Film-burn reveal
  float n = fbm(vUv * vec2(aspect * 2.5, 2.5)) * 0.75 + vUv.y * 0.35;
  float t = uReveal * 1.25 - 0.1;
  float vis = 1.0 - smoothstep(t - 0.015, t + 0.015, n);
  float edge = (1.0 - smoothstep(0.0, 0.07, abs(n - t))) * step(0.001, uReveal) * (1.0 - step(0.999, uReveal));
  col = mix(col, vec3(1.0, 0.5, 0.18), edge);

  float g = hash12(gl_FragCoord.xy + fract(uTime * 24.0) * 97.0) - 0.5;
  col += g * 0.04;

  float a = max(vis, edge);
  gl_FragColor = vec4(col * a, a);
}
`;

/** Production-slate texture for media that hasn't been supplied yet. */
function slateCanvas(label: string, hint: string, w: number, h: number) {
  const scale = Math.min(2, 1400 / Math.max(w, h)) * Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(64, Math.round(w * scale));
  const H = Math.max(64, Math.round(h * scale));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const u = Math.min(W, H) / 100;

  ctx.fillStyle = "#15120f";
  ctx.fillRect(0, 0, W, H);
  // Exposure falloff
  const g = ctx.createRadialGradient(W * 0.7, H * 0.25, 0, W * 0.7, H * 0.25, Math.max(W, H) * 0.9);
  g.addColorStop(0, "rgba(255,150,80,0.28)");
  g.addColorStop(0.45, "rgba(255,90,44,0.06)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Frame lines and centre cross, like a ground-glass
  ctx.strokeStyle = "rgba(242,235,223,0.22)";
  ctx.lineWidth = Math.max(1, u * 0.18);
  const m = u * 5;
  ctx.strokeRect(m, m, W - m * 2, H - m * 2);
  ctx.beginPath();
  ctx.moveTo(W / 2 - u * 3, H / 2);
  ctx.lineTo(W / 2 + u * 3, H / 2);
  ctx.moveTo(W / 2, H / 2 - u * 3);
  ctx.lineTo(W / 2, H / 2 + u * 3);
  ctx.stroke();

  const mono = cssFont("--font-martian", "monospace");
  const display = cssFont("--font-shoulders", "sans-serif");

  ctx.fillStyle = "#ff5a2c";
  ctx.font = `500 ${Math.round(u * 2.6)}px ${mono}`;
  ctx.fillText("ASSET PLACEHOLDER", m + u * 3, m + u * 6);

  ctx.fillStyle = "#f2ebdf";
  const size = Math.round(Math.min(u * 11, (W - m * 4) / Math.max(8, label.length * 0.42)));
  ctx.font = `800 ${size}px ${display}`;
  const words = label.toUpperCase().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w0 of words) {
    const test = line ? `${line} ${w0}` : w0;
    if (ctx.measureText(test).width > W - m * 4 && line) {
      lines.push(line);
      line = w0;
    } else line = test;
  }
  lines.push(line);
  const lh = size * 0.92;
  const base = H - m - u * 9 - (lines.length - 1) * lh;
  lines.forEach((l, i) => ctx.fillText(l, m + u * 3, base + i * lh));

  ctx.fillStyle = "rgba(160,150,133,0.9)";
  ctx.font = `400 ${Math.round(u * 2.3)}px ${mono}`;
  ctx.fillText(hint.toUpperCase(), m + u * 3, H - m - u * 4);

  return c;
}

function MediaPlane({
  texture,
  imageSize,
  focus = [0.5, 0.5],
  viewEl,
  input,
  onReady,
}: {
  texture: THREE.Texture;
  imageSize: [number, number];
  /** Focal point as CSS object-position fractions (x from left, y from top). */
  focus?: [number, number];
  viewEl: React.RefObject<HTMLElement | null>;
  input: React.RefObject<MediaInput>;
  onReady: () => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  // Built by hand rather than as <shaderMaterial uniforms={…}>: R3F copies a
  // uniforms prop, so in-place updates to our object would never reach the GPU.
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        uniforms: {
          uTex: { value: texture },
          uPlane: { value: new THREE.Vector2(1, 1) },
          uImage: { value: new THREE.Vector2(...imageSize) },
          uFocus: { value: new THREE.Vector2(focus[0], 1 - focus[1]) },
          uTime: { value: 0 },
          uHover: { value: 0 },
          uPointer: { value: new THREE.Vector2(0.5, 0.5) },
          uVel: { value: 0 },
          uReveal: { value: 0 },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- focus is fixed per image
    [texture, imageSize],
  );
  useEffect(() => () => material.dispose(), [material]);
  const uniforms = material.uniforms;
  const ready = useRef(false);

  useFrame(() => {
    const dt = frame.delta;
    const m = mesh.current;
    const v = viewEl.current;
    if (!m || !v) return;
    const r = v.getBoundingClientRect();
    uniforms.uPlane.value.set(r.width, r.height);
    uniforms.uTime.value = frame.time;
    uniforms.uVel.value = studio.velocity;
    const inp = input.current;
    uniforms.uHover.value = THREE.MathUtils.damp(uniforms.uHover.value, inp.hover, 5, dt);
    const k = 1 - Math.exp(-10 * dt);
    uniforms.uPointer.value.x += (inp.px - uniforms.uPointer.value.x) * k;
    uniforms.uPointer.value.y += (1 - inp.py - uniforms.uPointer.value.y) * k;
    if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
      uniforms.uReveal.value = Math.min(1, uniforms.uReveal.value + dt * 0.6);
    }
    if (!ready.current) {
      ready.current = true;
      onReady();
    }
  });

  return (
    <mesh ref={mesh} frustumCulled={false} material={material}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

function ImagePlane(props: {
  src: string;
  focus?: [number, number];
  viewEl: React.RefObject<HTMLElement | null>;
  input: React.RefObject<MediaInput>;
  onReady: () => void;
}) {
  // The raw shader writes its result straight to the (sRGB) canvas with no
  // output conversion, so the photo's sRGB values must pass through untouched.
  // Tagging it SRGBColorSpace would linearise it on sampling and the plane
  // would render roughly gamma-squared, i.e. far darker than the real photo.
  const tex = useTexture(props.src, (t) => {
    t.colorSpace = THREE.NoColorSpace;
  });
  const img = tex.image as { width: number; height: number };
  return <MediaPlane texture={tex} imageSize={[img.width, img.height]} {...props} />;
}

function SlatePlane({
  label,
  hint,
  ...props
}: {
  label: string;
  hint: string;
  viewEl: React.RefObject<HTMLElement | null>;
  input: React.RefObject<MediaInput>;
  onReady: () => void;
}) {
  const { tex, size } = useMemo(() => {
    const r = props.viewEl.current?.getBoundingClientRect();
    const c = slateCanvas(label, hint, r?.width ?? 800, r?.height ?? 450);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return { tex: t, size: [c.width, c.height] as [number, number] };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- drawn once per label at mount size
  }, [label, hint]);
  useEffect(() => () => tex.dispose(), [tex]);
  return <MediaPlane texture={tex} imageSize={size} {...props} />;
}

export default function MediaView({
  src,
  focus,
  label,
  hint,
  input,
  onReady,
}: {
  src?: string | null;
  focus?: [number, number];
  label: string;
  hint: string;
  input: React.RefObject<MediaInput>;
  onReady: () => void;
}) {
  const viewEl = useRef<HTMLElement>(null);
  return (
    <View
      ref={viewEl}
      index={2}
      className="pointer-events-none absolute inset-0"
      {...({ "data-gl-view": "" } as object)}
    >
      <Suspense fallback={null}>
        {src ? (
          <ImagePlane src={src} focus={focus} viewEl={viewEl} input={input} onReady={onReady} />
        ) : (
          <SlatePlane label={label} hint={hint} viewEl={viewEl} input={input} onReady={onReady} />
        )}
      </Suspense>
    </View>
  );
}
