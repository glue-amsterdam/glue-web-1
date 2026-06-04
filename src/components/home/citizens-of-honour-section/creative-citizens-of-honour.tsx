import CreativeCitizensDisplay from "@/components/home/citizens-of-honour-section/creative-citizens-display";
import { ClientCitizen } from "@/schemas/citizenSchema";
import { createClient } from "@/utils/supabase/server";

type LatestCitizensData = {
    title: string;
    description: string;
    is_visible: boolean;
    year: string;
    citizens: ClientCitizen[];
};

const EMPTY_RESULT: LatestCitizensData = {
    title: "",
    description: "",
    is_visible: false,
    year: "",
    citizens: [],
};

const fetchLatestYearCitizens = async (): Promise<LatestCitizensData> => {
    const supabase = await createClient();

    const { data: section, error: headerError } = await supabase
        .from("about_citizens_section")
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
        .from("about_citizens")
        .select("year")
        .order("year", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (yearError || !latestYearRow?.year) {
        return {
            title: section.title ?? "",
            description: section.description ?? "",
            is_visible: section.is_visible,
            year: "",
            citizens: [],
        };
    }

    const { data, error } = await supabase
        .from("about_citizens")
        .select("id, name, image_url, description, year")
        .eq("year", latestYearRow.year);

    if (error || !data?.length) {
        return {
            title: section.title ?? "",
            description: section.description ?? "",
            is_visible: section.is_visible,
            year: latestYearRow.year,
            citizens: [],
        };
    }

    const citizens: ClientCitizen[] = data.map((citizen) => ({
        id: citizen.id,
        name: citizen.name,
        description: citizen.description,
        year: citizen.year,
        image_url: citizen.image_url ?? "/placeholder.jpg",
    }));

    return {
        title: section.title ?? "",
        description: section.description ?? "",
        is_visible: section.is_visible,
        year: latestYearRow.year,
        citizens,
    };
};

const CreativeCitizensOfHonour = async () => {
    const { title, description, is_visible, citizens } =
        await fetchLatestYearCitizens();

    if (!is_visible) {
        return null;
    }

    return (
        <section
            id="creative-citizens-of-honour"
            className="main-padding"
        >
            <h2 className="title-text border-t lg:border-t-2 border-[var(--black-color)] pt-[15px] lg:pt-[30px]">
                {title.toUpperCase()}
            </h2>
            <CreativeCitizensDisplay
                description={description}
                citizens={citizens}
            />
        </section>
    );
};

export default CreativeCitizensOfHonour;
