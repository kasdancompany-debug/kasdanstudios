"use client";

import { useEffect, useState } from "react";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/cn";

/** Off by default. Sound starts only after this explicit click. */
export function SoundToggle({ className }: { className?: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const unsub = sound.subscribe(setOn);
    return () => {
      unsub();
    };
  }, []);

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => sound.setEnabled(!on)}
      className={cn(
        "type-nav group inline-flex items-center gap-2 text-mute transition-colors hover:text-cream",
        className,
      )}
    >
      <span aria-hidden className="flex h-3 items-end gap-[2px]">
        {[0.5, 1, 0.7, 0.9].map((h, i) => (
          <span
            key={i}
            className={cn("w-[2px] bg-current transition-all duration-500", on ? "opacity-100" : "opacity-60")}
            style={{ height: on ? `${h * 100}%` : "2px" }}
          />
        ))}
      </span>
      <span>Sound {on ? "on" : "off"}</span>
    </button>
  );
}
