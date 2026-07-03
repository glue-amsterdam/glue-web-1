"use client";


import type { Sponsor } from "@/schemas/sponsorsSchema";
import Image from "next/image";
import Link from "next/link";

export type PartnersDisplay = {
    label: string;
    sponsors: Sponsor[];
};



const getSponsorKey = (sponsor: Sponsor) =>
    sponsor.id ?? `${sponsor.name}-${sponsor.website}`;

type PartnersSectionProps = {
    group: PartnersDisplay;
};

const PartnersGroup = ({ group }: PartnersSectionProps) => (
    <section aria-labelledby={`sponsor-type-${group.label}`}>
        <h3 id={`sponsor-type-${group.label}`} className="body-text">
            {group.label}
        </h3>
        <ul className="flex flex-wrap lg:flex-nowrap pt-[30px] lg:pt-[15px] pb-[9px] gap-[30px]">
            {group.sponsors.map((sponsor) => (
                <li key={getSponsorKey(sponsor)}>
                    <Link
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div className="h-[60px]">
                            <Image
                                width={128}
                                height={32}
                                src={sponsor.image_url}
                                alt={sponsor.name + "logo"}
                                className="object-contain mix-blend-difference h-full w-full"
                            />
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    </section>
);



export default PartnersGroup;
