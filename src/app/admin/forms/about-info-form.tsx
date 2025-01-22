"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import type { InfoSection } from "@/schemas/infoSchema";
import { MainInfoForm } from "@/app/admin/components/info-form/main-info-form";
import { InfoItemForm } from "@/app/admin/components/info-form/info-item-form";

interface InfoSectionFormProps {
  initialData: InfoSection;
}

export default function InfoSectionForm({ initialData }: InfoSectionFormProps) {
  return (
    <div className="space-y-8">
      <MainInfoForm
        initialData={{
          title: initialData.title,
          description: initialData.description,
          is_visible: initialData.is_visible,
        }}
      />

      <div>
        <Label>Info Items (3 required)</Label>
        <div>
          <h2 className="text-lg font-semibold mb-4">Press Items</h2>
          <InfoItemForm initialItems={initialData.infoItems || []} />
        </div>
      </div>
    </div>
  );
}
