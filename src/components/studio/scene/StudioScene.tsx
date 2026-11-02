"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { SpotLight, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { filmStripTexture, slateTexture } from "./textures";
import { frame, studio, type Tier } from "../store";

/**
 * drei SpotLight whose target lives next to it in the scene graph, so the
 * aim point is relative to the light's parent group.
 */
export function AimedSpot({
  aim,
  lightRef,
  ...props
}: React.ComponentProps<typeof SpotLight> & {
  aim: [number, number, number];
  lightRef?: React.RefObject<THREE.SpotLight | null>;
}) {
  const local = useRef<THREE.SpotLight>(null);
  const ref = lightRef ?? local;
  useEffect(() => {
    const l = ref.current;
    if (!l || !l.parent) return;
    const parent = l.parent;
    parent.add(l.target);
    l.target.position.set(...aim);
    return () => {
      parent.remove(l.target);
    };
  }, [ref, aim]);
  return <SpotLight ref={ref} {...props} />;
}

export type ScreenProject = {
  slug: string;
  title: string;
  discipline: string;
  cover: string | null;
};

/* ------------------------------------------------------------------ */
/* Camera choreography                                                 */
/* Deterministic: scroll progress → point on a spline. Damping only    */
/* smooths the approach, so fast or backward scrolling always lands on */
/* the same frame.                                                     */
/* ------------------------------------------------------------------ */

const POS = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 8),
  new THREE.Vector3(0.9, 0.35, 1.5),
  new THREE.Vector3(-0.8, -0.15, -6),
  new THREE.Vector3(0.5, 0.25, -11.5),
  new THREE.Vector3(0, 0.15, -16.5),
]);
const LOOK = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0.6, 0, 0),
  new THREE.Vector3(-0.2, 0, -8),
  new THREE.Vector3(0.4, 0, -15),
  new THREE.Vector3(0, 0.05, -24),
  new THREE.Vector3(0, 0.1, -30),
]);

export const CTA_ORIGIN = new THREE.Vector3(0, 0, -90);
export const CTA_CAM = new THREE.Vector3(0, 0.6, -80);
export const CTA_LOOK = new THREE.Vector3(0, 1.0, -90);
const CTA_AIM: [number, number, number] = [0, -1.5, 0];
const KEY_AIM: [number, number, number] = [0.6, -0.6, -12];

