"use client";

import { GiWorld } from "react-icons/gi";
import Link from "next/link";
import { GlueInternationalContent } from "@/schemas/internationalSchema";

export default function GlueInternationalSection({
  glueInternational,
}: {
  glueInternational: GlueInternationalContent;
}) {
  const { button_color, button_text, subtitle, title, website } =
    glueInternational;

  return (
    <div
      style={{ backgroundColor: button_color }}
      className="w-full mx-auto rounded-lg flex flex-col h-full items-center justify-center p-1 md:p-4"
    >
      <div className="py-4 h-full flex flex-col justify-center bg-uiwhite text-uiblack w-full rounded-lg shadow-md mx-auto border border-uiblack">
        <div className="mx-auto text-center">
          <h1 className="h1-titles font-bold tracking-widest text-2xl md:text-4xl lg:text-6xl">
            {title}
          </h1>
          <p className="opacity-90 mt-4 text-md md:text-xl lg:text-2xl">
            {subtitle}
          </p>
        </div>
        <Link
          style={{ backgroundColor: button_color }}
          href={website}
          target="_blank"
          className="hover:scale-110 rounded-md py-2 mt-4 mx-auto flex items-center justify-center text-uiwhite transition duration-500 w-[80%]"
        >
          <GiWorld className="size-8 md:size-12 px-2" />
          <p className="text-center px-2 text-sm md:text-base">{button_text}</p>
        </Link>
      </div>
    </div>
  );
}
