"use client";

import dynamic from "next/dynamic";
import { useGL } from "./useGL";

const StageView = dynamic(() => import("./views/StageView"), { ssr: false });

/** WebGL studio stage for the closing CTA; nothing without WebGL (the CSS key light remains). */
export function GLStage() {
  const { enabled, tier } = useGL();
  return enabled ? <StageView tier={tier} /> : null;
}
