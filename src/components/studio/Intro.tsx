"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import gsap from "gsap";
import { Aperture, type ApertureHandle } from "./scene/Aperture";
import { FilmPass } from "./scene/FilmPass";
import { studio, type Tier } from "./store";
import { sound } from "@/lib/sound";

/**
 * "Every great story begins somewhere." — the optional cinematic intro.
 * Always skippable (button or Escape). The page underneath is fully
 * rendered and indexable; this is an overlay, not a gate.
 */
export default function Intro({ tier, onDone }: { tier: Tier; onDone: () => void }) {
  const control = useRef<ApertureHandle>({ open: 0, light: 0.22, dolly: 0 });
  const root = useRef<HTMLDivElement>(null);
  const enterBtn = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<"idle" | "opening" | "leaving">("idle");
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    try {
      sessionStorage.setItem("ks-intro-seen", "1");
    } catch {}
    onDone();
  }, [onDone]);

  const skip = useCallback(() => {
    if (finished.current) return;
    setPhase("leaving");
    gsap.to(root.current, {
      autoAlpha: 0,
      duration: 0.45,
      ease: "power2.out",
      onComplete: finish,
    });
  }, [finish]);

  const enter = () => {
    if (phase !== "idle") return;
    setPhase("opening");
    sound.aperture();
    const c = control.current;
    const tl = gsap.timeline({ onComplete: finish });
    tl.to(c, { open: 1, duration: 1.5, ease: "power3.inOut" }, 0)
      .to(c, { light: 2.2, duration: 1.7, ease: "power2.in" }, 0.15)
      .to(c, { dolly: 1, duration: 1.7, ease: "power2.in" }, 0.75)
      .to(root.current, { autoAlpha: 0, duration: 0.6, ease: "power1.out" }, 2.05);
  };

  // Mark the pre-paint cover as handed over; make the page inert behind us.
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-intro", "active");
    const behind = [document.querySelector("main"), document.querySelector("header"), document.querySelector("footer")];
    behind.forEach((el) => el?.setAttribute("inert", ""));
    enterBtn.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    const onMove = (e: PointerEvent) => {
      studio.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      studio.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.body.style.overflow = "hidden";

    return () => {
      html.removeAttribute("data-intro");
      behind.forEach((el) => el?.removeAttribute("inert"));
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onMove);
      document.body.style.overflow = "";
      (document.querySelector("#main") as HTMLElement | null)?.focus({
        preventScroll: true,
      });
    };
  }, [skip]);

  const high = tier === "high";

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
      className="fixed inset-0 z-[95] bg-ink text-cream"
    >
      <Canvas
        className="!absolute inset-0 opacity-0 transition-opacity duration-[1400ms]"
        dpr={high ? [1, 1.25] : 1}
        gl={{
          antialias: !high,
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
        }}
        camera={{ position: [0, 0, 12.5], fov: 30, near: 0.05, far: 40 }}
        onCreated={({ gl }) => {
          gl.setClearColor("#0c0b09");
          // Fade the lens in once shaders have compiled and a frame is ready.
          requestAnimationFrame(() => {
            gl.domElement.parentElement?.parentElement?.style.setProperty("opacity", "1");
          });
        }}
        aria-hidden
      >
        <Environment resolution={128} frames={1}>
          {/* Off-axis softboxes: reflections rake across the metal instead of flooding it */}
          <Lightformer
            form="rect"
            intensity={10}
            color="#fff1dc"
            position={[-5, 4, 5]}
            scale={[7, 1.5, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={3}
            color="#f2ebdf"
            position={[0, 7, 6]}
            scale={[10, 2, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={6}
            color="#ff5a2c"
            position={[6, -3, 4]}
            scale={[2.5, 5, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="ring"
            intensity={1.2}
            color="#ffffff"
            position={[3, 3, 9]}
            scale={2.5}
            target={[0, 0, 0]}
          />
        </Environment>
        <Aperture control={control} />
        {high && (
          <EffectComposer multisampling={0}>
            <Bloom
              mipmapBlur
              levels={5}
              luminanceThreshold={0.85}
              luminanceSmoothing={0.2}
              intensity={0.9}
              radius={0.7}
            />
            <FilmPass grain={0.07} aberration={0.0018} />
          </EffectComposer>
        )}
      </Canvas>

      {/* Title + actions */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 md:p-10 xl:p-14">
        <div className="flex items-start justify-between">
          <span className="text-[0.82rem] font-medium tracking-[0.32em]">kasdan</span>
          <button
            type="button"
            onClick={skip}
            className="type-nav pointer-events-auto link-line -mr-2 p-2 pb-1 text-mute hover:text-cream"
          >
            Skip intro
          </button>
        </div>

        <div
          className="flex flex-col items-center text-center transition-opacity duration-700"
          style={{ opacity: phase === "idle" ? 1 : 0 }}
        >
          <h2 id="intro-title" className="type-label tracking-[0.42em] text-bone">
            Every great story begins somewhere.
          </h2>
          <button
            ref={enterBtn}
            type="button"
            onClick={enter}
            disabled={phase !== "idle"}
            className="group pointer-events-auto mt-8 inline-flex items-center gap-4 border border-cream/40 px-8 py-4 type-nav text-cream transition-colors duration-500 hover:border-gold hover:text-gold"
          >
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-gold transition-transform duration-500 group-hover:scale-150"
            />
            Enter studio
          </button>
        </div>

        <p className="type-label text-center text-dim">Press Esc to skip</p>
      </div>
    </div>
  );
}
