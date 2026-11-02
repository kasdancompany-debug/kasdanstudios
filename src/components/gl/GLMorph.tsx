"use client";

import dynamic from "next/dynamic";
import { useGL } from "./useGL";

const MorphView = dynamic(() => import("./views/MorphView"), { ssr: false });

/**
 * The services object: one form that changes temperament for each
 * discipline (see morphStore). Decorative — without WebGL the space shows a
 * quiet ring so the layout keeps its weight.
 */
export function GLMorph({ className }: { className?: string }) {
  const { enabled } = useGL();
  return (
    // Callers set positioning (relative / absolute / sticky) in className.
    <div aria-hidden className={className}>
      {enabled ? (
        <MorphView />
      ) : (
        <div className="absolute inset-[18%] rounded-full border border-line-strong">
          <div className="absolute inset-[12%] rounded-full border border-line" />
        </div>
      )}
    </div>
  );
}
