import Image from "next/image";
import React from "react";
import { twMerge } from "tailwind-merge";

type FillProps = {
  className?: string;
  fill: true;
  width?: never;
  height?: never;
};

type SizeProps = {
  className?: string;
  fill?: false;
  width: number;
  height: number;
};

type Props = FillProps | SizeProps;

function GlueLogo({ className, fill, width, height }: Props) {
  return (
    <Image
      src={"/logos/logo-main.png"}
      className={twMerge("", className)}
      alt="GLUE logo, connected by design"
      {...(fill ? { fill: true } : { width, height })}
    />
  );
}

export default GlueLogo;
