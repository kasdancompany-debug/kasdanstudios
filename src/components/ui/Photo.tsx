import Image from "next/image";
import { cn } from "@/lib/cn";
import { GLMedia } from "@/components/gl/GLMedia";

type Ratio = "21/9" | "16/9" | "3/2" | "4/5" | "3/4" | "1/1";

const ratioClass: Record<Ratio, string> = {
  "21/9": "aspect-[21/9]",
  "16/9": "aspect-video",
  "3/2": "aspect-[3/2]",
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
  "1/1": "aspect-square",
};

/**
 * A real photograph in a fixed-ratio frame. The optimised <img> is always in
 * the page (alt text, SEO, no-WebGL fallback); with WebGL on, the same image
 * is redrawn as a shader plane cropped to the same focal point.
 */
export function Photo({
  src,
  alt,
  ratio,
  focus = [0.5, 0.5],
  sizes,
  priority = false,
  className,
}: {
  /** Path under /public, e.g. "/media/studio/kasdan-co-exterior.jpg". */
  src: string;
  alt: string;
  ratio: Ratio;
  /** Where to crop towards: x from the left, y from the top, as 0..1 fractions. */
  focus?: [number, number];
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    // No background on this wrapper: the WebGL canvas draws *behind* the page,
    // so anything opaque here would cover the GL copy once the <img> steps back.
    <GLMedia src={src} focus={focus} label={alt} className={cn(ratioClass[ratio], "overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        style={{ objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%` }}
      />
    </GLMedia>
  );
}
