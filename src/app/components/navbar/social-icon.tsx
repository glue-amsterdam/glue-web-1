import Link from "next/link";
import React from "react";
import { IconType } from "react-icons/lib";
import { CiInstagram, CiLinkedin, CiYoutube } from "react-icons/ci";
import { IoNewspaperOutline } from "react-icons/io5";
import { useLinks } from "@/app/context/MainContext";
import { LinkItem } from "@/schemas/mainSchema";

const iconMap: Record<string, IconType> = {
  linkedin: CiLinkedin,
  instagram: CiInstagram,
  youtube: CiYoutube,
  newsletter: IoNewspaperOutline,
};

type Platform = keyof typeof iconMap;

type Props = LinkItem;

export default function SocialIcons(): JSX.Element {
  const { mainLinks } = useLinks();

  return (
    <div className="flex items-center space-x-4 justify-center">
      {mainLinks.map(({ platform, link }) => (
        <SocialIcon
          link={link}
          platform={platform as Platform}
          key={link + platform}
        />
      ))}
    </div>
  );
}

function SocialIcon({ link, platform }: Props) {
  if (!link) return null;
  const Icon: IconType = iconMap[platform];
  if (!Icon) return null;

  return (
    <Link
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="md:hover:scale-105 md:transition-all"
    >
      <Icon className="size-6" />
    </Link>
  );
}
