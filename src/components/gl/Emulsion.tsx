"use client";

import dynamic from "next/dynamic";
import { useGL } from "./useGL";

const EmulsionView = dynamic(() => import("./views/EmulsionView"), { ssr: false });

/** Sitewide film-emulsion background. Without WebGL the page keeps its ink background. */
export function Emulsion() {
  const { enabled } = useGL();
  return enabled ? <EmulsionView /> : null;
}
