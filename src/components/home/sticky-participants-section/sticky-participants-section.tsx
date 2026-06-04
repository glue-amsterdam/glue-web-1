import BigButton from "@/components/big-button";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

type StickyParticipant = {
    userId: string;
    slug: string;
    userName: string;
    image: { image_url: string; alt: string };
};

type LatestStickyGroupData = {
    title: string;
    description: string;
    is_visible: boolean;
    year: number | null;
    group_photo_url: string | null;
    participants: StickyParticipant[];
};

const EMPTY_RESULT: LatestStickyGroupData = {
    title: "",
    description: "",
    is_visible: false,
    year: null,
    group_photo_url: null,
    participants: [],
};

type ParticipantDetailRow = {
    user_id: string;
    slug: string;
    user_info: { user_name: string } | { user_name: string }[] | null;
};

const getParticipantName = (
    userInfo: ParticipantDetailRow["user_info"]
): string => {
    if (Array.isArray(userInfo)) {
        return userInfo[0]?.user_name ?? "";
    }
    if (userInfo && typeof userInfo === "object") {
        return userInfo.user_name ?? "";
    }
    return "";
};

const fetchLatestStickyGroup = async (): Promise<LatestStickyGroupData> => {
    const supabase = await createClient();

    const { data: section, error: headerError } = await supabase
        .from("about_curated")
        .select("title, description, is_visible")
        .single();

    if (headerError || !section) {
        return EMPTY_RESULT;
    }

    if (!section.is_visible) {
        return {
            ...EMPTY_RESULT,
            is_visible: false,
        };
    }

    const { data: latestYearRow, error: yearError } = await supabase
        .from("sticky_groups")
        .select("year")
        .order("year", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (yearError || latestYearRow?.year == null) {
        return {
            title: section.title ?? "",
            description: section.description ?? "",
            is_visible: section.is_visible,
            year: null,
            group_photo_url: null,
            participants: [],
        };
    }

    const { data: group, error: groupError } = await supabase
        .from("sticky_groups")
        .select("id, year, group_photo_url")
        .eq("year", latestYearRow.year)
        .single();

    if (groupError || !group) {
        return {
            title: section.title ?? "",
            description: section.description ?? "",
            is_visible: section.is_visible,
            year: latestYearRow.year,
            group_photo_url: null,
            participants: [],
        };
    }

    const { data: groupParticipants, error: participantsError } =
        await supabase
            .from("sticky_group_participants")
            .select("participant_user_id")
            .eq("sticky_group_id", group.id);

    if (participantsError || !groupParticipants?.length) {
        return {
            title: section.title ?? "",
            description: section.description ?? "",
            is_visible: section.is_visible,
            year: group.year,
            group_photo_url: group.group_photo_url ?? null,
            participants: [],
        };
    }

    const userIds = groupParticipants.map((p) => p.participant_user_id);

    const { data: details, error: detailsError } = await supabase
        .from("participant_details")
        .select("user_id, slug, user_info(user_name)")
        .in("user_id", userIds);

    if (detailsError || !details?.length) {
        return {
            title: section.title ?? "",
            description: section.description ?? "",
            is_visible: section.is_visible,
            year: group.year,
            group_photo_url: group.group_photo_url ?? null,
            participants: [],
        };
    }

    const { data: images, error: imagesError } = await supabase
        .from("participant_image")
        .select("user_id, image_url")
        .in("user_id", userIds);

    if (imagesError) {
        return {
            title: section.title ?? "",
            description: section.description ?? "",
            is_visible: section.is_visible,
            year: group.year,
            group_photo_url: group.group_photo_url ?? null,
            participants: [],
        };
    }

    const participants: StickyParticipant[] = (
        details as ParticipantDetailRow[]
    ).map((detail) => {
        const name = getParticipantName(detail.user_info);
        const imageRow = images?.find((img) => img.user_id === detail.user_id);

        return {
            userId: detail.user_id,
            slug: detail.slug,
            userName: name,
            image: {
                image_url: imageRow?.image_url ?? "/placeholder.jpg",
                alt: `${name} profile image - participant from GLUE design routes`,
            },
        };
    });

    return {
        title: section.title ?? "",
        description: section.description ?? "",
        is_visible: section.is_visible,
        year: group.year,
        group_photo_url: group.group_photo_url ?? null,
        participants,
    };
};

const StickyParticipantsSection = async () => {
    const { title, description, is_visible, participants, group_photo_url, year } =
        await fetchLatestStickyGroup();

    const sticky_title = "Sticky participants 2026"

    if (!is_visible) {
        return null;
    }

    return (
        <section id="sticky-participants-section" className="main-padding">
            <h2 className="title-text border-t md:border-t-2 border-[var(--black-color)] pt-[15px] md:pt-[30px]">
                {title.toUpperCase()}
            </h2>
            <article className="pt-[40px] md:pt-[60px] w-full max-w-[1045px] mx-auto" >
                <img src={group_photo_url ?? ''} alt={`${title} group photo`} className="w-full h-auto" />
                <div className="pt-[40px] lg:flex lg:gap-[30px]">
                    <p className="base-text-size flex-1">{description}</p>
                    <div className="pt-[40px] lg:pt-0 flex-1">
                        <h3 className="base-text-size">{sticky_title.toUpperCase()}</h3>
                        <ul className="pt-[15px] flex flex-wrap">
                            {participants.map((participant, index) => (
                                <li key={participant.userId} className="base-text-size">
                                    <Link href={`/participants/${participant.slug}`}>
                                        {participant.userName}
                                    </Link>
                                    {index < participants.length - 1 ? `, ${" "}` : null}
                                </li>
                            ))}
                        </ul></div>
                </div>
            </article>
            <div className="pt-[40px] flex justify-center">
                <BigButton as="link" label="show details" href="/participants" mode="big" />
            </div>
        </section>
    );
};

export default StickyParticipantsSection;
