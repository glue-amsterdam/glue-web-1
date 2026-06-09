"use client"

import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";
import { cn } from "@/lib/utils";

type Props = {
    description: string;
    className?: string;
}

export default function SanitizedDescription({ description, className }: Props) {
    const sanitizedContent = useSanitizedHTML(description);
    return (
        <div
            className={cn("pt-[40px] lg:max-w-(--paragraph-max-width) base-text-size", className)}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
    );
}