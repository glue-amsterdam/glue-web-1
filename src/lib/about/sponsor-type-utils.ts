import type { SponsorType } from "@/schemas/sponsorsSchema";

export const slugifySponsorTypeId = (label: string): string =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const ensureSponsorTypeIds = (
  types: Array<{ id?: string; label: string }>
): SponsorType[] => {
  const usedIds = new Set<string>();

  return types.map((type) => {
    const baseId = type.id?.trim() || slugifySponsorTypeId(type.label) || "group";
    let id = baseId;
    let suffix = 2;

    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    usedIds.add(id);

    return {
      id,
      label: type.label.trim(),
    };
  });
};

export const sponsorMatchesType = (
  sponsorTypeValue: string,
  sponsorType: SponsorType
): boolean => {
  if (sponsorTypeValue === sponsorType.id) {
    return true;
  }

  return sponsorTypeValue === sponsorType.label;
};

export const resolveSponsorTypeLabel = (
  sponsorTypeValue: string,
  headerTypes: SponsorType[]
): string => {
  const byId = headerTypes.find((type) => type.id === sponsorTypeValue);
  if (byId) {
    return byId.label;
  }

  const byLabel = headerTypes.find((type) => type.label === sponsorTypeValue);
  if (byLabel) {
    return byLabel.label;
  }

  return sponsorTypeValue;
};

export const isOrphanSponsorType = (
  sponsorTypeValue: string,
  headerTypes: SponsorType[]
): boolean =>
  !headerTypes.some((type) => sponsorMatchesType(sponsorTypeValue, type));

export const groupSponsorsByType = <T extends { sponsor_type: string }>(
  sponsors: T[],
  headerTypes: SponsorType[]
): {
  groups: Array<{ type: SponsorType; sponsors: T[] }>;
  orphans: T[];
} => {
  const assigned = new Set<T>();
  const groups = headerTypes.map((type) => {
    const groupSponsors = sponsors.filter((sponsor) => {
      if (!sponsorMatchesType(sponsor.sponsor_type, type)) {
        return false;
      }

      assigned.add(sponsor);
      return true;
    });

    return { type, sponsors: groupSponsors };
  });

  const orphans = sponsors.filter((sponsor) => !assigned.has(sponsor));

  return { groups, orphans };
};
