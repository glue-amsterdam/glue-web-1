"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type BigButtonMode = "navbar" | "big" | "footer";
type BigButtonFontSize = "small" | "base";

const activeClassName =
  "bg-[var(--primary-color)] text-[var(--white-color)] border-[var(--primary-color)]";

export const getBigButtonClassName = ({
  mode,
  fontSize = "base",
  isActive = false,
  className,
}: {
  mode: BigButtonMode;
  fontSize?: BigButtonFontSize;
  isActive?: boolean;
  className?: string;
}) => {
  const fontSizeClass =
    fontSize === "small"
      ? "text-[10px] leading-[10px]"
      : fontSize === "base"
        ? "text-[15px] lg:text-[19px] leading-[21px] lg:leading-[19px]"
        : "";

  const modeClass =
    mode === "navbar"
      ? "pt-2 lg:pt-[10px] pb-[5px] lg:pb-[7px] px-[17px] lg:px-[20px]"
      : mode === "footer"
        ? "py-[8px] px-[13px] lg:border-[1px]"
        : mode === "big"
          ? "pt-2 pb-[5px] lg:py-[20px] px-[17px] lg:px-[35px]"
          : "";

  return cn(
    "cursor-pointer rounded-[40px] bg-[var(--white-color)] border lg:border-2 border-[var(--black-color)] text-[var(--black-color)]",
    "hover:bg-[var(--primary-color)] hover:text-[var(--white-color)] hover:border-[var(--primary-color)] transition-all duration-100",
    isActive && activeClassName,
    "disabled:opacity-50 disabled:pointer-events-none",
    fontSizeClass,
    modeClass,
    className,
  );
};

type BigButtonBase = {
  label: string;
  mode: BigButtonMode;
  fontSize?: BigButtonFontSize;
  disabled?: boolean;
  isActive?: boolean;
  target?: "_blank" | "_self" | "_parent" | "_top";
};

type BigButtonProps =
  | (BigButtonBase & { as: "link"; href: string })
  | (BigButtonBase & { as: "submit" })
  | (BigButtonBase & { as: "button"; onClick?: () => void });

function BigButton(props: BigButtonProps) {
  const {
    label,
    mode,
    fontSize = "base",
    disabled = false,
    isActive = false,
    target = "_self",
  } = props;

  const buttonClassName = getBigButtonClassName({ mode, fontSize, isActive });

  if (props.as === "link") {
    return (
      <Link href={props.href} target={target}>
        <button
          type="button"
          disabled={disabled}
          className={buttonClassName}
          aria-current={isActive ? "page" : undefined}
        >
          {label}
        </button>
      </Link>
    );
  }

  if (props.as === "submit") {
    return (
      <button
        type="submit"
        disabled={disabled}
        className={buttonClassName}
        aria-current={isActive ? "page" : undefined}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={props.onClick}
      className={buttonClassName}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </button>
  );
}

export default BigButton;
