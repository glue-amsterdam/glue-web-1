import { forwardRef, type ReactNode, type Ref } from "react";

import { cn } from "@/lib/utils";

export const filterDropdownPanelClassName =
    "absolute top-full left-0 right-0 z-10 flex flex-col lg:flex-row border-t lg:border-t-2 border-b lg:border-b-2 border-[var(--black-color)] bg-[var(--white-color)]";

type FilterDropdownPanelProps<TFilterId extends string> = {
    filterId: TFilterId;
    openFilter: TFilterId | null;
    panelId: string;
    ariaLabel: string;
    variant?: "picker" | "pinned";
    className?: string;
    children: ReactNode;
};

const FilterDropdownPanelInner = <TFilterId extends string>(
    {
        filterId,
        openFilter,
        panelId,
        ariaLabel,
        variant = "picker",
        className,
        children,
    }: FilterDropdownPanelProps<TFilterId>,
    ref: Ref<HTMLDivElement>
) => {
    if (openFilter !== filterId) return null;

    return (
        <div
            ref={ref}
            id={panelId}
            role="group"
            aria-label={ariaLabel}
            aria-live={variant === "pinned" ? "polite" : undefined}
            className={cn(filterDropdownPanelClassName, className)}
        >
            {children}
        </div>
    );
};

export const FilterDropdownPanel = forwardRef(FilterDropdownPanelInner) as <
    TFilterId extends string
>(
    props: FilterDropdownPanelProps<TFilterId> & { ref?: Ref<HTMLDivElement> }
) => ReturnType<typeof FilterDropdownPanelInner>;
