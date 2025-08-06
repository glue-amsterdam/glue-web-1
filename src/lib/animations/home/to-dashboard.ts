import gsap from "gsap";
import { HomeExitAnimationRefs } from "./home-about-exit-animation";

export function toDashboard({
  refs,
  resolve,
}: {
  refs: HomeExitAnimationRefs;
  resolve: () => void;
}) {
  const tl = gsap.timeline({ onComplete: resolve, scope: refs.scope });
  const {
    triangle,
    topNavBarRef,
    lettersContainerRef,
    gl_line,
    lu_line,
    ue_line,
    eg_line,
  } = refs;
  const dashboardButton = document.querySelector(".leftbutton") as HTMLElement;
  dashboardButton.classList.add("no-hover");

  if (dashboardButton) {
    tl.to(dashboardButton, {
      pointerEvents: "none",
      scale: 1.1,
      translate: "5% -5%",
      duration: 0.1,
      ease: "power2.out",
    });
  }
  if (eg_line && ue_line && lu_line && gl_line) {
    tl.to(
      eg_line.current,
      { strokeDashoffset: 100, opacity: 0, duration: 0.05 },
      "<"
    )
      .to(
        ue_line.current,
        { strokeDashoffset: 100, opacity: 0, duration: 0.05 },
        ">0.01"
      )
      .to(
        lu_line.current,
        { strokeDashoffset: 100, opacity: 0, duration: 0.05 },
        ">0.01"
      )
      .to(
        gl_line.current,
        { strokeDashoffset: 100, opacity: 0, duration: 0.05 },
        ">0.01"
      );
  }
  const buttonAreas =
    document.querySelectorAll(".button-area:not(.leftbutton)") || [];

  if (buttonAreas.length === 0) {
    console.warn(
      "homeExitAnimation: No elements found with .button-area class"
    );
  }
  tl.to(buttonAreas, {
    autoAlpha: 0,
    y: 50,
    duration: 0.1,
    filter: "blur(10px)",
    ease: "power2.inOut",
  });
  if (!topNavBarRef?.current) {
    console.warn("homeExitAnimation: topNavBarRef is missing or undefined");
  } else {
    tl.to(
      topNavBarRef.current,
      {
        autoAlpha: 0,
        y: -30,
        duration: 0.2,
        ease: "power2.out",
      },
      "<"
    );
  }
  if (!lettersContainerRef?.current) {
    console.warn(
      "homeExitAnimation: lettersContainerRef is missing or undefined"
    );
  } else {
    tl.to(
      lettersContainerRef.current,
      {
        scale: 0,
        autoAlpha: 0,
        y: -30,
        duration: 0.3,
        ease: "power2.out",
      },
      "<"
    );
  }
  if (!triangle?.current) {
    console.warn("homeExitAnimation: triangle ref is missing or undefined");
  } else {
    tl.to(triangle.current, {
      xPercent: 50,
      duration: 0.3,
      ease: "power2.out",
    }).addLabel("triangle-out-animation-end");
  }
  tl.to(
    [
      dashboardButton,
      refs.scope.current?.querySelector("#home-text-container"),
    ],
    {
      autoAlpha: 0,
      duration: 0.1,
    },
    "<"
  );
}
