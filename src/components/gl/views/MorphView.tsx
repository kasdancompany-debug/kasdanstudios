"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import * as THREE from "three";
import { EmulsionPlane } from "./EmulsionView";
import { morph } from "../morphStore";
import { frame, studio } from "@/components/studio/store";

/* Ashima/Stefan Gustavson 3D simplex noise (MIT) */
const snoise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

const vertex = /* glsl */ `
${snoise}
uniform float uTime;
uniform float uFreq;
uniform float uAmp;
uniform float uTwist;
uniform float uPulse;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;

float disp(vec3 n) {
  return snoise(n * uFreq + vec3(0.0, uTime * 0.22, 0.0)) * uAmp
       + snoise(n * uFreq * 2.4 - vec3(uTime * 0.17)) * uAmp * 0.33
       + uPulse * 0.08 * sin(uTime * 3.0 + n.y * 6.0);
}

vec3 shape(vec3 n) {
  vec3 q = n * (1.0 + disp(n));
  float a = q.y * uTwist;
  float c = cos(a), s = sin(a);
  q.xz = mat2(c, -s, s, c) * q.xz;
  return q;
}

void main() {
  vec3 n = normalize(position);
  vec3 t = normalize(cross(n, abs(n.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
  vec3 b = normalize(cross(n, t));
  float e = 0.012;
  vec3 q = shape(n);
  vec3 q1 = shape(normalize(n + t * e));
  vec3 q2 = shape(normalize(n + b * e));
  vec3 nn = normalize(cross(q1 - q, q2 - q));
  vDisp = disp(n);
  vec4 mv = modelViewMatrix * vec4(q, 1.0);
  vNormal = normalize(normalMatrix * nn);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const fragment = /* glsl */ `
uniform float uHue;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;

vec3 palette(float t) {
  // Darkroom thin-film: tungsten, safelight, print cream, cyan fringe
  vec3 a = vec3(0.52, 0.38, 0.30);
  vec3 b = vec3(0.48, 0.36, 0.32);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.18, 0.36);
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vView);
  if (!gl_FrontFacing) n = -n;
  float ndv = max(dot(n, v), 0.0);
  float fres = pow(1.0 - ndv, 2.2);

  vec3 film = palette(fres * 1.4 + vDisp * 2.2 + uHue);
  vec3 base = vec3(0.035, 0.03, 0.026);

  vec3 l = normalize(vec3(-0.5, 0.8, 0.6));
  vec3 h = normalize(l + v);
  float spec = pow(max(dot(n, h), 0.0), 60.0);
  float rim = smoothstep(0.35, 1.0, fres);

  vec3 col = mix(base, film, rim * 0.95 + 0.08);
  col += vec3(1.0, 0.85, 0.7) * spec * 0.9;
  col += film * max(dot(n, l), 0.0) * 0.12;

  gl_FragColor = vec4(col, 1.0);
}
`;

// One temperament per discipline, in content/services.ts order.
type Preset = { freq: number; amp: number; twist: number; hue: number };

/** One personality per service, keyed by the ids in content/services.ts. */
const PRESETS: Record<string, Preset> = {
  "marketing-strategy": { freq: 0.75, amp: 0.4, twist: -0.7, hue: 0.8 }, // heavy, deliberate
  "meta-ads-lead-gen": { freq: 3.2, amp: 0.2, twist: 0.8, hue: 0.05 }, // quick, warm, pulling in
  "graphic-design": { freq: 2.6, amp: 0.17, twist: 1.4, hue: 0.22 }, // wrung, safelight
  "social-tiktok": { freq: 4.2, amp: 0.1, twist: 0.0, hue: 0.48 }, // fizzing, quick
  photography: { freq: 2.0, amp: 0.24, twist: 0.5, hue: 0.32 }, // soft, daylight
  "web-design": { freq: 1.8, amp: 0.14, twist: -1.6, hue: 0.62 }, // engineered spiral, cool
  "commercials-film": { freq: 1.1, amp: 0.3, twist: 0.35, hue: 0.0 }, // slow, tungsten
  "real-estate": { freq: 0.6, amp: 0.22, twist: 0.1, hue: 0.12 }, // calm, architectural
};
const DEFAULT_PRESET = PRESETS["marketing-strategy"];

function Morph() {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uTime: { value: 0 },
          uFreq: { value: DEFAULT_PRESET.freq },
          uAmp: { value: DEFAULT_PRESET.amp },
          uTwist: { value: DEFAULT_PRESET.twist },
          uHue: { value: DEFAULT_PRESET.hue },
          uPulse: { value: 0 },
        },
      }),
    [],
  );
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 48), []);
  useEffect(
    () => () => {
      material.dispose();
      geometry.dispose();
    },
    [material, geometry],
  );

  useFrame(() => {
    const u = material.uniforms;
    const dt = frame.delta;
    const p = PRESETS[morph.active] ?? DEFAULT_PRESET;
    u.uTime.value = frame.time;
    u.uFreq.value = THREE.MathUtils.damp(u.uFreq.value, p.freq, 2.2, dt);
    u.uAmp.value = THREE.MathUtils.damp(u.uAmp.value, p.amp, 2.2, dt);
    u.uTwist.value = THREE.MathUtils.damp(u.uTwist.value, p.twist, 2.2, dt);
    u.uHue.value = THREE.MathUtils.damp(u.uHue.value, p.hue, 2.2, dt);
    u.uPulse.value = THREE.MathUtils.damp(u.uPulse.value, Math.abs(studio.velocity), 4, dt);
    const m = mesh.current;
    if (m) {
      m.rotation.y += dt * 0.15;
      m.rotation.x = THREE.MathUtils.damp(m.rotation.x, -studio.pointer.y * 0.35, 2.5, dt);
      m.rotation.z = THREE.MathUtils.damp(m.rotation.z, studio.pointer.x * 0.25, 2.5, dt);
    }
  });

  return <mesh ref={mesh} geometry={geometry} material={material} />;
}

export default function MorphView() {
  return (
    <View index={2} className="pointer-events-none absolute inset-0">
      <PerspectiveCamera makeDefault position={[0, 0, 4.2]} fov={35} />
      <EmulsionPlane />
      <Morph />
    </View>
  );
}
