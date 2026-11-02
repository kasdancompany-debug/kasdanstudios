/** Shared GLSL chunks. */

export const noise = /* glsl */ `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = r * p * 2.02;
    a *= 0.5;
  }
  return v;
}
`;

/**
 * The "emulsion" field: warm-black film base with drifting silver-halide
 * clouds, tungsten light leaks at the frame edges, a safelight glow where the
 * cursor is, and vertical gate streaks when the page moves fast.
 *
 * Evaluated in *screen space* (gl_FragCoord) so any view can draw it behind
 * transparent content and it lines up seamlessly with the page background.
 */
export const emulsion = /* glsl */ `
${noise}

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;     // px, origin top-left
uniform float uVel;      // signed scroll velocity, roughly -1..1
uniform float uScrollY;  // px
uniform float uLeak;     // 0..1 overall light-leak strength

vec3 emulsionColor(vec2 frag) {
  vec2 uv = frag / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime;
  float sy = uScrollY / uRes.y;

  vec3 base = vec3(0.043, 0.039, 0.035);

  // Silver-halide clouds drifting with scroll
  float clouds = fbm(p * 1.6 + vec2(t * 0.012, sy * 0.35 + t * 0.008));
  vec3 col = base + (clouds - 0.5) * 0.035;

  // Tungsten leak burning in from the right edge, breathing slowly
  float edge = smoothstep(0.55, 1.15, uv.x + (clouds - 0.5) * 0.55 + sin(t * 0.21 + sy) * 0.08);
  float leakShape = edge * smoothstep(0.0, 0.9, fbm(p * 0.9 + vec2(-t * 0.03, sy * 0.5)) + 0.25);
  col += vec3(1.0, 0.43, 0.14) * leakShape * 0.22 * uLeak;
  col += vec3(1.0, 0.69, 0.38) * pow(leakShape, 3.0) * 0.2 * uLeak;

  // Safelight bleed low on the left
  float red = 1.0 - smoothstep(0.0, 0.75, length((uv - vec2(-0.05, -0.1)) * vec2(1.0, 1.6)));
  red *= 0.6 + 0.4 * fbm(p * 2.0 + t * 0.05);
  col += vec3(0.9, 0.16, 0.06) * red * 0.12 * uLeak;

  // Cursor: a hand-held lamp over the film
  vec2 m = vec2(uMouse.x, uRes.y - uMouse.y);
  float d = length((frag - m) / uRes.y);
  col += vec3(1.0, 0.62, 0.36) * exp(-d * d * 22.0) * 0.07;

  // Gate streaks when moving fast
  float v = clamp(abs(uVel), 0.0, 1.0);
  float streak = vnoise(vec2(uv.x * 140.0, uv.y * 1.5 - t * 6.0 * sign(uVel)));
  col += vec3(0.9, 0.85, 0.78) * smoothstep(0.75, 1.0, streak) * v * 0.06;

  // Grain
  float g = hash12(frag + fract(t * 23.0) * 311.0) - 0.5;
  col += g * 0.045;

  return col;
}
`;