export function CameraRig() {
  const look = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());
  const lastSet = useRef(studio.set);

  useFrame((state) => {
    const dt = frame.delta;
    const camera = state.camera;
    // Ease the raw progress so chapters breathe: a little slower at the ends.
    const p = THREE.MathUtils.smoothstep(studio.progress, 0, 1) * 0.15 + studio.progress * 0.85;

    if (studio.set === "cta") {
      target.current.copy(CTA_CAM);
      lookTarget.current.copy(CTA_LOOK);
    } else {
      POS.getPoint(p, target.current);
      LOOK.getPoint(p, lookTarget.current);
    }

    // Parallax from the pointer, reduced while travelling fast
    const calm = 1 - Math.min(1, Math.abs(studio.velocity));
    target.current.x += studio.pointer.x * 0.35 * calm;
    target.current.y += studio.pointer.y * 0.22 * calm;

    // Cut, don't glide, between sets — the noise mask hides the jump.
    if (lastSet.current !== studio.set) {
      camera.position.copy(target.current);
      look.current.copy(lookTarget.current);
      lastSet.current = studio.set;
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.current.x, 3.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.current.y, 3.5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.current.z, 4.5, dt);
    look.current.lerp(lookTarget.current, 1 - Math.exp(-4 * dt));
    camera.lookAt(look.current);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/* Film strips                                                         */
/* ------------------------------------------------------------------ */

type StripDef = {
  pos: [number, number, number];
  rot: [number, number, number];
  length: number;
  bend: number;
  seed: number;
};

export const STRIPS: StripDef[] = [
  {
    pos: [3.2, 0.6, -2],
    rot: [0.2, -0.5, 1.15],
    length: 9,
    bend: 0.55,
    seed: 1,
  },
  {
    pos: [-4.4, 1.6, -5],
    rot: [-0.3, 0.6, -0.5],
    length: 10,
    bend: -0.4,
    seed: 2,
  },
  {
    pos: [1.4, -1.9, -8],
    rot: [0.5, 0.25, 1.7],
    length: 11,
    bend: 0.35,
    seed: 3,
  },
  {
    pos: [-2.2, -0.6, -11.5],
    rot: [0.1, -0.7, 0.35],
    length: 9,
    bend: 0.6,
    seed: 4,
  },
  {
    pos: [3.6, 1.8, -14],
    rot: [-0.4, -0.2, -1.2],
    length: 10,
    bend: -0.5,
    seed: 5,
  },
  {
    pos: [-3.8, -2.1, -17],
    rot: [0.3, 0.5, 1.4],
    length: 9,
    bend: 0.45,
    seed: 6,
  },
  {
    pos: [-7.5, -3, -21],
    rot: [0.1, -0.4, 0.6],
    length: 8,
    bend: 0.3,
    seed: 7,
  },
];

function bentStripGeometry(length: number, bend: number) {
  const width = length / 6;
  const g = new THREE.PlaneGeometry(width, length, 1, 64);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = y / length; // -0.5 → 0.5
    // A gentle S-curve, like film spilling off a reel
    pos.setZ(i, Math.sin(t * Math.PI * 1.6) * bend + Math.cos(t * Math.PI) * bend * 0.6);
  }
  g.computeVertexNormals();
  return g;
}

export function FilmStrip({ def, index }: { def: StripDef; index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const { geometry, map } = useMemo(
    () => ({
      geometry: bentStripGeometry(def.length, def.bend),
      map: filmStripTexture(def.seed),
    }),
    [def],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      map.dispose();
    },
    [geometry, map],
  );

  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const t = frame.time * 0.12 + index * 1.7;
    m.position.y = def.pos[1] + Math.sin(t) * 0.18;
    m.rotation.z = def.rot[2] + Math.sin(t * 0.7) * 0.05;
    m.rotation.x = def.rot[0] + Math.cos(t * 0.5) * 0.04;
  });

  return (
    <mesh ref={ref} geometry={geometry} position={def.pos} rotation={def.rot}>
      <meshStandardMaterial
        map={map}
        emissiveMap={map}
        emissive="#ffffff"
        emissiveIntensity={0.28}
        alphaTest={0.5}
        side={THREE.DoubleSide}
        roughness={0.35}
        metalness={0.1}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Project screens                                                     */
/* ------------------------------------------------------------------ */

function useScreenTexture(project: ScreenProject | undefined, index: number) {
  const slate = useMemo(
    () =>
      project?.cover
        ? null
        : slateTexture(
            index,
            project ? project.title : "Case study in preparation",
            project ? project.discipline : "Selected work",
          ),
    [project, index],
  );
  useEffect(() => () => slate?.dispose(), [slate]);
  return slate;
}

function CoverMaterial({ src }: { src: string }) {
  const tex = useTexture(src, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });
  return <meshBasicMaterial map={tex} toneMapped={false} />;
}

export function Screen({ project, index, slot }: { project?: ScreenProject; index: number; slot: number }) {
  const group = useRef<THREE.Group>(null);
  const face = useRef<THREE.Mesh>(null);
  const slate = useScreenTexture(project, index);

  const x = (slot - 1) * 5.25;
  const z = -30 - Math.abs(slot - 1) * 1.4;
  const yaw = -(slot - 1) * 0.3;

  useFrame(() => {
    const dt = frame.delta;
    const g = group.current;
    if (!g) return;
    const hovered = studio.hovered === index;
    const s = THREE.MathUtils.damp(g.scale.x, hovered ? 1.06 : 1, 6, dt);
    g.scale.setScalar(s);
    // Gentle perspective response to the pointer
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, yaw + studio.pointer.x * 0.08, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -studio.pointer.y * 0.05, 3, dt);
    const mat = face.current?.material as THREE.MeshBasicMaterial | undefined;
    if (mat) {
      const dim = studio.hovered === -1 || hovered ? 1 : 0.45;
      const v = THREE.MathUtils.damp(mat.color.r, dim, 5, dt);
      mat.color.setScalar(v);
    }
  });

  return (
    <group ref={group} position={[x, 0.1, z]} rotation={[0, yaw, 0]}>
      {/* Bezel */}
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[5.02, 2.86, 0.06]} />
        <meshStandardMaterial color="#0e0d0b" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh ref={face}>
        <planeGeometry args={[4.8, 2.7]} />
        {project?.cover ? (
          <Suspense fallback={<meshBasicMaterial color="#141210" />}>
            <CoverMaterial src={project.cover} />
          </Suspense>
        ) : (
          <meshBasicMaterial map={slate} toneMapped={false} />
        )}
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* CTA stage: cyclorama, floor, a single key light through haze        */
/* ------------------------------------------------------------------ */

