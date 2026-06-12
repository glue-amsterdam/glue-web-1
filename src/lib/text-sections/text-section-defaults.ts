import type { TextSectionSlug } from "@/schemas/textSectionSchema";
import type { TextSectionData } from "./types";

const PARTICIPATE_HOW_IT_WORKS_HTML =
  "<strong>1. Select a plan</strong><br />Select a fitting plan.<br /><br /><strong>2. Sign up</strong><br />Create an account to begin your application.<br /><br /><strong>3. Get Access</strong><br />Once your application has been approved, you will gain access to your personal dashboard.<br /><br /><strong>4. Complete Portfolio</strong><br />Enter your details, images and other information to appear on the GLUE website.";

const PARTICIPATE_SELECT_PLAN_HTML =
  "Application deadline 1 June 2026.<br /><br />Combi discount if you participate both at GLUE Utrecht (www.glue-utrecht.nl) and GLUE Amsterdam you get a 10% discount over the total fee of both GLUE participant fees. Optional at extra charge are a GLUE beach flag, printed maps, organising a bike-tour (please send us an email if your interested and we make you an offer). In general part of all the packages are:";

const VISIT_DISCOVER_HTML = `The first five maps in this guide are neighbourhood routes, explore specific areas of the city.
<br />THE HIGH BROW BIKE RIDE
explore Museum Quarter and Amsterdam South
<br />
THE CENTRE STAGE
explore the centre and its canals
<br />
THE UNDERGROUND DESIGN SCENE RIDE
from Amsterdam South-East towards the centre
<br />
THE NORTH EAST CONNECTION
Amsterdam North and islands tour
<br />
THE HOUTHAVEN HIKE
from the centre towards the Houthavens
<br />

The last four maps are thematic maps with selected highlights across the city:

ALTERNATIVES FROM THE UNEXPECTED
<br />
THE INTERIOR MASTERS CRAWL
<br />
COLLECTIBLE DESIGN COLLAGE

THE CREATIVE CITIZEN OF HONOUR 2025 GRAND TOUR`;

export const TEXT_SECTION_DEFAULTS: Record<TextSectionSlug, TextSectionData> = {
  "become-an-exhibitor": {
    slug: "become-an-exhibitor",
    adminGroup: "home",
    variant: "block",
    title: "Become part of the GLUE design route 2026",
    description:
      "Are you a designer, member of the general public, architect, brand, label, showroom, gallery, academy or other colleague and would like to take part in the Design Route and showcase your work? Then sign up now! You can find details on how to participate here.",
    showButton: true,
    buttonLabel: "learn more",
    buttonLink: "/participate",
    sectionId: "become-an-exhibitor",
  },
  "alternatives-unexpected": {
    slug: "alternatives-unexpected",
    adminGroup: "home",
    variant: "block",
    title: "ALTERNATIVES FROM THE UNEXPECTED",
    description:
      "Among the over 140 participants this year are 28 creatives who are curated to stretch the definition of design and to bring inspiration and debate. Under the name Alternatives from the Unexpected, these designers are spread throughout Amsterdam in various HUBS and other unique locations. Come and explore the boundaries between art, fashion, and design, and find out who they are and what alternatives they propose, see page 10. The city lives, the streets speak. This guide connects you to the GLUE community.",
    showButton: false,
    buttonLabel: null,
    buttonLink: null,
    sectionId: "text-section",
  },
  newsletter: {
    slug: "newsletter",
    adminGroup: "home",
    variant: "block",
    title: "Subscribe  Newsletter",
    description:
      "Stay tuned for what's to come! Updates about new events, locations and highlights selected by our crew and experts.",
    showButton: true,
    buttonLabel: "subscribe",
    buttonLink: "/newsletter",
    sectionId: "newsletter-section",
  },
  "visit-intro": {
    slug: "visit-intro",
    adminGroup: "visit",
    variant: "intro",
    title: "Visite the GLUE design route 2026",
    description:
      "The GLUE Design Route takes place from 17. — 19. September 2026. Discover our program featuring talks, workshops, food and drinks, open studios, and much more. If you're interested in design, then you've come to the right place.",
    showButton: false,
    buttonLabel: null,
    buttonLink: null,
    sectionId: "visit-intro-section",
  },
  "visit-sign-up": {
    slug: "visit-sign-up",
    adminGroup: "visit",
    variant: "block",
    title: "Sign up to access all information",
    description:
      "GLUE is free and open to the public. However, you must register to access all the information on our website. And for certain events, you must sign up in advance. ",
    showButton: true,
    buttonLabel: "sign up",
    buttonLink: "/sign-up",
    sectionId: "visit-sign up-section",
  },
  "visit-discover": {
    slug: "visit-discover",
    adminGroup: "visit",
    variant: "block",
    title: "Discover this year's routes",
    description: VISIT_DISCOVER_HTML,
    showButton: true,
    buttonLabel: "view map",
    buttonLink: "/map",
    sectionId: "visit-discover-section",
  },
  "participate-intro": {
    slug: "participate-intro",
    adminGroup: "participate",
    variant: "intro",
    title: "Become part of the GLUE design route 2026",
    description:
      "GLUE gives you the opportunity to showcase your work to an international design-focused audience. You will be featured on the GLUE platform. This will give you direct visibility and allow you to invite visitors to join you on your creative journey. You will also have the chance to connect with other creatives, reach potential clients, and expand your network.",
    showButton: false,
    buttonLabel: null,
    buttonLink: null,
    sectionId: "participate-intro-section",
  },
  "participate-how-it-works": {
    slug: "participate-how-it-works",
    adminGroup: "participate",
    variant: "block",
    title: "How it works",
    description: PARTICIPATE_HOW_IT_WORKS_HTML,
    showButton: true,
    buttonLabel: "start now",
    buttonLink: "#plans-selection-section",
    sectionId: "participate-explication-section",
  },
  "participate-select-plan": {
    slug: "participate-select-plan",
    adminGroup: "participate",
    variant: "block",
    title: "Select a plan",
    description: PARTICIPATE_SELECT_PLAN_HTML,
    showButton: false,
    buttonLabel: null,
    buttonLink: null,
    sectionId: "plans-selection-section",
  },
  "sign-up-intro": {
    slug: "sign-up-intro",
    adminGroup: "sign-up",
    variant: "intro",
    title: "Sign Up",
    description:
      "You must register to access this information. Registering does not commit you to anything. GLUE is free, so there is no charge. ",
    showButton: false,
    buttonLabel: null,
    buttonLink: null,
    sectionId: "sign-up-section",
  },
};

export const getTextSectionDefault = (slug: TextSectionSlug): TextSectionData =>
  TEXT_SECTION_DEFAULTS[slug];
