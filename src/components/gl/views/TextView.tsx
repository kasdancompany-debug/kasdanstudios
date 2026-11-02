"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { View } from "@react-three/drei";
import * as THREE from "three";
import { noise } from "../shaders";
import { mouse } from "../GLRoot";
import { rasterizeText } from "../rasterize";
import { frame, studio } from "@/components/studio/store";

const vertex = /* glsl */ `
varying vec2 vUv;
// Clip-space quad: the view's viewport is already this element's rect.
void main() { vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }
`;

/**
 * Type as image: a noise dissolve with a safelight burn edge on entry, a
 * lens bulge + chromatic split where the cursor passes, and film-gate
 * line jitter when the page moves fast.
 */
const fragment = /* glsl */ `
${noise}
uniform sampler2D uTex;
uniform float uTime;
uniform float uReveal;
uniform vec2 uPointer;   // 0..1 in plane space, y up
uniform float uNear;     // 0..1 cursor proximity
uniform float uVel;
uniform float uAspect;
uniform float uOpacity;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // Gate weave + velocity line jitter
  float line = floor(uv.y * 48.0);
  uv.x += (hash12(vec2(line, floor(uTime * 24.0))) - 0.5) * abs(uVel) * 0.04;
  uv += vec2(sin(uTime * 1.3), cos(uTime * 1.7)) * 0.0006;

  // Cursor lens bulge
  vec2 d = (uv - uPointer) * vec2(uAspect, 1.0);
  float dist = length(d);
  float lens = (1.0 - smoothstep(0.0, 0.35, dist)) * uNear;
  uv -= (uv - uPointer) * lens * 0.12;

  float split = 0.004 * lens + abs(uVel) * 0.006;
  vec4 c = texture2D(uTex, uv);
  float r = texture2D(uTex, uv + vec2(split, 0.0)).a;
  float b = texture2D(uTex, uv - vec2(split, 0.0)).a;

  // Dissolve-in with a burning edge
  float n = fbm(vUv * vec2(uAspect * 3.0, 3.0)) * 0.8 + (1.0 - vUv.x) * 0.25;
  float t = uReveal * 1.3 - 0.15;
  float visible = 1.0 - smoothstep(t - 0.02, t + 0.02, n);
  float burn = (1.0 - smoothstep(0.0, 0.06, abs(n - t))) * step(0.001, uReveal) * (1.0 - step(0.999, uReveal));

  float a = max(c.a, max(r, b) * 0.85) * visible * uOpacity;
  vec3 col = c.a > 0.0 ? c.rgb / max(c.a, 0.001) : vec3(1.0);
  col = mix(col, vec3(1.0, 0.25, 0.1), clamp((r - c.a) + (b - c.a), 0.0, 1.0) * 0.9);
  col = mix(col, vec3(1.0, 0.45, 0.15), burn * max(c.a, r));

  gl_FragColor = vec4(col * a, a);
}
`;

function TextPlane({
  el,
  viewEl,
  pad,
  onReady,
}: {
  el: HTMLElement;
  viewEl: React.RefObject<HTMLElement | null>;
  pad: number;
  onReady: () => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);
  // Built by hand: R3F copies a uniforms prop, so in-place updates wouldn't reach the GPU.
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
          uTex: { value: null as THREE.Texture | null },
          uTime: { value: 0 },
          uReveal: { value: 0 },
          uPointer: { value: new THREE.Vector2(-1, -1) },
          uNear: { value: 0 },
          uVel: { value: 0 },
          uAspect: { value: 1 },
          uOpacity: { value: 1 },
        },
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  const uniforms = material.uniforms;

  // (Re)rasterise when fonts are ready and whenever the element resizes.
  useEffect(() => {
    let current: THREE.CanvasTexture | null = null;
    let raf = 0;
    const draw = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const { canvas } = rasterizeText(el, pad);
        const t = new THREE.CanvasTexture(canvas);
        t.colorSpace = THREE.SRGBColorSpace;
        t.premultiplyAlpha = true;
        t.minFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
        current?.dispose();
        current = t;
        setTex(t);
      });
    };
    document.fonts.ready.then(draw);
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      current?.dispose();
    };
  }, [el, pad]);

  // Ancestors whose inline opacity/visibility (set by GSAP and friends) the GL copy should follow.
  const ancestors = useMemo(() => {
    const list: HTMLElement[] = [];
    let n: HTMLElement | null = el;
    while (n && n !== document.body) {
      list.push(n);
      n = n.parentElement;
    }
    return list;
  }, [el]);

  const readyCalled = useRef(false);
  useFrame(() => {
    const dt = frame.delta;
    const m = mesh.current;
    const v = viewEl.current;
    if (!m || !v || !tex) return;
    const r = v.getBoundingClientRect();
    uniforms.uTex.value = tex;
    uniforms.uTime.value = frame.time;
    uniforms.uAspect.value = r.width / Math.max(1, r.height);
    uniforms.uVel.value = studio.velocity;
    let o = 1;
    for (const a of ancestors) {
      if (a.style.visibility === "hidden") o = 0;
      else if (a.style.opacity) o *= parseFloat(a.style.opacity);
    }
    uniforms.uOpacity.value = o;

    const inView = r.top < window.innerHeight * 0.92 && r.bottom > 0;
    if (inView) uniforms.uReveal.value = Math.min(1, uniforms.uReveal.value + dt * 0.75);

    const px = (mouse.x - r.left) / r.width;
    const py = 1 - (mouse.y - r.top) / r.height;
    uniforms.uPointer.value.set(px, py);
    const inside = px > -0.1 && px < 1.1 && py > -0.3 && py < 1.3 ? 1 : 0;
    uniforms.uNear.value = THREE.MathUtils.damp(uniforms.uNear.value, inside, 6, dt);

    if (!readyCalled.current) {
      readyCalled.current = true;
      onReady();
    }
  });

  return (
    <mesh ref={mesh} frustumCulled={false} material={material}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

export default function TextView({ target, pad, onReady }: { target: HTMLElement; pad: number; onReady: () => void }) {
  const viewEl = useRef<HTMLElement>(null);
  return (
    <View
      ref={viewEl}
      index={3}
      className="pointer-events-none absolute"
      style={{ inset: -pad }}
      {...({ "data-gl-view": "" } as object)}
    >
      <TextPlane el={target} viewEl={viewEl} pad={pad} onReady={onReady} />
    </View>
  );
}
