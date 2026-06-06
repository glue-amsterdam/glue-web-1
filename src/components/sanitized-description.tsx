"use client"

import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";

type Props = {
    description: string;
}

export default function SanitizedDescription({ description }: Props) {
    const sanitizedContent = useSanitizedHTML(description);
    return <p className='pt-[40px] lg:pt-[60px] lg:max-w-(--paragraph-max-width) base-text-size' dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
}