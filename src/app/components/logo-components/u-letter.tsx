import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  className: string;
  ref: React.RefObject<SVGSVGElement>;
};

function Uletter({ className, ref }: Props) {
  return (
    <svg
      width="32"
      height="45"
      viewBox="0 0 35 45"
      fill="none"
      className={twMerge("", className)}
      ref={ref}
    >
      <path
        d="M15.968 45C5.28 45 0 38.018 0 28.109V0h5.731v28.172c0 6.73 2.769 11.593 10.301 11.593 7.533 0 10.237-4.923 10.237-11.593V0H32v28.109C32 38.081 26.72 45 15.968 45Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default Uletter;
