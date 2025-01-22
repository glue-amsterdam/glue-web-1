"use client";

import type { PressItemsSectionContent } from "@/schemas/pressSchema";
import { MainInfoForm } from "@/app/admin/components/press-form/main-info-form";
import { PressItemsForm } from "@/app/admin/components/press-form/press-items-form";

interface PressSectionFormProps {
  initialData: PressItemsSectionContent;
}

export default function PressSectionForm({
  initialData,
}: PressSectionFormProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">Main Information</h2>
        <MainInfoForm
          initialData={{
            title: initialData.title,
            description: initialData.description,
            is_visible: initialData.is_visible,
          }}
        />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">Press Items</h2>
        <PressItemsForm initialItems={initialData.pressItems || []} />
      </div>
    </div>
  );
}
