import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const filterDropdownPanelClassName =
    "absolute top-full left-0 right-0 z-10 flex flex-col lg:flex-row border-t lg:border-t-2 border-b lg:border-b-2 border-[var(--black-color)] bg-[var(--white-color)]";

type FilterDropdownPanelProps<TFilterId extends string> = {
    filterId: TFilterId;
    openFilter: TFilterId | null;
    panelId: string;
    ariaLabel: string;
    className?: string;
    children: ReactNode;
};

export const FilterDropdownPanel = <TFilterId extends string>({
    filterId,
    openFilter,
    panelId,
    ariaLabel,
    className,
    children,
}: FilterDropdownPanelProps<TFilterId>) => {
    if (openFilter !== filterId) return null;

    return (
        <div
            id={panelId}
            role="group"
            aria-label={ariaLabel}
            className={cn(filterDropdownPanelClassName, className)}
        >
            {children}
        </div>
    );
};
