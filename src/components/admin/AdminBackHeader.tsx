import React from "react";

export default function AdminBackHeader({
  sectionTitle,
}: {
  backLink: string;
  sectionTitle: string;
}) {
  return (
    <h2 className="text-5xl font-semibold pb-6 underline text-uiblack">
      {sectionTitle}
    </h2>
  );
}
