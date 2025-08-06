import Link from "next/link";
import React from "react";
import type { IconType } from "react-icons/lib";
import { CiInstagram, CiLinkedin, CiYoutube } from "react-icons/ci";
import { IoNewspaperOutline } from "react-icons/io5";
import { useLinks } from "@/app/context/MainContext";
import type { LinkItem } from "@/schemas/mainSchema";
import { cn } from "@/lib/utils";

const iconMap: Record<string, IconType> = {
  linkedin: CiLinkedin,
  instagram: CiInstagram,
  youtube: CiYoutube,
  newsletter: IoNewspaperOutline,
};

type Platform = keyof typeof iconMap;

type Props = LinkItem & {
  className?: string;
};

export default function SocialIcons({
  className,
}: {
  className?: string;
}): JSX.Element {
  const { mainLinks } = useLinks();

  return (
    <div className="flex items-center gap-4 justify-center">
      {mainLinks.map(({ platform, link }) => (
        <SocialIcon
          link={link}
          platform={platform as Platform}
          key={link + platform}
          className={className}
        />
      ))}
    </div>
  );
}

function SocialIcon({ link, platform, className }: Props) {
  if (!link || link === "javascript:void(0)") return null;
  const Icon: IconType = iconMap[platform];
  if (!Icon) return null;

  return (
    <Link
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("md:hover:scale-105 md:transition-all", className)}
    >
      <Icon className="size-6" />
      <span className="sr-only">{platform}</span>
    </Link>
  );
}
