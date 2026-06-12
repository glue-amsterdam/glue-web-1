import { forwardRef, type ChangeEvent, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import CrossIconFlipp from "../icons/cross-icon-flipp";

type BaseSecondNavbarProps = {
    children: ReactNode;
    searchValue: string;
    onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    searchInputId?: string;
    searchAriaLabel?: string;
    searchAfter?: ReactNode;
    className?: string;
};

type FilterButtonProps<TFilterId extends string> = {
    filterId: TFilterId;
    openFilter: TFilterId | null;
    panelId: string;
    label: string;
    isActive?: boolean;
    onToggle: (filter: TFilterId) => void;
    onKeyDown: (
        event: KeyboardEvent<HTMLButtonElement>,
        filter: TFilterId
    ) => void;
};

const LabelWithPlusButton = ({
    label,
    isOpen,
}: {
    label: string;
    isOpen: boolean;
}) => (
    <div className="flex gap-[10px] lg:gap-[15px] items-center">
        <p className="text-[15px] leading-[15px] lg:text-[19px] lg:leading-[25px]">
            {label}
        </p>
        <span>
            <CrossIconFlipp isOpen={isOpen} />
        </span>
    </div>
);

export const FilterButton = <TFilterId extends string>({
    filterId,
    openFilter,
    panelId,
    label,
    isActive = false,
    onToggle,
    onKeyDown,
}: FilterButtonProps<TFilterId>) => {
    const isOpen = openFilter === filterId;

    return (
        <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={`Filter by ${label}`}
            onClick={() => onToggle(filterId)}
            className={cn(
                "cursor-pointer",
                (isActive || isOpen) && "text-(--primary-color)"
            )}
            onKeyDown={(event) => onKeyDown(event, filterId)}
        >
            <LabelWithPlusButton label={label} isOpen={isOpen} />
        </button>
    );
};

const BaseSecondNavbar = forwardRef<HTMLDivElement, BaseSecondNavbarProps>(
    (
        {
            children,
            searchValue,
            onSearchChange,
            onSearchKeyDown,
            searchInputId = "second-navbar-search",
            searchAriaLabel = "Search",
            searchAfter,
            className,
        },
        ref
    ) => (
        <div
            ref={ref}
            className={cn(
                "grid auto-rows-auto lg:flex items-end w-fit lg:gap-[40px]",
                className
            )}
        >
            <div className="relative lg:order-last">
                <input
                    id={searchInputId}
                    type="search"
                    value={searchValue}
                    onChange={onSearchChange}
                    onKeyDown={onSearchKeyDown}
                    placeholder="Search"
                    aria-label={searchAriaLabel}
                    className="base-text-size h-[20px] lg:h-[30px] max-w-[170px] lg:max-w-[300px] placeholder:text-[15px] placeholder:leading-[15px] lg:placeholder:text-[19px] lg:placeholder:leading-[25px] placeholder:text-[var(--gray-color)] border-b lg:border-b-2 border-[var(--black-color)] focus:outline-none focus:ring-0"
                />
                {searchAfter}
            </div>
            <div className="flex gap-[30px] pt-[20px] lg:pt-0">{children}</div>
        </div>
    )
);

BaseSecondNavbar.displayName = "BaseSecondNavbar";

export default BaseSecondNavbar;
