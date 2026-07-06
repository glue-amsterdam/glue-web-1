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
    isOpen?: boolean;
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
    <div className="flex gap-[10px] lg:gap-[15px] items-center shrink-0">
        <p className="body-text whitespace-nowrap">
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
    isOpen: isOpenOverride,
    onToggle,
    onKeyDown,
}: FilterButtonProps<TFilterId>) => {
    const isOpen = isOpenOverride ?? openFilter === filterId;

    return (
        <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={`Filter by ${label}`}
            onClick={() => onToggle(filterId)}
            className={cn(
                "cursor-pointer shrink-0",
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
                "max-lg:grid max-lg:h-full max-lg:w-full max-lg:grid-rows-[var(--nav-secondary-h-mobile)_var(--nav-secondary-h-mobile)]",
                "lg:flex lg:items-end lg:w-fit lg:gap-[40px]",
                className
            )}
        >
            <div
                className={cn(
                    "relative lg:order-last",
                    "max-lg:flex max-lg:h-full max-lg:w-full max-lg:flex-col max-lg:justify-center max-lg:border-b max-lg:border-(--black-color)"
                )}
            >
                <input
                    id={searchInputId}
                    type="search"
                    value={searchValue}
                    onChange={onSearchChange}
                    onKeyDown={onSearchKeyDown}
                    placeholder="Search"
                    aria-label={searchAriaLabel}
                    className="navbar-search-input text-[16px] leading-[20px] max-lg:w-full max-lg:max-w-none max-lg:bg-transparent max-lg:border-0 max-lg:p-0 lg:text-[19px] lg:leading-[25px] h-[20px] lg:h-[30px] max-w-[170px] lg:max-w-[300px] placeholder:body-text placeholder:text-(--gray-color) border-b lg:border-b-2 border-(--black-color) focus:outline-none focus:ring-0"
                />
                {searchAfter}
            </div>
            <div className="flex gap-[30px] max-lg:items-center shrink-0">{children}</div>
        </div>
    )
);

BaseSecondNavbar.displayName = "BaseSecondNavbar";

export default BaseSecondNavbar;
