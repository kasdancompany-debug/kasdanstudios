"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerspectiveCamera, View } from "@react-three/drei";
import * as THREE from "three";
import { EmulsionPlane } from "./EmulsionView";
import {
  AimedSpot,
  CameraRig,
  FilmStrip,
  Screen,
  STRIPS,
  type ScreenProject,
} from "@/components/studio/scene/StudioScene";
import { filmStripTexture } from "@/components/studio/scene/textures";
import { frame, studio, type Tier } from "@/components/studio/store";

/* ------------------------------------------------------------------ */
/* 35 mm reel — machined flanges, hub, wound film pack                 */
/* ------------------------------------------------------------------ */

const R_FLANGE = 2.6;
const R_PACK = 1.75;
const R_HUB = 0.62;
const GAP = 0.74; // distance between flanges

function flangeShape() {
  const s = new THREE.Shape();
  s.absarc(0, 0, R_FLANGE, 0, Math.PI * 2, false);
  // Five kidney windows between hub and rim
  const n = 5;
  const r1 = 0.95;
  const r2 = 2.18;
  const spoke = 0.32; // radians of metal between windows
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 + spoke / 2;
    const a1 = ((i + 1) / n) * Math.PI * 2 - spoke / 2;
    const h = new THREE.Path();
    h.absarc(0, 0, r2, a0, a1, false);
    h.absarc(0, 0, r1, a1, a0, true);
    h.closePath();
    s.holes.push(h);
  }
  const spindle = new THREE.Path();
  spindle.absarc(0, 0, 0.16, 0, Math.PI * 2, true);
  s.holes.push(spindle);
  return s;
}

