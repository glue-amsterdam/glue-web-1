"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import MainContainer from "@/components/main-container";
import { cn } from "@/lib/utils";
import { hasStaggerPlayed, markStaggerPlayed } from "@/lib/stagger-once";

type StaggerEnterContainerProps = {
  variant: "enter" | "fade";
  className?: string;
  children: React.ReactNode;
  as?: "main-container" | "section";
  id?: string;
};

const StaggerEnterContainer = ({
  variant,
  className,
  children,
  as = "main-container",
  id,
}: StaggerEnterContainerProps) => {
  const pathname = usePathname();
  const [isDone, setIsDone] = useState(false);

  useLayoutEffect(() => {
    if (hasStaggerPlayed(pathname)) {
      setIsDone(true);
      return;
    }

    markStaggerPlayed(pathname);
  }, [pathname]);

  const staggerClass =
    variant === "fade" ? "stagger-enter-fade" : "stagger-enter";
  const containerClassName = cn(
    staggerClass,
    isDone && "stagger-enter-done",
    className,
  );

  if (as === "section") {
    return (
      <section id={id} className={containerClassName}>
        {children}
      </section>
    );
  }

  return (
    <MainContainer className={containerClassName}>{children}</MainContainer>
  );
};

export default StaggerEnterContainer;
