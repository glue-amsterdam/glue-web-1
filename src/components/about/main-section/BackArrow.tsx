import { SVGProps } from "react";

export function BackArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
      color="#fff"
    >
      <path
        fill="currentColor"
        d="M16 22L6 12L16 2l1.775 1.775L9.55 12l8.225 8.225z"
      ></path>
    </svg>
  );
}
