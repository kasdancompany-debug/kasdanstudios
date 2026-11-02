"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { FilmEffect } from "./FilmEffect";
import { studio } from "../store";

type Props = {
  grain?: number;
  vignette?: number;
  aberration?: number;
  /** Let scroll velocity + transitions drive distortion/aberration/mask. */
  reactive?: boolean;
};

/** R3F wrapper around FilmEffect. Uniforms update in the frame loop, never via React state. */
export const FilmPass = forwardRef<FilmEffect, Props>(function FilmPass(
  { grain = 0.06, vignette = 0.85, aberration = 0.0015, reactive = false },
  ref,
) {
  const effect = useMemo(() => new FilmEffect(), []);
  useImperativeHandle(ref, () => effect, [effect]);
  useEffect(() => () => effect.dispose(), [effect]);

  useFrame((state) => {
    effect.set("uTime", state.clock.elapsedTime);
    effect.set("uGrain", grain);
    effect.set("uVignette", vignette);
    if (reactive) {
      const v = Math.min(1, Math.abs(studio.velocity) * 1.6);
      effect.set("uAberration", aberration + v * 0.004 + studio.transition * 0.01);
      effect.set("uDistortion", v * 0.22 + studio.transition * 0.6);
      effect.set("uMask", studio.transition);
    } else {
      effect.set("uAberration", aberration);
    }
  });

  return <primitive object={effect} dispose={null} />;
});
