"use client";

import { useState, type KeyboardEvent } from "react";

export const useFilterPanel = <TFilterId extends string>() => {
    const [openFilter, setOpenFilter] = useState<TFilterId | null>(null);

    const handleFilterToggle = (filter: TFilterId) => {
        setOpenFilter((current) => (current === filter ? null : filter));
    };

    const handleFilterKeyDown = (
        event: KeyboardEvent<HTMLButtonElement>,
        filter: TFilterId
    ) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        handleFilterToggle(filter);
    };

    const closeFilter = () => setOpenFilter(null);

    return {
        openFilter,
        setOpenFilter,
        handleFilterToggle,
        handleFilterKeyDown,
        closeFilter,
    };
};
