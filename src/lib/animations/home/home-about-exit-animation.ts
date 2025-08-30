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
  buttonType,
}: {
  refs: HomeExitAnimationRefs;
  buttonType: string;
}) => {
  return new Promise<void>((resolve) => {
    if (buttonType === "upButton") {
      toAbout({ refs, resolve });
    } else if (buttonType === "rightButton") {
      toEvents({ refs, resolve });
    } else if (buttonType === "downButton") {
      toMap({ refs, resolve });
    } else if (buttonType === "leftButton") {
      toDashboard({ refs, resolve });
    } else {
      resolve();
    }
  });
};
