import { cn } from "@/lib/cn";
import { GLMedia } from "@/components/gl/GLMedia";

type Ratio = "21/9" | "16/9" | "3/2" | "4/5" | "1/1" | "9/16" | "4/3";

const ratioClass: Record<Ratio, string> = {
  "21/9": "aspect-[21/9]",
  "16/9": "aspect-video",
  "3/2": "aspect-[3/2]",
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
  "9/16": "aspect-[9/16]",
  "4/3": "aspect-[4/3]",
};

/**
 * A deliberately-designed stand-in for imagery that hasn't been supplied.
 * It reads as a ground-glass production slate so it can never be mistaken
 * for a real project still, and states exactly what asset is needed. With
 * WebGL on, the same slate is redrawn as a live shader plane.
 */
export function AssetPlaceholder({
  label,
  hint,
  ratio = "16/9",
  className,
  fill = false,
  tone = "default",
}: {
  /** What belongs here, e.g. "Showreel" or "Kasdan Co. café interior". */
  label: string;
  /** Format / spec hint shown in small type. */
  hint?: string;
  ratio?: Ratio;
  className?: string;
  /** Fill the parent instead of using an aspect ratio. */
  fill?: boolean;
  tone?: "default" | "deep";
}) {
  return (
    <GLMedia label={label} hint={hint} className={cn(fill ? "!absolute inset-0" : ratioClass[ratio], className)}>
      <div
        role="img"
        aria-label={`Placeholder: ${label}${hint ? ` — ${hint}` : ""}. Asset not yet supplied.`}
        className={cn("absolute inset-0 overflow-hidden", tone === "deep" ? "bg-coal" : "bg-char")}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(120% 90% at 72% 20%, rgba(255,150,80,0.16) 0%, rgba(255,90,44,0.04) 40%, transparent 72%)",
          }}
        />
        <span aria-hidden className="absolute inset-4 border border-line" />
        <div aria-hidden className="absolute inset-0 flex flex-col justify-between p-7 md:p-9">
          <span className="type-label text-gold">Asset placeholder</span>
          <div className="max-w-[24ch]">
            <span className="block font-display text-2xl leading-[0.95] text-cream md:text-4xl">{label}</span>
            {hint && <span className="type-label mt-3 block text-mute">{hint}</span>}
          </div>
        </div>
      </div>
    </GLMedia>
  );
}
