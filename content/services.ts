export type Service = {
  id: string;
  index: string;
  name: string;
  /** Button label on /services, e.g. "Book a listing shoot". */
  cta: string;
  /** One line, used on the homepage. */
  summary: string;
  /** Longer description for /services. */
  description: string[];
  offerings: string[];
  deliverables: string[];
  /** Optional still for the services page. Path under /public. */
  image: { src: string; alt: string; width: number; height: number } | null;
  imageHint: string;
};

export const services: Service[] = [
  {
    id: "commercials-film",
    index: "01",
    name: "Commercials & Film",
    cta: "Plan a commercial",
    summary: "Commercials for local businesses, brand films and corporate video — written, shot and finished in-house.",
    description: [
      "Film is where the studio started. We handle the whole arc: the idea and script, casting and locations, the shoot, and the edit suite where most stories are actually found.",
      "Crews are scaled to the work. A thirty-second spot for a local business, a recruitment film for a regional employer and a broadcast commercial each need different things, and we plan for that rather than defaulting to the biggest version.",
    ],
    offerings: [
      "Commercials for businesses",
      "Brand films",
      "Corporate & recruitment video",
      "Product films",
      "Event films",
      "Editing & colour",
      "Motion graphics",
    ],
    deliverables: [
      "Script, treatment and shot plan",
      "Hero spot plus 15s / 6s cut-downs",
      "Versions for TV, YouTube and social",
      "Colour-graded, mixed, captioned masters",
    ],
    image: null,
    imageHint: "On-set still or frame grab, landscape 3:2",
  },
  {
    id: "real-estate",
    index: "02",
    name: "Real Estate Media",
    cta: "Book a listing shoot",
    summary: "Listing videos, property photography and agent content that make a home look as good as it feels.",
    description: [
      "A listing has seconds to stop a scroll. We shoot homes and commercial properties with the same eye we bring to commercials: light, flow and the details buyers remember.",
      "For agents and brokerages we also make the content around the listings — agent introductions, neighbourhood films and the short clips that keep you visible between sales.",
    ],
    offerings: [
      "Listing videos",
      "Property photography",
      "Vertical listing reels",
      "Agent & brokerage branding videos",
      "Neighbourhood & lifestyle films",
      "Commercial property media",
    ],
    deliverables: [
      "Edited listing film (horizontal + vertical)",
      "Colour-corrected photo set for MLS and social",
      "Short reels for TikTok and Instagram",
      "Agent-branded versions on request",
    ],
    image: null,
    imageHint: "Property interior or exterior at golden hour, landscape 3:2",
  },
  {
    id: "social-tiktok",
    index: "03",
    name: "Social & TikTok",
    cta: "Start your content",
    summary: "TikToks, Reels and short-form video made for the feed — planned, shot, edited and posted.",
    description: [
      "We run our own café's channels, where content has passed a million cumulative views on TikTok, so we know what it takes to show up every week with something people actually want to watch.",
      "Content can be a single production day or an ongoing monthly partnership: ideas, shooting, editing, captions and posting support, with a simple report on what's working.",
    ],
    offerings: [
      "TikTok videos",
      "Instagram Reels & YouTube Shorts",
      "Monthly content partnerships",
      "Content days",
      "Social photography",
      "Captions & posting support",
    ],
    deliverables: [
      "Monthly content plan and hooks",
      "Batch-shot vertical videos",
      "Edited, captioned, ready-to-post files",
      "Simple monthly performance notes",
    ],
    image: null,
    imageHint: "Vertical content still, portrait 9:16 or 4:5",
  },
  {
    id: "web-design",
    index: "04",
    name: "Web Design",
    cta: "Plan a website",
    summary: "Websites that look like your brand and work like a sales tool — designed, built and launched.",
    description: [
      "Your website is where your film, photos and social all point. We design and build sites that load fast, read clearly on a phone and make it obvious what to do next — call, book, buy or enquire.",
      "From a one-page site for a new business to a full rebuild, we handle structure, copy, design, development and launch, and can stay on to keep it current.",
    ],
    offerings: [
      "Website design",
      "Website development",
      "Landing pages",
      "Website refreshes & rebuilds",
      "Copywriting & page structure",
      "Local SEO foundations",
      "Ongoing updates",
    ],
    deliverables: [
      "Sitemap, wireframes and design",
      "Responsive, accessible build",
      "Contact forms, analytics and SEO setup",
      "Launch, hosting setup and handover",
    ],
    image: null,
    imageHint: "Website on laptop and phone, landscape 3:2",
  },
  {
    id: "graphic-design",
    index: "05",
    name: "Graphic Design & Branding",
    cta: "Start a brand project",
    summary: "Logos, identities and the everyday design that makes a business look like itself everywhere.",
    description: [
      "Before anything gets made, there has to be an idea worth making. We develop brand identities and campaign concepts, then design the pieces that carry them — from a logo to a storefront sign to the next social post.",
      "The aim is work that holds together across a billboard, a menu and a phone screen, without feeling like the same asset resized three times.",
    ],
    offerings: [
      "Logo & brand identity",
      "Creative direction",
      "Campaign concepts",
      "Print & signage",
      "Menus, packaging & merch",
      "Social graphics & templates",
      "Presentation design",
    ],
    deliverables: [
      "Brand identity and usage guide",
      "Key visuals and campaign assets",
      "Print-ready and web-ready files",
      "Editable templates for your team",
    ],
    image: null,
    imageHint: "Identity or print work, portrait 4:5",
  },
  {
    id: "marketing-strategy",
    index: "06",
    name: "Marketing & Strategy",
    cta: "Talk marketing",
    summary: "Planning, ads and campaigns grounded in how small and local businesses actually operate.",
    description: [
      "Good creative needs a plan around it: who it's for, where it runs and what it's meant to change. We help build that plan, run the campaigns and keep an eye on whether it's working.",
      "Our background includes in-house marketing management and running a consumer business, so strategy here is practical rather than theoretical.",
    ],
    offerings: [
      "Marketing plans",
      "Campaign strategy",
      "Meta & TikTok ads",
      "Google Business & local search",
      "Audience development",
      "Consulting",
      "Performance reporting",
    ],
    deliverables: [
      "Marketing plan and channel mix",
      "Campaign briefs and media plan",
      "Ad creative, setup and management",
      "Monthly reporting with clear next steps",
    ],
    image: null,
    imageHint: "Planning session or workspace still, landscape 3:2",
  },
];

