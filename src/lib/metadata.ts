import type { Metadata } from "next";
import { config } from "@/config";

const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
};

const buildPageMetadata = ({
  path,
  title,
  description,
  keywords,
  robots,
}: {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  robots?: Metadata["robots"];
}): Metadata => ({
  title,
  description,
  keywords,
  ...(robots ? { robots } : {}),
  alternates: {
    canonical: `${config.baseUrl}${path}`,
  },
  openGraph: {
    title,
    description,
    url: `${config.baseUrl}${path}`,
  },
  twitter: {
    title,
    description,
  },
});

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
export const newsletterMetadata: Metadata = {
  title: `GLUE ${config.cityName} | Newsletter`,
  description: `Subscribe to our newsletter to stay updated with the latest news and events of GLUE ${config.cityName}.`,
  keywords: [
    "GLUE",
    config.cityName,
    "newsletter",
    "design routes",
    "connected by design",
  ],
  alternates: {
    canonical: `${config.baseUrl}/newsletter`,
  },
  openGraph: {
    title: `GLUE ${config.cityName} Newsletter | Connected by Design`,
    description: `Subscribe to our newsletter to stay updated with the latest news and events of GLUE ${config.cityName}.`,
    url: `${config.baseUrl}/newsletter`,
  },
  twitter: {
    title: `GLUE ${config.cityName} | Newsletter`,
    description: `Subscribe to our newsletter to stay updated with the latest news and events of GLUE ${config.cityName}.`,
  },
};

// CONTACT PAGE METADATA
export const contactMetadata: Metadata = buildPageMetadata({
  path: "/contact",
  title: `GLUE ${config.cityName} | Contact`,
  description: `Get in touch with the GLUE ${config.cityName} team — questions about design routes, participation, and events.`,
  keywords: ["GLUE", config.cityName, "contact", "design routes", "connected by design"],
});

// PARTICIPATE PAGE METADATA
export const participateMetadata: Metadata = buildPageMetadata({
  path: "/participate",
  title: `GLUE ${config.cityName} | Participate`,
  description: `Apply to participate in GLUE ${config.cityName} design route — explore plans for designers, studios, and showrooms.`,
  keywords: [
    "GLUE",
    config.cityName,
    "participate",
    "apply",
    "design routes",
    "connected by design",
  ],
});

// SIGN UP PAGE METADATA
export const signUpMetadata: Metadata = buildPageMetadata({
  path: "/sign-up",
  title: `GLUE ${config.cityName} | Sign Up`,
  description:
    "Register for a GLUE account to access the map, program, and community. Registering is free and does not subscribe you to our newsletter.",
  keywords: ["GLUE", config.cityName, "sign up", "register", "design routes"],
});

// VISIT PAGE METADATA
export const visitMetadata: Metadata = buildPageMetadata({
  path: "/visit",
  title: `GLUE ${config.cityName} | Visit`,
  description: `Plan your visit to GLUE ${config.cityName} design route — practical information for visitors and design enthusiasts.`,
  keywords: ["GLUE", config.cityName, "visit", "design routes", "connected by design"],
});

// LOGIN PAGE METADATA
export const loginMetadata: Metadata = buildPageMetadata({
  path: "/login",
  title: `GLUE ${config.cityName} | Log In`,
  description: "Sign in to your GLUE account with your email and password.",
  keywords: ["GLUE", config.cityName, "login", "sign in", "design routes"],
});

// PARTICIPATE APPLY PAGE METADATA
export const participateApplyMetadata: Metadata = buildPageMetadata({
  path: "/participate/apply",
  title: `GLUE ${config.cityName} | Apply to Participate`,
  description: `Complete your GLUE ${config.cityName} participation application.`,
  keywords: ["GLUE", config.cityName, "participate", "apply", "design routes"],
  robots: NOINDEX_ROBOTS,
});

// RESET PASSWORD PAGE METADATA
export const resetPasswordMetadata: Metadata = buildPageMetadata({
  path: "/reset-password",
  title: `GLUE ${config.cityName} | Reset Password`,
  description: "Reset your GLUE account password.",
  keywords: ["GLUE", config.cityName, "reset password", "account"],
  robots: NOINDEX_ROBOTS,
});

// LEGAL PAGE METADATA
export const privacyPolicyMetadata: Metadata = buildPageMetadata({
  path: "/privacy-policy",
  title: `GLUE ${config.cityName} | Privacy Policy`,
  description: `Privacy policy for GLUE ${config.cityName} — how we collect, use, and protect your personal data.`,
  keywords: ["GLUE", config.cityName, "privacy policy", "legal"],
});

export const termsAndConditionsMetadata: Metadata = buildPageMetadata({
  path: "/terms-and-conditions",
  title: `GLUE ${config.cityName} | Terms and Conditions`,
  description: `General terms and conditions for GLUE ${config.cityName} participation and platform use.`,
  keywords: ["GLUE", config.cityName, "terms and conditions", "legal"],
});

export const imprintMetadata: Metadata = buildPageMetadata({
  path: "/imprint",
  title: `GLUE ${config.cityName} | Imprint`,
  description: `Legal imprint and company information for GLUE ${config.cityName}.`,
  keywords: ["GLUE", config.cityName, "imprint", "legal"],
});