/** Concentric winding rings for the film pack's faces. */
function packTexture() {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#1a120c";
  ctx.fillRect(0, 0, S, S);
  for (let r = S * 0.17; r < S / 2; r += 1.4) {
    const shade = 30 + Math.random() * 26;
    ctx.strokeStyle = `rgb(${shade + 14}, ${shade}, ${shade - 8})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Reel({ spin }: { spin: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const { flange, pack, packFace } = useMemo(() => {
    const flange = new THREE.ExtrudeGeometry(flangeShape(), {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.018,
      bevelSegments: 3,
      curveSegments: 64,
    });
    flange.center();
    const pack = new THREE.CylinderGeometry(R_PACK, R_PACK, GAP - 0.04, 128, 1, false);
    pack.rotateX(Math.PI / 2);
    return { flange, pack, packFace: packTexture() };
  }, []);
  useEffect(
    () => () => {
      flange.dispose();
      pack.dispose();
      packFace.dispose();
    },
    [flange, pack, packFace],
  );

  useFrame(() => {
    if (group.current) group.current.rotation.z = -spin.current;
  });

  return (
    <group ref={group}>
      {[-GAP / 2, GAP / 2].map((z) => (
        <mesh key={z} geometry={flange} position={[0, 0, z]}>
          <meshStandardMaterial color="#c9c1b4" metalness={1} roughness={0.3} />
        </mesh>
      ))}
      {/* Film pack: satin base on the edge, winding rings on the faces */}
      <mesh geometry={pack}>
        <meshStandardMaterial attach="material-0" color="#2a1d14" roughness={0.35} metalness={0.1} />
        <meshStandardMaterial attach="material-1" map={packFace} roughness={0.25} />
        <meshStandardMaterial attach="material-2" map={packFace} roughness={0.25} />
      </mesh>
      {/* Hub */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[R_HUB, R_HUB, GAP + 0.02, 48]} />
        <meshStandardMaterial color="#8a8277" metalness={1} roughness={0.42} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, GAP + 0.3, 24]} />
        <meshStandardMaterial color="#1a1714" metalness={0.8} roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Film ribbon unspooling from the pack through the scene              */
/* ------------------------------------------------------------------ */

/** Film is as wide as the pack it's wound on. */
const FILM_WIDTH = GAP - 0.06;
/** World units of film per texture repeat (the strip texture is 6:1). */
const filmRepeat = (width: number) => width * 6;
/** Where the camera starts — the film eases round to face it, like film over a roller. */
const CAMERA_START = new THREE.Vector3(0, 0, 9);

/**
 * Sweeps a flat strip along `curve` using parallel-transport frames (no
 * artificial twist). It starts with its width along the reel's axis — so
 * it leaves the pack edge-on, exactly as film does — then turns to face
 * the camera over the first stretch.
 */
function filmGeometry(curve: THREE.Curve<THREE.Vector3>, segments: number, width: number, axis: THREE.Vector3) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const length = curve.getLength();
  const p = new THREE.Vector3();
  const t = new THREE.Vector3();
  const prevT = new THREE.Vector3();
  const transported = new THREE.Vector3();
  const face = new THREE.Vector3();
  const view = new THREE.Vector3();
  const side = new THREE.Vector3();
  const q = new THREE.Quaternion();

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    curve.getPointAt(u, p);
    curve.getTangentAt(u, t);
    if (i === 0) {
      transported.copy(axis).addScaledVector(t, -axis.dot(t)).normalize();
    } else {
      q.setFromUnitVectors(prevT, t);
      transported.applyQuaternion(q).addScaledVector(t, -transported.dot(t)).normalize();
    }
    prevT.copy(t);

    view.subVectors(p, CAMERA_START).normalize();
    face.crossVectors(t, view).normalize();
    if (face.dot(transported) < 0) face.negate();
    const blend = THREE.MathUtils.smoothstep(u, 0.015, 0.11);
    side.copy(transported).lerp(face, blend);
    side.addScaledVector(t, -side.dot(t)).normalize();

    const v = (u * length) / filmRepeat(width);
    pos.push(p.x - side.x * width * 0.5, p.y - side.y * width * 0.5, p.z - side.z * width * 0.5);
    pos.push(p.x + side.x * width * 0.5, p.y + side.y * width * 0.5, p.z + side.z * width * 0.5);
    uv.push(0, v, 1, v);
    if (i < segments) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function Ribbon({
  reelMatrix,
  scale,
  spinRate,
}: {
  reelMatrix: THREE.Matrix4;
  scale: number;
  spinRate: React.RefObject<number>;
}) {
  const width = FILM_WIDTH * scale;
  const { geometry, map } = useMemo(() => {
    const L = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z).applyMatrix4(reelMatrix);
    const axis = new THREE.Vector3(0, 0, 1).transformDirection(reelMatrix);
    // Leaves the bottom of the pack tangentially (the unwinding direction),
    // runs a short straight, then sweeps across the frame and dives into
    // depth along the path the camera will follow.
    const p0 = L(0, -R_PACK);
    const p1 = L(-0.9, -R_PACK - 0.02);
    // One clean sweep: low and left across the frame, then rising away into depth.
    const curve = new THREE.CatmullRomCurve3(
      [
        p0,
        p1,
        new THREE.Vector3(p1.x - 1.7, p1.y - 0.3, p1.z + 1.1),
        new THREE.Vector3(-1.6, -1.2, 0.9),
        new THREE.Vector3(-3.4, 0.2, -2.6),
        new THREE.Vector3(1.2, -0.5, -6.5),
        new THREE.Vector3(-1.1, 0.3, -11),
        new THREE.Vector3(0.8, -0.7, -16),
        new THREE.Vector3(0, -1.6, -24),
      ],
      false,
      "centripetal",
    );
    const map = filmStripTexture(11);
    map.wrapS = THREE.ClampToEdgeWrapping;
    map.wrapT = THREE.RepeatWrapping;
    return { geometry: filmGeometry(curve, 900, width, axis), map };
  }, [reelMatrix, width]);
  useEffect(
    () => () => {
      geometry.dispose();
      map.dispose();
    },
    [geometry, map],
  );

  // The film runs at the pack's surface speed, so frames leave the reel in step with its spin.
  useFrame(() => {
    const surfaceSpeed = spinRate.current * R_PACK * scale;
    map.offset.y -= (surfaceSpeed * frame.delta) / filmRepeat(width);
  });

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        map={map}
        emissiveMap={map}
        emissive="#ffffff"
        emissiveIntensity={0.42}
        alphaTest={0.5}
        side={THREE.DoubleSide}
        roughness={0.3}
        metalness={0.15}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

const KEY_AIM: [number, number, number] = [1.5, -0.4, -6];

function Lights({ tier }: { tier: Tier }) {
  const key = useRef<THREE.SpotLight>(null);
  const fill = useRef<THREE.PointLight>(null);
  const fog = useRef<THREE.FogExp2>(null);
  useFrame(() => {
    const p = studio.progress;
    const dt = frame.delta;
    if (key.current) key.current.intensity = THREE.MathUtils.damp(key.current.intensity, 260 * (1 - p * 0.45), 3, dt);
    if (fill.current) fill.current.intensity = THREE.MathUtils.smoothstep(p, 0.55, 0.9) * 40;
    if (fog.current) fog.current.density = 0.06 - p * 0.02;
  });
  return (
    <>
      <fogExp2 ref={fog} attach="fog" args={["#0b0a09", 0.05]} />
      <ambientLight intensity={0.15} color="#d6cbb9" />
      <AimedSpot
        lightRef={key}
        aim={KEY_AIM}
        position={[-5, 5, 9]}
        color="#ffcf9e"
        intensity={260}
        distance={36}
        angle={0.34}
        penumbra={0.9}
        attenuation={22}
        anglePower={6}
        opacity={tier === "high" ? 0.3 : 0.2}
        radiusTop={0.25}
        decay={1.4}
      />
      <pointLight position={[7, 2, 4]} color="#ff5a2c" intensity={30} distance={14} decay={1.6} />
      <pointLight ref={fill} position={[0, 0.5, -26]} color="#f2ebdf" intensity={0} distance={14} />
    </>
  );
}

/** Base orientation of the reel: turned toward the headline, tipped slightly back. */
const REEL_ROTATION = new THREE.Euler(0.12, -0.55, 0);

function Rig({ spin, speed }: { spin: React.RefObject<number>; speed: React.RefObject<number> }) {
  const tilt = useRef<THREE.Group>(null);
  const spinRate = useRef(0);
  const size = useThree((s) => s.size);
  useFrame(() => {
    // Reel and film run faster while scrolling, never stop entirely
    const v = Math.abs(studio.velocity);
    speed.current = THREE.MathUtils.damp(speed.current, 0.35 + v * 4, 4, frame.delta);
    spinRate.current = speed.current * 0.6;
    spin.current += spinRate.current * frame.delta;
    // Only a whisper of cursor tilt, so the reel never pulls away from its film
    const g = tilt.current;
    if (g) {
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, studio.pointer.x * 0.05, 3, frame.delta);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -studio.pointer.y * 0.04, 3, frame.delta);
    }
  });
  // Wide screens: reel beside the headline. Squarer: further back. Portrait: above and behind the copy.
  const aspect = size.width / size.height;
  const layout = aspect >= 1.45 ? "wide" : aspect >= 1 ? "square" : "tall";
  const { origin, scale, matrix } = useMemo(() => {
    const origin =
      layout === "wide"
        ? new THREE.Vector3(3.4, 0.3, -1.4)
        : layout === "square"
          ? new THREE.Vector3(3.1, 1.1, -4.6)
          : new THREE.Vector3(0.9, 2.4, -5.4);
    const scale = layout === "wide" ? 1 : 0.9;
    const matrix = new THREE.Matrix4().compose(
      origin,
      new THREE.Quaternion().setFromEuler(REEL_ROTATION),
      new THREE.Vector3(scale, scale, scale),
    );
    return { origin, scale, matrix };
  }, [layout]);
  return (
    <>
      <group position={origin} rotation={REEL_ROTATION} scale={scale}>
        <group ref={tilt}>
          <Reel spin={spin} />
        </group>
      </group>
      <Ribbon reelMatrix={matrix} scale={scale} spinRate={spinRate} />
    </>
  );
}

/** Project screens only exist for the last stretch, so they never show through behind the chapter titles. */
function EndScreens({ projects }: { projects: ScreenProject[] }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const k = THREE.MathUtils.smoothstep(studio.progress, 0.74, 0.86);
    g.visible = k > 0.001;
    g.position.y = (1 - k) * -3;
  });
  return (
    <group ref={group} visible={false}>
      {[0, 1, 2].map((slot) => (
        <Screen key={slot} slot={slot} index={slot} project={projects[slot]} />
      ))}
    </group>
  );
}

export function ReelScene({ tier, projects }: { tier: Tier; projects: ScreenProject[] }) {
  const spin = useRef(0);
  const speed = useRef(0.35);
  const strips = tier === "high" ? STRIPS.slice(1) : STRIPS.filter((_, i) => i % 2 === 1);
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={40} near={0.1} far={120} />
      <EmulsionPlane />
      <Environment resolution={64} frames={1}>
        <Lightformer
          form="rect"
          intensity={4}
          color="#fff1dc"
          position={[-6, 5, 6]}
          scale={[8, 2, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.5}
          color="#ff6a3a"
          position={[7, -2, 4]}
          scale={[3, 6, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer form="ring" intensity={1.5} color="#ffffff" position={[2, 3, 10]} scale={3} target={[0, 0, 0]} />
      </Environment>
      <Lights tier={tier} />
      <CameraRig />
      <Rig spin={spin} speed={speed} />
      {strips.map((s, i) => (
        <FilmStrip key={s.seed} def={s} index={i} />
      ))}
      <EndScreens projects={projects} />
    </>
  );
}

export default function ReelView({ tier, projects }: { tier: Tier; projects: ScreenProject[] }) {
  return (
    <View index={2} className="pointer-events-none absolute inset-0">
      <ReelScene tier={tier} projects={projects} />
    </View>
  );
}
