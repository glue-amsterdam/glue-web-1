"use client";

import { useMediaQuery } from "@/hooks/userMediaQuery";
import { useEffect, useState } from "react";
import PartnersGroup, { PartnersDisplay } from "./parters-group";


type PartnersSectionProps = {
    groups: PartnersDisplay[];
};

const ROTATION_INTERVAL_MS = 4500;
const LG_MEDIA_QUERY = "(min-width: 1024px)";

function PartnersSection({ groups }: PartnersSectionProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const isLgOrUp = useMediaQuery(LG_MEDIA_QUERY);

    useEffect(() => {
        if (groups.length <= 1 || isLgOrUp) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setActiveIndex((previousIndex) => (previousIndex + 1) % groups.length);
        }, ROTATION_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [groups.length, isLgOrUp]);

    if (groups.length === 0) {
        return <p className="title-padding text-sm">No sponsors to display.</p>;
    }
    return (
        <div className="title-padding flex gap-x-[80px] flex-wrap gap-y-[60px]" aria-live={isLgOrUp ? undefined : "polite"}>
            {isLgOrUp
                ? groups.map((group) => (
                    <PartnersGroup key={group.label} group={group} />
                ))
                : <PartnersGroup group={groups[activeIndex]} />}
        </div>
    )
}

export default PartnersSection