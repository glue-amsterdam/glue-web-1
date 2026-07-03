export const STATIC_PAGE_SLUGS = ["contact", "privacy-policy", "imprint"] as const;

export type StaticPageSlug = (typeof STATIC_PAGE_SLUGS)[number];

export type StaticPageBlock = {
  title: string;
  subtitle: string | null;
  content: string;
};

export const STATIC_PAGE_CACHE_TAG = (slug: StaticPageSlug) =>
  `static-page-${slug}`;

export const STATIC_PAGE_PATH: Record<StaticPageSlug, string> = {
  contact: "/contact",
  "privacy-policy": "/privacy-policy",
  imprint: "/imprint",
};

export const STATIC_PAGE_ADMIN_LABELS: Record<StaticPageSlug, string> = {
  contact: "Contact",
  "privacy-policy": "Privacy Policy",
  imprint: "Imprint",
};

export const STATIC_PAGE_EMPTY_MESSAGE: Record<StaticPageSlug, string> = {
  contact: "No contact information available.",
  "privacy-policy": "No privacy policy available.",
  imprint: "No imprint information available.",
};

export const STATIC_PAGE_DEFAULTS: Record<StaticPageSlug, StaticPageBlock> = {
  contact: {
    title: "Contact",
    subtitle: null,
    content:
      "<p>GLUE<br />Veerstraat 53<br />1075 SN Amsterdam</p><p>+31 (0)6 5494 0225</p><p>info@glue.amsterdam</p>",
  },
  imprint: {
    title: "Imprint",
    subtitle: null,
    content:
      '<p>Responsible for the content:<br />GLUE<br />amsterdam connected by design<br />Veerstraat 53<br />1075 SN Amsterdam</p><p>Website operator contact information: guus@glue.amsterdam<br />Design: Haller Brun<br />Texts: David Held<br />Programming: Aldana Alegre<br />Web Developer: Javier Azua</p><p>An association under the name "GLUE" exists in accordance with Art. 60 ff. of the Civil Code, with its registered office in Amsterdam. It is politically and religiously independent and a non-profit organization.</p><p>IBAN: NL11 RABO0365450073<br />Chamber or Commerce nr.: KVK81998740<br />VAT nr.: NL862299159B01</p>',
  },
  "privacy-policy": {
    title: "Privacy Policy - Cookie Usage",
    subtitle:
      "At GLUE, we take the protection of your personal data very seriously. This privacy policy explains how we collect, use, store and protect your data. Please contact us if you have any questions about our privacy policy. Last updated: January 28, 2026",
    content:
      "<p>Privacy policy content will be displayed here.</p>",
  },
};
