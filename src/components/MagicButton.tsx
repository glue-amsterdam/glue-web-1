import React from "react";

export default function MagicButton({
  textColor,
  borderColor,
  blockColor,
  text = "Magic!",
}: {
  textColor: string;
  borderColor: string;
  blockColor: string;
  text: string;
}) {
  return (
    <button
      style={{ borderColor: borderColor }}
      className="cursor-pointer font-medium overflow-hidden relative z-100 border group px-8 py-2"
    >
      <span
        style={{ color: textColor }}
        className={`relative z-10 text-xl duration-500`}
      >
        {text}
      </span>
      <span
        style={{ backgroundColor: blockColor }}
        className="absolute w-full h-full -left-32 top-0 -rotate-45 group-hover:rotate-0 group-hover:left-0 duration-500"
      />
      <span
        style={{ backgroundColor: blockColor }}
        className="absolute w-full h-full -right-32 top-0 -rotate-45 group-hover:rotate-0 group-hover:right-0 duration-500"
      />
    </button>
  );
}
