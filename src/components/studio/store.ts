/**
 * Shared, mutable state between the DOM (scroll, pointer, HTML controls)
 * and the WebGL render loop. Deliberately not React state: the render loop
 * reads these values every frame without triggering re-renders.
 */

export type StudioSet = "hero" | "cta";

type Listener = () => void;

export const studio = {
  /** 0 → 1 across the hero + story sections. Written by ScrollTrigger. */
  progress: 0,
  /** Smoothed scroll velocity (progress units / second), drives lens breathing. */
  velocity: 0,
  /** Normalised pointer, -1 → 1. */
  pointer: { x: 0, y: 0 },
  /** Index of the project screen highlighted from the HTML list, or -1. */
  hovered: -1,
  /** Which set the camera is on. */
  set: "hero" as StudioSet,
  /** Whether any immersive section is on screen. */
  visible: true,
  /** 0 → 1: noise-mask transition (route change / set change). */
  transition: 0,

  _listeners: new Set<Listener>(),
  subscribe(fn: Listener) {
    this._listeners.add(fn);
    return () => {
      this._listeners.delete(fn);
    };
  },
  emit() {
    this._listeners.forEach((l) => l());
  },
};

export type Tier = "high" | "low";

export type Capabilities = {
  webgl: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  tier: Tier;
};

export function detectCapabilities(): Capabilities {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  const saveData = Boolean(nav.connection?.saveData);

  let webgl = false;
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") ?? c.getContext("webgl")) as WebGLRenderingContext | null;
    if (gl) {
      // Software rasterisers can't hold a usable frame rate, so they get the static site.
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      webgl = !/swiftshader|llvmpipe|software|basic render/i.test(renderer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    webgl = false;
  }

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const narrow = window.innerWidth < 768;
  const tier: Tier = coarse || narrow || cores <= 4 || memory <= 4 ? "low" : "high";

  return { webgl, reducedMotion, saveData, tier };
}

/* ------------------------------------------------------------------ */
/* Sitewide WebGL state                                                */
/* ------------------------------------------------------------------ */

type GLState = { enabled: boolean; tier: Tier };

let glState: GLState = { enabled: false, tier: "low" };
const glListeners = new Set<() => void>();

export const glStore = {
  get: () => glState,
  set(next: Partial<GLState>) {
    glState = { ...glState, ...next };
    glListeners.forEach((l) => l());
  },
  subscribe(fn: () => void) {
    glListeners.add(fn);
    return () => {
      glListeners.delete(fn);
    };
  },
};

/** Page scroll metrics shared with shaders (px and px/s, smoothed). */
export const scroll = { y: 0, velocity: 0 };

/**
 * Frame clock for everything rendered inside drei <View>s. Portals get their
 * own THREE.Clock that never ticks, so views read this one instead; it is
 * advanced once per frame by the root canvas.
 */
export const frame = { time: 0, delta: 1 / 60 };
