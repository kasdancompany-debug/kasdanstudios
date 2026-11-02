"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";
import type { EmbedMedia } from "@/lib/content/schemas";

const aspectClass: Record<EmbedMedia["aspect"], string> = {
  "16:9": "aspect-video",
  "21:9": "aspect-[21/9]",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16]",
  "4:5": "aspect-[4/5]",
};

function embedUrl(media: EmbedMedia) {
  if (media.type === "vimeo") {
    return `https://player.vimeo.com/video/${media.id}?autoplay=1&dnt=1&title=0&byline=0&portrait=0`;
  }
  return `https://www.youtube-nocookie.com/embed/${media.id}?autoplay=1&rel=0&modestbranding=1`;
}

/**
 * Click-to-load facade for Vimeo / YouTube. No third-party script, cookie
 * or request is made until the visitor chooses to play — faster pages and
 * a cleaner privacy story.
 */
export function VideoEmbed({ media, priority = false }: { media: EmbedMedia; priority?: boolean }) {
  const [active, setActive] = useState(false);
  const provider = media.type === "vimeo" ? "Vimeo" : "YouTube";

  return (
    <figure>
      <div className={`relative overflow-hidden bg-coal ${aspectClass[media.aspect]}`}>
        {active ? (
          <iframe
            src={embedUrl(media)}
            title={media.title}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="group absolute inset-0 flex h-full w-full items-center justify-center"
          >
            {media.poster && (
              <Image
                src={media.poster}
                alt=""
                fill
                sizes="(min-width: 1280px) 80vw, 100vw"
                className="object-cover opacity-80 transition-opacity duration-700 group-hover:opacity-100"
                priority={priority}
              />
            )}
            <span className="relative flex items-center gap-4">
              <span className="flex size-16 items-center justify-center rounded-full border border-cream/60 bg-ink/40 transition-colors duration-500 group-hover:border-gold group-hover:bg-ink/60 md:size-20">
                <Play aria-hidden strokeWidth={1} className="ml-1 size-6 fill-cream text-cream" />
              </span>
              <span className="type-nav text-cream">
                Play film <span className="sr-only">: {media.title}</span>
              </span>
            </span>
            <span className="type-label absolute bottom-4 left-4 text-mute">Loads {provider} player</span>
          </button>
        )}
      </div>
      {media.caption && <figcaption className="type-label mt-3 text-mute">{media.caption}</figcaption>}
    </figure>
  );
}
