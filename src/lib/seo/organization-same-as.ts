import type { LinkItem } from "@/schemas/mainSchema";

export const getOrganizationSameAs = (mainLinks: LinkItem[]): string[] =>
  mainLinks.map(({ link }) => link.trim()).filter(Boolean);
