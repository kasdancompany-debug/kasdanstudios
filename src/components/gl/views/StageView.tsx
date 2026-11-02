"use client";

import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import { EmulsionPlane } from "./EmulsionView";
import { CTA_CAM, CTA_LOOK, CtaStage } from "@/components/studio/scene/StudioScene";
import { frame, studio, type Tier } from "@/components/studio/store";

/** Slow hand-held drift toward the lit cyclorama. */
function Drift() {
  useFrame((state) => {
    const t = frame.time;
    const c = state.camera;
    c.position.set(
      CTA_CAM.x + Math.sin(t * 0.2) * 0.4 + studio.pointer.x * 0.5,
      CTA_CAM.y + Math.sin(t * 0.27) * 0.15 + studio.pointer.y * 0.25,
      CTA_CAM.z,
    );
    c.lookAt(CTA_LOOK);
  });
  return null;
}

/** The lit studio stage behind the closing call to action. */
export default function StageView({ tier }: { tier: Tier }) {
  return (
    <View index={2} className="pointer-events-none absolute inset-0">
      <PerspectiveCamera makeDefault position={CTA_CAM.toArray()} fov={42} near={0.1} far={80} />
      <EmulsionPlane />
      <fogExp2 attach="fog" args={["#0b0a09", 0.03]} />
      <ambientLight intensity={0.12} />
      <Drift />
      <CtaStage tier={tier} always />
    </View>
  );
}
