import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  className: string;
};

function Lletter({ className }: Props) {
  return (
    <svg
      width="32"
      height="45"
      viewBox="0 0 35 45"
      fill="none"
      className={twMerge("", className)}
    >
      <path d="M0 45V0h5.731v39.733H32V45H0Z" fill="currentColor" />
    </svg>
  );
}

export default Lletter;
