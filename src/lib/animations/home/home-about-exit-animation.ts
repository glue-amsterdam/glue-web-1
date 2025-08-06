import { toAbout } from "./to-about";
import { toDashboard } from "./to-dashboard";
import { toEvents } from "./to-events";
import { toMap } from "./to-map";
export interface HomeExitAnimationRefs {
  scope: React.RefObject<HTMLDivElement>;
  lettersContainerRef?: React.RefObject<HTMLDivElement>;
  box1?: React.RefObject<HTMLDivElement>;
  box2?: React.RefObject<HTMLDivElement>;
  box3?: React.RefObject<HTMLDivElement>;
  box4?: React.RefObject<HTMLDivElement>;
  triangle?: React.RefObject<HTMLDivElement>;
  g_letterRef?: React.RefObject<SVGSVGElement>;
  l_letterRef?: React.RefObject<SVGSVGElement>;
  u_letterRef?: React.RefObject<SVGSVGElement>;
  e_letterRef?: React.RefObject<SVGSVGElement>;
  gl_line?: React.RefObject<SVGPathElement>;
  lu_line?: React.RefObject<SVGPathElement>;
  ue_line?: React.RefObject<SVGPathElement>;
  eg_line?: React.RefObject<SVGPathElement>;
  topNavBarRef?: React.RefObject<HTMLDivElement>;
  buttonsAreaRef?: React.RefObject<HTMLLIElement>;
  textAreaRef?: React.RefObject<HTMLDivElement>;
}

export const homeExitAnimation = ({
  refs,
  href,
}: {
  refs: HomeExitAnimationRefs;
  href: string;
}) => {
  return new Promise<void>((resolve) => {
    if (href === "/about") {
      toAbout({ refs, resolve });
    } else if (href === "/events") {
      toEvents({ refs, resolve });
    } else if (href === "/map") {
      toMap({ refs, resolve });
    } else if (href.startsWith("/dashboard")) {
      toDashboard({ refs, resolve });
    } else {
      resolve();
    }
  });
};
