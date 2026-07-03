import { fetchSponsorsData } from "@/lib/about/fetch-sponsors-section";
import { groupSponsorsByType } from "@/lib/about/sponsor-type-utils";
import PartnersSection from "./partners-section";
import { PartnersDisplay } from "./parters-group";

const OurPartners = async () => {
  const { sponsorsHeaderSchema, sponsors } = await fetchSponsorsData();

  if (!sponsorsHeaderSchema.is_visible) {
    return null;
  }

  const { title, sponsors_types } = sponsorsHeaderSchema;
  const { groups, orphans } = groupSponsorsByType(sponsors, sponsors_types);

  const sponsorGroupsByType: PartnersDisplay[] = groups
    .filter((group) => group.sponsors.length > 0)
    .map((group) => ({
      label: group.type.label,
      sponsors: group.sponsors,
    }));

  if (orphans.length > 0) {
    sponsorGroupsByType.push({
      label: "Other",
      sponsors: orphans,
    });
  }

  return (
    <section id="our-partners-section" className="main-padding">
      <h2 className="title-text border-t lg:border-t-2 border-(--black-color) pt-[15px] lg:pt-[30px]">
        {title.toUpperCase()}
      </h2>
      <PartnersSection groups={sponsorGroupsByType} />
    </section>
  );
};

export default OurPartners;
