"use client";

import type { PressItemsSectionContent } from "@/schemas/pressSchema";
import { PressHeaderForm } from "./PressHeaderForm";
import { PressItemsForm } from "./PressItemForm";

interface PressSectionFormProps {
  initialData: PressItemsSectionContent;
}

export default function AboutPressForm({ initialData }: PressSectionFormProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">Main Information</h2>
        <PressHeaderForm
          initialData={{
            title: initialData.title,
            description: initialData.description,
            is_visible: initialData.is_visible,
            text_color: initialData.text_color,
            background_color: initialData.background_color,
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
