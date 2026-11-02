import { BlendFunction, Effect, EffectAttribute } from "postprocessing";
import * as THREE from "three";

/**
 * One fullscreen pass that finishes the frame like a film print:
 * - barrel lens distortion (mainly during transitions)
 * - chromatic aberration that grows toward the edges
 * - vignette
 * - animated procedural grain
 * - an fbm noise mask for scene transitions (0 = clear, 1 = black)
 */
const fragment = /* glsl */ `
uniform float uTime;
uniform float uGrain;
uniform float uVignette;
uniform float uAberration;
uniform float uDistortion;
uniform float uMask;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // Barrel distortion is applied while sampling: postprocessing forbids a
  // separate UV-transform stage in a convolution effect.
  vec2 c = uv - 0.5;
  float edge = dot(c, c);
  vec2 duv = 0.5 + c * (1.0 - uDistortion * edge);
  vec2 off = c * uAberration * (0.35 + edge * 2.5);

  vec3 col;
  col.r = texture2D(inputBuffer, duv + off).r;
  col.g = uDistortion > 0.0005 ? texture2D(inputBuffer, duv).g : inputColor.g;
  col.b = texture2D(inputBuffer, duv - off).b;

  // Vignette — oval, gentle
  float vig = 1.0 - smoothstep(0.18, 0.95, length(c * vec2(1.0, 1.15)));
  // Outside the distorted frame, fall to black instead of smearing edges
  vig *= step(0.0, duv.x) * step(duv.x, 1.0) * step(0.0, duv.y) * step(duv.y, 1.0);
  col *= mix(1.0, vig, uVignette);

  // Grain: luminance-weighted so blacks stay deep
  float g = hash(uv * resolution + fract(uTime * 24.0) * 97.0) - 0.5;
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col += g * uGrain * (0.35 + 0.65 * (1.0 - lum));

  // Noise-mask transition
  if (uMask > 0.0) {
    float n = fbm(uv * vec2(3.2, 2.0) + vec2(uTime * 0.04, 0.0));
    float m = smoothstep(n - 0.12, n + 0.12, uMask * 1.25 - 0.05);
    col = mix(col, vec3(0.047, 0.043, 0.035), m);
  }

  outputColor = vec4(col, inputColor.a);
}
`;

export class FilmEffect extends Effect {
  constructor() {
    super("FilmEffect", fragment, {
      blendFunction: BlendFunction.NORMAL,
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, THREE.Uniform>([
        ["uTime", new THREE.Uniform(0)],
        ["uGrain", new THREE.Uniform(0.06)],
        ["uVignette", new THREE.Uniform(0.85)],
        ["uAberration", new THREE.Uniform(0.0015)],
        ["uDistortion", new THREE.Uniform(0)],
        ["uMask", new THREE.Uniform(0)],
      ]),
    });
  }

  set(name: "uTime" | "uGrain" | "uVignette" | "uAberration" | "uDistortion" | "uMask", value: number) {
    this.uniforms.get(name)!.value = value;
  }
}
