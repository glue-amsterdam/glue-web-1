import type { Metadata } from "next"; import { config } from "@/config";

// BASE IN LAYOUT
export const LayoutMetadata: Metadata = {
  title: `GLUE ${config.cityName} | Connected by Design`,
  description: `Discover GLUE ${config.cityName}, where innovation meets creativity. Explore our events, design routes, and join a community connected by design.`,
  openGraph: {
    title: `GLUE ${config.cityName} | Connected by Design`,
    url: config.baseUrl,
    description: `Join GLUE ${config.cityName} and experience a world of design-driven innovation. Connect with us today!`,
    images: [
      {
        url: `${config.baseUrl}/${config.cityName}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `GLUE ${config.cityName} - Connected by Design`,
      },
    ],
    type: "website",
    siteName: `GLUE ${config.cityName}`,
  },
  twitter: {
    title: `GLUE ${config.cityName} | Connected by Design`,
    card: "summary_large_image",
    description: `Discover GLUE ${config.cityName}, where innovation meets creativity. Explore our events, design routes, and join a community connected by design.`,
    images: `${config.baseUrl}/${config.cityName}/tw-image.jpg`,
    site: config.cityName,
  },
  icons: [
    {
      url: `${config.baseUrl}/${config.cityName}/favicon.ico`,
      media: "(prefers-color-scheme: light)",
    },
    {
      url: `${config.baseUrl}/${config.cityName}/favicon.ico`,
      media: "(prefers-color-scheme: dark)",
    },
  ],

  keywords: [
    "GLUE",
    config.cityName,
    "design",
    "design routes",
    "design community",
    "innovation",
    "connected by design",
    "creative events",
    "urban design",
  ],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL(config.baseUrl),
  alternates: {
    canonical: config.baseUrl,
  },
};

// EXHIBITORS PAGE METADATA
export const exhibitorsMetadata: Metadata = {
  title: `GLUE ${config.cityName} | Exhibitors`,
  description: `Browse all exhibitors of GLUE ${config.cityName} design route — designers, studios, showrooms, galleries and more.`,
  keywords: [
    "GLUE",
    config.cityName,
    "exhibitors",
    "design routes",
    "designers",
    "studios",
    "showrooms",
    "galleries",
    "connected by design",
  ],
  alternates: {
    canonical: `${config.baseUrl}/exhibitors`,
  },
  openGraph: {
    title: `GLUE ${config.cityName} | Exhibitors`,
    description: `Browse all exhibitors of GLUE ${config.cityName} design route — designers, studios, showrooms, galleries and more.`,
    url: `${config.baseUrl}/exhibitors`,
  },
  twitter: {
    title: `GLUE ${config.cityName} | Exhibitors`,
    description: `Browse all exhibitors of GLUE ${config.cityName} design route — designers, studios, showrooms, galleries and more.`,
  },
};

// POSTS PAGE METADATA
export const postsMetadata: Metadata = {
  title: `GLUE ${config.cityName} | Posts`,
  description: `Read the latest news and stories from GLUE ${config.cityName} — design routes, events, and community updates.`,
  keywords: [
    "GLUE",
    config.cityName,
    "posts",
    "news",
    "design routes",
    "connected by design",
  ],
  alternates: {
    canonical: `${config.baseUrl}/posts`,
  },
  openGraph: {
    title: `GLUE ${config.cityName} | Posts`,
    description: `Read the latest news and stories from GLUE ${config.cityName} — design routes, events, and community updates.`,
    url: `${config.baseUrl}/posts`,
  },
  twitter: {
    title: `GLUE ${config.cityName} | Posts`,
    description: `Read the latest news and stories from GLUE ${config.cityName} — design routes, events, and community updates.`,
  },
};

// PROGRAM PAGE METADATA
export const programMetadata: Metadata = {
  title: `GLUE ${config.cityName} | Program`,
  description: `Browse the program of GLUE ${config.cityName} design route — lectures, workshops, tours and more.`,
  keywords: [
    "GLUE",
    config.cityName,
    "program",
    "events",
    "lectures",
    "workshops",
    "tours",
    "design routes",
    "connected by design",
  ],
  alternates: {
    canonical: `${config.baseUrl}/program`,
  },
  openGraph: {
    title: `GLUE ${config.cityName} | Program`,
    description: `Browse the program of GLUE ${config.cityName} design route — lectures, workshops, tours and more.`,
    url: `${config.baseUrl}/program`,
  },
  twitter: {
    title: `GLUE ${config.cityName} | Program`,
    description: `Browse the program of GLUE ${config.cityName} design route — lectures, workshops, tours and more.`,
  },
};

// MAP PAGE METADATA
export const mapMetadata: Metadata = {
  title: `GLUE ${config.cityName} | Map`,
  description: `Explore the GLUE ${config.cityName} design route map — find exhibitors, hubs, and curated routes.`,
  keywords: [
    "GLUE",
    config.cityName,
    "map",
    "exhibitors",
    "design routes",
    "hubs",
    "curated routes",
    "connected by design",
  ],
  alternates: {
    canonical: `${config.baseUrl}/map`,
  },
  openGraph: {
    title: `GLUE ${config.cityName} | Map`,
    description: `Explore the GLUE ${config.cityName} design route map — find exhibitors, hubs, and curated routes.`,
    url: `${config.baseUrl}/map`,
  },
  twitter: {
    title: `GLUE ${config.cityName} | Map`,
    description: `Explore the GLUE ${config.cityName} design route map — find exhibitors, hubs, and curated routes.`,
  },
};

// INDIVIDUAL EXHIBITOR PAGE METADATA
export const individualExhibitorMetadata = {
  title: `GLUE ${config.cityName} | Exhibitor`,
  description: `Discover the details of the exhibitor ${config.cityName} design route.`,
  openGraph: {
    title: `GLUE ${config.cityName} | Exhibitor`,
    description: `Discover the details of the exhibitor ${config.cityName} design route.`,
  },
};

// ABOUT PAGE METADATA
export const aboutPageMetadata: Metadata = {
  title: `About GLUE ${config.cityName} | Team, Foundation & Archive`,
  description: `Meet the GLUE ${config.cityName} team, learn about the GLUE Foundation, mission, press, and browse the GLUE archive by year.`,
  keywords: [
    "GLUE",
    config.cityName,
    "about",
    "team",
    "foundation",
    "archive",
    "design routes",
    "connected by design",
  ],
  alternates: {
    canonical: `${config.baseUrl}/about`,
  },
  openGraph: {
    title: `About GLUE ${config.cityName} | Team, Foundation & Archive`,
    description: `Meet the GLUE ${config.cityName} team, learn about the GLUE Foundation, mission, press, and browse the GLUE archive by year.`,
    url: `${config.baseUrl}/about`,
  },
  twitter: {
    title: `About GLUE ${config.cityName} | Team, Foundation & Archive`,
    description: `Meet the GLUE ${config.cityName} team, learn about the GLUE Foundation, mission, press, and browse the GLUE archive by year.`,
  },
};

// NEWSLETTER PAGE METADATA
export const newsletterMetadata = {
  title: `GLUE ${config.cityName} | Newsletter`,
  description: `Subscribe to our newsletter to stay updated with the latest news and events of GLUE ${config.cityName}.`,
  openGraph: {
    title: `GLUE ${config.cityName} Newsletter | Connected by Design`,
    description: `Subscribe to our newsletter to stay updated with the latest news and events of GLUE ${config.cityName}.`,
  },
};