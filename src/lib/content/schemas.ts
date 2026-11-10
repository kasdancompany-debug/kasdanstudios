import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

const localPath = z
  .string()
  .regex(/^\/[^\s]+$/, "Must be an absolute path under /public, e.g. /work/my-project/hero.jpg");

export const imageSchema = z.object({
  type: z.literal("image"),
  src: localPath,
  alt: z.string().min(1, "Every image needs descriptive alt text"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  caption: z.string().optional(),
});

export const videoFileSchema = z.object({
  type: z.literal("video"),
  /** Self-hosted MP4 under /public. */
  src: localPath,
  poster: localPath,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  title: z.string().min(1),
  /** Optional WebVTT captions under /public. */
  captions: localPath.optional(),
  caption: z.string().optional(),
});

export const embedSchema = z.object({
  type: z.enum(["vimeo", "youtube", "tiktok"]),
  /** Video id only, e.g. "76979871" for Vimeo, "dQw4w9WgXcQ" for YouTube or the number at the end of a TikTok URL. */
  id: z.string().regex(/^[\w-]+$/),
  title: z.string().min(1, "Embeds need a title for screen readers"),
  /** Poster shown before the player is loaded. */
  poster: localPath.optional(),
  aspect: z.enum(["16:9", "21:9", "4:3", "1:1", "9:16", "4:5"]).default("16:9"),
  caption: z.string().optional(),
});

export const mediaSchema = z.discriminatedUnion("type", [imageSchema, videoFileSchema, embedSchema]);

export type ImageMedia = z.infer<typeof imageSchema>;
export type VideoFileMedia = z.infer<typeof videoFileSchema>;
export type EmbedMedia = z.infer<typeof embedSchema>;
export type Media = z.infer<typeof mediaSchema>;

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

// Order here is the order of the /work filters.
export const projectCategories = [
  "marketing",
  "paid-ads",
  "design",
  "photography",
  "social",
  "web",
  "commercials",
  "real-estate",
] as const;
export type ProjectCategory = (typeof projectCategories)[number];

export const categoryLabels: Record<ProjectCategory, string> = {
  marketing: "Marketing",
  "paid-ads": "Meta Ads & Lead Gen",
  design: "Graphic Design",
  photography: "Photography",
  social: "Social & TikTok",
  web: "Web",
  commercials: "Commercials & Film",
  "real-estate": "Real Estate",
};

const creditSchema = z.object({
  role: z.string().min(1),
  name: z.string().min(1),
});

const projectAwardSchema = z.object({
  year: z.number().int(),
  name: z.string().min(1),
  organization: z.string().min(1),
  /** Who received it, e.g. "Dan O'Brien" — keeps attribution honest. */
  recipient: z.string().min(1),
});

const metricSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  /** Where the number comes from (platform analytics, client report…). Required. */
  source: z.string().min(1, "Every metric needs a verifiable source"),
});

const narrativeSchema = z.object({
  heading: z.string().optional(),
  body: z.array(z.string().min(1)).min(1),
});

export const projectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slugs are lowercase-with-hyphens"),
    status: z.enum(["draft", "published"]),
    /** Lower numbers appear first. */
    order: z.number().int().default(100),
    featured: z.boolean().default(false),

    title: z.string().min(1),
    client: z.string().optional(),
    year: z.number().int().min(2000).max(2100).optional(),
    categories: z.array(z.enum(projectCategories)).min(1),
    disciplines: z.array(z.string()).min(1),

    /** One sentence for cards. */
    summary: z.string().min(1),
    /** Two to four sentences for the case study intro. */
    overview: z.string().min(1),

    /** Card + hero still. */
    cover: imageSchema.optional(),
    /** "contain" shows the whole cover on cards (for ads and posters that must not be cropped). */
    coverFit: z.enum(["cover", "contain"]).default("cover"),
    /** Which part of the cover to keep when it's cropped, as a CSS object-position, e.g. "50% 25%". */
    coverFocus: z
      .string()
      .regex(/^\d{1,3}% \d{1,3}%$/, 'Use "x% y%", e.g. "50% 25%"')
      .optional(),
    /** Optional hero loop or film; falls back to the cover image. */
    heroVideo: videoFileSchema.optional(),
    /** The finished film, if there is one. */
    film: z.union([embedSchema, videoFileSchema]).optional(),
    /** Where to see more of the work, e.g. the channel it was published on. */
    link: z.object({ label: z.string().min(1), href: z.string().url() }).optional(),

    challenge: narrativeSchema.optional(),
    idea: narrativeSchema.optional(),
    execution: narrativeSchema.optional(),

    gallery: z.array(mediaSchema).default([]),
    /** "editorial" alternates wide and narrow frames; "grid" lays out ad sets and photo series evenly. */
    galleryLayout: z.enum(["editorial", "grid"]).default("editorial"),

    /** Only verified outcomes — each needs a source. */
    results: z.array(metricSchema).default([]),
    awards: z.array(projectAwardSchema).default([]),
    credits: z.array(creditSchema).default([]),

    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().max(170).optional(),
      })
      .default({}),

    /** Internal editorial notes. Never rendered. */
    notes: z.string().optional(),
  })
  .superRefine((p, ctx) => {
    if (p.status !== "published") return;
    if (!p.cover) {
      ctx.addIssue({ code: "custom", path: ["cover"], message: "Published projects need a cover image" });
    }
  });

export type Project = z.infer<typeof projectSchema>;

/* ------------------------------------------------------------------ */
/* Journal                                                             */
/* ------------------------------------------------------------------ */

export const journalCategories = ["studio", "craft", "strategy", "behind-the-scenes"] as const;

export const journalLabels: Record<(typeof journalCategories)[number], string> = {
  studio: "Studio",
  craft: "Craft",
  strategy: "Strategy",
  "behind-the-scenes": "Behind the Scenes",
};

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const postFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    status: z.enum(["draft", "published"]),
    description: z.string().min(1).max(170),
    category: z.enum(journalCategories),
    tags: z.array(z.string()).default([]),
    author: z.string().default("kasdan studios"),
    /** Required once published. Use the real publication date. */
    publishedAt: isoDate.optional(),
    updatedAt: isoDate.optional(),
    cover: imageSchema.omit({ type: true }).optional(),
  })
  .superRefine((p, ctx) => {
    if (p.status === "published" && !p.publishedAt) {
      ctx.addIssue({ code: "custom", path: ["publishedAt"], message: "Published articles need a publishedAt date" });
    }
  });

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;
