"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { engravingTexture } from "./textures";
import { studio } from "../store";

const BLADES = 9;
/** Radius of the blade pivot circle. */
const RP = 1.18;

/** Iris blade outline: a tapered arm along a curved centreline, pivot at origin, centre at (RP, 0). */
function bladeShape() {
  const p0 = new THREE.Vector2(-0.06, -0.04);
  const p1 = new THREE.Vector2(RP * 0.5, RP * 0.62);
  const p2 = new THREE.Vector2(RP * 1.28, RP * 0.12);
  const curve = new THREE.QuadraticBezierCurve(p0, p1, p2);
  const steps = 28;
  const left: THREE.Vector2[] = [];
  const right: THREE.Vector2[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const c = curve.getPoint(t);
    const tan = curve.getTangent(t);
    const n = new THREE.Vector2(-tan.y, tan.x);
    const w = RP * (0.66 - 0.32 * t) * 0.5;
    left.push(c.clone().addScaledVector(n, w));
    right.push(c.clone().addScaledVector(n, -w));
  }
  const shape = new THREE.Shape();
  shape.moveTo(left[0].x, left[0].y);
  left.slice(1).forEach((p) => shape.lineTo(p.x, p.y));
  // Rounded tip
  const tip = curve.getPoint(1);
  shape.quadraticCurveTo(tip.x + 0.06, tip.y, right[steps].x, right[steps].y);
  right
    .slice(0, steps)
    .reverse()
    .forEach((p) => shape.lineTo(p.x, p.y));
  shape.closePath();
  // Pivot pin hole
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.035, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}

/** Lens housing turned on a lathe: stepped front bezel, recessed throat. Axis = Z. */
function housingGeometry() {
  const pts = [
    [1.16, -0.45],
    [1.16, 0.18],
    [1.22, 0.26],
    [1.3, 0.3],
    [1.9, 0.3],
    [1.96, 0.27],
    [1.98, 0.12],
    [2.06, 0.1],
    [2.06, -0.08],
    [1.98, -0.1],
    [1.98, -0.9],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, 160);
  g.rotateX(Math.PI / 2);
  return g;
}

/** Knurled focus ring: a cylinder whose surface is displaced into fine ridges. */
function knurlGeometry() {
  const g = new THREE.CylinderGeometry(2.1, 2.1, 0.55, 270, 1, true);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const a = Math.atan2(v.z, v.x);
    const ridge = 1 + 0.012 * Math.max(0, Math.sin(a * 90));
    pos.setXYZ(i, v.x * ridge, v.y, v.z * ridge);
  }
  g.computeVertexNormals();
  g.rotateX(Math.PI / 2);
  g.translate(0, 0, -0.42);
  return g;
}

export type ApertureHandle = {
  /** 0 = closed, 1 = fully open. */
  open: number;
  /** Strength of the light behind the iris. */
  light: number;
  /** 0 → 1 camera dolly through the lens. */
  dolly: number;
};

