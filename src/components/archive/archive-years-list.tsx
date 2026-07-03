"use client";

import Link from "next/link";
import PlusButtonMobile from "@/components/icons/plus-button-mobile";
import PlusIconDesktop from "@/components/icons/plus-icon-desktop";
import { markAboutArchiveReturn } from "@/lib/navigation/hash-route";
import PlusIconBig from "../icons/plus-icon-big";

type Props = {
  years: number[];
};

const ArchiveYearPlusIcon = () => (
  <span aria-hidden="true" className="shrink-0">
    <span className="lg:hidden">
      <PlusButtonMobile />
    </span>
    <span className="hidden lg:block">
      <PlusIconBig />
    </span>
  </span>
);

const ArchiveYearsList = ({ years }: Props) => {
  const sortedYears = [...years].sort((a, b) => b - a);

  return (
    <ul
      className="w-full title-padding flex flex-col gap-[20px] list-none"
      aria-label="Archive years"
    >
      {sortedYears.map((year) => (
        <li key={year} className="border-b-0">
          <Link
            href={`/about/archive/${year}`}
            onClick={markAboutArchiveReturn}
            className="group base-text-size main-boder-top hover:no-underline py-[15px] flex w-full items-center justify-between gap-3"
            aria-label={`View GLUE ${year} archive`}
          >
            <span className="title-text">{year}</span>
            <ArchiveYearPlusIcon />
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default ArchiveYearsList;
