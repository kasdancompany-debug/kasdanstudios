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
    id: "marketing-strategy",
    index: "01",
    name: "Marketing & Strategy",
    cta: "Talk marketing",
    summary: "A clear plan for growth: who you're reaching, what you're saying and how you'll know it's working.",
    description: [
      "Good creative needs a plan around it: who it's for, where it runs and what it's meant to change. We build that plan with you, run the campaigns and keep a close eye on whether it's working.",
      "Our background includes in-house marketing management and running a consumer business, so strategy here is practical rather than theoretical.",
    ],
    offerings: [
      "Marketing plans",
      "Campaign strategy",
      "Promotions & launch campaigns",
      "Google Business & local search",
      "Audience development",
      "Consulting",
      "Performance reporting",
    ],
    deliverables: [
      "Marketing plan and channel mix",
      "Campaign briefs and media plan",
      "Creative and channel plan for every campaign",
      "Monthly reporting with clear next steps",
    ],
    image: null,
    imageHint: "Planning session or workspace still, landscape 3:2",
  },
  {
    id: "meta-ads-lead-gen",
    index: "02",
    name: "Meta Ads & Lead Generation",
    cta: "Get more leads",
    summary: "Facebook and Instagram campaigns built to bring in enquiries, bookings and sales — not just likes.",
    description: [
      "We plan, build and run paid campaigns on Facebook and Instagram around one goal: getting the right people to put their hand up. The targeting, the offer, the ad and the form or page they land on all have to work together, so we build them together.",
      "Because the creative is made in-house — video, photography and design — we can test new ads quickly and keep what's working in front of people. You get plain-English reporting on what each lead costs and what we're changing next.",
    ],
    offerings: [
      "Facebook & Instagram ad campaigns",
      "Lead generation funnels",
      "Instant forms & landing pages",
      "Video, static & carousel ad creative",
      "Pixel & conversion tracking",
      "Retargeting & audience building",
      "TikTok & Google ads",
    ],
    deliverables: [
      "Campaign strategy, audience and offer",
      "Ad creative in several variations to test",
      "Tracking, forms and landing pages set up",
      "Monthly reporting on leads and cost per lead",
    ],
    image: {
      src: "/work/lupin-leads-meta-ads/ad-plumbing-heating.webp",
      alt: "Lupin Leads Meta ad for plumbing and heating contractors",
      width: 1254,
      height: 1254,
    },
    imageHint: "Ad creative on a phone, portrait 4:5",
  },
  {
    id: "graphic-design",
    index: "03",
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
    image: {
      src: "/work/ravenwood-film-festival/retro-poster.jpg",
      alt: "Retro poster designed for the Ravenwood Film Festival",
      width: 855,
      height: 1080,
    },
    imageHint: "Identity or print work, portrait 4:5",
  },
  {
    id: "social-tiktok",
    index: "04",
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
    image: {
      src: "/work/kasdan-co-food-photography/ghost-duo.webp",
      alt: "Two sheet ghosts in sunglasses holding Kasdan Co. iced lattes in autumn woods",
      width: 1289,
      height: 1670,
    },
    imageHint: "Vertical content still, portrait 9:16 or 4:5",
  },
  {
    id: "photography",
    index: "05",
    name: "Food & Product Photography",
    cta: "Book a shoot",
    summary: "Menu, food, drink and product photography styled to stop the scroll — for menus, socials and ads.",
    description: [
      "We shoot for our own café every season, so we know what makes a drink or a plate look worth the trip: real light, a location with character and an idea behind the styling, not just a white backdrop.",
      "Every shoot is planned around where the photos will live — menu boards, Instagram, delivery apps and paid ads — and delivered in the crops each one needs.",
    ],
    offerings: [
      "Food & drink photography",
      "Menu & seasonal launch shoots",
      "Product photography",
      "Styling & art direction",
      "Lifestyle & location shoots",
      "Photos for ads & delivery apps",
    ],
    deliverables: [
      "Shot list and styling plan",
      "Colour-graded selects",
      "Square, portrait and vertical crops",
      "Behind-the-scenes clips for Stories",
    ],
    image: {
      src: "/work/kasdan-co-food-photography/lavender-matcha.webp",
      alt: "Iced lavender matcha latte photographed on a brick garden path",
      width: 1500,
      height: 2000,
    },
    imageHint: "Food or drink still, portrait 4:5",
  },
  {
    id: "web-design",
    index: "06",
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
    image: {
      src: "/work/lupin-leads-website/desktop.png",
      alt: "The Lupin Leads website homepage, designed and built by Kasdan Studios",
      width: 1920,
      height: 1200,
    },
    imageHint: "Website on laptop and phone, landscape 3:2",
  },
  {
    id: "commercials-film",
    index: "07",
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
    index: "08",
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
    body: "Strategy, concepts and creative direction — refined with you until the plan is clear.",
  },
  {
    name: "Make",
    body: "Design, shoots, builds and campaign setup, run with care for your time and budget.",
  },
  {
    name: "Launch & grow",
    body: "Everything goes live where it needs to be, and we track the results and keep improving.",
  },
];

export const faqs = [
  {
    q: "Can you run our Facebook and Instagram ads?",
    a: "Yes. We plan, create and manage Meta campaigns built around leads and sales, and because we make the ads in-house we can keep testing fresh creative. Each month you get a clear report on what each lead costs and what we're doing next.",
  },
  {
    q: "What does a project typically cost?",
    a: "It depends on scope — the number of deliverables, shoot days, ad spend and how long the work runs all matter. We don't publish package prices; after a first conversation we send a written proposal tailored to what you need. If you have a budget in mind, sharing it early helps us shape the right approach.",
  },
  {
    q: "How long does a project take?",
    a: "It depends on the scope and how many review rounds are involved. A logo or a campaign launch can move in weeks; brand identities, websites and films take longer. Every proposal includes a realistic schedule, and if you have a fixed date, tell us at the start.",
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
    q: "Do you photograph food and products?",
    a: "Yes. We plan the styling and location, shoot, and deliver colour-graded photos cropped for your menu, social channels, delivery apps and ads. Our own café's seasonal menus are shot this way.",
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
