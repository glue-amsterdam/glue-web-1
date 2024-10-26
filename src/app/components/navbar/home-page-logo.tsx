import Link, { LinkProps } from "next/link";
import React from "react";
import { ImHome } from "react-icons/im";

type HomePageLogoProps = Omit<LinkProps, "href"> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

function HomePageLogo(props: HomePageLogoProps) {
  return (
    <Link {...props} href={"/"}>
      <ImHome size={24} />
    </Link>
  );
}

export default HomePageLogo;
