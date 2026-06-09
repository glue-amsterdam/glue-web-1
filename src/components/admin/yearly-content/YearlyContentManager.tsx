"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  YearlyContentSection,
  YearlyContentYearStatus,
} from "@/lib/admin/yearly-content-types";
import { YearContentStatusGrid } from "./YearContentStatusGrid";
import { YearSelectorBar } from "./YearSelectorBar";
import { YearlyContentSheet } from "./YearlyContentSheet";

const isValidSection = (value: string | null): value is YearlyContentSection =>
  value === "year-numbers" ||
  value === "sticky" ||
  value === "citizens" ||
  value === "archive";

export const YearlyContentManager = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const yearParam = searchParams.get("year");
  const sectionParam = searchParams.get("section");

  const selectedYear = yearParam ? Number(yearParam) : null;
  const activeSection = isValidSection(sectionParam) ? sectionParam : null;

  const [years, setYears] = useState<number[]>([]);
  const [pendingYears, setPendingYears] = useState<number[]>([]);
  const [status, setStatus] = useState<YearlyContentYearStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const allYears = useMemo(() => {
    const merged = new Set([...years, ...pendingYears]);
    return [...merged].sort((a, b) => b - a);
  }, [years, pendingYears]);

  const updateUrl = useCallback(
    (nextYear: number | null, nextSection: YearlyContentSection | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextYear) {
        params.set("year", String(nextYear));
      } else {
        params.delete("year");
      }

      if (nextSection) {
        params.set("section", nextSection);
      } else {
        params.delete("section");
      }

      const query = params.toString();
      router.replace(query ? `?${query}` : "/admin/yearly-content", {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  const loadSummary = useCallback(async (year?: number) => {
    setIsLoading(true);
    try {
      const url = year
        ? `/api/admin/yearly-content/summary?year=${year}`
        : "/api/admin/yearly-content/summary";
      const res = await fetch(url);
      if (!res.ok) {
        return;
      }

      const data = await res.json();
      setYears(data.years ?? []);
      if (year && data.status) {
        setStatus(data.status);
      } else {
        setStatus(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary(selectedYear ?? undefined);
  }, [loadSummary, selectedYear]);

  useEffect(() => {
    if (selectedYear && years.includes(selectedYear)) {
      setPendingYears((prev) => prev.filter((y) => y !== selectedYear));
    }
  }, [selectedYear, years]);

  const handleSelectYear = (year: number) => {
    updateUrl(year, activeSection);
  };

  const handleAddYear = (year: number) => {
    if (!allYears.includes(year)) {
      setPendingYears((prev) => [...prev, year]);
    }
    updateUrl(year, null);
  };

  const handleEdit = (section: YearlyContentSection) => {
    if (!selectedYear) {
      return;
    }
    updateUrl(selectedYear, section);
  };

  const handleCloseSheet = () => {
    if (selectedYear) {
      loadSummary(selectedYear);
    }

    if (!selectedYear) {
      updateUrl(null, null);
      return;
    }
    updateUrl(selectedYear, null);
  };

  const handleChanged = () => {
    if (selectedYear) {
      loadSummary(selectedYear);
    } else {
      loadSummary();
    }
  };

  const isNewCitizenYear =
    selectedYear !== null &&
    !years.includes(selectedYear) &&
    pendingYears.includes(selectedYear);

  useEffect(() => {
    if (allYears.length === 0 || selectedYear) {
      return;
    }

    updateUrl(allYears[0], activeSection);
  }, [allYears, selectedYear, activeSection, updateUrl]);

  return (
    <div className="space-y-8">
      <YearSelectorBar
        years={allYears}
        selectedYear={selectedYear}
        onSelectYear={handleSelectYear}
        onAddYear={handleAddYear}
      />

      {!selectedYear ? (
        <p className="text-sm text-gray-600">
          Select a year or create a new one to manage yearly content.
        </p>
      ) : isLoading && !status ? (
        <p className="text-sm text-gray-500">Loading year status...</p>
      ) : status ? (
        <YearContentStatusGrid status={status} onEdit={handleEdit} />
      ) : (
        <YearContentStatusGrid
          status={{
            year: selectedYear,
            year_numbers: { configured: false },
            sticky: { available: false, count: 0, has_photo: false },
            citizens: { available: false, count: 0 },
            archive: { configured: false, has_media: false },
          }}
          onEdit={handleEdit}
        />
      )}

      <YearlyContentSheet
        open={Boolean(selectedYear && activeSection)}
        year={selectedYear}
        section={activeSection}
        isNewCitizenYear={isNewCitizenYear}
        onClose={handleCloseSheet}
        onChanged={handleChanged}
      />
    </div>
  );
};
