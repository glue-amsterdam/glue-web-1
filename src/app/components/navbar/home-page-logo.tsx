import Link, { LinkProps } from "next/link";
import React from "react";
import { ImHome } from "react-icons/im";

type HomePageLogoProps = Omit<LinkProps, "href"> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

function HomePageLogo(props: HomePageLogoProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent event bubbling to avoid interference with map click handlers
    e.stopPropagation();

    // Call the original onClick if it exists
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <Link {...props} href={"/"} onClick={handleClick} data-navigation="true">
      <ImHome size={24} />
    </Link>
  );
}

export default HomePageLogo;
