"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { frame, glStore, scroll, studio } from "@/components/studio/store";

/** Eases scroll velocity back to rest between scroll events. */
function VelocityDecay() {
  useFrame((state, dt) => {
    frame.time = state.clock.elapsedTime;
    frame.delta = Math.min(dt, 0.1);
    scroll.velocity *= Math.exp(-dt * 6);
    // Normalised velocity for shaders that want -1..1
    studio.velocity = Math.max(-1, Math.min(1, scroll.velocity / 2500));
  });
  return null;
}

/**
 * The single, sitewide WebGL canvas. Every GL element on the page renders
 * into it through drei <View>s, which scissor their scene into the screen
 * rect of a tracked DOM element. Views draw in `index` order, so the
 * full-screen emulsion background (index 1) is always underneath.
 */
export default function GLCanvas() {
  const high = glStore.get().tier === "high";
  return (
    <Canvas
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: -10, pointerEvents: "none" }}
      dpr={high ? [1, 1.25] : 1}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => gl.setClearColor("#0b0a09")}
    >
      <VelocityDecay />
      <View.Port />
    </Canvas>
  );
}