export const engagementModels = [
  {
    name: "Project-based",
    body: "A defined piece of work with a clear scope, timeline and fee — a brand film, a campaign, an identity. You get a written proposal before anything starts.",
  },
  {
    name: "Ongoing creative partnership",
    body: "A monthly arrangement for businesses that need a steady stream of content, campaign support or marketing direction. Scope is agreed up front and reviewed together.",
  },
];

export const process = [
  {
    name: "Discover",
    body: "We learn the business, the audience and what the work needs to achieve.",
  },
  {
    name: "Develop",
    body: "Ideas, scripts and treatments — refined with you until the direction is clear.",
  },
  {
    name: "Produce",
    body: "Pre-production, the shoot and the edit, run with care for your time and budget.",
  },
  {
    name: "Deliver",
    body: "Final masters and every version you need, ready for where they'll live.",
  },
];

export const faqs = [
  {
    q: "What does a project typically cost?",
    a: "It depends on scope — crew size, shoot days, locations and the number of deliverables all matter. We don't publish package prices; after a first conversation we send a written proposal tailored to what you need. If you have a budget in mind, sharing it early helps us shape the right approach.",
  },
  {
    q: "How long does a project take?",
    a: "It depends on pre-production, the number of shoot days and how many review rounds are involved. Content shoots generally move faster than commercials or brand films. Every proposal includes a realistic schedule, and if you have a fixed date, tell us at the start.",
  },
  {
    q: "Where are you based?",
    a: "Sault Ste. Marie, Ontario. We work across Northern Ontario and travel for productions further afield when the project calls for it — travel is scoped into the proposal.",
  },
  {
    q: "Can we work together remotely?",
    a: "Yes. Strategy, creative development, editing and post-production all work well remotely. Shoots happen in person, either with us travelling or with a crew we coordinate.",
  },
  {
    q: "Do you work with realtors and brokerages?",
    a: "Yes. We shoot listing videos and photography, plus agent and neighbourhood content. Turnaround and pricing depend on the property and what you need — tell us about the listing and we'll quote it.",
  },
  {
    q: "Can you build our website as well as the content?",
    a: "Yes. We design and build websites, and because we also make the film, photography and social content, it all looks like one brand. We can host and maintain it after launch, or hand it over to your team.",
  },
  {
    q: "Do you take on one-off projects or only retainers?",
    a: "Both. Many clients start with a single project. Ongoing partnerships suit businesses that need regular content or marketing support.",
  },
];
