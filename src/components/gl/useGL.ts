"use client";

import { useSyncExternalStore } from "react";
import { glStore } from "@/components/studio/store";

const serverSnapshot = { enabled: false, tier: "low" as const };

/** Whether the sitewide WebGL canvas is running. Always false on the server. */
export function useGL() {
  return useSyncExternalStore(glStore.subscribe, glStore.get, () => serverSnapshot);
}
