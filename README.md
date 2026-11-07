# Kasdan Studios

Website for **Kasdan Studios**, an independent creative production and marketing studio in Sault Ste. Marie, Ontario (a Kasdan Co. company). _Ideas worth watching._

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · React Three Fiber / Three.js · GSAP ScrollTrigger · Lenis · Zod · Resend.

---

## Contents

1. [Quick start](#quick-start)
2. [Project structure](#project-structure)
3. [Editing content](#editing-content)
   - [Studio details, socials, showreel](#studio-details-socials-showreel)
   - [Adding a portfolio project](#adding-a-portfolio-project)
   - [Writing a journal article](#writing-a-journal-article)
   - [Previewing drafts](#previewing-drafts)
4. [Contact form](#contact-form)
5. [Design system and WebGL](#design-system-and-webgl)
6. [Deploying to Vercel](#deploying-to-vercel)
7. [Quality checks](#quality-checks)
8. [Launch checklist](#launch-checklist)

---

## Quick start

Requires Node.js 20.9 or later.

```bash
npm install
cp .env.example .env.local   # then fill in values — see "Contact form"
npm run dev                  # http://localhost:3000
```

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Development server                            |
| `npm run build`     | Production build (also validates all content) |
| `npm run start`     | Serve the production build                    |
| `npm run typecheck` | TypeScript, no emit                           |
| `npm run lint`      | ESLint (Next.js + React Compiler rules)       |
| `npm run format`    | Prettier                                      |
| `npm run check`     | typecheck → lint → build                      |

---

## Project structure

```
content/                    ← everything editable lives here
  site.ts                   studio details, email, socials, showreel, nav
  recognition.ts            founder awards, education, Kasdan Co. facts
  services.ts               six services (ids double as contact-form project types), process, FAQ
  projects/*.json           one file per portfolio project
  projects/_template.json   copy this to start a new project (ignored by the site)
  journal/*.md              one Markdown file per article
public/
  work/<project-slug>/      project images and video
  media/                    showreel, posters, other site media
src/
  app/                      routes, metadata, sitemap, robots, OG image
  components/
    layout/                 header, footer, client enhancements (reveal, Lenis, cursor)
    sections/               page hero, CTA
    work/                   project cards, filterable grid
    media/                  video embeds, ambient video, gallery media
    contact/                contact form (client)
    studio/                 optional WebGL "Enter the Studio" layer
    ui/                     buttons, labels, placeholders, reveal wrapper
  lib/
    content/                content loaders + Zod schemas
    contact/                form schema, delivery, rate limiting
    seo.ts                  metadata + JSON-LD helpers
```

---

## Editing content

### Studio details, socials, showreel

Edit `content/site.ts`.

- **`email`** — the public studio address. While it is `null` the address is not shown anywhere. (This is display-only; where form submissions go is set by environment variables.)
- **`socials`** — set `href` to the full URL to show a link; `null` hides it.
- **`showreel`** — put files in `public/media/` and set `src` (H.264 MP4, muted, ideally under ~10 MB), an optional lighter `mobileSrc`, and a `poster` still (2400×1350). The video only streams when the visitor allows motion and isn't on a data saver; otherwise the poster shows. Audio never plays.

Awards and credentials live in `content/recognition.ts`:

- `founderAwards` — the Midsouth Emmy, Gold Quill and D&AD New Blood, all individual honours of Dan O'Brien and labelled that way.
- `awardsRoll` — everything shown in the **Awards & recognition reel** (homepage and About). It includes the founder's three plus Tokyo Design Awards, Muse Creative Awards, the Craft Beverage Marketing Awards, a 2024 Guinness World Record and a 2017 iHorror Award. For those five, **fill in `year` and `recipient` once confirmed**. Until then, no year (an outline dash shows instead) and no "Awarded to…" line appear, so nothing is implied.
- Add official award logos only once you have the files **and** permission to use them.

### Adding a portfolio project

No component code changes are needed.

1. Copy `content/projects/_template.json` to `content/projects/<slug>.json`. The file name must match the `slug` field (lowercase-with-hyphens).
2. Put media in `public/work/<slug>/` and reference it with paths like `/work/<slug>/cover.jpg`.
3. Fill in the fields. Optional fields can be deleted entirely.
4. Leave `"status": "draft"` while you work; set `"status": "published"` to make it live.
5. Run `npm run build` — invalid files fail the build with a message naming the field.

Field reference (validated by `src/lib/content/schemas.ts`):

| Field                            | Notes                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `status`                         | `draft` or `published`. Only published projects appear on the public site and sitemap.                       |
| `order`, `featured`              | Lower `order` first. One `featured` project leads the homepage and /work.                                    |
| `title`, `client`, `year`        | Name a client only with their permission. `year` and `cover` are required to publish.                        |
| `categories`                     | Any of `commercials`, `real-estate`, `social`, `web`, `design`, `marketing` — these drive the /work filters. |
| `disciplines`                    | Free text, e.g. `"Direction"`, `"Colour"`.                                                                   |
| `summary`, `overview`            | Card sentence; case-study intro.                                                                             |
| `cover`                          | `{ type: "image", src, alt, width, height }` — always give real pixel dimensions.                            |
| `heroVideo`                      | Optional silent loop: `{ type: "video", src, poster, width, height, title }`.                                |
| `film`                           | Vimeo/YouTube `{ type: "vimeo", id, title, poster?, aspect }`, or a self-hosted MP4.                         |
| `challenge`, `idea`, `execution` | `{ heading?, body: ["paragraph", …] }`.                                                                      |
| `gallery`                        | Any mix of images, MP4s and Vimeo/YouTube embeds.                                                            |
| `results`                        | `{ value, label, source }` — **every metric must name its source.** Leave empty if unknown.                  |
| `awards`                         | `{ year, name, organization, recipient }` — only after verifying with the awarding body.                     |
| `credits`                        | `{ role, name }`.                                                                                            |
| `seo`                            | Optional title/description overrides.                                                                        |
| `notes`                          | Internal only, never rendered.                                                                               |

Images: export JPGs around 2400 px wide; Next.js generates AVIF/WebP sizes automatically. Vimeo/YouTube players only load when the visitor presses play.

**Current state:** three draft entries exist — Kasdan Co. brand & social, a commercial film, and an award-recognized project. All copy in them is marked `PLACEHOLDER`, and none is visible on the public site. Until a project is published, the homepage shows three clearly labelled "in preparation" slots and /work shows an empty state.

### Writing a journal article

Create `content/journal/<slug>.md`:

```markdown
---
title: "Article title"
status: draft # or published
description: "Up to 170 characters — used for search and social previews."
category: craft # studio | craft | strategy | behind-the-scenes
tags: ["brand films", "ontario"]
author: "Dan O'Brien"
publishedAt: 2027-01-15 # required when published — use the real date
updatedAt: 2027-02-01 # optional
cover: # optional
  src: /media/journal/article-cover.jpg
  alt: "Describe the image"
  width: 2400
  height: 1350
---

Body in Markdown…
```

Reading time, related articles (by category and tags), canonical URLs, Open Graph tags and `BlogPosting` structured data are generated automatically.

The **Journal link only appears in the navigation once at least one article is published.** `/journal` always exists, but it is `noindex` while empty. Four draft outlines are included (`status: draft`) — they are outlines, not articles, and must be written up before publishing.

### Previewing drafts

Set `CONTENT_PREVIEW=true` in `.env.local` (or on a Vercel **Preview** environment) to render drafts. They show a "Draft preview" banner, are `noindex`, and never appear in the sitemap. The flag is ignored on production deployments.

---

## Contact form

`/contact` posts to a server action (`src/app/contact/actions.ts`). Each submission goes through these steps in order:

1. **Honeypot** — a hidden field real visitors never fill.
2. **Time trap** — submissions made under 2.5 s after the form becomes interactive are rejected. (Visitors without JavaScript skip this check and rely on the other defences.)
3. **Zod validation** — the same schema (`src/lib/contact/schema.ts`) runs in the browser and on the server.
4. **Rate limit** — 5 submissions per 15 minutes per connection, keyed by a salted SHA-256 hash of the IP. Raw IPs are never stored.
5. **Delivery** via Resend. The visitor is told the message was sent **only** after Resend accepts it. If the provider rejects it or delivery isn't configured, the visitor sees a plain error and their input is kept.

### Configure email delivery (Resend)

1. Create an account at [resend.com](https://resend.com) and **verify your sending domain** (add the DNS records it gives you).
2. Create an API key with "sending access" only.
3. Set these environment variables (locally in `.env.local`, on Vercel under Project → Settings → Environment Variables):

| Variable             | Example                                   | Notes                                                    |
| -------------------- | ----------------------------------------- | -------------------------------------------------------- |
| `RESEND_API_KEY`     | `re_…`                                    | Server-only. Never prefix with `NEXT_PUBLIC_`.           |
| `CONTACT_TO_EMAIL`   | `studio@yourdomain.com`                   | Inbox that receives enquiries (comma-separate for more). |
| `CONTACT_FROM_EMAIL` | `Kasdan Studios <website@yourdomain.com>` | Must be on the verified domain.                          |
| `RATE_LIMIT_SALT`    | long random string                        | e.g. `openssl rand -hex 32`.                             |
| `CONTACT_DELIVERY`   | `console`                                 | Development only — see below.                            |

Enquiries arrive with **Reply-To** set to the visitor's address, so replying in your mail client goes straight to them.

### Testing submissions

- **Without sending email:** set `CONTACT_DELIVERY=console` in `.env.local`. Valid submissions succeed with a "Development mode — not emailed" note, and the server logs a redacted summary (project type, budget, message length — no names, emails or message text). This mode is ignored in production.
- **Real delivery:** with the Resend variables set, submit the form on a Vercel Preview deployment. Check the Resend dashboard → Emails, and your inbox.
- **Failure path:** remove `RESEND_API_KEY` and submit — you should see "Our contact form isn't accepting messages right now, so nothing was sent."
- **Spam checks:** submitting within ~2 seconds of page load returns "That was quicker than we expected…". More than 5 valid submissions in 15 minutes returns a rate-limit message.

### Spam protection notes

The rate limiter keeps its counters in server memory. On Vercel, each serverless instance keeps its own counters, so treat it as a speed bump rather than a hard limit. If spam becomes a problem:

- swap `checkRateLimit` in `src/lib/contact/rate-limit.ts` for a shared store such as Upstash Redis (`@upstash/ratelimit`), and/or
- add Cloudflare Turnstile (a privacy-friendly CAPTCHA) — and update the privacy policy if you do.

### Data handling, retention and deletion

- The website does not store submissions in a database. Each one exists only as an email in the studio inbox (and in Resend's delivery logs, retained per your Resend plan).
- The privacy policy (`src/app/privacy/page.tsx`) states a **24-month retention** for enquiry emails after last contact. Put that into practice: set a mail rule or calendar reminder to purge old enquiries, or change the policy text to match what you will actually do.
- **Deletion requests:** search the inbox (and Resend → Emails) for the requester's address, delete their messages, and confirm by email within 30 days.
- Application logs never contain personal data from the form.
- If you add analytics, a CRM, a newsletter or any new processor, **update the privacy policy first.** Have the policy reviewed by a qualified advisor before launch.

---

## Design system and WebGL

**Type.** Big Shoulders (condensed poster capitals) for display, cut with Fraunces italics (soft, wonky axes) for accent words. Schibsted Grotesk handles body text and Martian Mono the camera-HUD labels. Any `<span className="italic">` inside a `type-mega`/`type-display`/`type-headline`/`type-title` heading switches to Fraunces automatically.
**Colour.** Darkroom blacks, print-paper whites, one safelight red (`--color-gold` token, kept for compatibility) and a tungsten amber for light leaks.

**One sitewide canvas.** A single fixed WebGL canvas (`src/components/gl/GLCanvas.tsx`) sits behind every page. Every GL element is a drei `<View>` scissored into the screen rect of a DOM element, so there is one context and one render loop for the whole site. Every GL element also has a DOM twin: the real heading, image or placeholder stays in the page for search engines, screen readers and visitors without WebGL. It is only visually hidden once its GL copy has drawn.

**When it runs:** WebGL is available and not a software renderer, and the visitor hasn't asked for reduced motion or reduced data. On phones, tablets and modest hardware it runs a lighter tier (DPR 1, fewer objects).

| Piece               | File                                                                  | What it does                                                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gate                | `gl/GLRoot.tsx`, `gl/useGL.ts`                                        | Capability detection; mounts the canvas after the intro; feeds pointer + scroll velocity to shaders.                                                                                       |
| Emulsion background | `gl/views/EmulsionView.tsx`, `gl/shaders.ts`                          | Full-screen shader on every page: silver-halide clouds, tungsten leaks, a cursor "lamp", gate streaks on fast scroll, grain. Screen-space, so every view's backdrop matches it seamlessly. |
| GL headlines        | `gl/GLText.tsx`, `gl/views/TextView.tsx`, `gl/rasterize.ts`           | Rasterises the live DOM heading character by character, then dissolves it in with a burn edge, bulges it under the cursor and jitters it like a film gate when you scroll fast.            |
| GL media            | `gl/GLMedia.tsx`, `gl/views/MediaView.tsx`                            | Wraps every image and placeholder: film-burn reveal, cursor ripple, chromatic split, scroll shear. `AssetPlaceholder` uses it automatically.                                               |
| Homepage reel       | `home/ReelStory.tsx`, `gl/views/ReelScene.tsx`                        | Machined 35 mm reel (extruded flanges, hub, wound pack) unspooling a running film ribbon; the camera follows it through the scroll story to the project screens.                           |
| Services object     | `gl/GLMorph.tsx`, `gl/views/MorphView.tsx`                            | Simplex-displaced, twisting form with thin-film iridescence; four "temperaments", one per discipline, driven by hover and scroll.                                                          |
| CTA stage           | `gl/GLStage.tsx`, `gl/views/StageView.tsx`                            | Cyclorama, floor and a volumetric key light behind the closing headline.                                                                                                                   |
| Intro               | `studio/ImmersiveLayer.tsx`, `studio/Intro.tsx`, `scene/Aperture.tsx` | Academy-leader countdown (CSS, before hydration), then the 9-blade aperture. Always skippable (button / Esc).                                                                              |
| Awards reel         | `awards/AwardsReel.tsx`                                               | Pinned, horizontally scrubbed strip of exposed 35 mm frames; bends with scroll speed. An ordered list underneath.                                                                          |
| HUD                 | `layout/Viewfinder.tsx`                                               | Corner marks, running timecode + REC tally, frame-counter scroll gauge. Decorative and `aria-hidden`.                                                                                      |

Two R3F gotchas the code works around, worth knowing before you add views:

1. **Use `frame.time` / `frame.delta`** from `studio/store.ts` inside views, not `state.clock`. View portals get their own clock that never ticks.
2. **Build `ShaderMaterial`s yourself** (`new THREE.ShaderMaterial({ uniforms })`) and mutate `material.uniforms`. Passing `uniforms={…}` as a JSX prop gives the material a copy, so per-frame updates never reach the GPU.

**Motion rules** (break these and you get flicker, swimming text or ugly resting frames):

- **One clock.** Lenis, ScrollTrigger and the WebGL canvas all advance inside `gsap.ticker`, in a fixed order (`src/lib/motion/ticker.ts`): scroll first, then render. The canvas runs `frameloop="never"`. Don't add another `requestAnimationFrame` loop that moves things the canvas tracks.
- **No twin flash.** While WebGL is expected (`html[data-gl]`, set before first paint), GL headings and media are held hidden until their GL copy is ready, then dissolve in once. Failsafes reveal the DOM version after 3.5 s or if WebGL turns out not to run.
- **Rest on composed frames.** Scroll sequences use `useScrollRest` (`src/lib/motion/useScrollRest.ts`): when a gesture ends mid-sequence, the page eases to the next composed frame in the direction of travel (homepage: hero, each chapter, the screens; awards: one whole frame at the left margin). To add a frame to the homepage story, add a chapter; its resting point is derived from it.
- **The hero fits one screen.** It sits in a fixed-height stage, so its type and spacing scale with viewport height. Below 500 px of height (landscape phones) the stage switches off and the hero scrolls normally.
- **Display faces use `font-display: block`.** Next can't build a metric-matched fallback for Big Shoulders, so swapping would flash and reflow every headline.

Performance safeguards: one WebGL context at a time (the sitewide canvas waits for the intro); views off screen are skipped; DPR is capped at 1.25; the light count in each scene is constant, so nothing recompiles mid-scroll; and everything created outside JSX is disposed on unmount. Three.js loads only when GL actually runs; it is not in any page's initial HTML. Sound is synthesised with WebAudio, off by default.

### Asset pipeline and outstanding art direction

All 3D elements are procedural today, built from real geometry (lathe profiles, extruded blade outlines, displaced knurling) rather than placeholder primitives. Before the experience is final, the following needs to be supplied or decided:

1. **Lens / aperture model (optional upgrade).** A Blender model of a cine lens front with a rigged iris would beat the procedural version. Export as glTF Binary (`.glb`), Y-up, metres, with each blade a separate node pivoting on its own origin. Use PBR metal/roughness materials and 1–2K textures, and compress (`gltf-transform optimize in.glb out.glb --compress draco --texture-compress webp`). Place it in `public/models/`, load it with drei's `useGLTF`, and drive the blade nodes' `rotation.z` from the same `open` value used in `Aperture.tsx`.
2. **Project footage.** Screens and film strips use labelled placeholder textures until projects are published. Published project covers are picked up automatically (`cover.src`).
3. **Showreel.** See [Studio details](#studio-details-socials-showreel).
4. **Sound design.** The synthesised ambience and clicks are functional stand-ins; licensed or custom-designed sound can replace `src/lib/sound.ts`.
5. **Test on target devices** — at minimum a mid-range Android phone, an iPhone, an integrated-graphics laptop and a desktop GPU.

---

## Deploying to Vercel

1. Push the repository to GitHub (or GitLab/Bitbucket).
2. In Vercel: **Add New → Project**, import the repository. The framework preset is detected automatically; no build settings need to change.
3. Under **Settings → Environment Variables**, add for **Production** (and **Preview** if you want the form to work there):
   - `NEXT_PUBLIC_SITE_URL` = `https://www.yourdomain.com` (Production only — the canonical domain, no trailing slash)
   - `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `RATE_LIMIT_SALT`
   - optionally `CONTENT_PREVIEW=true` on **Preview** only
4. Deploy. Then under **Settings → Domains**, add your domain and follow the DNS instructions.
5. After the first production deploy, submit `https://www.yourdomain.com/sitemap.xml` in Google Search Console.

**Search indexing is off until you launch.** Every deployment sends `noindex` and a `robots.txt` that blocks crawlers, unless it is the Production deployment **and** `ALLOW_INDEXING=true` is set. Add that variable (Production only) on launch day, after the real domain is connected. If `NEXT_PUBLIC_SITE_URL` is missing, canonical URLs fall back to the Vercel production URL — set it before launch.

Security headers (`next.config.ts`): `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'`, `nosniff`, a strict referrer policy, a restrictive `Permissions-Policy`, COOP and HSTS. A full script-src CSP is deliberately omitted: it would require per-request nonces and turn every static page dynamic.

---

## Quality checks

```bash
npm run check
```

The build validates every project JSON and article frontmatter against the Zod schemas.

---

## Launch checklist

These are **launch blockers** — the site should not go live until they are done:

- [ ] Configure Resend (verified domain + env vars) and send a real test enquiry from the production domain.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain.
- [ ] On launch day, set `ALLOW_INDEXING=true` (Production only) and redeploy so search engines can index the site.
- [ ] Set `site.email` and real social links in `content/site.ts` (or consciously leave them hidden).
- [ ] Confirm the exact naming of each award against the awarding bodies' records (`content/recognition.ts`). The organization names currently shown are NATAS Mid-South Chapter, IABC and D&AD.
- [ ] Confirm year and recipient for Tokyo Design Awards, Muse Creative Awards, CBMAs, the Guinness World Record and the iHorror Award (`awardsRoll` in `content/recognition.ts`).
- [ ] Fill in the business pitch competition details (`businessRecognition.detail`), or remove the item.
- [ ] Review the privacy policy with a qualified advisor and confirm the retention period you will actually follow.
- [ ] Publish at least one real case study, or accept the "in preparation" homepage slots as the launch state.

Strongly recommended:

- [ ] Supply a showreel, founder portrait, behind-the-scenes still and Kasdan Co. imagery (each placeholder on the site says which asset and format it needs).
- [ ] Replace the generated Open Graph card with a real still (`src/app/opengraph-image.jpg`, 1200×630).
- [ ] Replace the interim favicon (`src/app/icon.svg`) with a designed mark, and add `apple-icon.png` (180×180).
- [ ] Run Lighthouse and test the immersive layer on real phones and a low-end laptop.
- [ ] Decide whether to mention current law-clerk studies on the About page (deliberately omitted for now).