export function CtaStage({ tier, always = false }: { tier: Tier; always?: boolean }) {
  // The volumetric cone ignores fog, so it stays hidden until the stage is in
  // use. Only meshes are toggled: lights stay put so the light count (and so
  // every compiled shader) never changes mid-scroll.
  const meshes = useRef<THREE.Group>(null);
  const spot = useRef<THREE.SpotLight>(null);
  useFrame(() => {
    const on = always || studio.set === "cta";
    if (meshes.current) meshes.current.visible = on;
    spot.current?.children.forEach((c) => (c.visible = on));
  });
  const cyc = useMemo(() => {
    const g = new THREE.CylinderGeometry(14, 14, 14, 96, 1, true, -Math.PI * 0.5, Math.PI);
    g.rotateY(Math.PI);
    return g;
  }, []);
  useEffect(() => () => cyc.dispose(), [cyc]);

  return (
    <group position={CTA_ORIGIN.toArray()}>
      <group ref={meshes} visible={false}>
        <mesh geometry={cyc} position={[0, 5.5, 4]}>
          <meshStandardMaterial color="#1a1814" roughness={0.95} side={THREE.BackSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 4]}>
          <planeGeometry args={[40, 30]} />
          <meshStandardMaterial color="#14120f" roughness={tier === "high" ? 0.55 : 0.85} metalness={0.15} />
        </mesh>
      </group>
      <AimedSpot
        lightRef={spot}
        aim={CTA_AIM}
        position={[0, 9, 6]}
        color="#ffe6c4"
        intensity={650}
        distance={26}
        angle={0.42}
        penumbra={1}
        attenuation={13}
        anglePower={5}
        opacity={0.55}
        radiusTop={0.15}
        decay={1.3}
      />
      {/* Cool fill so the cyc's curve reads */}
      <pointLight position={[-7, 2, 8]} color="#9fb3c9" intensity={30} distance={22} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export function StudioScene({ tier, projects }: { tier: Tier; projects: ScreenProject[] }) {
  const strips = tier === "high" ? STRIPS : STRIPS.filter((_, i) => i % 2 === 0);
  const key = useRef<THREE.SpotLight>(null);
  const screensLight = useRef<THREE.PointLight>(null);
  const fog = useRef<THREE.FogExp2>(null);

  useFrame(() => {
    const dt = frame.delta;
    const p = studio.progress;
    // Lighting drifts from warm projector light to cooler screen spill
    if (key.current) key.current.intensity = THREE.MathUtils.damp(key.current.intensity, 220 * (1 - p * 0.5), 3, dt);
    if (screensLight.current) {
      screensLight.current.intensity = THREE.MathUtils.damp(
        screensLight.current.intensity,
        THREE.MathUtils.smoothstep(p, 0.55, 0.9) * 40,
        3,
        dt,
      );
    }
    if (fog.current) fog.current.density = studio.set === "cta" ? 0.03 : 0.055 - p * 0.015;
  });

  return (
    <>
      <color attach="background" args={["#0c0b09"]} />
      <fogExp2 ref={fog} attach="fog" args={["#0c0b09", 0.055]} />
      <ambientLight intensity={0.12} color="#cfc6b6" />

      <CameraRig />

      {/* Projector beam from behind the viewer, raking through the strips */}
      <AimedSpot
        lightRef={key}
        aim={KEY_AIM}
        position={[-5, 4.5, 9]}
        color="#ffdcae"
        intensity={220}
        distance={34}
        angle={0.32}
        penumbra={0.9}
        attenuation={22}
        anglePower={6}
        opacity={tier === "high" ? 0.32 : 0.22}
        radiusTop={0.25}
        decay={1.4}
      />

      {strips.map((s, i) => (
        <FilmStrip key={s.seed} def={s} index={i} />
      ))}

      {[0, 1, 2].map((slot) => (
        <Screen key={slot} slot={slot} index={slot} project={projects[slot]} />
      ))}
      <pointLight ref={screensLight} position={[0, 0.5, -26]} color="#e8e1d3" intensity={0} distance={14} />

      <CtaStage tier={tier} />
    </>
  );
}
