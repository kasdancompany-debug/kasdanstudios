"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { View } from "@react-three/drei";
import * as THREE from "three";
import { emulsion } from "../shaders";
import { mouse } from "../GLRoot";
import { frame, scroll, studio } from "@/components/studio/store";

const vertex = /* glsl */ `
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragment = /* glsl */ `
${emulsion}
void main() { gl_FragColor = vec4(emulsionColor(gl_FragCoord.xy), 1.0); }
`;

/**
 * Material that paints the emulsion field. Built by hand (not via a
 * uniforms prop, which R3F copies) so per-frame updates reach the GPU.
 */
export function useEmulsionMaterial() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uRes: { value: new THREE.Vector2(1, 1) },
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(-9999, -9999) },
          uVel: { value: 0 },
          uScrollY: { value: 0 },
          uLeak: { value: 1 },
        },
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  const gl = useThree((s) => s.gl);
  useFrame(() => {
    const u = material.uniforms;
    const dpr = gl.getPixelRatio();
    // Always the whole canvas (never the view's rect) so every view's
    // backdrop lines up with the page background exactly.
    gl.getDrawingBufferSize(u.uRes.value);
    const height = window.innerHeight;
    u.uTime.value = frame.time;
    u.uMouse.value.set(mouse.x * dpr, mouse.y * dpr);
    u.uVel.value = studio.velocity;
    u.uScrollY.value = scroll.y * dpr;
    // Light leaks are strongest at the top of a page and settle down for reading
    u.uLeak.value = 1 - Math.min(1, scroll.y / (height * 1.4)) * 0.55;
  });
  return material;
}

/** A clip-space quad that paints the emulsion field across its view. */
export function EmulsionPlane({ renderOrder = -1 }: { renderOrder?: number }) {
  const material = useEmulsionMaterial();
  return (
    <mesh frustumCulled={false} renderOrder={renderOrder} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

export default function EmulsionView() {
  return (
    <View className="pointer-events-none fixed inset-0" index={1}>
      <EmulsionPlane />
    </View>
  );
}
