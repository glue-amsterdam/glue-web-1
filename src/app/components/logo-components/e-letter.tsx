import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  className: string;
};

function Eletter({ className }: Props) {
  return (
    <svg
      width="32"
      height="45"
      viewBox="0 0 35 45"
      fill="none"
      className={twMerge("", className)}
    >
      <path
        d="M0 45V0h32v5.205H5.731v13.708h20.28v5.333H5.732v15.55H32V45H0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default Eletter;
