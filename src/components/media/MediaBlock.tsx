import Image from "next/image";
import type { Media } from "@/lib/content/schemas";
import { VideoEmbed } from "./VideoEmbed";

/**
 * Renders any gallery/film media item from project data with correct
 * intrinsic dimensions (no layout shift) and lazy loading.
 */
export function MediaBlock({
  media,
  sizes = "100vw",
  priority = false,
}: {
  media: Media;
  sizes?: string;
  priority?: boolean;
}) {
  if (media.type === "image") {
    return (
      <figure>
        <Image
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          sizes={sizes}
          priority={priority}
          className="h-auto w-full bg-coal"
        />
        {media.caption && <figcaption className="type-label mt-3 text-mute">{media.caption}</figcaption>}
      </figure>
    );
  }

  if (media.type === "video") {
    return (
      <figure>
        <video
          className="h-auto w-full bg-coal"
          width={media.width}
          height={media.height}
          poster={media.poster}
          controls
          playsInline
          preload="none"
          aria-label={media.title}
        >
          <source src={media.src} type="video/mp4" />
          {media.captions && <track kind="captions" src={media.captions} srcLang="en" label="English" default />}
        </video>
        {media.caption && <figcaption className="type-label mt-3 text-mute">{media.caption}</figcaption>}
      </figure>
    );
  }

  return <VideoEmbed media={media} priority={priority} />;
}
