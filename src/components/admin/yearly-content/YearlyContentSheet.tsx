"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { YearlyContentSection } from "@/lib/admin/yearly-content-types";
import { YEARLY_CONTENT_SECTION_LABELS } from "@/lib/admin/yearly-content-types";
import { ArchiveYearEditor } from "./ArchiveYearEditor";
import { CitizensYearEditor } from "./CitizensYearEditor";
import { StickyGroupEditor } from "./StickyGroupEditor";
import { YearNumbersForm } from "./YearNumbersForm";

type YearlyContentSheetProps = {
  open: boolean;
  year: number | null;
  section: YearlyContentSection | null;
  isNewCitizenYear?: boolean;
  onClose: () => void;
  onChanged: () => void;
};

export const YearlyContentSheet = ({
  open,
  year,
  section,
  isNewCitizenYear = false,
  onClose,
  onChanged,
}: YearlyContentSheetProps) => {
  const title =
    section && year
      ? `${YEARLY_CONTENT_SECTION_LABELS[section]} — ${year}`
      : "Edit content";

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto text-black"
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {year && section === "year-numbers" ? (
            <YearNumbersForm
              year={year}
              onSaved={onChanged}
              onDeleted={onChanged}
            />
          ) : null}

          {year && section === "sticky" ? (
            <StickyGroupEditor
              year={year}
              onSaved={onChanged}
              onDeleted={onChanged}
            />
          ) : null}

          {year && section === "citizens" ? (
            <CitizensYearEditor
              year={year}
              isNewYear={isNewCitizenYear}
              onChanged={onChanged}
            />
          ) : null}

          {year && section === "archive" ? (
            <ArchiveYearEditor
              year={year}
              onSaved={onChanged}
              onDeleted={onChanged}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};
