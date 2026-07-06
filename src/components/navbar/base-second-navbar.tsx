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
    <div className="flex gap-[10px] lg:gap-[15px] items-center">
        <p className="body-text">
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
                "grid h-full w-full grid-rows-[var(--nav-secondary-h-mobile)_var(--nav-secondary-h-mobile)]",
                "lg:flex lg:h-auto lg:w-fit lg:grid-rows-none lg:items-end lg:gap-[40px]",
                className
            )}
        >
            <div className="relative flex h-full w-full flex-col justify-center border-b border-(--black-color) lg:order-last lg:h-auto lg:justify-end lg:border-b-0">
                <input
                    id={searchInputId}
                    type="search"
                    value={searchValue}
                    onChange={onSearchChange}
                    onKeyDown={onSearchKeyDown}
                    placeholder="Search"
                    aria-label={searchAriaLabel}
                    className="navbar-search-input w-full max-w-none bg-transparent text-[16px] leading-[20px] lg:text-[19px] lg:leading-[25px] h-[20px] lg:h-[30px] lg:w-auto lg:max-w-[300px] placeholder:body-text placeholder:text-(--gray-color) border-0 lg:border-b-2 lg:border-(--black-color) focus:outline-none focus:ring-0 p-0"
                />
                {searchAfter}
            </div>
            <div className="flex items-center gap-[30px]">{children}</div>
        </div>
    )
);

BaseSecondNavbar.displayName = "BaseSecondNavbar";

export default BaseSecondNavbar;
