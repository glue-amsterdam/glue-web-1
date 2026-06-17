import { fetchSponsorsData } from "@/lib/about/fetch-sponsors-section";
import type { Sponsor } from "@/schemas/sponsorsSchema";
import PartnersSection from "./partners-section";
import { PartnersDisplay } from "./parters-group";

const getSponsorKey = (sponsor: Sponsor) =>
    sponsor.id ?? `${sponsor.name}-${sponsor.website}`;

const OurPartners = async () => {
    const { sponsorsHeaderSchema, sponsors } = await fetchSponsorsData();

    if (!sponsorsHeaderSchema.is_visible) {
        return null;
    }

    const { title, sponsors_types } = sponsorsHeaderSchema;

    const assignedKeys = new Set<string>();

    const sponsorGroupsByType = sponsors_types.map((sponsorType) => {
        const groupSponsors = sponsors.filter((sponsor) => {
            if (sponsor.sponsor_type !== sponsorType.label) {
                return false;
            }
            assignedKeys.add(getSponsorKey(sponsor));
            return true;
        });

        return {
            label: sponsorType.label,
            sponsors: groupSponsors,
        };
    });

    const orphanSponsors = sponsors.filter(
        (sponsor) => !assignedKeys.has(getSponsorKey(sponsor))
    );

    if (orphanSponsors.length > 0) {
        sponsorGroupsByType.push({
            label: "Other",
            sponsors: orphanSponsors,
        });
    }

    const groupsWithSponsors: PartnersDisplay[] = sponsorGroupsByType.filter(
        (group) => group.sponsors.length > 0
    );

    return (
        <section id="our-partners-section" className="main-padding">
            <h2 className="title-text border-t lg:border-t-2 border-(--black-color) pt-[15px] lg:pt-[30px]">
                {title.toUpperCase()}
            </h2>
            <PartnersSection groups={groupsWithSponsors} />
        </section>
    );
};

export default OurPartners;
