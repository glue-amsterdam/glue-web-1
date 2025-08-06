"use client";

import React from "react";
import type { InfoSection } from "@/schemas/infoSchema";
import { InfoHeaderForm } from "./InfoHeaderForm";
import { InfoItemForm } from "./InfoItemForm";

interface InfoSectionFormProps {
  initialData: InfoSection;
}

export default function AboutInfoForm({ initialData }: InfoSectionFormProps) {
  return (
    <div className="space-y-8">
      <InfoHeaderForm
        initialData={{
          title: initialData.title,
          description: initialData.description,
          is_visible: initialData.is_visible,
          text_color: initialData.text_color,
          background_color: initialData.background_color,
        }}
      />

      <div>
        <div>
          <h2 className="text-lg font-semibold mb-4">Press Items</h2>
          <InfoItemForm initialItems={initialData.infoItems || []} />
        </div>
      </div>
    </div>
  );
}
