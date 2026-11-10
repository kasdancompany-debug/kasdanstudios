import Image from "next/image";
import Link from "next/link";
import { categoryLabels, type ImageMedia, type Project } from "@/lib/content/schemas";
import { cn } from "@/lib/cn";
import { brandCase } from "@/lib/brand";

type Tile =
  | { kind: "image"; key: string; project: Project; image: Omit<ImageMedia, "type" | "caption"> }
  | { kind: "accent"; key: string; tone: "gold" | "line"; text: string };

// Where each column starts, in rem — the stagger that keeps the wall from reading as a grid.
const offsets: Record<number, number[]> = {
  2: [0, 4],
  3: [3, 0, 6],
  5: [0, 7, 2.5, 10, 4.5],
};

const accents: { tone: "gold" | "line"; text: string }[] = [
  { tone: "line", text: "Ads · Design · Photo · Web · Film" },
];

/** Every image from every project, interleaved so one project's frames don't bunch together. */
function buildTiles(projects: Project[]): Tile[] {
  const perProject = projects.map((p) => {
    const seen = new Set<string>();
    const imgs = [p.cover, ...p.gallery].filter((m): m is ImageMedia => !!m && m.type === "image");
    return imgs
      .filter((m) => (seen.has(m.src) ? false : (seen.add(m.src), true)))
      .map((m) => ({ kind: "image" as const, key: `${p.slug}:${m.src}`, project: p, image: m }));
  });

  const tiles: Tile[] = [];
  for (let round = 0; perProject.some((l) => l.length > round); round++) {
    for (const list of perProject) if (list[round]) tiles.push(list[round]);
  }
  // Drop an accent block in every so often, like a colour swatch on a pinboard.
  accents.forEach((a, i) => {
    const at = Math.min(tiles.length, 5 + i * 7);
    tiles.splice(at, 0, { kind: "accent", key: `accent-${i}`, ...a });
  });
  return tiles;
}

// Very tall frames (phone screenshots) are cropped from the top so they don't swallow a column.
const MAX_RATIO = 1.6;
const ratioOf = (img: { width: number; height: number }) => Math.min(img.height / img.width, MAX_RATIO);

/** Greedy masonry: each tile goes to the currently shortest column. */
function toColumns(tiles: Tile[], count: number): Tile[][] {
  const cols: Tile[][] = Array.from({ length: count }, () => []);
  const heights = offsets[count].map((o) => o / 16);
  for (const t of tiles) {
    const i = heights.indexOf(Math.min(...heights));
    cols[i].push(t);
    heights[i] += t.kind === "image" ? ratioOf(t.image) : 0.6;
  }
  return cols;
}

function WallTile({ tile, sizes }: { tile: Tile; sizes: string }) {
  if (tile.kind === "accent") {
    return (
      <div
        aria-hidden
        className={cn(
          "flex aspect-[5/3] items-end p-5",
          tile.tone === "gold" ? "bg-gold text-ink" : "border border-line text-mute",
        )}
      >
        <span className="type-label">{tile.text}</span>
      </div>
    );
  }

  const { project, image } = tile;
  const tall = image.height / image.width > MAX_RATIO;
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group relative block overflow-hidden bg-coal"
      data-cursor="view"
      aria-label={`${project.title} — view project`}
    >
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        style={tall ? { aspectRatio: `1 / ${MAX_RATIO}` } : undefined}
        className={cn(
          "w-full transition-transform duration-[1.2s] ease-[var(--ease-cinema)] group-hover:scale-[1.04]",
          tall ? "object-cover object-top" : "h-auto",
        )}
      />
      <span className="absolute inset-0 flex flex-col items-center justify-center bg-gold/85 p-6 text-center text-ink opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="font-display text-[clamp(1.25rem,1.6vw,1.75rem)] leading-tight">
          {brandCase(project.title)}
        </span>
        <span className="type-label mt-3">{project.categories.map((c) => categoryLabels[c]).join(" / ")}</span>
        <span className="type-label mt-4 italic">— view —</span>
      </span>
    </Link>
  );
}

function Columns({
  tiles,
  count,
  sizes,
  className,
}: {
  tiles: Tile[];
  count: 2 | 3 | 5;
  sizes: string;
  className: string;
}) {
  return (
    <div className={cn("items-start gap-3 md:gap-4", className)}>
      {toColumns(tiles, count).map((col, i) => (
        <div
          key={i}
          className="flex min-w-0 flex-1 flex-col gap-3 md:gap-4"
          style={{ paddingTop: `${offsets[count][i]}rem` }}
        >
          {col.map((t) => (
            <WallTile key={t.key} tile={t} sizes={sizes} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * The work as a staggered pinboard of frames. Three column layouts are
 * rendered and swapped by breakpoint (lazy images in hidden layouts never load).
 */
export function WorkWall({ projects }: { projects: Project[] }) {
  const tiles = buildTiles(projects);
  return (
    <>
      <Columns tiles={tiles} count={2} sizes="50vw" className="flex md:hidden" />
      <Columns tiles={tiles} count={3} sizes="33vw" className="hidden md:flex lg:hidden" />
      <Columns tiles={tiles} count={5} sizes="20vw" className="hidden lg:flex" />
    </>
  );
}