export function Aperture({ control }: { control: React.RefObject<ApertureHandle> }) {
  const group = useRef<THREE.Group>(null);
  const pivots = useRef<(THREE.Group | null)[]>([]);
  const backLight = useRef<THREE.MeshBasicMaterial>(null);
  const keyLight = useRef<THREE.PointLight>(null);

  const { blade, housing, knurl, engraving } = useMemo(() => {
    const blade = new THREE.ExtrudeGeometry(bladeShape(), {
      depth: 0.012,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.006,
      bevelSegments: 2,
      curveSegments: 12,
    });
    return {
      blade,
      housing: housingGeometry(),
      knurl: knurlGeometry(),
      engraving: engravingTexture(),
    };
  }, []);

  // Geometries made outside JSX must be disposed by hand.
  useEffect(
    () => () => {
      blade.dispose();
      housing.dispose();
      knurl.dispose();
      engraving.dispose();
    },
    [blade, housing, knurl, engraving],
  );

  useFrame((state, dt) => {
    const c = control.current;
    const t = state.clock.elapsedTime;
    const camera = state.camera as THREE.PerspectiveCamera;

    // Idle breathing before activation, so the mechanism feels alive.
    const breathe = c.open < 0.02 ? 0.035 + Math.sin(t * 0.9) * 0.02 : 0;
    const o = THREE.MathUtils.clamp(c.open + breathe, 0, 1);
    const theta = THREE.MathUtils.lerp(0.16, -0.95, o);
    for (const p of pivots.current) if (p) p.rotation.z = theta;

    // Spring-damped pointer response
    if (group.current) {
      const g = group.current;
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, studio.pointer.x * 0.22 * (1 - c.dolly), 3.2, dt);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -studio.pointer.y * 0.16 * (1 - c.dolly), 3.2, dt);
      g.rotation.z += dt * 0.02 * (1 - o);
    }

    // Squared so the idle glow stays a faint ember and the open state blooms.
    const l = c.light * c.light;
    if (backLight.current) backLight.current.color.setRGB(1.0 * l, 0.8 * l, 0.56 * l);
    if (keyLight.current) keyLight.current.intensity = 14 + c.light * 12;

    camera.position.z = THREE.MathUtils.lerp(12.5, -2.2, c.dolly * c.dolly * (3 - 2 * c.dolly));
    camera.position.x = THREE.MathUtils.damp(camera.position.x, studio.pointer.x * 0.25 * (1 - c.dolly), 2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, studio.pointer.y * 0.18 * (1 - c.dolly), 2, dt);
    camera.lookAt(0, 0, -3);
    camera.fov = THREE.MathUtils.lerp(30, 55, c.dolly * c.dolly);
    camera.updateProjectionMatrix();
  });

  return (
    <group ref={group}>
      {/* Housing */}
      <mesh geometry={housing}>
        <meshStandardMaterial color="#2b2620" metalness={0.85} roughness={0.3} envMapIntensity={1.4} />
      </mesh>
      <mesh geometry={knurl}>
        <meshStandardMaterial color="#17150f" metalness={0.8} roughness={0.42} />
      </mesh>

      {/* Engraved markings on the front bezel */}
      <mesh position={[0, 0, 0.302]}>
        <ringGeometry args={[1.32, 1.88, 160]} />
        <meshBasicMaterial map={engraving} transparent opacity={0.75} toneMapped={false} depthWrite={false} />
      </mesh>

      {/* Iris blades */}
      {Array.from({ length: BLADES }, (_, i) => {
        const a = (i / BLADES) * Math.PI * 2;
        return (
          <group
            key={i}
            position={[Math.cos(a) * RP, Math.sin(a) * RP, -0.12 + i * 0.011]}
            rotation={[0, 0, a + Math.PI]}
          >
            <group
              ref={(el) => {
                pivots.current[i] = el;
              }}
            >
              <mesh geometry={blade}>
                <meshStandardMaterial color="#6d6559" metalness={0.9} roughness={0.32} envMapIntensity={1.6} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* Coated front element — faint reflections only */}
      <mesh position={[0, 0, 0.2]}>
        <circleGeometry args={[1.16, 96]} />
        <meshStandardMaterial
          color="#8fa3b8"
          transparent
          opacity={0.1}
          roughness={0.04}
          metalness={0}
          envMapIntensity={2.5}
          depthWrite={false}
        />
      </mesh>

      {/* The light waiting behind the iris */}
      <mesh position={[0, 0, -3]}>
        <circleGeometry args={[1.5, 64]} />
        <meshBasicMaterial ref={backLight} toneMapped={false} />
      </mesh>

      <pointLight ref={keyLight} position={[-3.5, 3, 4]} color="#ffe2b8" intensity={6} distance={14} decay={1.4} />
      <pointLight position={[4, -2.5, 2.5]} color="#9fb3c9" intensity={2.5} distance={12} decay={1.6} />
    </group>
  );
}
